import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type TagDocument = HydratedDocument<Tag>;

@Schema({
  timestamps: true,
  collection: 'tags',
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
export class Tag {
  @Prop({ type: String, default: () => uuidv4() })
  _id: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
    set: (v: string) => v?.trim().toLowerCase(),
  })
  name: string;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
