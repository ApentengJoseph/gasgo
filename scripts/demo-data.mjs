#!/usr/bin/env node
/**
 * Demo data for GasRefill — lets you see orders, riders and live tracking without real payments.
 *
 *   npm run demo:seed    create demo customer, demo rider and orders in every stage
 *   npm run demo:ride    drive the demo rider: home → station → home, updating live
 *   npm run demo:clean   remove everything this script created
 *
 * Needs .env.local (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) and migration 002.
 * Demo records are marked: emails end in @gasrefill.test, order numbers start with DEMO-.
 */
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// ── env ───────────────────────────────────────────────────────────────
const envFile = path.resolve(process.cwd(), '.env.local');
const env = Object.fromEntries(fs.readFileSync(envFile, 'utf8').split('\n')
  .filter(l => l.includes('=') && !l.trim().startsWith('#'))
  .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^"|"$/g, '')]));
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const DEMO = {
  customer: { email: 'customer.demo@gasrefill.test', password: 'GasRefill-demo-1', name: 'Akosua Mensah (demo)', phone: '0240000101' },
  rider:    { email: 'rider.demo@gasrefill.test',    password: 'GasRefill-demo-1', name: 'Kwame Asante (demo)',  phone: '0240000202' },
};
const SAFEKEEPING = 5, BASE = 10, RATE = 1.8;

// Real Koforidua pickup points
const HOMES = {
  adweso:    { address: 'Adweso, near the School of Nursing, Koforidua', lat: 6.0790, lng: -0.2530 },
  adweso2:   { address: 'Adweso Estates, Block C, Koforidua',             lat: 6.0803, lng: -0.2518 },
  effiduase: { address: 'Effiduase, behind the Methodist church',        lat: 6.1105, lng: -0.2405 },
  oyoko:     { address: 'Oyoko roundabout, Koforidua',                    lat: 6.1185, lng: -0.2702 },
  central:   { address: 'Koforidua Central, near Jackson Park',           lat: 6.0940, lng: -0.2590 },
};

const km = (a, b) => {
  const R = 6371, r = d => d * Math.PI / 180;
  const x = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};
const ago = (days, hours = 0) => new Date(Date.now() - days * 864e5 - hours * 36e5).toISOString();
const r2 = n => Math.round(n * 100) / 100;

async function ensureUser({ email, password, name, phone }, role) {
  const { data: list } = await db.auth.admin.listUsers({ perPage: 1000 });
  let user = list?.users?.find(u => u.email === email);
  if (!user) {
    const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) throw new Error(`create ${email}: ${error.message}`);
    user = data.user;
  }
  const { error } = await db.from('profiles').upsert({ id: user.id, name, phone, role, is_active: true, is_online: role === 'rider' }, { onConflict: 'id' });
  if (error) throw new Error(`profile ${email}: ${error.message}`);
  return user.id;
}

function buildOrder(n, customerId, station, home, items, extra = {}) {
  const lines = items.map(i => ({ kg: i.kg, qty: i.qty, unit: station.prices[i.kg] ?? r2(station.prices[12] / 12 * i.kg) }));
  const gas = r2(lines.reduce((s, l) => s + l.unit * l.qty, 0));
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const delivery = r2((BASE + km(station, home) * 2 * RATE) * (1 + Math.min(0.15 * (count - 1), 0.75)));
  const safekeeping = SAFEKEEPING * count;
  return {
    order_number: `DEMO-${String(n).padStart(3, '0')}`,
    user_id: customerId,
    station_id: station.id, station_name: station.name,
    cylinder_size: lines[0].kg,
    cylinder_name: count === 1 ? `${lines[0].kg} kg cylinder` : lines.map(l => `${l.qty} × ${l.kg} kg`).join(' + '),
    quantity: count, items: lines,
    cylinder_price: gas, subtotal: gas, delivery_fee: delivery, safekeeping_fee: safekeeping, discount: 0,
    total: r2(gas + delivery + safekeeping),
    delivery_address: home.address, delivery_lat: home.lat, delivery_lng: home.lng,
    contact_name: DEMO.customer.name, contact_phone: DEMO.customer.phone,
    payment_method: 'mobile_money', payment_status: 'paid',
    ...extra,
  };
}

