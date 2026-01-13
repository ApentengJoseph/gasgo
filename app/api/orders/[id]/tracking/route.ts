/**
 * GET /api/orders/[id]/tracking
 * Get real-time order tracking data
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { optionalAuth } from '@/lib/auth/middleware';
import { calculateETA } from '@/lib/utils/distance';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await optionalAuth(request);
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        station: {
          select: {
            latitude: true,
            longitude: true,
          },
        },
        rider: {
          select: {
            currentLatitude: true,
            currentLongitude: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check access
    if (user && order.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Calculate ETA if rider is assigned and has location
    let eta = null;
    if (
      order.rider &&
      order.rider.currentLatitude &&
      order.rider.currentLongitude
    ) {
      const stationPos = {
        lat: order.station.latitude,
        lng: order.station.longitude,
      };
      const riderPos = {
        lat: order.rider.currentLatitude,
        lng: order.rider.currentLongitude,
      };
      const destinationPos = {
        lat: order.deliveryLatitude,
        lng: order.deliveryLongitude,
      };

      // Calculate ETA from rider to destination
      const result = await calculateETA(riderPos, destinationPos, apiKey);
      eta = {
        distance: result.distance,
        duration: result.duration, // in minutes
        estimatedArrival: new Date(
          Date.now() + result.duration * 60 * 1000
        ),
      };
    }

    return NextResponse.json({
      success: true,
      tracking: {
        orderId: order.id,
        status: order.status,
        station: {
          latitude: order.station.latitude,
          longitude: order.station.longitude,
        },
        destination: {
          latitude: order.deliveryLatitude,
          longitude: order.deliveryLongitude,
        },
        rider: order.rider
          ? {
              latitude: order.rider.currentLatitude,
              longitude: order.rider.currentLongitude,
            }
          : null,
        eta,
        trackingHistory: order.trackingHistory || [],
      },
    });
  } catch (error) {
    console.error('Get tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking data' },
      { status: 500 }
    );
  }
}

