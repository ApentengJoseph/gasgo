/**
 * GET /api/stations/[id]
 * Get single station details
 */

import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/db/prisma';

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
