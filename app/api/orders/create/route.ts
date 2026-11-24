import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { normalizeStation, priceFor, type StationRow } from '@/lib/data/stations';
import { isWithinServiceArea } from '@/lib/utils/serviceArea';
import { quote, describeItems, MAX_CYLINDERS_PER_ORDER, type BasketItem } from '@/lib/utils/quote';

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function generateOrderNumber(): string {
  const ts = Date.now().toString().slice(-8);
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `GAS${ts}${rand}`;
}

/**
 * POST /api/orders/create
 * Requires a session (guest/anonymous sessions are fine). All prices are
 * computed here from the database; prices sent by the browser are ignored.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stationId, cylinderSize, items: rawItems, deliveryAddress, deliveryLatitude, deliveryLongitude, deliveryNotes } = body;

    // Basket: [{kg, qty}] (bulk) or a single cylinderSize (older clients)
    const items: BasketItem[] = (Array.isArray(rawItems) && rawItems.length
      ? rawItems
      : [{ kg: Number(String(cylinderSize ?? '').replace(/[^\d.]/g, '')), qty: 1 }]
    ).map((i: any) => ({ kg: Math.round(Number(i.kg)), qty: Math.round(Number(i.qty)) }))
     .filter((i: BasketItem) => i.kg > 0 && i.qty > 0);
    const count = items.reduce((n, i) => n + i.qty, 0);

    if (!stationId || !items.length || !deliveryAddress || deliveryLatitude == null || deliveryLongitude == null) {
      return NextResponse.json({ error: 'Missing order details. Please start again.' }, { status: 400 });
    }
    if (items.some(i => i.kg < 1 || i.kg > 50)) {
      return NextResponse.json({ error: 'Cylinder sizes must be between 1 and 50 kg.' }, { status: 400 });
    }
    if (count > MAX_CYLINDERS_PER_ORDER) {
      return NextResponse.json({ error: `One delivery can carry up to ${MAX_CYLINDERS_PER_ORDER} cylinders.` }, { status: 400 });
    }
    if (!isWithinServiceArea(deliveryLatitude, deliveryLongitude)) {
      return NextResponse.json({ error: 'This address is outside our Koforidua delivery area.' }, { status: 400 });
    }

    // Who is ordering (anonymous guest sessions count)
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Your session expired. Please refresh and try again.' }, { status: 401 });

    const admin = createServiceRoleClient();
    const [{ data: stationRow }, { data: profile }] = await Promise.all([
      admin.from('stations').select('id, name, address, lat, lng, station_prices(size_kg, price)').eq('id', stationId).maybeSingle(),
      admin.from('profiles').select('name, phone').eq('id', user.id).maybeSingle(),
    ]);
    if (!stationRow) return NextResponse.json({ error: 'That station is no longer available. Please pick another.' }, { status: 404 });
    if (!profile?.name || !profile?.phone) {
      return NextResponse.json({ error: 'Please add your name and phone number first.' }, { status: 400 });
    }

    const station = normalizeStation(stationRow as StationRow);
    if (items.some(i => !priceFor(station, i.kg))) return NextResponse.json({ error: 'This station has no price for one of those sizes.' }, { status: 400 });

    const oneWayKm = haversineKm(station.lat, station.lng, deliveryLatitude, deliveryLongitude);
    const q = quote(items, kg => priceFor(station, kg), oneWayKm * 2);
    const first = q.lines[0];

    const row: Record<string, unknown> = {
      order_number: generateOrderNumber(),
      user_id: user.id,
      station_id: station.id,
      station_name: station.name,
      cylinder_size: first.kg,
      cylinder_name: count === 1 ? `${first.kg} kg cylinder` : describeItems(items),
      quantity: count,
      cylinder_price: q.gas,
      items: q.lines.map(l => ({ kg: l.kg, qty: l.qty, unit: l.unit })),
      delivery_address: deliveryAddress,
      delivery_lat: deliveryLatitude,
      delivery_lng: deliveryLongitude,
      delivery_notes: deliveryNotes || null,
      subtotal: q.gas,
      delivery_fee: q.delivery,
      safekeeping_fee: q.safekeeping,
      discount: 0,
      total: q.total,
      contact_name: profile.name,
      contact_phone: profile.phone,
    };
    let { data: order, error } = await admin.from('orders').insert(row).select('id, order_number, total').single();
    // Database without migration 002: retry without the new columns
    if (error && (error.code === 'PGRST204' || error.code === '42703')) {
      const { items: _i, contact_name: _n, contact_phone: _p, ...legacy } = row;
      ({ data: order, error } = await admin.from('orders').insert(legacy).select('id, order_number, total').single());
    }
    if (error || !order) throw error ?? new Error('insert failed');
    return NextResponse.json({ success: true, orderId: order.id, orderNumber: order.order_number, total: order.total });
  } catch (err: any) {
    console.error('[orders/create]', err);
    return NextResponse.json({ error: 'We could not create your order. Please try again.' }, { status: 500 });
  }
}
