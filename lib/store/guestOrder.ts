import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GuestOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface GuestOrder {
  stationId: string | null;
  stationName: string | null;
  cylinderSize: string | null;
  cylinderName: string | null;
  deliveryAddress: string | null;
  deliveryLocation: { lat: number; lng: number } | null;
  deliveryInstructions: string;
  estimatedPrice: number | null;
  items: GuestOrderItem[];
  createdAt: string;
  expiresAt: string; // 24-hour expiry
  sessionId: string;
}

interface GuestOrderStore {
  order: GuestOrder;
  updateStation: (stationId: string, stationName: string) => void;
  updateCylinder: (cylinderSize: string, cylinderName: string, price: number) => void;
  updateAddress: (address: string, location?: { lat: number; lng: number }) => void;
  updateInstructions: (instructions: string) => void;
  addItem: (item: GuestOrderItem) => void;
  removeItem: (itemId: string) => void;
  updatePrice: (price: number) => void;
  clearOrder: () => void;
  getOrCreateSessionId: () => string;
  isOrderValid: () => boolean;
}

const getOrCreateSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('gaso-guest-session-id');
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('gaso-guest-session-id', sessionId);
  }
  return sessionId;
};

// Create initial order without client-only values (for SSR)
// This will be replaced by persisted state on client hydration
const createInitialOrder = (): GuestOrder => {
  const now = new Date();
  
  return {
    stationId: null,
    stationName: null,
    cylinderSize: null,
    cylinderName: null,
    deliveryAddress: null,
    deliveryLocation: null,
    deliveryInstructions: '',
    estimatedPrice: null,
    items: [],
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    sessionId: '', // Will be set on client-side hydration
  };
};

export const useGuestOrder = create<GuestOrderStore>()(
  persist(
    (set, get) => ({
      order: createInitialOrder(),

      updateStation: (stationId: string, stationName: string) => {
        set((state) => ({
          order: {
            ...state.order,
            stationId,
            stationName,
          },
        }));
      },

      updateCylinder: (cylinderSize: string, cylinderName: string, price: number) => {
        set((state) => ({
          order: {
            ...state.order,
            cylinderSize,
            cylinderName,
            estimatedPrice: price,
            items: [
              {
                id: `cylinder-${cylinderSize}`,
                name: cylinderName,
                price,
                quantity: 1,
              },
            ],
          },
        }));
      },

      updateAddress: (address: string, location?: { lat: number; lng: number }) => {
        set((state) => ({
          order: {
            ...state.order,
            deliveryAddress: address,
            deliveryLocation: location || null,
          },
        }));
      },

      updateInstructions: (instructions: string) => {
        set((state) => ({
          order: {
            ...state.order,
            deliveryInstructions: instructions,
          },
        }));
      },

      addItem: (item: GuestOrderItem) => {
        set((state) => ({
          order: {
            ...state.order,
            items: [...state.order.items, item],
          },
        }));
      },

      removeItem: (itemId: string) => {
        set((state) => ({
          order: {
            ...state.order,
            items: state.order.items.filter((item) => item.id !== itemId),
          },
        }));
      },

      updatePrice: (price: number) => {
        set((state) => ({
          order: {
            ...state.order,
            estimatedPrice: price,
          },
        }));
      },

      clearOrder: () => {
        set({ order: createInitialOrder() });
      },

      getOrCreateSessionId: () => {
        return get().order.sessionId || getOrCreateSessionId();
      },

      isOrderValid: () => {
        // Only check on client-side
        if (typeof window === 'undefined') {
          return false;
        }
        
        const order = get().order;
        const now = new Date();
        const expiresAt = new Date(order.expiresAt);
        
        // Check if expired
        if (now > expiresAt) {
          return false;
        }
        
        // Check if has minimum required fields
        return !!(
          order.stationId &&
          order.cylinderSize &&
          order.deliveryAddress &&
          order.estimatedPrice
        );
      },
    }),
    {
      name: 'gaso-guest-order',
      version: 1,
      // Skip hydration on server-side to prevent hydration mismatch
      skipHydration: true, // Always skip initial hydration, let it happen on client
      partialize: (state) => ({ order: state.order }), // Only persist order data
    }
  )
);

