/**
 * POST /api/delivery/eta
 * Calculate delivery ETA
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateETA } from '@/lib/utils/distance';
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
  try {
    const body = await request.json();
    const { origin, destination } = calculateETASchema.parse(body);

    const apiKey =
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY ||
      '';

    const result = await calculateETA(origin, destination, apiKey);

    return NextResponse.json({
      success: true,
      distance: result.distance,
      duration: result.duration,
      estimatedArrival: new Date(
        Date.now() + result.duration * 60 * 1000
      ).toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Calculate ETA error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate ETA' },
      { status: 500 }
    );
  }
}

