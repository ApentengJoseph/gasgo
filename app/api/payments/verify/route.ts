/**
 * POST /api/payments/verify
 * Verify Paystack payment and update order
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyPaystackPayment } from '@/lib/payments/paystack-server';
import { prisma } from '@/lib/db/prisma';
import { createNotification } from '@/lib/utils/notifications';
import { z } from 'zod';

const verifyPaymentSchema = z.object({
  reference: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference } = verifyPaymentSchema.parse(body);

    // Verify payment with Paystack
    const paymentData = await verifyPaystackPayment(reference);

    if (!paymentData.status || paymentData.data.status !== 'success') {
      return NextResponse.json(
        { error: 'Payment verification failed', data: paymentData },
        { status: 400 }
      );
    }

    // Find order by payment reference
    const order = await prisma.order.findFirst({
      where: {
        paymentReference: reference,
      },
      include: {
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order payment status
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'COMPLETED',
        paidAt: new Date(),
        status: 'CONFIRMED', // Move to confirmed after payment
      },
    });

    // Create notification for user
    if (order.userId) {
      await createNotification({
        userId: order.userId,
        orderId: order.id,
        type: 'PAYMENT_CONFIRMED',
        title: 'Payment Confirmed',
        message: `Your payment of GH₵${order.totalAmount.toFixed(2)} has been confirmed. Order #${order.orderNumber} is being processed.`,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}

