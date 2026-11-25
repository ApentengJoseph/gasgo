import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { requireApprovedRider, fail, sameOrigin, rateLimited } from '@/lib/server/guard';
import { walletSummary } from '@/lib/server/wallet';
import { MIN_WITHDRAWAL } from '@/lib/orders/rules';

/**
 * POST /api/rider/withdraw { amount }
 * Requests a payout to the MoMo number on the rider's (admin-approved) profile.
 * The amount is reserved from the wallet immediately; an admin approves and
 * GasRefill pays via Paystack Transfers. The payout number can't be changed here
 * (only by an admin), so a stolen login can't redirect money.
 */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return fail(403, 'Not allowed.');
  const r = await requireApprovedRider();
  if (r.error) return r.error;
  if (rateLimited(`withdraw:${r.user.id}`, 5, 60 * 60 * 1000)) return fail(429, 'Too many requests. Try again later.');
  const { amount } = await req.json().catch(() => ({}));
  const amt = Math.round(Number(amount) * 100) / 100;
  if (!Number.isFinite(amt) || amt < MIN_WITHDRAWAL) return fail(400, `Minimum withdrawal is GH₵${MIN_WITHDRAWAL}.`);

  const { balance } = await walletSummary(r.admin, r.user.id);
  if (amt > balance) return fail(400, `You can withdraw up to GH₵${Math.max(0, balance).toFixed(2)}.`);

  const reference = `WD_${Date.now()}_${randomBytes(4).toString('hex')}`;
  const { data: w, error } = await r.admin.from('withdrawals').insert({
    rider_id: r.user.id, amount: amt, momo_number: r.rider.momo_number, momo_network: r.rider.momo_network, reference,
  }).select('id').single();
  if (error) return fail(409, /one_open|duplicate/i.test(error.message) ? 'You already have a withdrawal in progress.' : 'Could not request the withdrawal.');
  await r.admin.from('rider_ledger').insert({ rider_id: r.user.id, type: 'withdrawal', amount: -amt, note: `Withdrawal ${reference}` });
  return NextResponse.json({ ok: true, id: w.id });
}
