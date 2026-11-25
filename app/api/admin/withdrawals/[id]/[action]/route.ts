import { NextRequest, NextResponse } from 'next/server';
import { adminGate, audit, isUuid } from '@/lib/server/admin';
import { fail, clean } from '@/lib/server/guard';
import { sendPayout, payoutSucceeded, payoutReturned } from '@/lib/server/payouts';

/**
 * POST /api/admin/withdrawals/:id/:action
 *   pay        send with Paystack Transfers to the rider's registered MoMo number
 *   mark_paid  you paid it yourself (outside Paystack)
 *   reject     { reason } → money goes back to the rider's wallet
 */
export async function POST(req: NextRequest, { params }: { params: { id: string; action: string } }) {
  const g = await adminGate(req, { write: true });
  if (g.error) return g.error;
  if (!isUuid(params.id)) return fail(404, 'Not found.');
  const { admin, user } = g;
  const body = await req.json().catch(() => ({}));
  const { data: w } = await admin.from('withdrawals').select('*').eq('id', params.id).maybeSingle();
  if (!w) return fail(404, 'Not found.');
  const { data: p } = await admin.from('profiles').select('name').eq('id', w.rider_id).maybeSingle();
  const log = (details?: Record<string, unknown>) => audit(admin, user.id, `withdrawal.${params.action}`, w.reference, { amount: w.amount, to: `${w.momo_network} ${w.momo_number}`, ...details });

  if (params.action === 'pay') {
    if (w.status !== 'requested') return fail(409, 'This withdrawal was already handled.');
    const r = await sendPayout(admin, w, p?.name || 'GasRefill rider', user.id);
    if (r.error) return fail(502, r.error);
    await log({ via: 'paystack' });
    return NextResponse.json({ ok: true, note: r.note });
  }
  if (params.action === 'mark_paid') {
    if (!(await payoutSucceeded(admin, w, user.id))) return fail(409, 'This withdrawal was already handled.');
    await log({ via: 'manual' });
    return NextResponse.json({ ok: true });
  }
  if (params.action === 'reject') {
    const reason = clean(body.reason, 160);
    if (!reason) return fail(400, 'Add a short reason (the rider sees it).');
    if (w.status !== 'requested') return fail(409, 'Only requests not yet sent can be declined.');
    if (!(await payoutReturned(admin, w, 'rejected', reason, user.id))) return fail(409, 'This withdrawal was already handled.');
    await log({ reason });
    return NextResponse.json({ ok: true });
  }
  return fail(404, 'Unknown action.');
}
