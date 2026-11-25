import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { adminGate, audit } from '@/lib/server/admin';
import { fail, clean } from '@/lib/server/guard';
import { isWithinServiceArea } from '@/lib/utils/serviceArea';
import { PRICE_SIZES, priceRows } from '@/lib/server/stations';

export const dynamic = 'force-dynamic';
/** GET /api/admin/stations — every station (also hidden ones) with prices and orders delivered. */
export async function GET(req: NextRequest) {
  const g = await adminGate(req);
  if (g.error) return g.error;
  const { data, error } = await g.admin.from('stations')
    .select('id, name, address, phone, lat, lng, is_active, created_at, station_prices(size_kg, price)').order('name');
  if (error) return NextResponse.json({ error: 'Could not load stations.' }, { status: 500 });
  const { data: done } = await g.admin.from('orders').select('station_id').eq('status', 'delivered').limit(10000);
  const n = new Map<string, number>();
  (done ?? []).forEach(o => n.set(o.station_id, (n.get(o.station_id) ?? 0) + 1));
  return NextResponse.json({
    sizes: PRICE_SIZES,
    stations: (data ?? []).map(s => ({
      ...s, delivered: n.get(s.id) ?? 0,
      prices: Object.fromEntries((s.station_prices ?? []).map((p: { size_kg: number; price: number }) => [p.size_kg, Number(p.price)])),
      station_prices: undefined,
    })),
  });
}

/** POST /api/admin/stations { name, address, phone, lat, lng, prices } — add a partner station. */
export async function POST(req: NextRequest) {
  const g = await adminGate(req, { write: true });
  if (g.error) return g.error;
  const b = await req.json().catch(() => ({}));
  const name = clean(b.name, 80), lat = Number(b.lat), lng = Number(b.lng);
  if (name.length < 2) return fail(400, 'Enter the station name.');
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !isWithinServiceArea(lat, lng)) return fail(400, 'The location must be inside the Koforidua area.');
  const { data: st, error } = await g.admin.from('stations').insert({
    name, address: clean(b.address, 160) || null, phone: clean(b.phone, 20) || null, lat, lng, is_active: true,
  }).select('id').single();
  if (error || !st) return fail(500, 'Could not add the station.');
  const p = priceRows(st.id, b.prices);
  if (p.error) { await g.admin.from('stations').delete().eq('id', st.id); return fail(400, p.error); }
  if (!p.rows.length) { await g.admin.from('stations').delete().eq('id', st.id); return fail(400, 'Add at least one price.'); }
  await g.admin.from('station_prices').insert(p.rows);
  await audit(g.admin, g.user.id, 'station.create', name);
  revalidatePath('/');
  return NextResponse.json({ ok: true, id: st.id });
}
