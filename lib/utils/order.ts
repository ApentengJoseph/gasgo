/**
 * Order Utilities
 * Order number generation, status management, etc.
 */

import { prisma } from '@/lib/db/prisma';

/**
 * Generate unique order number (GAS + timestamp + random)
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `GAS${timestamp}${random}`;
}

/**
 * Calculate delivery fee based on distance
 */
export function calculateDeliveryFee(distanceKm: number): number {
  // Base fee: GH₵5
  // Per km: GH₵0.50
  const baseFee = 5;
  const perKm = 0.5;
  const maxFee = 20; // Maximum delivery fee
  
  const fee = baseFee + (distanceKm * perKm);
  return Math.min(fee, maxFee);
}

/**
 * Calculate safekeeping fee
 */
export function calculateSafekeepingFee(): number {
  return 5; // Fixed GH₵5
}

/**
 * Calculate total order amount
 */
export function calculateOrderTotal(
  gasPrice: number,
  deliveryFee: number,
  safekeepingFee: number,
  discount: number = 0
): number {
  const subtotal = gasPrice + deliveryFee + safekeepingFee;
  return Math.max(0, subtotal - discount);
}

/**
 * Get next order status based on current status
 */
export function getNextOrderStatus(currentStatus: string): string | null {
  const statusFlow: Record<string, string> = {
    PENDING: 'CONFIRMED',
    CONFIRMED: 'ASSIGNED',
    ASSIGNED: 'AT_STATION',
    AT_STATION: 'COLLECTED',
    COLLECTED: 'ON_THE_WAY',
    ON_THE_WAY: 'ARRIVING',
    ARRIVING: 'DELIVERED',
  };

  return statusFlow[currentStatus] || null;
}

/**
 * Check if order can be cancelled
 */
export function canCancelOrder(status: string): boolean {
  const cancellableStatuses = ['PENDING', 'CONFIRMED', 'ASSIGNED'];
  return cancellableStatuses.includes(status);
}

