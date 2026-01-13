/**
 * GET /api/stations
 * Get all active stations with inventory
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const region = searchParams.get('region');

    const stations = await prisma.station.findMany({
      where: {
        isActive: true,
        ...(city && { city }),
        ...(region && { region }),
      },
      include: {
        inventory: {
          where: {
            quantity: {
              gt: 0,
            },
          },
        },
        ratings: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Calculate average ratings
    const stationsWithRatings = stations.map((station) => {
      const ratings = station.ratings.map((r) => r.rating);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;

      return {
        id: station.id,
        name: station.name,
        address: station.address,
        city: station.city,
        region: station.region,
        latitude: station.latitude,
        longitude: station.longitude,
        phone: station.phone,
        email: station.email,
        rating: Math.round(avgRating * 10) / 10,
        inventory: station.inventory.map((inv) => ({
          size: inv.cylinderSize,
          quantity: inv.quantity,
          price: inv.price,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      stations: stationsWithRatings,
    });
  } catch (error) {
    console.error('Get stations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stations' },
      { status: 500 }
    );
  }
}

