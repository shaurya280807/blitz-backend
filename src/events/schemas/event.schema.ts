import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type EventDocument = HydratedDocument<Event>;

@Schema({
  timestamps: true,
  collection: 'events',
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
export class Event {
  @Prop({ type: String, default: () => uuidv4() })
  _id: string;

  @Prop({ type: String, required: true, trim: true })
  title: string;

  @Prop({ type: String, required: true, trim: true })
  description: string;

  @Prop({ type: Date, required: true, index: true })
  date: Date;

  @Prop({ type: String, required: true, trim: true })
  location: string;

  @Prop({ type: String, default: '', trim: true })
  additionalInfo: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
