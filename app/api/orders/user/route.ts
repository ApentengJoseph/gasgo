/**
 * GET /api/orders/user
 * Get user's order history
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { authenticateRequest, optionalAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    const { user } = await optionalAuth(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // For authenticated users
    if (user) {
      const orders = await prisma.order.findMany({
        where: {
          userId: user.userId,
          ...(status && { status: status as any }),
        },
        include: {
          station: {
            select: {
              name: true,
              address: true,
            },
          },
          ratings: {
            where: {
              userId: user.userId,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      });

      return NextResponse.json({
        success: true,
        orders,
        pagination: {
          limit,
          offset,
          hasMore: orders.length === limit,
        },
      });
    }

    // For guest users - require session ID
    const guestSessionId = request.headers.get('x-guest-session-id');
    if (!guestSessionId) {
      return NextResponse.json(
        { error: 'Authentication or guest session required' },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        guestSessionId,
        ...(status && { status: status as any }),
      },
      include: {
        station: {
          select: {
            name: true,
            address: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        limit,
        offset,
        hasMore: orders.length === limit,
      },
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

