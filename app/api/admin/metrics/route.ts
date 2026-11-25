import { NextRequest, NextResponse } from 'next/server';
import { adminGate, fetchAll, sum } from '@/lib/server/admin';
import { ACTIVE } from '@/lib/orders/rules';

export const dynamic = 'force-dynamic';

type O = {
  id: string; status: string; payment_method: string | null; payment_status: string | null; user_id: string | null;
  total: number; subtotal: number; delivery_fee: number; safekeeping_fee: number; rider_earning: number | null; platform_fee: number | null;
  created_at: string; confirmed_at: string | null; assigned_at: string | null; delivered_at: string | null; station_name: string;
};
type E = { session_id: string; user_id: string | null; event: string; created_at: string; device: string | null };

const RANGES: Record<string, number> = { today: 0, '7d': 7, '30d': 30 };
const minutes = (a?: string | null, b?: string | null) => (a && b ? (new Date(b).getTime() - new Date(a).getTime()) / 60000 : null);
const avg = (xs: (number | null)[]) => { const v = xs.filter((x): x is number => x != null && x >= 0); return v.length ? Math.round(v.reduce((s, x) => s + x, 0) / v.length) : null; };

/**
 * GET /api/admin/metrics?range=today|7d|30d
 * Everything the control centre overview shows: orders, money split, riders,
 * customers, app usage and the order funnel, plus things that need attention.
 */
