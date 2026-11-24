import { useGuestOrder } from '@/lib/store/guestOrder';
import { normalizeStation, priceFor, type Station } from '@/lib/data/stations';
import { describeItems, type BasketItem } from '@/lib/utils/quote';
import type { Order } from '@/lib/types/database';

/** Cylinders in a placed order (bulk `items` column, or the single size on older orders). */
export function itemsOf(o: Order & { items?: { kg: number; qty: number }[] | null }): BasketItem[] {
  if (Array.isArray(o.items) && o.items.length) return o.items.map(i => ({ kg: Number(i.kg), qty: Number(i.qty) }));
  return [{ kg: Number(o.cylinder_size), qty: Number(o.quantity) || 1 }];
}

/**
 * Fills the basket with a past order (same cylinders, station and address) at
 * today's station prices. Returns false if the station is no longer available.
 */
export async function loadReorder(o: Order): Promise<boolean> {
  const res = await fetch('/api/stations');
  const { stations } = (await res.json()) as { stations: Station[] };
  const st = stations?.find(s => s.id === o.station_id);
  if (!st) return false;
  const station = 'pricePerKg' in st ? st : normalizeStation(st as any);
  const items = itemsOf(o);
  const gas = items.reduce((s, i) => s + priceFor(station, i.kg) * i.qty, 0);
  const now = new Date();
  useGuestOrder.setState({
    order: {
      stationId: station.id,
      stationName: station.name,
      stationLocation: { lat: station.lat, lng: station.lng },
      cylinderSize: String(items[0].kg),
      cylinderName: describeItems(items),
      deliveryAddress: o.delivery_address,
      deliveryLocation: { lat: o.delivery_lat, lng: o.delivery_lng },
      deliveryInstructions: o.delivery_notes ?? '',
      estimatedPrice: Math.round(gas * 100) / 100,
      items: items.map(i => ({ id: `${i.kg}kg`, name: `${i.kg} kg`, price: priceFor(station, i.kg), quantity: i.qty })),
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 864e5).toISOString(),
      sessionId: '',
    },
  });
  return true;
}
