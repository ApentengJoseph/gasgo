import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  phone: string;

  @Prop()
  email?: string;

  @Prop()
  name?: string;

  @Prop()
  avatar?: string;

  @Prop({ default: false })
  isPhoneVerified: boolean;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: 'customer' })
  role: string; // 'customer', 'rider', 'admin'

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  fcmToken?: string; // For push notifications
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ phone: 1 });
UserSchema.index({ email: 1 });
