import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop() refreshToken?: string;
  @Prop() name?: string;
  @Prop({ unique: true, required: true }) email: string;
  @Prop({ required: true }) password: string;
  @Prop() username?: string;
  @Prop() tenantId?: string;
  @Prop({ type: [String], default: [] }) permissions?: string[];
  @Prop({
    type: [
      {
        sessionId: String,
        valid: { type: Boolean, default: true },
        createdAt: Date,
      },
    ],
    default: [],
  })
  sessions?: Array<{ sessionId: string; valid: boolean; createdAt: Date }>;
  @Prop() phone?: string;
  @Prop() address?: string;
  @Prop() image?: string;
  @Prop({ default: false }) isActive?: boolean;
  @Prop() codeId?: string;
  @Prop() codeExpire?: Date;
  @Prop({ default: 'USER' }) role?: string;
  @Prop({ default: null, index: true }) deletedAt?: Date;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ name: 'text', email: 'text' });
