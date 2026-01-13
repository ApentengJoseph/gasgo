/**
 * Coupon/Promo Code Utilities
 */

import { prisma } from '@/lib/db/prisma';

export interface CouponDiscount {
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_DELIVERY';
  value: number;
  discount: number;
  maxDiscount?: number;
}

/**
 * Validate and apply coupon code
 */
export async function validateCoupon(
  code: string,
  orderAmount: number
): Promise<{ valid: boolean; discount?: CouponDiscount; error?: string }> {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!coupon) {
    return { valid: false, error: 'Invalid coupon code' };
  }

  if (!coupon.isActive) {
    return { valid: false, error: 'Coupon is not active' };
  }

  const now = new Date();
  if (now < coupon.validFrom || now > coupon.validUntil) {
    return { valid: false, error: 'Coupon has expired' };
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, error: 'Coupon usage limit reached' };
  }

  if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
    return {
      valid: false,
      error: `Minimum order amount is GH₵${coupon.minOrderAmount}`,
    };
  }

  let discount = 0;

  switch (coupon.type) {
    case 'PERCENTAGE':
      discount = (orderAmount * coupon.value) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
      break;
    case 'FIXED_AMOUNT':
      discount = coupon.value;
      break;
    case 'FREE_DELIVERY':
      // This should be handled separately in order calculation
      discount = 0; // Will be applied to delivery fee
      break;
  }

  return {
    valid: true,
    discount: {
      type: coupon.type,
      value: coupon.value,
      discount,
      maxDiscount: coupon.maxDiscount || undefined,
    },
  };
}

/**
 * Apply coupon to order (increment usage)
 */
export async function applyCoupon(code: string): Promise<void> {
  await prisma.coupon.update({
    where: { code: code.toUpperCase() },
    data: {
      usedCount: {
        increment: 1,
      },
    },
  });
}

