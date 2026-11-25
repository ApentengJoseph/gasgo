import { NextRequest, NextResponse } from 'next/server';
import { adminGate, fetchAll } from '@/lib/server/admin';
import { ACTIVE } from '@/lib/orders/rules';

export const dynamic = 'force-dynamic';

/** GET /api/admin/riders?status=pending|approved|suspended|rejected — riders with wallet and job counts. */
export async function GET(req: NextRequest) {
  const g = await adminGate(req);
  if (g.error) return g.error;
  const { admin } = g;
  const status = req.nextUrl.searchParams.get('status');

  let q = admin.from('riders')
    .select('id, status, vehicle_type, vehicle_reg, momo_network, created_at, approved_at, profiles!riders_id_fkey(name, phone, is_online, current_lat, current_lng)')
    .order('created_at', { ascending: false }).limit(500);
  if (status && ['pending', 'approved', 'suspended', 'rejected'].includes(status)) q = q.eq('status', status);
  const { data: riders, error } = await q;
  if (error) return NextResponse.json({ error: 'Could not load riders.' }, { status: 500 });

  const ids = (riders ?? []).map(r => r.id);
  const [ledger, jobs] = ids.length ? await Promise.all([
    fetchAll<{ rider_id: string; amount: number }>((f, t) => admin.from('rider_ledger').select('rider_id, amount').in('rider_id', ids).range(f, t), 200000),
    fetchAll<{ rider_id: string; status: string }>((f, t) => admin.from('orders').select('rider_id, status').in('rider_id', ids).in('status', [...ACTIVE, 'delivered']).range(f, t), 200000),
  ]) : [[], []];

  const bal = new Map<string, number>();
  ledger.forEach(l => bal.set(l.rider_id, (bal.get(l.rider_id) ?? 0) + Number(l.amount)));
  const done = new Map<string, number>(), active = new Map<string, number>();
  jobs.forEach(j => (j.status === 'delivered' ? done : active).set(j.rider_id, ((j.status === 'delivered' ? done : active).get(j.rider_id) ?? 0) + 1));

  const counts = await admin.from('riders').select('status');
  const tally = (s: string) => (counts.data ?? []).filter(r => r.status === s).length;

  return NextResponse.json({
    riders: (riders ?? []).map((r: any) => ({
      id: r.id, status: r.status, vehicle: r.vehicle_type, reg: r.vehicle_reg, created_at: r.created_at,
      name: r.profiles?.name, phone: r.profiles?.phone, online: !!r.profiles?.is_online,
      balance: Math.round((bal.get(r.id) ?? 0) * 100) / 100, delivered: done.get(r.id) ?? 0, active: active.get(r.id) ?? 0,
    })),
    counts: { pending: tally('pending'), approved: tally('approved'), suspended: tally('suspended'), rejected: tally('rejected') },
  });
}
