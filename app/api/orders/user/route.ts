/**
 * GET /api/orders/user
 * Get user's order history
 */

import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/db/prisma';
// import { authenticateRequest, optionalAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  // TODO: Implement when backend is ready
  return NextResponse.json(
    { error: 'Not implemented yet' },
    { status: 501 }
  );
}
