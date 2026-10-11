import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type GalleryItemDocument = HydratedDocument<GalleryItem>;

@Schema({
  timestamps: true,
  collection: 'gallery',
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_, ret: Record<string, any>) => {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    },
  },
})
export class GalleryItem {
  @Prop({ type: String, default: () => uuidv4() })
  _id: string;

  @Prop({ type: String, required: true, trim: true })
  title: string;

  @Prop({ type: String, required: true })
  image: string;
}

export const GalleryItemSchema = SchemaFactory.createForClass(GalleryItem);
