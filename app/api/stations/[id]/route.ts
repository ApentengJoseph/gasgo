/**
 * GET /api/stations/[id]
 * Get single station details
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const station = await prisma.station.findUnique({
      where: { id: params.id },
      include: {
        inventory: true,
        ratings: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!station) {
      return NextResponse.json(
        { error: 'Station not found' },
        { status: 404 }
      );
    }

    // Calculate average rating
    const ratings = station.ratings.map((r) => r.rating);
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;

    return NextResponse.json({
      success: true,
      station: {
        ...station,
        rating: Math.round(avgRating * 10) / 10,
        totalRatings: ratings.length,
      },
    });
  } catch (error) {
    console.error('Get station error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch station' },
      { status: 500 }
    );
  }
}

