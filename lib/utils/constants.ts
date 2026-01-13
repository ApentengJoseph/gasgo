/**
 * Application constants
 */

export const CYLINDER_SIZES = [
  { size: '6kg', label: '6kg Cylinder', weight: 6 },
  { size: '12kg', label: '12kg Cylinder', weight: 12 },
  { size: '25kg', label: '25kg Cylinder', weight: 25 },
] as const;

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'collected',
  'at_station',
  'on_the_way',
  'arriving_soon',
  'delivered',
  'confirmed',
  'cancelled',
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

export const ORDER_STEPS = [
  { id: 1, label: 'Order Placed', key: 'pending' },
  { id: 2, label: 'Payment Confirmed', key: 'confirmed' },
  { id: 3, label: 'Rider Assigned', key: 'confirmed' },
  { id: 4, label: 'At Station', key: 'at_station' },
  { id: 5, label: 'On the way', key: 'on_the_way' },
  { id: 6, label: 'Arriving Soon', key: 'arriving_soon' },
  { id: 7, label: 'Delivered', key: 'delivered' },
  { id: 8, label: 'Confirmed', key: 'confirmed' },
] as const;

export const PRICING_CONFIG = {
  BASE_DELIVERY_FEE: 10,
  SAFEKEEPING_FEE: 5,
  DISTANCE_RATE: 1.8, // per km
} as const;

export const APP_NAME = 'Gaso';
export const APP_DESCRIPTION = 'Professional Gas Delivery Service';

