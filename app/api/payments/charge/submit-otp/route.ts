import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { sessionUser, fail, sameOrigin, rateLimited } from '@/lib/server/guard';
import { confirmPayment } from '@/lib/payments/confirm';

/**
 * POST /api/payments/charge/submit-otp { otp, reference }
 * Some networks send the customer a one-time code before the MoMo prompt.
 * Only the order's owner may submit it, for a payment we created, a few times.
 */
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return fail(403, 'Not allowed.');
  const user = await sessionUser();
  if (!user) return fail(401, 'Your session expired. Please refresh.');
  if (rateLimited(`otp:${user.id}`, 6, 15 * 60 * 1000)) return fail(429, 'Too many tries. Wait a few minutes and start the payment again.');

  const { otp, reference } = await request.json().catch(() => ({}));
  const code = String(otp ?? '').replace(/\D/g, '');
  if (code.length < 4 || code.length > 8 || typeof reference !== 'string') return fail(400, 'Enter the code from your phone.');

  const admin = createServiceRoleClient();
  const { data: pmt } = await admin.from('payments').select('order_id').eq('reference', reference).maybeSingle();
  const { data: order } = pmt ? await admin.from('orders').select('user_id').eq('id', pmt.order_id).maybeSingle() : { data: null };
  if (!order || order.user_id !== user.id) return fail(404, 'Payment not found. Please start again.');

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return fail(503, 'Payments are not available right now.');
  const res = await fetch('https://api.paystack.co/charge/submit_otp', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ otp: code, reference }),
    cache: 'no-store',
  }).catch(() => null);
  const data = await res?.json().catch(() => null);
  if (!res?.ok || !data?.status) return fail(400, data?.message || 'That code didn’t work. Check it and try again.');

  const nextStatus: string = data.data?.status;
  if (nextStatus === 'success') await confirmPayment(reference);
  return NextResponse.json({
    success: true,
    status: nextStatus,
    displayText: data.data?.display_text ||
      (nextStatus === 'pay_offline'
        ? 'A payment prompt has been sent to your phone. Enter your MoMo PIN to finish.'
        : nextStatus === 'success' ? 'Payment confirmed!' : 'Processing payment…'),
  });
}
