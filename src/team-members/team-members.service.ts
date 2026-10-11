import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TeamMember, TeamMemberDocument } from './schemas/team-member.schema';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { QueryTeamMemberDto } from './dto/query-team-member.dto';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class TeamMembersService {
  private readonly logger = new Logger(TeamMembersService.name);

  constructor(
    @InjectModel(TeamMember.name) private readonly memberModel: Model<TeamMemberDocument>,
    private readonly uploadsService: UploadsService,
  ) {}

  async findAll(queryDto: QueryTeamMemberDto) {
    const filter: Record<string, any> = {};

    if (queryDto.tier) {
      filter.tier = queryDto.tier;
    }

    if (queryDto.search) {
      const searchRegex = { $regex: queryDto.search.trim(), $options: 'i' };
      filter.$or = [{ name: searchRegex }, { position: searchRegex }];
    }

    const page = queryDto.page || 1;
    const limit = queryDto.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.memberModel.find(filter).sort({ createdAt: 1 }).skip(skip).limit(limit).exec(),
      this.memberModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
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
    Object.assign(member, updateDto);
    const updated = await member.save();

    // If an image was updated and old image is different, safely clean up old image
    if (updateDto.image && oldImage && updateDto.image !== oldImage) {
      // Check if old image is still referenced by other members before deleting
      const otherCount = await this.memberModel
        .countDocuments({ image: oldImage, _id: { $ne: id } })
        .exec();
      if (otherCount === 0) {
        await this.uploadsService.deleteImage(oldImage);
      }
    }

    return updated;
  }

  async delete(id: string): Promise<{ message: string; deletedId: string }> {
    const member = await this.findById(id);
    const imageToDelete = member.image;

    await this.memberModel.findByIdAndDelete(id).exec();

    // 1. Clean up references in projects (referential integrity)
    try {
      const projectResult = await this.memberModel.db
        .collection('projects')
        .updateMany({ team: id }, { $pull: { team: id } as any });
      this.logger.log(
        `Removed team member "${id}" from ${projectResult.modifiedCount} project(s).`,
      );
    } catch (err: any) {
      this.logger.warn(`Failed to clean up team references in projects: ${err.message}`);
    }

    // 2. Safe image cleanup
    if (imageToDelete) {
      const otherCount = await this.memberModel.countDocuments({ image: imageToDelete }).exec();
      if (otherCount === 0) {
        await this.uploadsService.deleteImage(imageToDelete);
      }
    }

    return { message: `Team member "${member.name}" successfully deleted`, deletedId: id };
  }
}
