/**
 * GET /api/payments/callback
 * Paystack payment callback handler
 */

import { NextRequest, NextResponse } from 'next/server';
// import { verifyPaystackPayment } from '@/lib/payments/paystack-server';
// import { prisma } from '@/lib/db/prisma';
// import { createNotification } from '@/lib/utils/notifications';

export async function GET(request: NextRequest) {
  // TODO: Implement when backend is ready
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('reference');
  
  // Redirect to orders page
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return NextResponse.redirect(
    `${appUrl}/orders?payment=${reference ? 'success' : 'failed'}`
  );
}
