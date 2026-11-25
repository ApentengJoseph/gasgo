import { NextRequest, NextResponse } from 'next/server';
import { adminGate } from '@/lib/server/admin';
import { ACTIVE } from '@/lib/orders/rules';

export const dynamic = 'force-dynamic';

const FILTERS: Record<string, string[]> = {
  live: ['confirmed', ...ACTIVE],
  waiting: ['confirmed'],
  unpaid: ['pending'],
  delivered: ['delivered'],
  cancelled: ['cancelled'],
};

/** GET /api/admin/orders?filter=all|live|waiting|unpaid|delivered|cancelled|unsettled&q=&page= */
export async function GET(req: NextRequest) {
  const g = await adminGate(req);
  if (g.error) return g.error;
  const sp = req.nextUrl.searchParams;
  const filter = sp.get('filter') ?? 'all';
  const page = Math.max(0, Math.min(200, Number(sp.get('page')) || 0));
  // Search: only letters, digits, spaces and + (keeps the filter syntax safe)
  const q = (sp.get('q') ?? '').replace(/[^\w\s+]/g, '').trim().slice(0, 40);

  let query = g.admin.from('orders')
    .select('id, order_number, status, payment_method, payment_status, total, quantity, cylinder_name, station_name, delivery_address, contact_name, contact_phone, rider_id, rider_name, created_at, confirmed_at, delivered_at, refund_status, station_settled_at, cash_collected_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * 50, page * 50 + 49);
  if (FILTERS[filter]) query = query.in('status', FILTERS[filter]);
  if (filter === 'waiting') query = query.is('rider_id', null);
  if (filter === 'unsettled') query = query.eq('status', 'delivered').eq('payment_method', 'mobile_money').is('station_settled_at', null);
  if (filter === 'refunds') query = query.eq('refund_status', 'pending');
  if (q) query = query.or(`order_number.ilike.%${q}%,contact_phone.ilike.%${q}%,contact_name.ilike.%${q}%`);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: 'Could not load orders.' }, { status: 500 });
  return NextResponse.json({ orders: data ?? [], total: count ?? 0, page });
}
