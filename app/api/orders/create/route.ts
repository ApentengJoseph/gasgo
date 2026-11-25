import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { normalizeStation, priceFor, type StationRow } from '@/lib/data/stations';
import { isWithinServiceArea } from '@/lib/utils/serviceArea';
import { quote, describeItems, MAX_CYLINDERS_PER_ORDER, type BasketItem } from '@/lib/utils/quote';
import { randomInt } from 'crypto';
import { sameOrigin, rateLimited, clientIp, clean } from '@/lib/server/guard';

/** Open (not finished) orders one account may have at once — stops fake orders sending riders around. */
const MAX_OPEN_ORDERS = 3;

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
  const rand = randomInt(0, 1000).toString().padStart(3, '0');
  return `GAS${ts}${rand}`;
}

/**
 * POST /api/orders/create
 * Requires a session (guest/anonymous sessions are fine). All prices are
 * computed here from the database; prices sent by the browser are ignored.
 */
export async function POST(request: NextRequest) {
  try {
    if (!sameOrigin(request)) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
    if (rateLimited(`order-ip:${clientIp(request)}`, 30, 60 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many orders from this network. Please try again later.' }, { status: 429 });
    }
    const body = await request.json().catch(() => ({}));
    const { stationId, cylinderSize, items: rawItems, deliveryNotes } = body;
    const deliveryAddress = clean(body.deliveryAddress, 300);
    const deliveryLatitude = Number(body.deliveryLatitude);
    const deliveryLongitude = Number(body.deliveryLongitude);

    // Basket: [{kg, qty}] (bulk) or a single cylinderSize (older clients)
    const items: BasketItem[] = (Array.isArray(rawItems) && rawItems.length
      ? rawItems
      : [{ kg: Number(String(cylinderSize ?? '').replace(/[^\d.]/g, '')), qty: 1 }]
    ).map((i: any) => ({ kg: Math.round(Number(i.kg)), qty: Math.round(Number(i.qty)) }))
     .filter((i: BasketItem) => i.kg > 0 && i.qty > 0);
    const count = items.reduce((n, i) => n + i.qty, 0);

    if (typeof stationId !== 'string' || !items.length || items.length > 10 || !deliveryAddress
        || !Number.isFinite(deliveryLatitude) || !Number.isFinite(deliveryLongitude)) {
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
    if (rateLimited(`order-user:${user.id}`, 8, 10 * 60 * 1000)) {
      return NextResponse.json({ error: 'You’re placing orders too quickly. Please wait a few minutes.' }, { status: 429 });
    }

    const admin = createServiceRoleClient();
    const ago = (h: number) => new Date(Date.now() - h * 3600 * 1000).toISOString();
    const [{ count: open }, { count: unpaid }] = await Promise.all([
      admin.from('orders').select('id', { count: 'exact', head: true })
        .eq('user_id', user.id).not('status', 'in', '(pending,delivered,cancelled)').gte('created_at', ago(24)),
      admin.from('orders').select('id', { count: 'exact', head: true })
        .eq('user_id', user.id).eq('status', 'pending').gte('created_at', ago(1)),
    ]);
    if ((open ?? 0) >= MAX_OPEN_ORDERS) {
      return NextResponse.json({ error: `You already have ${MAX_OPEN_ORDERS} orders in progress. Wait for one to finish or cancel one in My orders.` }, { status: 409 });
    }
    if ((unpaid ?? 0) >= 5) {
      return NextResponse.json({ error: 'You have several unpaid orders. Finish paying one in My orders, or try again in an hour.' }, { status: 409 });
    }
    const [{ data: stationRow }, { data: profile }] = await Promise.all([
      admin.from('stations').select('id, name, address, lat, lng, is_active, station_prices(size_kg, price)').eq('id', stationId).maybeSingle(),
      admin.from('profiles').select('name, phone, is_active').eq('id', user.id).maybeSingle(),
    ]);
    if (!stationRow || stationRow.is_active === false) return NextResponse.json({ error: 'That station is no longer available. Please pick another.' }, { status: 404 });
    if (profile?.is_active === false) return NextResponse.json({ error: 'We can’t take orders from this account. Please WhatsApp GasRefill.' }, { status: 403 });
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
      delivery_notes: clean(deliveryNotes, 300) || null,
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
