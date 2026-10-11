import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type GalleryDocument = HydratedDocument<Gallery>;

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
export class Gallery {
  @Prop({ type: String, default: () => uuidv4() })
  _id: string;

  @Prop({ type: String, required: true, trim: true })
  image: string;

  @Prop({ type: String, required: true, trim: true })
  title: string;
}

export const GallerySchema = SchemaFactory.createForClass(Gallery);
GallerySchema.index({ createdAt: -1 });
