/**
 * POST /api/payments/initialize
 * Initialize Paystack payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { optionalAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { initializePaystackPayment } from '@/lib/payments/paystack-server';
// Amount is already in GHS, Paystack server function handles conversion
import { z } from 'zod';

const initializePaymentSchema = z.object({
  orderId: z.string(),
  paymentMethod: z.enum(['MOBILE_MONEY', 'CARD']),
  phone: z.string().optional(),
  network: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { user } = await optionalAuth(request);

    const body = await request.json();
    const { orderId, paymentMethod, phone, network } =
      initializePaymentSchema.parse(body);

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check access
    if (user && order.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (order.paymentStatus === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Order already paid' },
        { status: 400 }
      );
    }

    // Get email for payment
    const email =
      user && order.user
        ? order.user.email || `${order.user.phone}@gaso.gh`
        : phone
        ? `${phone}@gaso.gh`
        : 'customer@gaso.gh';

    // Initialize Paystack payment
    const paymentData = await initializePaystackPayment({
      email,
      amount: order.totalAmount,
      reference: order.orderNumber,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        phone: phone || order.user?.phone,
        network: network || undefined,
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback`,
      channels:
        paymentMethod === 'MOBILE_MONEY'
          ? ['mobile_money']
          : ['card', 'bank'],
    });

    // Update order with payment reference
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentMethod,
        paymentStatus: 'PROCESSING',
        paymentReference: paymentData.data.reference,
      },
    });

    return NextResponse.json({
      success: true,
      authorizationUrl: paymentData.data.authorization_url,
      accessCode: paymentData.data.access_code,
      reference: paymentData.data.reference,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Initialize payment error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 500 }
    );
  }
}

