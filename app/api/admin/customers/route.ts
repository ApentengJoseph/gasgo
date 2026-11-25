import { NextRequest, NextResponse } from 'next/server';
import { adminGate, fetchAll } from '@/lib/server/admin';

export const dynamic = 'force-dynamic';

/** GET /api/admin/customers?q= — customers with their order count, spend and last order. */
export async function GET(req: NextRequest) {
  const g = await adminGate(req);
  if (g.error) return g.error;
  const { admin } = g;
  const q = (req.nextUrl.searchParams.get('q') ?? '').replace(/[^\w\s+]/g, '').trim().slice(0, 40);

  let query = admin.from('profiles').select('id, name, phone, is_active, created_at', { count: 'exact' })
    .eq('role', 'customer').not('name', 'is', null).order('created_at', { ascending: false }).limit(200);
  if (q) query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
  const { data: people, count } = await query;
  const ids = (people ?? []).map(p => p.id);
  const orders = ids.length
    ? await fetchAll<{ user_id: string; status: string; total: number; created_at: string }>((f, t) =>
        admin.from('orders').select('user_id, status, total, created_at').in('user_id', ids).range(f, t), 100000)
    : [];

  const stats = new Map<string, { orders: number; delivered: number; spent: number; cancelled: number; last: string | null }>();
  for (const o of orders) {
    const s = stats.get(o.user_id) ?? { orders: 0, delivered: 0, spent: 0, cancelled: 0, last: null };
    s.orders++;
    if (o.status === 'delivered') { s.delivered++; s.spent += Number(o.total); }
    if (o.status === 'cancelled') s.cancelled++;
    if (!s.last || o.created_at > s.last) s.last = o.created_at;
    stats.set(o.user_id, s);
  }
  return NextResponse.json({
    total: count ?? 0,
    customers: (people ?? []).map(p => {
      const s = stats.get(p.id) ?? { orders: 0, delivered: 0, spent: 0, cancelled: 0, last: null };
      return { ...p, ...s, spent: Math.round(s.spent * 100) / 100 };
    }),
  });
}
