/**
 * POST /api/coupons/validate
 * Validate a coupon code
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/utils/coupon';
import { z } from 'zod';

const validateCouponSchema = z.object({
  code: z.string().min(1),
  orderAmount: z.number().min(0),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, orderAmount } = validateCouponSchema.parse(body);

    const result = await validateCoupon(code, orderAmount);

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error || 'Invalid coupon code' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      discount: result.discount,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Validate coupon error:', error);
    return NextResponse.json(
      { error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}

