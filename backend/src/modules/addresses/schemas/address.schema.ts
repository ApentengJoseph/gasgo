import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AddressDocument = Address & Document;

@Schema({ timestamps: true })
export class Address {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  addressLine1: string;

  @Prop()
  addressLine2?: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  region: string;

  @Prop({ default: 'Ghana' })
  country: string;

  @Prop()
  postalCode?: string;

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop()
  plusCode?: string;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop()
  deliveryNotes?: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

// Indexes
AddressSchema.index({ userId: 1 });
AddressSchema.index({ location: '2dsphere' });
