/**
 * POST /api/orders/create
 * Create a new order (supports both authenticated and guest users)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { optionalAuth } from '@/lib/auth/middleware';
import { generateOrderNumber, calculateOrderTotal } from '@/lib/utils/order';
import { calculateDeliveryFee, calculateSafekeepingFee } from '@/lib/utils/order';
import { calculateDistance } from '@/lib/utils/distance';
import { isWithinServiceArea } from '@/lib/utils/distance';
import { validateCoupon, applyCoupon } from '@/lib/utils/coupon';
import { z } from 'zod';

const createOrderSchema = z.object({
  stationId: z.string(),
  cylinderSize: z.string(),
  quantity: z.number().int().min(1).default(1),
  deliveryAddress: z.string(),
  deliveryLatitude: z.number(),
  deliveryLongitude: z.number(),
  deliveryNotes: z.string().optional(),
  addressId: z.string().optional(),
  couponCode: z.string().optional(),
  guestSessionId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Optional auth - supports guest orders
    const { user } = await optionalAuth(request);

    const body = await request.json();
    const data = createOrderSchema.parse(body);

    // Check if location is within service area
    if (!isWithinServiceArea(data.deliveryLatitude, data.deliveryLongitude)) {
      return NextResponse.json(
        {
          error: 'Service not available in this location',
          message: 'We are coming to your location soon!',
        },
        { status: 400 }
      );
    }

    // Get station and inventory
    const station = await prisma.station.findUnique({
      where: { id: data.stationId },
      include: {
        inventory: {
          where: {
            cylinderSize: data.cylinderSize,
          },
        },
      },
    });

    if (!station || !station.isActive) {
      return NextResponse.json(
        { error: 'Station not found or inactive' },
        { status: 404 }
      );
    }

    const inventory = station.inventory[0];
    if (!inventory || inventory.quantity < data.quantity) {
      return NextResponse.json(
        { error: 'Insufficient inventory' },
        { status: 400 }
      );
    }

    // Calculate pricing
    const gasPrice = inventory.price * data.quantity;

    // Calculate distance and delivery fee
    const distance = calculateDistance(
      station.latitude,
      station.longitude,
      data.deliveryLatitude,
      data.deliveryLongitude
    );
    const deliveryFee = calculateDeliveryFee(distance);
    const safekeepingFee = calculateSafekeepingFee();

    // Apply coupon if provided
    let discount = 0;
    let appliedCouponCode = null;
    let freeDelivery = false;

    if (data.couponCode) {
      const couponResult = await validateCoupon(
        data.couponCode,
        gasPrice + deliveryFee + safekeepingFee
      );

      if (couponResult.valid && couponResult.discount) {
        appliedCouponCode = data.couponCode.toUpperCase();
        await applyCoupon(appliedCouponCode);

        if (couponResult.discount.type === 'FREE_DELIVERY') {
          freeDelivery = true;
          discount = deliveryFee;
        } else {
          discount = couponResult.discount.discount;
        }
      }
    }

    const finalDeliveryFee = freeDelivery ? 0 : deliveryFee;
    const totalAmount = calculateOrderTotal(
      gasPrice,
      finalDeliveryFee,
      safekeepingFee,
      discount
    );

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user?.userId || null,
        guestSessionId: data.guestSessionId || null,
        stationId: data.stationId,
        addressId: data.addressId || null,
        deliveryAddress: data.deliveryAddress,
        deliveryLatitude: data.deliveryLatitude,
        deliveryLongitude: data.deliveryLongitude,
        deliveryNotes: data.deliveryNotes || null,
        cylinderSize: data.cylinderSize,
        quantity: data.quantity,
        gasPrice,
        deliveryFee: finalDeliveryFee,
        safekeepingFee,
        discount,
        couponCode: appliedCouponCode,
        totalAmount,
        paymentMethod: 'CASH', // Default, will be updated on payment
        status: 'PENDING',
      },
      include: {
        station: {
          select: {
            name: true,
            address: true,
          },
        },
      },
    });

    // Update inventory
    await prisma.stationInventory.update({
      where: {
        id: inventory.id,
      },
      data: {
        quantity: {
          decrement: data.quantity,
        },
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        station: order.station,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

