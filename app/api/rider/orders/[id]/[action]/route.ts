import { NextRequest, NextResponse } from 'next/server';
import { requireApprovedRider, fail, sameOrigin, rateLimited } from '@/lib/server/guard';
import { ACTIVE, MAX_ACTIVE_JOBS, type Status } from '@/lib/orders/rules';
import { assignOrder, advanceOrder } from '@/lib/server/orders';

/**
 * Rider job actions (approved riders only, all checks on the server):
 *   POST /api/rider/orders/:id/accept
 *   POST /api/rider/orders/:id/decline
 *   POST /api/rider/orders/:id/status  { next, cashCollected? }
 *
 * On delivery the wallet is credited (and, for cash orders, the cash the rider
 * kept is recorded) exactly once per order (unique ledger key).
 */
export async function POST(req: NextRequest, { params }: { params: { id: string; action: string } }) {
  if (!sameOrigin(req)) return fail(403, 'Not allowed.');
  const r = await requireApprovedRider();
  if (r.error) return r.error;
  const { admin, user, profile } = r;
  if (rateLimited(`rider-action:${user.id}`, 60, 60 * 1000)) return fail(429, 'Slow down a little.');
  const { data: o } = await admin.from('orders').select('*').eq('id', params.id).maybeSingle();
  if (!o) return fail(404, 'Order not found.');

  // ── Accept ──
  if (params.action === 'accept') {
    if (o.status !== 'confirmed' || o.rider_id) return fail(409, 'Another rider took this order.');
    const { data: p } = await admin.from('profiles').select('is_online').eq('id', user.id).maybeSingle();
    if (!p?.is_online) return fail(409, 'Go online to accept orders.');
    const { count } = await admin.from('orders').select('id', { count: 'exact', head: true }).eq('rider_id', user.id).in('status', ACTIVE);
    if ((count ?? 0) >= MAX_ACTIVE_JOBS) return fail(409, `Finish a job first (max ${MAX_ACTIVE_JOBS} at once).`);
    const ok = await assignOrder(admin, o, { id: user.id, name: profile.name, phone: profile.phone });
    if (!ok) return fail(409, 'Another rider took this order.');
    return NextResponse.json({ ok: true, status: 'assigned' });
  }

  // ── Decline (just hides it for this rider) ──
  if (params.action === 'decline') {
    await admin.from('order_declines').upsert({ order_id: o.id, rider_id: user.id }, { onConflict: 'order_id,rider_id' });
    return NextResponse.json({ ok: true });
  }

  // ── Move to the next step ──
  if (params.action === 'status') {
    if (o.rider_id !== user.id) return fail(403, 'This is not your job.');
    const { next, cashCollected } = await req.json().catch(() => ({}));
    const err = await advanceOrder(admin, o, next as Status, { by: user.id, cashCollected: cashCollected === true });
    if (err) return fail(409, err);
    return NextResponse.json({ ok: true, status: next });
  }

  return fail(404, 'Unknown action.');
}
