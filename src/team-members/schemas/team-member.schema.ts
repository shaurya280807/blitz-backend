import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type TeamMemberDocument = HydratedDocument<TeamMember>;

export enum TeamMemberTier {
  CORE = 'core',
  SENIOR = 'senior',
  JUNIOR = 'junior',
  VOLUNTEER = 'volunteer',
}

@Schema({
  timestamps: true,
  collection: 'team_members',
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
export class TeamMember {
  @Prop({ type: String, default: () => uuidv4() })
  _id: string;

  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, required: true, trim: true })
  position: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(TeamMemberTier),
    index: true,
  })
  tier: TeamMemberTier;

  @Prop({ type: String, default: '' })
  image: string;

  @Prop({ type: String, default: '', trim: true })
  bio: string;

  @Prop({ type: String, default: '', trim: true })
  linkedin: string;

  @Prop({ type: String, default: '', trim: true })
  github: string;

  @Prop({ type: String, default: '', trim: true })
  instagram: string;
}

export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);
