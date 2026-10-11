import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type AchievementDocument = HydratedDocument<Achievement>;

@Schema({
  timestamps: true,
  collection: 'achievements',
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
export class Achievement {
  @Prop({ type: String, default: () => uuidv4() })
  _id: string;

  @Prop({ type: Number, required: true, index: true })
  year: number;

  @Prop({ type: String, required: true, trim: true })
  title: string;

  // IMPORTANT: team is kept strictly as an editable string as specified in the Master Prompt
  @Prop({ type: String, required: true, trim: true })
  team: string;

  @Prop({ type: String, required: true, trim: true })
  event: string;

  @Prop({ type: String, required: true, trim: true })
  result: string;

  @Prop({ type: String, default: '' })
  image: string;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);
