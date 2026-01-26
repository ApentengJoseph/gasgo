import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true, unique: true })
  reference: string;

  @Prop({ required: true })
  amount: number;

  @Prop({
    required: true,
    default: 'pending',
    enum: ['pending', 'completed', 'failed', 'cancelled'],
  })
  status: string;

  @Prop({ default: 'paystack' })
  paymentMethod: string;

  @Prop()
  paidAt?: Date;

  @Prop()
  failureReason?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Indexes
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ reference: 1 });
