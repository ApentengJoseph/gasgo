import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { confirmPayment } from '@/lib/payments/confirm';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { payoutSucceeded, payoutReturned } from '@/lib/server/payouts';

/**
 * Paystack webhook. Every event is verified with the HMAC-SHA512 signature
 * (constant-time compare) before anything happens, and payments are then
 * re-verified with Paystack's API inside confirmPayment(), never trusted from
 * the webhook body alone. Always answers 200 so Paystack doesn't retry-storm.
 */
export async function POST(request: NextRequest) {
  const raw = Buffer.from(await request.arrayBuffer());
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ received: true });

  const expected = crypto.createHmac('sha512', secret).update(raw).digest();
  const given = Buffer.from(request.headers.get('x-paystack-signature') || '', 'hex');
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
    console.warn('[webhook] bad signature');
    return NextResponse.json({ received: true });
  }

  try {
    const event = JSON.parse(raw.toString('utf8'));
    const ref: string | undefined = event?.data?.reference;

    if (event.event === 'charge.success' && ref) {
      await confirmPayment(ref);
    }

    // Rider withdrawals paid out by Paystack Transfers (atomic: each outcome applies once)
    if ((event.event === 'transfer.success' || event.event === 'transfer.failed' || event.event === 'transfer.reversed') && ref) {
      const admin = createServiceRoleClient();
      const { data: w } = await admin.from('withdrawals').select('id, rider_id, amount, status, reference').eq('reference', ref).maybeSingle();
      if (w) {
        if (event.event === 'transfer.success') await payoutSucceeded(admin, w);
        else await payoutReturned(admin, w, 'failed', event.data?.reason || (event.event === 'transfer.reversed' ? 'Transfer reversed' : 'Transfer failed'));
      }
    }
  } catch (err) {
    console.error('[webhook]', err);
  }
  return NextResponse.json({ received: true });
}
