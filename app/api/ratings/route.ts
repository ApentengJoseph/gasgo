/**
 * POST /api/ratings
 * Submit a rating for an order/station/rider
 */

import { NextRequest, NextResponse } from 'next/server';
// import { authenticateRequest } from '@/lib/auth/middleware';
// import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const createRatingSchema = z.object({
  orderId: z.string(),
  stationId: z.string().optional(),
  riderId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // TODO: Implement when backend is ready
  return NextResponse.json(
    { error: 'Not implemented yet' },
    { status: 501 }
  );
}
