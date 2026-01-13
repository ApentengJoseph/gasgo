/**
 * POST /api/coupons/validate
 * Validate a coupon code
 */

import { NextRequest, NextResponse } from 'next/server';
// import { validateCoupon } from '@/lib/utils/coupon';
import { z } from 'zod';

const validateCouponSchema = z.object({
  code: z.string().min(1),
  orderAmount: z.number().min(0),
});

export async function POST(request: NextRequest) {
  // TODO: Implement when backend is ready
  return NextResponse.json(
    { error: 'Not implemented yet' },
    { status: 501 }
  );
}

