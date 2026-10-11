import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type AdminDocument = HydratedDocument<Admin>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_, ret: Record<string, any>) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.passwordHash;
      return ret;
    },
  },
})
export class Admin {
  @Prop({ type: String, default: () => uuidv4() })
  _id: string;

  @Prop({ type: String, required: true, unique: true })
  username: string;

  @Prop({ type: String, required: true })
  passwordHash: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
