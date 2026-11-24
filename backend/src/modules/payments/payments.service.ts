import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import axios from 'axios';
import { Payment } from './schemas/payment.schema';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { OrdersService } from '../orders/orders.service';

const PAYSTACK_BASE = 'https://api.paystack.co';

const MOBILE_MONEY_CHANNEL_MAP: Record<string, string> = {
  mtn: 'mtn_mobile_money',
  vod: 'vodafone_cash',
  tgo: 'airtel_tigogh',
  card: 'card',
};

@Injectable()
export class PaymentsService {
  private readonly secretKey: string;

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    private configService: ConfigService,
    private ordersService: OrdersService,
  ) {
    this.secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY') || '';
    if (!this.secretKey) {
      console.warn('[PaymentsService] PAYSTACK_SECRET_KEY is not set');
    }
  }

  async initialize(dto: InitializePaymentDto) {
    const { orderId, email, amount, channel = 'mtn' } = dto;

    const order = await this.ordersService.findById(orderId);
    if (!order) throw new BadRequestException('Order not found');

    // Idempotency: if a pending payment already exists for this order return it
    const existing = await this.paymentModel.findOne({ orderId, status: 'pending' });
    if (existing) {
      return { success: true, reference: existing.reference };
    }

    const reference = `GAS_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const amountPesewas = Math.round(amount * 100);

    const paystackChannel = MOBILE_MONEY_CHANNEL_MAP[channel] || 'mtn_mobile_money';
    const callbackUrl = `${this.configService.get<string>('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000'}/api/payments/callback`;

    let authorizationUrl: string | undefined;
    let accessCode: string | undefined;

    try {
      const res = await axios.post(
        `${PAYSTACK_BASE}/transaction/initialize`,
        {
          email,
          amount: amountPesewas,
          reference,
          currency: 'GHS',
          callback_url: `${callbackUrl}?reference=${reference}`,
          channels: [paystackChannel],
          metadata: {
            orderId,
            orderNumber: order.orderNumber,
            channel,
            custom_fields: [
              { display_name: 'Order Number', variable_name: 'order_number', value: order.orderNumber },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      authorizationUrl = res.data.data.authorization_url;
      accessCode = res.data.data.access_code;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Paystack initialization failed';
      throw new BadRequestException(msg);
    }

    await this.paymentModel.create({
      orderId,
      reference,
      amount,
      status: 'pending',
      paymentMethod: 'paystack',
      channel: paystackChannel,
    });

    return { success: true, reference, authorizationUrl, accessCode };
  }

  async verify(dto: VerifyPaymentDto & { orderId?: string }) {
    const { reference } = dto;

    // Fetch from Paystack
    let paymentData: any;
    try {
      const res = await axios.get(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${this.secretKey}` },
      });
      paymentData = res.data.data;
    } catch (err: any) {
      throw new BadRequestException(err.response?.data?.message || 'Failed to verify payment');
    }

    const payment = await this.paymentModel.findOne({ reference });
    if (!payment) throw new BadRequestException('Payment record not found');

    const isSuccess = paymentData.status === 'success';

    payment.status = isSuccess ? 'completed' : 'failed';
    payment.paidAt = paymentData.paid_at ? new Date(paymentData.paid_at) : undefined;
    payment.channel = paymentData.channel || payment.channel;
    await payment.save();

    if (isSuccess) {
      await this.ordersService.update(payment.orderId, {
        paymentStatus: 'paid',
        paymentReference: reference,
        status: 'confirmed',
        confirmedAt: new Date(),
      });
    }

    return {
      success: isSuccess,
      status: paymentData.status,
      amount: paymentData.amount / 100,
      reference,
    };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    // CRITICAL: verify signature using raw body bytes
    const expectedSig = crypto
      .createHmac('sha512', this.secretKey)
      .update(rawBody)
      .digest('hex');

    if (!signature || expectedSig !== signature) {
      throw new UnauthorizedException('Invalid Paystack webhook signature');
    }

    let event: any;
    try {
      event = JSON.parse(rawBody.toString('utf8'));
    } catch {
      throw new BadRequestException('Invalid JSON in webhook body');
    }

    switch (event.event) {
      case 'charge.success':
        await this.verify({ reference: event.data.reference });
        break;

      case 'transfer.success':
      case 'transfer.failed':
        // Handle rider payouts if implemented
        break;

      default:
        // Ignore unknown events — always return 200 to Paystack
        break;
    }

    return { received: true };
  }

  async handleCallback(reference: string) {
    return this.verify({ reference });
  }
}
