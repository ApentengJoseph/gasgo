import { createServiceRoleClient } from '@/lib/supabase/server';
import { refundTransaction } from '@/lib/payments/refund';

/**
 * The ONLY place an order is marked paid. Every path (webhook, status poll,
 * verify, callback) goes through here, and money counts only if Paystack says:
 *   - the transaction succeeded,
 *   - in Ghana cedis,
 *   - for at least the order total stored in our database.
 *
 * Normal case: the order is still waiting for payment → it's confirmed.
 * Late approvals (the customer approved an older MoMo prompt after retrying,
 * switched to cash, or cancelled) are handled so nobody pays without getting
 * gas: switched-to-cash orders become MoMo-paid, cancelled or already-paid
 * orders are refunded. Each late reference is handled exactly once.
 */
export type ConfirmResult =
  | { status: 'success'; orderId: string }
  | { status: 'pending' | 'failed' | 'unknown' | 'mismatch'; orderId?: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function confirmPayment(reference: string): Promise<ConfirmResult> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !/^[A-Za-z0-9_\-.]{6,100}$/.test(reference)) return { status: 'unknown' };
  const admin = createServiceRoleClient();

  const { data: pmt } = await admin.from('payments').select('order_id').eq('reference', reference).maybeSingle();
  // Only references we created (a retry replaces the stored one, so older GAS_ refs are looked up via Paystack)
  if (!pmt?.order_id && !reference.startsWith('GAS_')) return { status: 'unknown' };

  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` }, cache: 'no-store',
  }).catch(() => null);
  const body = await res?.json().catch(() => null);
  const txn = body?.data;
  const orderId: string | undefined = pmt?.order_id ?? (UUID.test(String(txn?.metadata?.orderId)) ? txn.metadata.orderId : undefined);
  if (!res?.ok || !body?.status || !txn || !orderId) return { status: 'unknown', orderId };
  if (txn.status === 'failed' || txn.status === 'abandoned' || txn.status === 'reversed') {
    if (pmt) await admin.from('payments').update({ status: 'failed' }).eq('reference', reference);
    return { status: 'failed', orderId };
  }
  if (txn.status !== 'success') return { status: 'pending', orderId };

  const { data: order } = await admin.from('orders')
    .select('id, total, status, user_id, order_number, payment_status, payment_reference, cash_collected_at')
    .eq('id', orderId).maybeSingle();
  if (!order) return { status: 'unknown' };
  const expected = Math.round(Number(order.total) * 100);
  if (txn.currency !== 'GHS' || Number(txn.amount) < expected) {
    console.error('[payments] amount mismatch', { reference, expected, got: txn.amount, currency: txn.currency });
    if (pmt) await admin.from('payments').update({ status: 'mismatch' }).eq('reference', reference);
    return { status: 'mismatch', orderId: order.id };
  }

  const now = new Date().toISOString();
  const notify = async (type: string, title: string, message: string) => {
    if (order.user_id) await admin.from('notifications').insert({ user_id: order.user_id, type, title, message, data: { orderId: order.id } });
  };

  if (pmt) await admin.from('payments').update({ status: 'completed', paid_at: now }).eq('reference', reference);

  // ── Normal case: waiting for payment → confirmed ──
  const { data: flipped } = await admin.from('orders').update({
    payment_status: 'paid', payment_method: 'mobile_money', payment_reference: reference,
    status: 'confirmed', confirmed_at: now,
  }).eq('id', order.id).eq('status', 'pending').select('id');
  if (flipped?.length) {
    await notify('payment_success', 'Payment received', `We've received your payment for order #${order.order_number}. A rider will pick up your cylinder soon.`);
    return { status: 'success', orderId: order.id };
  }
  if (order.payment_reference === reference) return { status: 'success', orderId: order.id }; // already counted

  // ── Late approval: handle this reference once only ──
  const { error: seen } = await admin.from('payment_events').insert({ reference, order_id: order.id, outcome: 'late' });
  if (seen) return { status: 'success', orderId: order.id }; // another check already handled it

  if (order.status !== 'cancelled' && order.payment_status !== 'paid' && !order.cash_collected_at) {
    // They switched to cash, then approved the MoMo prompt anyway: it's paid, the rider collects nothing.
    const { data: switched } = await admin.from('orders').update({
      payment_status: 'paid', payment_method: 'mobile_money', payment_reference: reference,
    }).eq('id', order.id).neq('payment_status', 'paid').is('cash_collected_at', null).neq('status', 'cancelled').select('id');
    if (switched?.length) {
      await admin.from('payment_events').update({ outcome: 'applied' }).eq('reference', reference);
      await notify('payment_success', 'Paid with MoMo', `Your MoMo payment for order #${order.order_number} went through, so there’s no cash to pay the rider.`);
      return { status: 'success', orderId: order.id };
    }
  }

  // Cancelled, or already paid another way → this money goes back.
  const refund = await refundTransaction(reference);
  await admin.from('payment_events').update({ outcome: refund === 'refunded' ? 'refunded' : 'refund_failed' }).eq('reference', reference);
  console.error('[payments] late payment refunded', { reference, order: order.id, refund });
  await notify('payment_success', 'Refund on its way',
    order.status === 'cancelled'
      ? `Your payment for cancelled order #${order.order_number} is being refunded to your MoMo.`
      : `Order #${order.order_number} was already paid, so we’re refunding your extra MoMo payment.`);
  return { status: 'success', orderId: order.id };
}
