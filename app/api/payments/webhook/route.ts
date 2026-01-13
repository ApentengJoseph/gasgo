/**
 * POST /api/payments/webhook
 * Paystack webhook handler for payment events
 */

import { NextRequest, NextResponse } from 'next/server';
// import { verifyPaystackWebhook } from '@/lib/payments/paystack-server';
// import { prisma } from '@/lib/db/prisma';
// import { createNotification } from '@/lib/utils/notifications';

export async function POST(request: NextRequest) {
  // TODO: Implement when backend is ready
  return NextResponse.json(
    { received: true, message: 'Webhook received but not processed (backend not implemented)' }
  );
}