export async function GET(req: NextRequest) {
  const g = await adminGate(req);
  if (g.error) return g.error;
  const { admin } = g;

  const range = RANGES[req.nextUrl.searchParams.get('range') ?? '7d'] !== undefined ? req.nextUrl.searchParams.get('range') ?? '7d' : '7d';
  const days = RANGES[range];
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0); // Ghana is on UTC
  if (days) start.setUTCDate(start.getUTCDate() - (days - 1));
  const since = start.toISOString();

  const [orders, events, newCustomers, riders, ledger, online, alerts] = await Promise.all([
    fetchAll<O>((f, t) => admin.from('orders')
      .select('id, status, payment_method, payment_status, user_id, total, subtotal, delivery_fee, safekeeping_fee, rider_earning, platform_fee, created_at, confirmed_at, assigned_at, delivered_at, station_name')
      .gte('created_at', since).order('created_at').range(f, t)),
    fetchAll<E>((f, t) => admin.from('app_events').select('session_id, user_id, event, created_at, device')
      .gte('created_at', since).order('created_at').range(f, t), 100000),
    admin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer').gte('created_at', since),
    admin.from('riders').select('status'),
    fetchAll<{ rider_id: string; amount: number }>((f, t) => admin.from('rider_ledger').select('rider_id, amount').range(f, t)),
    admin.from('riders').select('id, profiles!riders_id_fkey!inner(is_online)', { count: 'exact', head: true }).eq('status', 'approved').eq('profiles.is_online', true),
    Promise.all([
      admin.from('riders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      admin.from('withdrawals').select('id', { count: 'exact', head: true }).in('status', ['requested', 'processing']),
      admin.from('support_questions').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      admin.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'confirmed').is('rider_id', null)
        .lt('confirmed_at', new Date(Date.now() - 10 * 60000).toISOString()),
      admin.from('orders').select('id', { count: 'exact', head: true }).eq('refund_status', 'pending'),
      admin.from('payment_events').select('reference', { count: 'exact', head: true }).eq('outcome', 'refund_failed'),
      fetchAll<{ subtotal: number }>((f, t) => admin.from('orders').select('subtotal').eq('status', 'delivered')
        .eq('payment_method', 'mobile_money').is('station_settled_at', null).range(f, t)),
    ]),
  ]);

  // ── Orders ──
  const delivered = orders.filter(o => o.status === 'delivered');
  const live = orders.filter(o => ['confirmed', ...ACTIVE].includes(o.status as never));
  const cancelled = orders.filter(o => o.status === 'cancelled');
  const unpaid = orders.filter(o => o.status === 'pending');

  // ── Money (delivered orders) ──
  const money = {
    gmv: sum(delivered, 'total'),
    gas: sum(delivered, 'subtotal'),
    fees: Math.round((sum(delivered, 'delivery_fee') + sum(delivered, 'safekeeping_fee')) * 100) / 100,
    riders: sum(delivered, 'rider_earning'),
    profit: sum(delivered, 'platform_fee'),
    cashShare: delivered.length ? Math.round(delivered.filter(o => o.payment_method === 'cash').length / delivered.length * 100) : 0,
  };

  // ── Rider wallets (all time) ──
  const balances = new Map<string, number>();
  for (const l of ledger) balances.set(l.rider_id, (balances.get(l.rider_id) ?? 0) + Number(l.amount));
  const owedToRiders = Math.round([...balances.values()].filter(v => v > 0).reduce((s, v) => s + v, 0) * 100) / 100;
  const owedByRiders = Math.round(-[...balances.values()].filter(v => v < 0).reduce((s, v) => s + v, 0) * 100) / 100;

  // ── App usage ──
  const sessions = new Map<string, { first: number; last: number; user: string | null; device: string | null }>();
  for (const e of events) {
    const t = new Date(e.created_at).getTime();
    const s = sessions.get(e.session_id);
    if (!s) sessions.set(e.session_id, { first: t, last: t, user: e.user_id, device: e.device });
    else { s.last = Math.max(s.last, t); s.user = s.user ?? e.user_id; }
  }
  const sessionList = [...sessions.values()];
  const count = (ev: string) => new Set(events.filter(e => e.event === ev).map(e => e.session_id)).size;
  const usage = {
    sessions: sessionList.length,
    activeUsers: new Set(sessionList.map(s => s.user).filter(Boolean)).size,
    avgMinutes: sessionList.length ? Math.round(sessionList.reduce((s, x) => s + (x.last - x.first), 0) / sessionList.length / 6000) / 10 : 0,
    mobileShare: sessionList.length ? Math.round(sessionList.filter(s => s.device === 'mobile').length / sessionList.length * 100) : 0,
    signIns: events.filter(e => e.event === 'sign_in').length,
    devicesLinked: events.filter(e => e.event === 'device_linked').length,
    pageViews: events.filter(e => e.event === 'page_view').length,
  };
  const funnel = [
    { label: 'Visited', value: usage.sessions },
    { label: 'Reached checkout', value: count('checkout_start') },
    { label: 'Placed order', value: orders.length },
    { label: 'Confirmed', value: orders.filter(o => o.confirmed_at).length },
    { label: 'Delivered', value: delivered.length },
  ];

  // ── Chart: by hour (today) or by day ──
  const buckets: { label: string; orders: number; delivered: number; revenue: number }[] = [];
  const keyOf = (iso: string) => (days ? iso.slice(0, 10) : iso.slice(11, 13));
  if (days) for (let i = 0; i < days; i++) { const d = new Date(start); d.setUTCDate(d.getUTCDate() + i); buckets.push({ label: d.toISOString().slice(0, 10), orders: 0, delivered: 0, revenue: 0 }); }
  else for (let h = 0; h < 24; h++) buckets.push({ label: String(h).padStart(2, '0'), orders: 0, delivered: 0, revenue: 0 });
  const idx = new Map(buckets.map((b, i) => [b.label, i]));
  for (const o of orders) {
    const b = buckets[idx.get(keyOf(o.created_at)) ?? -1];
    if (!b) continue;
    b.orders++;
    if (o.status === 'delivered') { b.delivered++; b.revenue += Number(o.platform_fee) || 0; }
  }

  // ── Top stations ──
  const byStation = new Map<string, number>();
  for (const o of delivered) byStation.set(o.station_name, (byStation.get(o.station_name) ?? 0) + 1);

  const [pendingRiders, openWithdrawals, openQuestions, waitingOrders, pendingRefunds, failedRefunds, stationDue] = alerts;
  const riderRows = riders.data ?? [];

  return NextResponse.json({
    range, since,
    orders: {
      total: orders.length, delivered: delivered.length, live: live.length, cancelled: cancelled.length, unpaid: unpaid.length,
      completionRate: orders.length ? Math.round(delivered.length / Math.max(1, orders.length - unpaid.length) * 100) : 0,
      avgAcceptMinutes: avg(orders.map(o => minutes(o.confirmed_at, o.assigned_at))),
      avgDeliveryMinutes: avg(delivered.map(o => minutes(o.confirmed_at, o.delivered_at))),
    },
    money: { ...money, owedToRiders, owedByRiders, stationDue: sum(stationDue as Record<string, unknown>[], 'subtotal') },
    riders: {
      approved: riderRows.filter(r => r.status === 'approved').length,
      pending: riderRows.filter(r => r.status === 'pending').length,
      suspended: riderRows.filter(r => r.status === 'suspended').length,
      online: online.count ?? 0,
    },
    customers: {
      new: newCustomers.count ?? 0,
      ordering: new Set(orders.map(o => o.user_id).filter(Boolean)).size,
      repeat: (() => { const c = new Map<string, number>(); delivered.forEach(o => o.user_id && c.set(o.user_id, (c.get(o.user_id) ?? 0) + 1)); return [...c.values()].filter(n => n > 1).length; })(),
    },
    usage, funnel, chart: buckets.map(b => ({ ...b, revenue: Math.round(b.revenue * 100) / 100 })),
    topStations: [...byStation.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, n]) => ({ name, orders: n })),
    attention: {
      pendingRiders: pendingRiders.count ?? 0,
      withdrawals: openWithdrawals.count ?? 0,
      questions: openQuestions.count ?? 0,
      waitingOrders: waitingOrders.count ?? 0,
      refunds: (pendingRefunds.count ?? 0) + (failedRefunds.count ?? 0),
    },
  });
}
