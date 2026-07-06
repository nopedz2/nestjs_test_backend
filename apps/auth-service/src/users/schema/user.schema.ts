import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop() refreshToken?: string;
  @Prop() name?: string;
  @Prop({ unique: true, required: true }) email: string;
  @Prop({ required: true }) password: string;
  @Prop() phone?: string;
  @Prop() address?: string;
  @Prop() image?: string;
  @Prop({ default: false }) isActive?: boolean;
  @Prop() codeId?: string;
  @Prop() codeExpire?: Date;
  @Prop({ default: 'USER' }) role?: string; // USER, ADMIN, HR
  @Prop({ default: null, index: true }) deletedAt?: Date; // Soft delete with index for faster queries
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);

// Add text indexes for search optimization on name and email fields
UserSchema.index({ name: 'text', email: 'text' });
