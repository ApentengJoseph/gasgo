import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

/**
 * POST /api/demo/advance  { orderId }
 *
 * TEST MODE ONLY (NEXT_PUBLIC_DEMO_AUTO_RIDER=true). A demo rider accepts the
 * customer's confirmed order and moves one step per call along the real route:
 * customer's home (pick up the empty) → station (refill) → home (return).
 * The tracking page calls this every few seconds, so the whole journey plays
 * out live without a real rider. Disabled unless the flag is set.
 */

const DEMO_RIDER = { email: 'rider.demo@gasrefill.test', name: 'Kwame Asante (demo)', phone: '0240000202' };
const STEP_M = 260;     // max distance moved per call
const ARRIVE_M = 45;    // close enough to count as "arrived"
const ARRIVING_M = 400; // switch to "arriving" when this close on the way back

type P = { lat: number; lng: number };
const metres = (a: P, b: P) => {
  const R = 6371000, r = (d: number) => d * Math.PI / 180;
  const x = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};
const toward = (from: P, to: P): P => {
  const d = metres(from, to);
  if (d <= STEP_M) return to;
  const t = STEP_M / d;
  return { lat: from.lat + (to.lat - from.lat) * t, lng: from.lng + (to.lng - from.lng) * t };
};
const heading = (a: P, b: P) => (Math.atan2(b.lng - a.lng, b.lat - a.lat) * 180 / Math.PI + 360) % 360;

const NOTES: Record<string, [string, string]> = {
  assigned:   ['Rider on the way', 'is coming to pick up your empty cylinder'],
  collected:  ['Cylinder picked up', 'has your cylinder and is heading to the station'],
  at_station: ['Refilling now', 'is refilling your cylinder at the station'],
  on_the_way: ['Bringing it back', 'is bringing your full cylinder back'],
  arriving:   ['Almost there', 'is nearly at your door'],
  delivered:  ['Delivered', 'has delivered your gas. Enjoy your cooking!'],
};

async function demoRiderId(admin: ReturnType<typeof createServiceRoleClient>) {
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const users = (list?.users ?? []) as { id: string; email?: string }[];
  let user: { id: string } | undefined = users.find(u => u.email === DEMO_RIDER.email);
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email: DEMO_RIDER.email, password: crypto.randomUUID(), email_confirm: true,
    });
    if (error || !data.user) throw new Error('could not create demo rider');
    user = data.user;
  }
  await admin.from('profiles').upsert(
    { id: user.id, name: DEMO_RIDER.name, phone: DEMO_RIDER.phone, role: 'rider', is_active: true, is_online: true },
    { onConflict: 'id' },
  );
  return user.id;
}

export async function POST(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_DEMO_AUTO_RIDER !== 'true') {
    return NextResponse.json({ error: 'Demo rider is off' }, { status: 404 });
  }
  const { orderId } = await req.json().catch(() => ({}));
  const session = await createServerSupabaseClient();
  const { data: { user } } = await session.auth.getUser();
  if (!user || !orderId) return NextResponse.json({ error: 'Not allowed' }, { status: 401 });

  const admin = createServiceRoleClient();
  const { data: o } = await admin.from('orders').select('*').eq('id', orderId).maybeSingle();
  if (!o || o.user_id !== user.id) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (['pending', 'delivered', 'cancelled'].includes(o.status)) return NextResponse.json({ status: o.status });

  const { data: st } = await admin.from('stations').select('lat, lng').eq('id', o.station_id).single();
  const home: P = { lat: o.delivery_lat, lng: o.delivery_lng };
  const station: P = { lat: st!.lat, lng: st!.lng };
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {};

  if (o.status === 'confirmed') {
    // Demo rider accepts and starts ~1 km from the customer
    const riderId = await demoRiderId(admin);
    Object.assign(patch, {
      rider_id: riderId, rider_name: DEMO_RIDER.name, rider_phone: DEMO_RIDER.phone,
      status: 'assigned', assigned_at: now,
      rider_lat: home.lat + 0.008, rider_lng: home.lng - 0.005, rider_heading: 200,
    });
  } else {
    const pos: P = { lat: o.rider_lat ?? station.lat, lng: o.rider_lng ?? station.lng };
    const target = o.status === 'assigned' ? home : o.status === 'collected' || o.status === 'at_station' ? station : home;
    const next = o.status === 'at_station' ? pos : toward(pos, target);
    Object.assign(patch, { rider_lat: next.lat, rider_lng: next.lng, rider_heading: heading(pos, next) });
    const left = metres(next, target);

    let status: string | null = null;
    if (o.status === 'assigned' && left <= ARRIVE_M) status = 'collected';
    else if (o.status === 'collected' && left <= ARRIVE_M) status = 'at_station';
    else if (o.status === 'at_station') {
      // "refill" for ~3 ticks: at_station_at must be at least ~8 s old
      if (Date.now() - new Date(o.at_station_at ?? now).getTime() > 8000) status = 'on_the_way';
    }
    else if (o.status === 'on_the_way' && left <= ARRIVING_M) status = 'arriving';
    else if (o.status === 'arriving' && left <= ARRIVE_M) status = 'delivered';
    if (status) { patch.status = status; patch[`${status}_at`] = now; }
  }

  const { error } = await admin.from('orders').update(patch).eq('id', o.id).eq('status', o.status);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const newStatus = (patch.status as string) ?? o.status;
  if (patch.status && NOTES[newStatus]) {
    const [title, msg] = NOTES[newStatus];
    await admin.from('notifications').insert({
      user_id: o.user_id, type: newStatus, title,
      message: `${DEMO_RIDER.name.replace(' (demo)', '')} ${msg} (order #${o.order_number}).`,
      data: { orderId: o.id },
    });
  }
  return NextResponse.json({ status: newStatus });
}
