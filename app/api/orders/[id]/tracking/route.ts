/**
 * GET /api/orders/[id]/tracking
 * Get real-time order tracking data
 */

import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/db/prisma';
// import { optionalAuth } from '@/lib/auth/middleware';
// import { calculateETA } from '@/lib/utils/distance';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // TODO: Implement when backend is ready
  return NextResponse.json(
    { error: 'Not implemented yet' },
    { status: 501 }
  );
}
