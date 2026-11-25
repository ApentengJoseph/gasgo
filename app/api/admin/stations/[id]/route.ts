import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { adminGate, audit, isUuid } from '@/lib/server/admin';
import { fail, clean } from '@/lib/server/guard';
import { priceRows } from '@/lib/server/stations';

/** PATCH /api/admin/stations/:id { name?, address?, phone?, is_active?, prices? } — edit details, prices, show/hide. */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const g = await adminGate(req, { write: true });
  if (g.error) return g.error;
  if (!isUuid(params.id)) return fail(404, 'Station not found.');
  const b = await req.json().catch(() => ({}));
  const { data: st } = await g.admin.from('stations').select('id, name').eq('id', params.id).maybeSingle();
  if (!st) return fail(404, 'Station not found.');

  const patch: Record<string, unknown> = {};
  if (typeof b.name === 'string') { const n = clean(b.name, 80); if (n.length < 2) return fail(400, 'Enter the station name.'); patch.name = n; }
  if (typeof b.address === 'string') patch.address = clean(b.address, 160) || null;
  if (typeof b.phone === 'string') patch.phone = clean(b.phone, 20) || null;
  if (typeof b.is_active === 'boolean') patch.is_active = b.is_active;
  if (Object.keys(patch).length) await g.admin.from('stations').update(patch).eq('id', st.id);

  if (b.prices) {
    const p = priceRows(st.id, b.prices);
    if (p.error) return fail(400, p.error);
    if (p.rows.length) await g.admin.from('station_prices').upsert(p.rows, { onConflict: 'station_id,size_kg' });
    // Sizes cleared in the form are removed
    const keep = p.rows.map(r => r.size_kg);
    const cleared = Object.entries(b.prices as Record<string, unknown>).filter(([, v]) => v === '' || v == null).map(([k]) => Number(k)).filter(k => !keep.includes(k));
    if (cleared.length) await g.admin.from('station_prices').delete().eq('station_id', st.id).in('size_kg', cleared);
  }
  await audit(g.admin, g.user.id, 'station.update', st.name, { ...patch, prices: b.prices ?? undefined });
  revalidatePath('/');
  return NextResponse.json({ ok: true });
}
