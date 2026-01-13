/**
 * GET /api/stations
 * Get all active stations with inventory
 */

import { NextRequest, NextResponse } from 'next/server';
// // import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  // TODO: Implement when backend is ready
  return NextResponse.json(
    { error: 'Not implemented yet' },
    { status: 501 }
  );
}

