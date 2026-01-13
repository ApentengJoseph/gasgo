/**
 * POST /api/payments/initialize
 * Initialize Paystack payment
 */

import { NextRequest, NextResponse } from 'next/server';
// import { optionalAuth } from '@/lib/auth/middleware';
// import { prisma } from '@/lib/db/prisma';
// import { initializePaystackPayment } from '@/lib/payments/paystack-server';
// Amount is already in GHS, Paystack server function handles conversion
import { z } from 'zod';

const initializePaymentSchema = z.object({
  orderId: z.string(),
  paymentMethod: z.enum(['MOBILE_MONEY', 'CARD']),
  phone: z.string().optional(),
  network: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // TODO: Implement when backend is ready
  return NextResponse.json(
    { error: 'Not implemented yet' },
    { status: 501 }
  );
}
