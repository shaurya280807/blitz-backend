import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GalleryItem, GalleryItemDocument } from './schemas/gallery-item.schema';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto';
import { QueryGalleryDto } from './dto/query-gallery.dto';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class GalleryService {
  constructor(
    @InjectModel(GalleryItem.name) private readonly galleryModel: Model<GalleryItemDocument>,
    private readonly uploadsService: UploadsService,
  ) {}

  async findAll(queryDto: QueryGalleryDto) {
    const filter: Record<string, any> = {};

    if (queryDto.search) {
      filter.title = { $regex: queryDto.search.trim(), $options: 'i' };
    }

    const page = queryDto.page || 1;
    const limit = queryDto.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.galleryModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.galleryModel.countDocuments(filter).exec(),
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

  async findById(id: string): Promise<GalleryItemDocument> {
    const item = await this.galleryModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException(`Gallery item with ID "${id}" not found`);
    }
    return item;
  }

  async create(createDto: CreateGalleryItemDto): Promise<GalleryItemDocument> {
    const item = new this.galleryModel(createDto);
    return item.save();
  }

  async update(id: string, updateDto: UpdateGalleryItemDto): Promise<GalleryItemDocument> {
    const item = await this.findById(id);
    const oldImage = item.image;

    Object.assign(item, updateDto);
    const updated = await item.save();

    // Safely cleanup old image if replaced
    if (updateDto.image && oldImage && updateDto.image !== oldImage) {
      const otherCount = await this.galleryModel
        .countDocuments({ image: oldImage, _id: { $ne: id } })
        .exec();
      if (otherCount === 0) {
        await this.uploadsService.deleteImage(oldImage);
      }
    }

    return updated;
  }

  async delete(id: string): Promise<{ message: string; deletedId: string }> {
    const item = await this.findById(id);
    const imageToDelete = item.image;

    await this.galleryModel.findByIdAndDelete(id).exec();

    // Safe image cleanup
    if (imageToDelete) {
      const otherCount = await this.galleryModel.countDocuments({ image: imageToDelete }).exec();
      if (otherCount === 0) {
        await this.uploadsService.deleteImage(imageToDelete);
      }
    }

    return { message: `Gallery item "${item.title}" successfully deleted`, deletedId: id };
  }
}
