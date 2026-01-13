/**
 * POST /api/payments/verify
 * Verify Paystack payment and update order
 */

import { NextRequest, NextResponse } from 'next/server';
// import { verifyPaystackPayment } from '@/lib/payments/paystack-server';
// import { prisma } from '@/lib/db/prisma';
// import { createNotification } from '@/lib/utils/notifications';
import { z } from 'zod';

const verifyPaymentSchema = z.object({
  reference: z.string(),
});

export async function POST(request: NextRequest) {
  // TODO: Implement when backend is ready
  return NextResponse.json(
    { error: 'Not implemented yet' },
    { status: 501 }
  );
}
