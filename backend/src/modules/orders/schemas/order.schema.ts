import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop()
  userId?: string; // Optional for guest orders

  @Prop()
  guestSessionId?: string;

  @Prop({ required: true })
  stationId: string;

  @Prop({ required: true })
  stationName: string;

  @Prop({ required: true })
  stationLocation: string;

  @Prop({ required: true })
  cylinderSize: string;

  @Prop({ required: true, default: 1 })
  quantity: number;

  @Prop({ required: true })
  cylinderPrice: number;

  @Prop({ required: true })
  deliveryAddress: string;

  @Prop({ required: true })
  deliveryLatitude: number;

  @Prop({ required: true })
  deliveryLongitude: number;

  @Prop()
  deliveryNotes?: string;

  @Prop()
  addressId?: string;

  @Prop({ required: true })
  subtotal: number;

  @Prop({ required: true, default: 0 })
  deliveryFee: number;

  @Prop({ required: true, default: 0 })
  safekeepingFee: number;

  @Prop({ required: true, default: 0 })
  discount: number;

  @Prop()
  couponCode?: string;

  @Prop({ required: true })
  total: number;

  @Prop({
    required: true,
    default: 'pending',
    enum: [
      'pending',
      'confirmed',
      'assigned',
      'at_station',
      'collected',
      'on_the_way',
      'arriving',
      'delivered',
      'cancelled',
    ],
  })
  status: string;

  @Prop()
  riderId?: string;

  @Prop()
  estimatedDeliveryTime?: Date;

  @Prop()
  riderLocation?: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  };

  @Prop()
  paymentStatus?: string;

  @Prop()
  paymentReference?: string;

  @Prop()
  deliveredAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Indexes
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ riderId: 1 });
