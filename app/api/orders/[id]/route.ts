/**
 * GET /api/orders/[id] - Get order details
 * PATCH /api/orders/[id] - Update order
 */

import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/db/prisma';
// import { authenticateRequest, optionalAuth } from '@/lib/auth/middleware';

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // TODO: Implement when backend is ready
  return NextResponse.json(
    { error: 'Not implemented yet' },
    { status: 501 }
  );
}
