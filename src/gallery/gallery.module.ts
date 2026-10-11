import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GalleryItem, GalleryItemSchema } from './schemas/gallery-item.schema';
import { GalleryService } from './gallery.service';
import { GalleryController } from './gallery.controller';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: GalleryItem.name, schema: GalleryItemSchema }]),
    UploadsModule,
  ],
  controllers: [GalleryController],
  providers: [GalleryService],
  exports: [GalleryService, MongooseModule],
})
export class GalleryModule {}
