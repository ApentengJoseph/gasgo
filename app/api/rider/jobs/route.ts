import { NextRequest, NextResponse } from 'next/server';
import { requireApprovedRider } from '@/lib/server/guard';
import { ACTIVE, splitFees } from '@/lib/orders/rules';

/**
 * GET /api/rider/jobs?lat=&lng=
 *  active:   the rider's accepted jobs (full details: customer, address, notes)
 *  requests: paid orders waiting for a rider, nearest first, with personal details
 *            removed (area name, distance, cylinders, earning) until accepted.
 */
const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371, r = (d: number) => d * Math.PI / 180;
  const x = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

export async function GET(req: NextRequest) {
  const r = await requireApprovedRider();
  if (r.error) return r.error;
  const { admin, user } = r;
  const lat = Number(req.nextUrl.searchParams.get('lat')), lng = Number(req.nextUrl.searchParams.get('lng'));
  const here = Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 ? { lat, lng } : null;

  const [{ data: active }, { data: waiting }, { data: declined }] = await Promise.all([
    admin.from('orders').select('*').eq('rider_id', user.id).in('status', ACTIVE).order('assigned_at'),
    admin.from('orders').select('id, order_number, station_id, station_name, cylinder_size, quantity, items, delivery_address, delivery_lat, delivery_lng, delivery_fee, safekeeping_fee, payment_method, total, cylinder_price, confirmed_at')
      .eq('status', 'confirmed').is('rider_id', null).order('confirmed_at').limit(30),
    admin.from('order_declines').select('order_id').eq('rider_id', user.id),
  ]);
  const skip = new Set((declined ?? []).map(d => d.order_id));
  const stationIds = [...new Set((waiting ?? []).map(o => o.station_id).filter(Boolean))];
  const { data: stations } = stationIds.length ? await admin.from('stations').select('id, lat, lng').in('id', stationIds) : { data: [] as any[] };
  const stationById = new Map((stations ?? []).map(s => [s.id, s]));

  const requests = (waiting ?? []).filter(o => !skip.has(o.id)).map(o => {
    const st = stationById.get(o.station_id);
    const home = { lat: o.delivery_lat, lng: o.delivery_lng };
    const { riderEarning } = splitFees(Number(o.delivery_fee), Number(o.safekeeping_fee));
    return {
      id: o.id,
      orderNumber: o.order_number,
      area: String(o.delivery_address).split(',')[0].slice(0, 40), // area only, never the full address
      stationName: o.station_name,
      cylinders: Number(o.quantity) || 1,
      sizes: Array.isArray(o.items) ? o.items.map((i: any) => `${i.qty}×${i.kg}kg`).join(' ') : `${o.cylinder_size}kg`,
      earning: riderEarning,
      cash: o.payment_method === 'cash',
      cashToCollect: o.payment_method === 'cash' ? Number(o.total) : 0,
      gasCost: Number(o.cylinder_price),
      toPickupKm: here ? Math.round(km(here, home) * 10) / 10 : null,
      tripKm: st ? Math.round(km(home, st) * 2 * 10) / 10 : null,
      // ~100 m pin for the map: the exact spot, name and phone are only shown after accepting
      pickup: { lat: Math.round(home.lat * 1000) / 1000, lng: Math.round(home.lng * 1000) / 1000 },
      waitingSince: o.confirmed_at,
    };
  }).sort((a, b) => (a.toPickupKm ?? 99) - (b.toPickupKm ?? 99));

  // Station locations for active jobs (navigation)
  const activeStationIds = [...new Set((active ?? []).map(o => o.station_id))];
  const { data: activeStations } = activeStationIds.length ? await admin.from('stations').select('id, name, lat, lng, address').in('id', activeStationIds) : { data: [] as any[] };

  return NextResponse.json({ active: active ?? [], requests, stations: activeStations ?? [] });
}