async function seed() {
  const check = await db.from('orders').select('items, contact_name, rider_name').limit(1);
  if (check.error) throw new Error('Run migration 002 first (Supabase → SQL Editor). ' + check.error.message);

  const customerId = await ensureUser(DEMO.customer, 'customer');
  const riderId = await ensureUser(DEMO.rider, 'rider');

  const { data: rows } = await db.from('stations').select('id, name, lat, lng, station_prices(size_kg, price)');
  const stations = rows.map(s => ({ ...s, prices: Object.fromEntries((s.station_prices || []).map(p => [p.size_kg, Number(p.price)])) }));
  const goil = stations.find(s => /goil/i.test(s.name)) ?? stations[0];
  const manbah = stations.find(s => /manbah/i.test(s.name)) ?? stations[1];
  const lartey = stations.find(s => /lartey/i.test(s.name)) ?? stations[2];

  await clean({ keepUsers: true });

  const riderBits = { rider_id: riderId, rider_name: DEMO.rider.name, rider_phone: DEMO.rider.phone };
  const orders = [
    // Live: rider on the way to pick up (the one `demo:ride` drives)
    buildOrder(1, customerId, goil, HOMES.adweso, [{ kg: 12, qty: 1 }], {
      ...riderBits, status: 'assigned', confirmed_at: ago(0, 0.3), assigned_at: ago(0, 0.2), created_at: ago(0, 0.35),
      rider_lat: 6.0890, rider_lng: -0.2600, rider_heading: 160,
    }),
    // Live: refilling at the station (bulk)
    buildOrder(2, customerId, manbah, HOMES.effiduase, [{ kg: 12, qty: 2 }, { kg: 6, qty: 1 }], {
      ...riderBits, status: 'at_station', confirmed_at: ago(0, 1), assigned_at: ago(0, 0.9), collected_at: ago(0, 0.6), at_station_at: ago(0, 0.2),
      created_at: ago(0, 1.1), rider_lat: manbah.lat, rider_lng: manbah.lng, payment_method: 'cash', payment_status: 'pending',
    }),
    // Waiting for a rider: two neighbours in Adweso (shows batching on the rider screen)
    buildOrder(3, customerId, goil, HOMES.adweso2, [{ kg: 6, qty: 1 }], { status: 'confirmed', confirmed_at: ago(0, 0.1), created_at: ago(0, 0.15) }),
    buildOrder(4, customerId, goil, HOMES.adweso, [{ kg: 3, qty: 2 }], { status: 'confirmed', confirmed_at: ago(0, 0.05), created_at: ago(0, 0.1) }),
    buildOrder(5, customerId, lartey, HOMES.oyoko, [{ kg: 25, qty: 1 }], { status: 'confirmed', confirmed_at: ago(0, 0.2), created_at: ago(0, 0.25) }),
    // History
    buildOrder(6, customerId, goil, HOMES.adweso, [{ kg: 12, qty: 1 }], { ...riderBits, status: 'delivered', created_at: ago(24), confirmed_at: ago(24), delivered_at: ago(24, -1) }),
    buildOrder(7, customerId, manbah, HOMES.central, [{ kg: 12, qty: 2 }, { kg: 6, qty: 1 }], { ...riderBits, status: 'delivered', created_at: ago(52), confirmed_at: ago(52), delivered_at: ago(52, -1) }),
    buildOrder(8, customerId, lartey, HOMES.adweso, [{ kg: 6, qty: 1 }], { status: 'cancelled', created_at: ago(40), cancelled_at: ago(40), cancellation_reason: 'Cancelled by customer', payment_status: 'refunded' }),
  ];
  const { data, error } = await db.from('orders').insert(orders).select('id, order_number, status');
  if (error) throw new Error('insert orders: ' + error.message);

  await db.from('notifications').insert([
    { user_id: customerId, type: 'assigned', title: 'Rider on the way', message: 'Kwame is coming to pick up your empty cylinder (order #DEMO-001).', data: { orderId: data.find(o => o.order_number === 'DEMO-001').id } },
    { user_id: customerId, type: 'at_station', title: 'Refilling now', message: 'Your cylinders are being refilled at Manbah Gas (order #DEMO-002).', data: { orderId: data.find(o => o.order_number === 'DEMO-002').id } },
    { user_id: customerId, type: 'delivered', title: 'Delivered', message: 'Order #DEMO-006 is back at your door. Enjoy your cooking!', read: true, data: { orderId: data.find(o => o.order_number === 'DEMO-006').id } },
  ]);

  console.log('\nDemo data ready:');
  for (const o of data) console.log(`  ${o.order_number}  ${o.status.padEnd(10)}  /orders/tracking?orderId=${o.id}`);
  console.log(`\nSign in at /auth/login:`);
  console.log(`  customer  ${DEMO.customer.email} / ${DEMO.customer.password}  → My orders`);
  console.log(`  rider     ${DEMO.rider.email} / ${DEMO.rider.password}  → Rider dashboard`);
  console.log('\nThen run `npm run demo:ride` and open DEMO-001 to watch live tracking.\n');
}

