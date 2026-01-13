/**
 * POST /api/delivery/eta
 * Calculate delivery ETA
 */

import { NextRequest, NextResponse } from 'next/server';
// import { calculateETA } from '@/lib/utils/distance';
import { z } from 'zod';

const calculateETASchema = z.object({
  origin: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  destination: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
});

export async function POST(request: NextRequest) {
  // TODO: Implement when backend is ready
  return NextResponse.json(
    { error: 'Not implemented yet' },
    { status: 501 }
  );
}
