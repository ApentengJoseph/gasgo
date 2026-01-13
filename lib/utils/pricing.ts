/**
 * Pricing calculation utilities
 */

export interface PricingBreakdown {
  gasCost: number;
  baseDeliveryFee: number;
  distanceFee: number;
  deliveryFee: number;
  safekeeping: number;
  total: number;
}

export interface PricingConfig {
  baseDeliveryFee: number; // GH₵10
  safekeepingFee: number; // GH₵5
  distanceRate: number; // GH₵1.8 per km
}

const DEFAULT_CONFIG: PricingConfig = {
  baseDeliveryFee: 10,
  safekeepingFee: 5,
  distanceRate: 1.8,
};

/**
 * Calculate delivery fee based on distance
 */
export function calculateDeliveryFee(
  distance: number, // in kilometers
  config: PricingConfig = DEFAULT_CONFIG
): number {
  const distanceFee = distance * config.distanceRate;
  return config.baseDeliveryFee + distanceFee;
}

/**
 * Calculate total order price
 */
export function calculateTotalPrice(
  gasCost: number,
  distance: number,
  config: PricingConfig = DEFAULT_CONFIG
): PricingBreakdown {
  const baseDeliveryFee = config.baseDeliveryFee;
  const distanceFee = distance * config.distanceRate;
  const deliveryFee = baseDeliveryFee + distanceFee;
  const safekeeping = config.safekeepingFee;
  const total = gasCost + deliveryFee + safekeeping;

  return {
    gasCost,
    baseDeliveryFee,
    distanceFee,
    deliveryFee,
    safekeeping,
    total,
  };
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  return `GH₵${amount.toFixed(2)}`;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

