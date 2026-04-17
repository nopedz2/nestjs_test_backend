import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop() name: string;
  @Prop({ unique: true, required: true }) email: string;
  @Prop() password: string;
  @Prop() phone?: string;
  @Prop() address?: string;
  @Prop() image?: string;
  @Prop({ default: false }) isActive?: boolean;
  @Prop() codeId?: string;
  @Prop() codeExpire?: Date;
  @Prop({ default: 'USER' }) role?: string; // USER, ADMIN, HR
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);

