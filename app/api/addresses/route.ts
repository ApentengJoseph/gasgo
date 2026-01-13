/**
 * GET /api/addresses - Get user addresses
 * POST /api/addresses - Create new address
 */

import { NextRequest, NextResponse } from 'next/server';
// // import { authenticateRequest } from '@/lib/auth/middleware';
// // import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const createAddressSchema = z.object({
  label: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  region: z.string().min(1),
  country: z.string().default('Ghana'),
  postalCode: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  plusCode: z.string().optional(),
  isDefault: z.boolean().default(false),
  deliveryNotes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  // TODO: Implement when backend is ready
  return NextResponse.json(
    { error: 'Not implemented yet' },
    { status: 501 }
  );
}

export async function POST(request: NextRequest) {
  // TODO: Implement when backend is ready
  return NextResponse.json(
    { error: 'Not implemented yet' },
    { status: 501 }
  );
}

