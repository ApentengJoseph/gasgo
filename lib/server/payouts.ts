import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Rider withdrawals. Money leaves the wallet when the rider requests (a negative
 * ledger line). If the payout fails, is rejected or is reversed, exactly one
 * reversal line puts it back. Every status change is atomic ("only if it is
 * still X"), so two webhook deliveries or two admins can't double-credit.
 */

const MOMO_BANK: Record<string, string> = { MTN: 'MTN', TELECEL: 'VOD', AIRTELTIGO: 'ATL' };

type W = { id: string; rider_id: string; amount: number; status: string; reference: string };

/** Move a withdrawal from one of `from` to `to`; returns true only for the caller that made the change. */
async function move(admin: SupabaseClient, w: W, from: string[], patch: Record<string, unknown>) {
  const { data } = await admin.from('withdrawals').update(patch).eq('id', w.id).in('status', from).select('id');
  return !!data?.length;
}

async function giveBack(admin: SupabaseClient, w: W, why: string) {
  await admin.from('rider_ledger').insert({ rider_id: w.rider_id, type: 'withdrawal_reversal', amount: Number(w.amount), note: `${why} · ${w.reference}` });
  await admin.from('notifications').insert({
    user_id: w.rider_id, type: 'account', title: 'Withdrawal returned',
    message: `GH₵${Number(w.amount).toFixed(2)} is back in your GasRefill wallet (${why.toLowerCase()}).`, data: {},
  });
}

export async function payoutSucceeded(admin: SupabaseClient, w: W, by?: string) {
  const ok = await move(admin, w, ['requested', 'processing'], { status: 'paid', processed_at: new Date().toISOString(), ...(by ? { processed_by: by } : {}) });
  if (ok) await admin.from('notifications').insert({
    user_id: w.rider_id, type: 'account', title: 'Withdrawal paid',
    message: `GH₵${Number(w.amount).toFixed(2)} has been sent to your MoMo.`, data: {},
  });
  return ok;
}

/** Failed/reversed by Paystack (also after it first said "paid") or rejected by an admin. */
export async function payoutReturned(admin: SupabaseClient, w: W, status: 'failed' | 'rejected', reason: string, by?: string) {
  const from = status === 'rejected' ? ['requested'] : ['requested', 'processing', 'paid'];
  const ok = await move(admin, w, from, {
    status, failure_reason: reason.slice(0, 200), processed_at: new Date().toISOString(), ...(by ? { processed_by: by } : {}),
  });
  if (ok) await giveBack(admin, w, status === 'rejected' ? `Declined: ${reason}` : 'Payout failed');
  return ok;
}

/**
 * Send the money with Paystack Transfers (MoMo). Needs transfers enabled on the
 * Paystack account and, for automatic sending, transfer OTP turned off.
 */
export async function sendPayout(admin: SupabaseClient, w: W & { momo_number: string; momo_network: string }, riderName: string, by: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return { error: 'Paystack is not set up.' };
  if (!(await move(admin, w, ['requested'], { status: 'processing', processed_by: by }))) return { error: 'This withdrawal was already handled.' };

  const call = async (path: string, body: unknown) => {
    const res = await fetch(`https://api.paystack.co${path}`, {
      method: 'POST', headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store',
    }).catch(() => null);
    return { ok: !!res?.ok, d: await res?.json().catch(() => null) };
  };

  const rec = await call('/transferrecipient', {
    type: 'mobile_money', name: riderName.slice(0, 60), account_number: w.momo_number, bank_code: MOMO_BANK[w.momo_network] ?? w.momo_network, currency: 'GHS',
  });
  const recipient = rec.d?.data?.recipient_code;
  if (!rec.ok || !recipient) {
    await move(admin, w, ['processing'], { status: 'requested' }); // nothing was sent: back to the queue
    return { error: rec.d?.message || 'Paystack could not add this MoMo number.' };
  }

  const tr = await call('/transfer', {
    source: 'balance', amount: Math.round(Number(w.amount) * 100), recipient, reference: w.reference, reason: 'GasRefill rider payout', currency: 'GHS',
  });
  const status = tr.d?.data?.status;
  if (!tr.ok || !tr.d?.status) {
    // Paystack refused it outright: no money moved, so it can be tried again.
    await move(admin, w, ['processing'], { status: 'requested' });
    return { error: tr.d?.message || 'Paystack did not accept the transfer.' };
  }
  await admin.from('withdrawals').update({ transfer_code: tr.d.data.transfer_code ?? null }).eq('id', w.id);
  if (status === 'success') await payoutSucceeded(admin, w, by);
  if (status === 'otp') return { ok: true, note: 'Paystack is asking for an OTP. Turn off transfer OTP in Paystack settings, or finish it in the Paystack dashboard.' };
  return { ok: true, note: status === 'success' ? 'Paid.' : 'Sent. It will show as paid when Paystack confirms.' };
}
