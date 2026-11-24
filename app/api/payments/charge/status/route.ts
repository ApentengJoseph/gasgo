import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

const PAYSTACK_BASE = 'https://api.paystack.co';

/**
 * GET /api/payments/charge/status?reference=…   (or ?orderId=… for the signed-in owner)
 * Asks Paystack whether a MoMo charge went through. On success the order is
 * confirmed — but only if it's still waiting for payment, so a late check can
 * never move an order that a rider is already working on.
 */
export async function GET(request: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return NextResponse.json({ error: 'Not configured' }, { status: 503 });
  const admin = createServiceRoleClient();

  let reference = request.nextUrl.searchParams.get('reference');
  const orderId = request.nextUrl.searchParams.get('orderId');

  if (!reference && orderId) {
    const session = await createServerSupabaseClient();
    const { data: { user } } = await session.auth.getUser();
    const { data: ord } = await admin.from('orders').select('user_id, status').eq('id', orderId).maybeSingle();
    if (!user || !ord || ord.user_id !== user.id) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (ord.status !== 'pending') return NextResponse.json({ status: 'success', orderStatus: ord.status });
    const { data: pmt } = await admin.from('payments').select('reference').eq('order_id', orderId).maybeSingle();
    if (!pmt?.reference) return NextResponse.json({ status: 'none' }); // never tried paying
    reference = pmt.reference;
  }
  if (!reference) return NextResponse.json({ error: 'reference or orderId required' }, { status: 400 });

  try {
    const res = await fetch(`${PAYSTACK_BASE}/charge/${reference}`, { headers: { Authorization: `Bearer ${secretKey}` } });
    const data = await res.json();
    if (!res.ok || !data.status) return NextResponse.json({ status: 'unknown' });
    const txnStatus: string = data.data?.status;

    if (txnStatus === 'success') {
      await admin.from('payments').update({ status: 'completed', paid_at: new Date().toISOString() }).eq('reference', reference);
      const { data: pmt } = await admin.from('payments').select('order_id').eq('reference', reference).maybeSingle();
      if (pmt?.order_id) {
        const { data: confirmed } = await admin.from('orders').update({
          payment_status: 'paid',
          payment_method: 'mobile_money',
          payment_reference: reference,
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
        }).eq('id', pmt.order_id).eq('status', 'pending').select('user_id, order_number');

        // Notify only the first time the order flips to confirmed
        const ord = confirmed?.[0];
        if (ord?.user_id) {
          await admin.from('notifications').insert({
            user_id: ord.user_id,
            type: 'payment_success',
            title: 'Payment received',
            message: `We've received your payment for order #${ord.order_number}. A rider will pick up your cylinder soon.`,
            data: { orderId: pmt.order_id },
          });
        }
      }
    }
    return NextResponse.json({ status: txnStatus, reference });
  } catch (err) {
    console.error('[charge/status]', err);
    return NextResponse.json({ status: 'unknown' });
  }
}