// ── Live ride: home → station → home ─────────────────────────────────────
function path_(from, to, steps) {
  return Array.from({ length: steps }, (_, i) => {
    const t = (i + 1) / steps;
    // gentle curve so the pin doesn't move in a ruler-straight line
    const bend = Math.sin(t * Math.PI) * 0.0012;
    return { lat: from.lat + (to.lat - from.lat) * t + bend, lng: from.lng + (to.lng - from.lng) * t - bend };
  });
}
const heading = (a, b) => (Math.atan2(b.lng - a.lng, b.lat - a.lat) * 180 / Math.PI + 360) % 360;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function ride() {
  const { data: o } = await db.from('orders').select('*').eq('order_number', 'DEMO-001').maybeSingle();
  if (!o) throw new Error('No DEMO-001 order. Run `npm run demo:seed` first.');
  const { data: st } = await db.from('stations').select('lat, lng, name').eq('id', o.station_id).single();
  const home = { lat: o.delivery_lat, lng: o.delivery_lng };
  const start = { lat: o.rider_lat ?? 6.089, lng: o.rider_lng ?? -0.26 };
  const STEP_MS = 3000;

  const legs = [
    { label: 'Heading to the customer', to: home, steps: 10, status: 'assigned', after: 'collected' },
    { label: 'Taking the cylinder to the station', to: st, steps: 12, status: 'collected', after: 'at_station' },
    { label: 'Refilling', to: st, steps: 4, status: 'at_station', after: 'on_the_way' },
    { label: 'Bringing it back', to: home, steps: 12, status: 'on_the_way', after: 'delivered' },
  ];
  console.log(`Driving DEMO-001 (${o.id}). Open /orders/tracking?orderId=${o.id}\n`);
  await db.from('orders').update({ status: 'assigned', rider_lat: start.lat, rider_lng: start.lng }).eq('id', o.id);

  let pos = start;
  for (const leg of legs) {
    console.log(`→ ${leg.label}`);
    const pts = leg.to === st && leg.status === 'at_station' ? Array(leg.steps).fill(st) : path_(pos, leg.to, leg.steps);
    for (const [i, p] of pts.entries()) {
      const isArrivingSoon = leg.status === 'on_the_way' && i === Math.floor(pts.length * 0.75);
      await db.from('orders').update({
        rider_lat: p.lat, rider_lng: p.lng, rider_heading: heading(pos, p),
        ...(isArrivingSoon ? { status: 'arriving', arriving_at: new Date().toISOString() } : {}),
      }).eq('id', o.id);
      pos = p;
      await sleep(STEP_MS);
    }
    await db.from('orders').update({ status: leg.after, [`${leg.after}_at`]: new Date().toISOString() }).eq('id', o.id);
    await db.from('notifications').insert({
      user_id: o.user_id, type: leg.after,
      title: { collected: 'Cylinder picked up', at_station: 'Refilling now', on_the_way: 'Bringing it back', delivered: 'Delivered' }[leg.after],
      message: `Order #${o.order_number}: ${{ collected: 'your rider has your empty cylinder', at_station: 'your cylinder is being refilled', on_the_way: 'your full cylinder is on its way back', delivered: 'your gas is back at your door' }[leg.after]}.`,
      data: { orderId: o.id },
    });
  }
  console.log('\nDelivered. Run `npm run demo:seed` to reset.');
}

async function clean({ keepUsers = false } = {}) {
  const { data: demoOrders } = await db.from('orders').select('id').like('order_number', 'DEMO-%');
  const ids = (demoOrders ?? []).map(o => o.id);
  if (ids.length) {
    await db.from('payments').delete().in('order_id', ids);
    await db.from('ratings').delete().in('order_id', ids);
    await db.from('orders').delete().in('id', ids);
  }
  const { data: list } = await db.auth.admin.listUsers({ perPage: 1000 });
  const demoUsers = (list?.users ?? []).filter(u => u.email?.endsWith('@gasrefill.test'));
  for (const u of demoUsers) {
    await db.from('notifications').delete().eq('user_id', u.id);
    if (!keepUsers) {
      await db.from('addresses').delete().eq('user_id', u.id);
      await db.from('profiles').delete().eq('id', u.id);
      await db.auth.admin.deleteUser(u.id);
    }
  }
  if (!keepUsers) console.log(`Removed ${ids.length} demo orders and ${demoUsers.length} demo users.`);
}

const cmd = process.argv[2];
const run = { seed, ride, clean: () => clean() }[cmd];
if (!run) { console.log('Usage: node scripts/demo-data.mjs <seed|ride|clean>'); process.exit(1); }
run().then(() => process.exit(0)).catch(e => { console.error('✗', e.message); process.exit(1); });
