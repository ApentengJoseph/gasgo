import { useEffect, useState } from 'react';
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
  stationLocation: { lat: number; lng: number } | null;
  cylinderSize: string | null;
  cylinderName: string | null;
  deliveryAddress: string | null;
  deliveryLocation: { lat: number; lng: number } | null;
  deliveryInstructions: string;
  /** gas price only (GH₵) */
  estimatedPrice: number | null;
  items: GuestOrderItem[];
  createdAt: string;
  expiresAt: string; // 24-hour expiry
  sessionId: string;
}

interface GuestOrderStore {
  order: GuestOrder;
  updateStation: (stationId: string, stationName: string, location?: { lat: number; lng: number }) => void;
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
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem('gaso-guest-session-id', sessionId);
  }
  return sessionId;
};

const createInitialOrder = (): GuestOrder => {
  const now = new Date();
  return {
    stationId: null,
    stationName: null,
    stationLocation: null,
    cylinderSize: null,
    cylinderName: null,
    deliveryAddress: null,
    deliveryLocation: null,
    deliveryInstructions: '',
    estimatedPrice: null,
    items: [],
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    sessionId: '',
  };
};

export const useGuestOrder = create<GuestOrderStore>()(
  persist(
    (set, get) => ({
      order: createInitialOrder(),

      updateStation: (stationId, stationName, location) =>
        set((s) => ({ order: { ...s.order, stationId, stationName, stationLocation: location ?? s.order.stationLocation } })),

      updateCylinder: (cylinderSize, cylinderName, price) =>
        set((s) => ({
          order: {
            ...s.order,
            cylinderSize,
            cylinderName,
            estimatedPrice: price,
            items: [{ id: `cylinder-${cylinderSize}`, name: cylinderName, price, quantity: 1 }],
          },
        })),

      updateAddress: (address, location) =>
        set((s) => ({ order: { ...s.order, deliveryAddress: address, deliveryLocation: location || null } })),

      updateInstructions: (instructions) =>
        set((s) => ({ order: { ...s.order, deliveryInstructions: instructions } })),

      addItem: (item) => set((s) => ({ order: { ...s.order, items: [...s.order.items, item] } })),
      removeItem: (itemId) => set((s) => ({ order: { ...s.order, items: s.order.items.filter((i) => i.id !== itemId) } })),
      updatePrice: (price) => set((s) => ({ order: { ...s.order, estimatedPrice: price } })),
      clearOrder: () => set({ order: createInitialOrder() }),
      getOrCreateSessionId: () => get().order.sessionId || getOrCreateSessionId(),

      isOrderValid: () => {
        if (typeof window === 'undefined') return false;
        const o = get().order;
        if (new Date() > new Date(o.expiresAt)) return false;
        return !!(o.stationId && o.cylinderSize && o.deliveryAddress && o.deliveryLocation && o.estimatedPrice);
      },
    }),
    {
      name: 'gaso-guest-order',
      version: 2,
      // Hydrated on the client by useOrderHydrated() to avoid SSR mismatches
      skipHydration: true,
      partialize: (state) => ({ order: state.order }),
      // Orders saved by older versions used fake station ids ("1".."8") — drop them.
      migrate: () => ({ order: createInitialOrder() }) as any,
    }
  )
);

/** Loads the saved order from localStorage once; returns true when it's ready to read. */
export function useOrderHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useGuestOrder.persist.hasHydrated());
  useEffect(() => {
    if (useGuestOrder.persist.hasHydrated()) { setHydrated(true); return; }
    const unsub = useGuestOrder.persist.onFinishHydration(() => setHydrated(true));
    useGuestOrder.persist.rehydrate();
    return unsub;
  }, []);
  return hydrated;
}

/** The cylinders in a saved order as {kg, qty} lines (supports older single-size baskets). */
export function basketOf(order: GuestOrder): { kg: number; qty: number }[] {
  const fromItems = order.items
    .map(i => ({ kg: Number(String(i.id).replace(/[^\d.]/g, '')), qty: i.quantity }))
    .filter(i => i.kg > 0 && i.qty > 0);
  if (fromItems.length) return fromItems;
  const kg = Number(order.cylinderSize);
  return kg ? [{ kg, qty: 1 }] : [];
}
