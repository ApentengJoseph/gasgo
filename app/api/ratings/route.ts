/**
 * POST /api/ratings
 * Submit a rating for an order/station/rider
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const createRatingSchema = z.object({
  orderId: z.string(),
  stationId: z.string().optional(),
  riderId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error) return auth.error;

    const { user } = auth;
    const body = await request.json();
    const data = createRatingSchema.parse(body);

    // Verify order belongs to user
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if rating already exists
    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_orderId: {
          userId: user.userId,
          orderId: data.orderId,
        },
      },
    });

    if (existingRating) {
      return NextResponse.json(
        { error: 'Rating already submitted for this order' },
        { status: 400 }
      );
    }

    // Create rating
    const rating = await prisma.rating.create({
      data: {
        userId: user.userId,
        orderId: data.orderId,
        stationId: data.stationId || order.stationId,
        riderId: data.riderId || order.riderId || undefined,
        rating: data.rating,
        comment: data.comment || null,
      },
    });

    // Update station/rider average ratings
    if (data.stationId) {
      await updateStationRating(data.stationId);
    }

    if (data.riderId) {
      await updateRiderRating(data.riderId);
    }

    return NextResponse.json({
      success: true,
      rating,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create rating error:', error);
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    );
  }
}

async function updateStationRating(stationId: string) {
  const ratings = await prisma.rating.findMany({
    where: { stationId },
    select: { rating: true },
  });

  const avgRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

  // You can store this in a separate table or update station metadata
  // For now, we'll just return it
  return avgRating;
}

async function updateRiderRating(riderId: string) {
  const ratings = await prisma.rating.findMany({
    where: { riderId },
    select: { rating: true },
  });

  const avgRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

  // Update rider rating
  await prisma.rider.update({
    where: { id: riderId },
    data: { rating: avgRating },
  });

  return avgRating;
}

