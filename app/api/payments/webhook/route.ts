/**
 * POST /api/payments/webhook
 * Paystack webhook handler for payment events
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyPaystackWebhook } from '@/lib/payments/paystack-server';
import { prisma } from '@/lib/db/prisma';
import { createNotification } from '@/lib/utils/notifications';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-paystack-signature');
    const body = await request.text();

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifyPaystackWebhook(body, signature);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handlePaymentSuccess(event.data);
        break;
      case 'charge.failed':
        await handlePaymentFailed(event.data);
        break;
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(data: any) {
  const order = await prisma.order.findFirst({
    where: { paymentReference: data.reference },
    include: { user: true },
  });

  if (order && order.paymentStatus !== 'COMPLETED') {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'COMPLETED',
        paidAt: new Date(),
        status: 'CONFIRMED',
      },
    });

    if (order.userId) {
      await createNotification({
        userId: order.userId,
        orderId: order.id,
        type: 'PAYMENT_CONFIRMED',
        title: 'Payment Confirmed',
        message: `Your payment of GH₵${order.totalAmount.toFixed(2)} has been confirmed.`,
      });
    }
  }
}

async function handlePaymentFailed(data: any) {
  const order = await prisma.order.findFirst({
    where: { paymentReference: data.reference },
    include: { user: true },
  });

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'FAILED',
      },
    });

    if (order.userId) {
      await createNotification({
        userId: order.userId,
        orderId: order.id,
        type: 'ORDER_CANCELLED',
        title: 'Payment Failed',
        message: `Payment for order #${order.orderNumber} failed. Please try again.`,
      });
    }
  }
}

