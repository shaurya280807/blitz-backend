import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { TeamMember, TeamMemberDocument } from '../team/schemas/team-member.schema';
import { Tag, TagDocument } from '../tags/schemas/tag.schema';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(TeamMember.name) private readonly teamMemberModel: Model<TeamMemberDocument>,
    @InjectModel(Tag.name) private readonly tagModel: Model<TagDocument>,
    private readonly uploadsService: UploadsService,
  ) {}

  private async validateAndDeduplicateMembers(memberIds?: string[]): Promise<string[]> {
    if (!memberIds || memberIds.length === 0) return [];
    // Deduplicate
    const uniqueIds = Array.from(new Set(memberIds));
    // Verify each member exists
    const existing = await this.teamMemberModel
      .find({ _id: { $in: uniqueIds } })
      .select('_id')
      .exec();
    const existingSet = new Set(existing.map((m) => m._id));
    const missing = uniqueIds.filter((id) => !existingSet.has(id));
    if (missing.length > 0) {
      throw new BadRequestException(
        `Referenced team member(s) do not exist: ${missing.join(', ')}`,
      );
    }
    return uniqueIds;
  }

  private async validateAndDeduplicateTags(tagIds?: string[]): Promise<string[]> {
    if (!tagIds || tagIds.length === 0) return [];
    // Deduplicate
    const uniqueIds = Array.from(new Set(tagIds));
    // Verify each tag exists
    const existing = await this.tagModel
      .find({ _id: { $in: uniqueIds } })
      .select('_id')
      .exec();
    const existingSet = new Set(existing.map((t) => t._id));
    const missing = uniqueIds.filter((id) => !existingSet.has(id));
    if (missing.length > 0) {
      throw new BadRequestException(`Referenced tag(s) do not exist: ${missing.join(', ')}`);
    }
    return uniqueIds;
  }

  private async populateProject(projectDoc: ProjectDocument | null) {
    if (!projectDoc) return null;
    const project = projectDoc.toJSON();

    // Fetch team members details
    const teamMembers =
      project.team && project.team.length > 0
        ? await this.teamMemberModel.find({ _id: { $in: project.team } }).exec()
        : [];

    // Fetch tags details
    const tags =
      project.tags && project.tags.length > 0
        ? await this.tagModel.find({ _id: { $in: project.tags } }).exec()
        : [];

    return {
      ...project,
      teamMembers,
      tagDetails: tags,
    };
  }

  async findAll(paginationDto: PaginationDto, tagId?: string, search?: string) {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (tagId) {
      filter.tags = tagId;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const [projects, total] = await Promise.all([
      this.projectModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.projectModel.countDocuments(filter).exec(),
    ]);

    const populatedData = await Promise.all(projects.map((p) => this.populateProject(p)));

    return {
      data: populatedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findById(id: string) {
    const project = await this.projectModel.findById(id).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }
    return this.populateProject(project);
  }

  async create(createDto: CreateProjectDto): Promise<any> {
    const validatedTeam = await this.validateAndDeduplicateMembers(createDto.team);
    const validatedTags = await this.validateAndDeduplicateTags(createDto.tags);

    const project = new this.projectModel({
      ...createDto,
      team: validatedTeam,
      tags: validatedTags,
    });

    const saved = await project.save();
    return this.populateProject(saved);
  }

  async update(id: string, updateDto: UpdateProjectDto): Promise<any> {
    const project = await this.projectModel.findById(id).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    const oldImage = project.image;

    if (updateDto.name !== undefined) project.name = updateDto.name;
    if (updateDto.description !== undefined) project.description = updateDto.description;
    if (updateDto.github !== undefined) project.github = updateDto.github;
    if (updateDto.liveDemo !== undefined) project.liveDemo = updateDto.liveDemo;

    if (updateDto.team !== undefined) {
      project.team = await this.validateAndDeduplicateMembers(updateDto.team);
    }

    if (updateDto.tags !== undefined) {
      project.tags = await this.validateAndDeduplicateTags(updateDto.tags);
    }

    if (updateDto.image !== undefined && updateDto.image !== oldImage) {
      project.image = updateDto.image;
      const saved = await project.save();

      if (oldImage && oldImage !== updateDto.image) {
        await this.cleanupImageIfUnreferenced(oldImage, id);
      }
      return this.populateProject(saved);
    }

    const saved = await project.save();
    return this.populateProject(saved);
  }

  async delete(id: string): Promise<{ message: string; deletedId: string }> {
    const project = await this.projectModel.findById(id).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    const oldImage = project.image;
    await this.projectModel.findByIdAndDelete(id).exec();

    if (oldImage) {
      await this.cleanupImageIfUnreferenced(oldImage, id);
    }

    return { message: `Project "${project.name}" successfully deleted`, deletedId: id };
  }

  private async cleanupImageIfUnreferenced(
    imagePath: string,
    excludedProjectId: string,
  ): Promise<void> {
    try {
      const otherProject = await this.projectModel
        .findOne({
          image: imagePath,
          _id: { $ne: excludedProjectId },
        })
        .exec();

      if (!otherProject) {
        const db = this.projectModel.db;
        const inMembers = await db.collection('team_members').countDocuments({ image: imagePath });
        const inAchievements = await db
          .collection('achievements')
          .countDocuments({ image: imagePath });
        const inGallery = await db.collection('gallery').countDocuments({ image: imagePath });

        if (inMembers === 0 && inAchievements === 0 && inGallery === 0) {
          await this.uploadsService.deleteImage(imagePath);
        }
      }
    } catch (err: any) {
      this.logger.warn(`Error during safe image cleanup: ${err.message}`);
    }
  }
}
