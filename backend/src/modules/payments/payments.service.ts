import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment } from './schemas/payment.schema';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import axios from 'axios';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class PaymentsService {
  private paystackSecretKey: string;
  private paystackBaseUrl = 'https://api.paystack.co';

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    private configService: ConfigService,
    private ordersService: OrdersService,
  ) {
    this.paystackSecretKey =
      this.configService.get<string>('PAYSTACK_SECRET_KEY') || '';
  }

  async initialize(initializePaymentDto: InitializePaymentDto) {
    const { orderId, email, amount } = initializePaymentDto;

    // Get order
    const order = await this.ordersService.findById(orderId);

    // Generate reference
    const reference = `GAS_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Initialize payment with Paystack
    try {
      const response = await axios.post(
        `${this.paystackBaseUrl}/transaction/initialize`,
        {
          email,
          amount: amount * 100, // Convert to pesewas
          reference,
          callback_url: `${this.configService.get<string>('PAYSTACK_CALLBACK_URL')}?reference=${reference}`,
          metadata: {
            orderId,
            orderNumber: order.orderNumber,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // Save payment record
      await this.paymentModel.create({
        orderId,
        reference,
        amount,
        status: 'pending',
        paymentMethod: 'paystack',
        createdAt: new Date(),
      });

      return {
        success: true,
        authorizationUrl: response.data.data.authorization_url,
        accessCode: response.data.data.access_code,
        reference,
      };
    } catch (error) {
      throw new Error('Failed to initialize payment');
    }
  }

  async verify(verifyPaymentDto: VerifyPaymentDto) {
    const { reference } = verifyPaymentDto;

    try {
      const response = await axios.get(
        `${this.paystackBaseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
          },
        },
      );

      const paymentData = response.data.data;

      // Update payment record
      const payment = await this.paymentModel.findOne({ reference });
      if (payment) {
        payment.status = paymentData.status === 'success' ? 'completed' : 'failed';
        payment.paidAt = paymentData.paid_at ? new Date(paymentData.paid_at) : null;
        await payment.save();

        // Update order payment status
        if (payment.status === 'completed') {
          await this.ordersService.update(payment.orderId, {
            paymentStatus: 'paid',
            paymentReference: reference,
          });
        }
      }

      return {
        success: paymentData.status === 'success',
        status: paymentData.status,
        amount: paymentData.amount / 100, // Convert from pesewas
        reference,
      };
    } catch (error) {
      throw new Error('Failed to verify payment');
    }
  }

  async handleWebhook(body: any, headers: any) {
    // Verify webhook signature
    const hash = this.calculatePaystackHash(JSON.stringify(body));
    if (hash !== headers['x-paystack-signature']) {
      throw new Error('Invalid webhook signature');
    }

    // Handle webhook event
    if (body.event === 'charge.success') {
      const { reference } = body.data;
      await this.verify({ reference });
    }

    return { success: true };
  }

  async handleCallback(reference: string) {
    return this.verify({ reference });
  }

  private calculatePaystackHash(payload: string): string {
    // Implement Paystack webhook signature verification
    // This is a simplified version
    return '';
  }
}
