import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tag, TagDocument } from './schemas/tag.schema';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  private readonly logger = new Logger(TagsService.name);

  constructor(@InjectModel(Tag.name) private readonly tagModel: Model<TagDocument>) {}

  async findAll(search?: string): Promise<TagDocument[]> {
    const filter: Record<string, any> = {};
    if (search) {
      filter.name = { $regex: search.trim().toLowerCase(), $options: 'i' };
    }
    return this.tagModel.find(filter).sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<TagDocument> {
    const tag = await this.tagModel.findById(id).exec();
    if (!tag) {
      throw new NotFoundException(`Tag with ID "${id}" not found`);
    }
    return tag;
  }

  async create(createTagDto: CreateTagDto): Promise<TagDocument> {
    const normalizedName = createTagDto.name.trim().toLowerCase();
    const existing = await this.tagModel.findOne({ name: normalizedName }).exec();
    if (existing) {
      throw new ConflictException(`Tag with name "${createTagDto.name}" already exists`);
    }

    try {
      const createdTag = new this.tagModel({ name: normalizedName });
      return await createdTag.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException(`Tag with name "${createTagDto.name}" already exists`);
      }
      throw error;
    }
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<TagDocument> {
    const tag = await this.findById(id);

    if (updateTagDto.name) {
      const normalizedName = updateTagDto.name.trim().toLowerCase();
      const existing = await this.tagModel
        .findOne({ name: normalizedName, _id: { $ne: id } })
        .exec();
      if (existing) {
        throw new ConflictException(`Tag with name "${updateTagDto.name}" already exists`);
      }
      tag.name = normalizedName;
    }

    return tag.save();
  }

  async delete(id: string): Promise<{ message: string; deletedId: string }> {
    const tag = await this.findById(id);
    await this.tagModel.findByIdAndDelete(id).exec();

    // Referential integrity: pull deleted tag from all projects referencing it
    try {
      const result = await this.tagModel.db
        .collection('projects')
        .updateMany({ tags: id }, { $pull: { tags: id } as any });
      this.logger.log(`Removed tag "${id}" from ${result.modifiedCount} project(s).`);
    } catch (err: any) {
      this.logger.warn(`Failed to clean up tag references in projects: ${err.message}`);
    }

    return { message: `Tag "${tag.name}" successfully deleted`, deletedId: id };
  }
}
