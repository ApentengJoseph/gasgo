/**
 * Order-related types
 */

import { OrderStatus } from '@/lib/utils/constants';

export interface Station {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  distance?: number; // in km
  price: number; // base price for 12kg
  available: boolean;
  rating: number;
  inventory: {
    '6kg': number;
    '12kg': number;
    '25kg': number;
  };
}

export interface Address {
  id: string;
  label: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  isDefault: boolean;
  instructions?: string;
}

export interface Order {
  id: string;
  userId: string;
  stationId: string;
  stationName: string;
  size: '6kg' | '12kg' | '25kg';
  address: Address;
  status: OrderStatus;
  pricing: {
    gasCost: number;
    deliveryFee: number;
    safekeeping: number;
    total: number;
  };
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  createdAt: Date;
  updatedAt: Date;
  deliveredAt?: Date;
  deliveryInstructions?: string;
}

export interface OrderTracking {
  orderId: string;
  currentStep: number;
  steps: Array<{
    id: number;
    label: string;
    completed: boolean;
    timestamp?: Date;
  }>;
  riderLocation?: {
    lat: number;
    lng: number;
  };
  estimatedArrival?: Date;
}

