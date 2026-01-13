/**
 * GET /api/addresses - Get user addresses
 * POST /api/addresses - Create new address
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
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
  try {
    const auth = await authenticateRequest(request);
    if (auth.error) return auth.error;

    const { user } = auth;

    const addresses = await prisma.address.findMany({
      where: { userId: user.userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error) return auth.error;

    const { user } = auth;
    const body = await request.json();
    const data = createAddressSchema.parse(body);

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: user.userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const address = await prisma.address.create({
      data: {
        ...data,
        userId: user.userId,
      },
    });

    return NextResponse.json({
      success: true,
      address,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create address error:', error);
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    );
  }
}

