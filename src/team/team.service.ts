import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TeamMember, TeamMemberDocument, TeamMemberTier } from './schemas/team-member.schema';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name);

  constructor(
    @InjectModel(TeamMember.name) private readonly memberModel: Model<TeamMemberDocument>,
    private readonly uploadsService: UploadsService,
  ) {}

  async findAll(tier?: TeamMemberTier): Promise<TeamMemberDocument[]> {
    const filter: Record<string, any> = {};
    if (tier) {
      filter.tier = tier;
    }
    return this.memberModel.find(filter).sort({ createdAt: 1 }).exec();
  }

  async findById(id: string): Promise<TeamMemberDocument> {
    const member = await this.memberModel.findById(id).exec();
    if (!member) {
      throw new NotFoundException(`Team member with ID "${id}" not found`);
    }
    return member;
  }

  async create(createDto: CreateTeamMemberDto): Promise<TeamMemberDocument> {
    const member = new this.memberModel(createDto);
    return member.save();
  }

  async update(id: string, updateDto: UpdateTeamMemberDto): Promise<TeamMemberDocument> {
    const member = await this.findById(id);
    const oldImage = member.image;

    // Apply updates
    if (updateDto.name !== undefined) member.name = updateDto.name;
    if (updateDto.position !== undefined) member.position = updateDto.position;
    if (updateDto.tier !== undefined) member.tier = updateDto.tier;
    if (updateDto.bio !== undefined) member.bio = updateDto.bio;
    if (updateDto.linkedin !== undefined) member.linkedin = updateDto.linkedin;
    if (updateDto.github !== undefined) member.github = updateDto.github;
    if (updateDto.instagram !== undefined) member.instagram = updateDto.instagram;

    // If image reference changed or removed
    if (updateDto.image !== undefined && updateDto.image !== oldImage) {
      member.image = updateDto.image;
      const updated = await member.save();

      // Only clean up old image if DB save succeeded and oldImage was not empty
      if (oldImage && oldImage !== updateDto.image) {
        await this.cleanupImageIfUnreferenced(oldImage, id);
      }
      return updated;
    }

    return member.save();
  }

  async delete(id: string): Promise<{ message: string; deletedId: string }> {
    const member = await this.findById(id);
    const oldImage = member.image;

    await this.memberModel.findByIdAndDelete(id).exec();

    // Referential cleanup in projects: pull deleted team member from all projects
    try {
      const result = await this.memberModel.db
        .collection('projects')
        .updateMany({ team: id }, { $pull: { team: id } as any });
      this.logger.log(`Removed team member "${id}" from ${result.modifiedCount} project(s).`);
    } catch (err: any) {
      this.logger.warn(`Failed to clean up team member references in projects: ${err.message}`);
    }

    // Clean up old image if unreferenced
    if (oldImage) {
      await this.cleanupImageIfUnreferenced(oldImage, id);
    }

    return { message: `Team member "${member.name}" successfully deleted`, deletedId: id };
  }

  private async cleanupImageIfUnreferenced(
    imagePath: string,
    excludedMemberId: string,
  ): Promise<void> {
    try {
      // Check if image is still referenced by another member
      const otherMember = await this.memberModel
        .findOne({
          image: imagePath,
          _id: { $ne: excludedMemberId },
        })
        .exec();

      if (!otherMember) {
        // Also check projects, achievements, gallery
        const db = this.memberModel.db;
        const inProjects = await db.collection('projects').countDocuments({ image: imagePath });
        const inAchievements = await db
          .collection('achievements')
          .countDocuments({ image: imagePath });
        const inGallery = await db.collection('gallery').countDocuments({ image: imagePath });

        if (inProjects === 0 && inAchievements === 0 && inGallery === 0) {
          await this.uploadsService.deleteImage(imagePath);
        }
      }
    } catch (err: any) {
      this.logger.warn(`Error during safe image cleanup: ${err.message}`);
    }
  }
}
