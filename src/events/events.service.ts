import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';

@Injectable()
export class EventsService {
  constructor(@InjectModel(Event.name) private readonly eventModel: Model<EventDocument>) {}

  async findAll(queryDto: QueryEventDto) {
    const filter: Record<string, any> = {};

    if (queryDto.search) {
      const searchRegex = { $regex: queryDto.search.trim(), $options: 'i' };
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
      ];
    }

    if (queryDto.upcoming !== undefined) {
      const now = new Date();
      if (queryDto.upcoming) {
        filter.date = { $gte: now };
      } else {
        filter.date = { $lt: now };
      }
    }

    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const skip = (page - 1) * limit;

    const sortOrder = queryDto.upcoming ? 1 : -1;

    const [data, total] = await Promise.all([
      this.eventModel.find(filter).sort({ date: sortOrder }).skip(skip).limit(limit).exec(),
      this.eventModel.countDocuments(filter).exec(),
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

  async findById(id: string): Promise<EventDocument> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }
    return event;
  }

  async create(createDto: CreateEventDto): Promise<EventDocument> {
    const event = new this.eventModel(createDto);
    return event.save();
  }

  async update(id: string, updateDto: UpdateEventDto): Promise<EventDocument> {
    const event = await this.findById(id);
    Object.assign(event, updateDto);
    return event.save();
  }

  async delete(id: string): Promise<{ message: string; deletedId: string }> {
    const event = await this.findById(id);
    await this.eventModel.findByIdAndDelete(id).exec();
    return { message: `Event "${event.title}" successfully deleted`, deletedId: id };
  }
}
