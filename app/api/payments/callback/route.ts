/**
 * GET /api/payments/callback
 * Paystack payment callback handler
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyPaystackPayment } from '@/lib/payments/paystack-server';
import { prisma } from '@/lib/db/prisma';
import { createNotification } from '@/lib/utils/notifications';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/orders?error=payment_failed`
      );
    }

    // Verify payment
    const paymentData = await verifyPaystackPayment(reference);

    if (!paymentData.status || paymentData.data.status !== 'success') {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/orders?error=payment_failed`
      );
    }

    // Find and update order
    const order = await prisma.order.findFirst({
      where: { paymentReference: reference },
      include: { user: true },
    });

    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'COMPLETED',
          paidAt: new Date(),
          status: 'CONFIRMED',
        },
      });

      // Create notification
      if (order.userId) {
        await createNotification({
          userId: order.userId,
          orderId: order.id,
          type: 'PAYMENT_CONFIRMED',
          title: 'Payment Confirmed',
          message: `Your payment has been confirmed. Order #${order.orderNumber} is being processed.`,
        });
      }
    }

    // Redirect to orders page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/orders?payment=success&orderId=${order?.id}`
    );
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/orders?error=payment_failed`
    );
  }
}

