import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({
  timestamps: true,
  collection: 'projects',
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
export class Project {
  @Prop({ type: String, default: () => uuidv4() })
  _id: string;

  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, required: true, trim: true })
  description: string;

  @Prop({ type: String, default: '', trim: true })
  image: string;

  @Prop({ type: String, default: '', trim: true })
  github: string;

  @Prop({ type: String, default: '', trim: true })
  liveDemo: string;

  @Prop({ type: [String], default: [] })
  team: string[]; // Array of TeamMember UUIDs

  @Prop({ type: [String], default: [] })
  tags: string[]; // Array of Tag UUIDs
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
ProjectSchema.index({ name: 1 });
ProjectSchema.index({ tags: 1 });
ProjectSchema.index({ team: 1 });
