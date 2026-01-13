/**
 * POST /api/orders/create
 * Create a new order (supports both authenticated and guest users)
 */

import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/db/prisma';
// import { optionalAuth } from '@/lib/auth/middleware';
// import { generateOrderNumber, calculateOrderTotal } from '@/lib/utils/order';
// import { calculateDeliveryFee, calculateSafekeepingFee } from '@/lib/utils/order';
// import { calculateDistance } from '@/lib/utils/distance';
// import { isWithinServiceArea } from '@/lib/utils/distance';
// import { validateCoupon, applyCoupon } from '@/lib/utils/coupon';
import { z } from 'zod';

const createOrderSchema = z.object({
  stationId: z.string(),
  cylinderSize: z.string(),
  quantity: z.number().int().min(1).default(1),
  deliveryAddress: z.string(),
  deliveryLatitude: z.number(),
  deliveryLongitude: z.number(),
  deliveryNotes: z.string().optional(),
  addressId: z.string().optional(),
  couponCode: z.string().optional(),
  guestSessionId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // TODO: Implement when backend is ready
  return NextResponse.json(
    { error: 'Not implemented yet' },
    { status: 501 }
  );
}
