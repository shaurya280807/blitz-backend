import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Achievement, AchievementDocument } from './schemas/achievement.schema';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import { QueryAchievementDto } from './dto/query-achievement.dto';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectModel(Achievement.name) private readonly achievementModel: Model<AchievementDocument>,
    private readonly uploadsService: UploadsService,
  ) {}

  async findAll(queryDto: QueryAchievementDto) {
    const filter: Record<string, any> = {};

    if (queryDto.year) {
      filter.year = queryDto.year;
    }

    if (queryDto.search) {
      const searchRegex = { $regex: queryDto.search.trim(), $options: 'i' };
      filter.$or = [
        { title: searchRegex },
        { event: searchRegex },
        { team: searchRegex },
        { result: searchRegex },
      ];
    }

    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.achievementModel
        .find(filter)
        .sort({ year: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.achievementModel.countDocuments(filter).exec(),
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

  async findById(id: string): Promise<AchievementDocument> {
    const achievement = await this.achievementModel.findById(id).exec();
    if (!achievement) {
      throw new NotFoundException(`Achievement with ID "${id}" not found`);
    }
    return achievement;
  }

  async create(createDto: CreateAchievementDto): Promise<AchievementDocument> {
    const achievement = new this.achievementModel(createDto);
    return achievement.save();
  }

  async update(id: string, updateDto: UpdateAchievementDto): Promise<AchievementDocument> {
    const achievement = await this.findById(id);
    const oldImage = achievement.image;

    Object.assign(achievement, updateDto);
    const updated = await achievement.save();

    // Safely cleanup old image if replaced
    if (updateDto.image && oldImage && updateDto.image !== oldImage) {
      const otherCount = await this.achievementModel
        .countDocuments({ image: oldImage, _id: { $ne: id } })
        .exec();
      if (otherCount === 0) {
        await this.uploadsService.deleteImage(oldImage);
      }
    }

    return updated;
  }

  async delete(id: string): Promise<{ message: string; deletedId: string }> {
    const achievement = await this.findById(id);
    const imageToDelete = achievement.image;

    await this.achievementModel.findByIdAndDelete(id).exec();

    // Safe image cleanup
    if (imageToDelete) {
      const otherCount = await this.achievementModel
        .countDocuments({ image: imageToDelete })
        .exec();
      if (otherCount === 0) {
        await this.uploadsService.deleteImage(imageToDelete);
      }
    }

    return { message: `Achievement "${achievement.title}" successfully deleted`, deletedId: id };
  }
}
