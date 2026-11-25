import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { sessionUser, fail, sameOrigin, clean } from '@/lib/server/guard';
import { customerCanCancel } from '@/lib/orders/rules';
import { refundTransaction } from '@/lib/payments/refund';

/**
 * POST /api/orders/:id/cancel  { reason? }
 * Customer cancels before a rider accepts. A MoMo order that was already paid
 * is refunded through Paystack (to the same MoMo wallet).
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!sameOrigin(req)) return fail(403, 'Not allowed.');
  const user = await sessionUser();
  if (!user) return fail(401, 'Please refresh and try again.');
  const { reason } = await req.json().catch(() => ({}));

  const admin = createServiceRoleClient();
  const { data: o } = await admin.from('orders')
    .select('id, user_id, status, rider_id, payment_status, payment_reference, order_number')
    .eq('id', params.id).maybeSingle();
  if (!o || o.user_id !== user.id) return fail(404, 'Order not found.');
  if (o.status === 'cancelled') return NextResponse.json({ ok: true, status: 'cancelled' });
  if (!customerCanCancel(o)) {
    return fail(409, 'Your rider has already accepted this order. Call or WhatsApp them, or contact us, to change it.');
  }

  // Cancel only if nothing changed in the meantime (e.g. a rider accepted a second ago)
  const { data: updated } = await admin.from('orders').update({
    status: 'cancelled',
    cancelled_at: new Date().toISOString(),
    cancelled_by: 'customer',
    cancellation_reason: clean(reason, 200) || 'Cancelled by customer',
    refund_status: o.payment_status === 'paid' ? 'pending' : null,
  }).eq('id', o.id).eq('status', o.status).is('rider_id', null).select('id');
  if (!updated?.length) return fail(409, 'This order just changed. Please refresh.');

  let refund: 'refunded' | 'pending' | null = null;
  if (o.payment_status === 'paid' && o.payment_reference) {
    refund = await refundTransaction(o.payment_reference);
    await admin.from('orders').update({
      refund_status: refund, payment_status: refund === 'refunded' ? 'refunded' : 'paid',
    }).eq('id', o.id);
  }

  await admin.from('notifications').insert({
    user_id: user.id, type: 'cancelled', title: 'Order cancelled',
    message: refund
      ? `Order #${o.order_number} was cancelled. ${refund === 'refunded' ? 'Your MoMo refund is on its way.' : 'We’re processing your refund.'}`
      : `Order #${o.order_number} was cancelled.`,
    data: { orderId: o.id },
  });
  return NextResponse.json({ ok: true, status: 'cancelled', refund });
}
