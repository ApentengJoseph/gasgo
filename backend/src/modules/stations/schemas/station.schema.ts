import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StationDocument = Station & Document;

@Schema({ timestamps: true })
export class Station {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop()
  phone?: string;

  @Prop()
  email?: string;

  @Prop({ type: Object })
  pricing: {
    '6kg'?: number;
    '12kg'?: number;
    '25kg'?: number;
  };

  @Prop({ type: Object })
  inventory: {
    '6kg'?: number;
    '12kg'?: number;
    '25kg'?: number;
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  operatingHours?: string;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  totalRatings: number;
}

export const StationSchema = SchemaFactory.createForClass(Station);

// Index for geospatial queries
StationSchema.index({ location: '2dsphere' });
