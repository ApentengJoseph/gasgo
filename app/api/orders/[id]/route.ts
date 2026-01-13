/**
 * GET /api/orders/[id] - Get order details
 * PATCH /api/orders/[id] - Update order
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { authenticateRequest, optionalAuth } from '@/lib/auth/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await optionalAuth(request);

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        station: {
          select: {
            id: true,
            name: true,
            address: true,
            latitude: true,
            longitude: true,
          },
        },
        address: true,
        rider: {
          include: {
            user: {
              select: {
                fullName: true,
                phone: true,
              },
            },
          },
        },
        ratings: {
          where: {
            userId: user?.userId || undefined,
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

    // Check access (user must own order or be admin/rider)
    if (
      user &&
      order.userId !== user.userId &&
      user.role !== 'ADMIN' &&
      user.role !== 'RIDER'
    ) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Guest orders can only be accessed with session ID
    if (!user && order.guestSessionId) {
      const sessionId = request.headers.get('x-guest-session-id');
      if (sessionId !== order.guestSessionId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error) return auth.error;

    const { user } = auth;
    const body = await request.json();

    // Only admin and riders can update orders
    if (user.role !== 'ADMIN' && user.role !== 'RIDER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.riderId && { riderId: body.riderId }),
        ...(body.currentLatitude !== undefined && {
          currentLatitude: body.currentLatitude,
        }),
        ...(body.currentLongitude !== undefined && {
          currentLongitude: body.currentLongitude,
        }),
        ...(body.estimatedDelivery && {
          estimatedDelivery: new Date(body.estimatedDelivery),
        }),
        ...(body.deliveredAt && { deliveredAt: new Date(body.deliveredAt) }),
      },
      include: {
        station: true,
        rider: true,
        user: {
          select: {
            id: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

