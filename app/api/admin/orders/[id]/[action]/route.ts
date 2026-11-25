import { NextRequest, NextResponse } from 'next/server';
import { adminGate, audit, isUuid } from '@/lib/server/admin';
import { fail, clean } from '@/lib/server/guard';
import { assignOrder, advanceOrder } from '@/lib/server/orders';
import { refundTransaction } from '@/lib/payments/refund';
import type { Status } from '@/lib/orders/rules';

/**
 * Admin order actions:
 *   cancel   { reason }          any unfinished order; MoMo payments are refunded
 *   assign   { riderId }         give a waiting order to an approved rider (or swap riders before pickup)
 *   unassign                     rider not responding → back to waiting
 *   advance  { next, cashCollected? }  move a step for a rider who can't (phone died etc.)
 *   settle                       GasRefill has paid the station for a MoMo order
 *   refund                       retry a refund that didn't go through
 */
export async function POST(req: NextRequest, { params }: { params: { id: string; action: string } }) {
  const g = await adminGate(req, { write: true });
  if (g.error) return g.error;
  if (!isUuid(params.id)) return fail(404, 'Order not found.');
  const { admin, user } = g;
  const body = await req.json().catch(() => ({}));
  const { data: o } = await admin.from('orders').select('*').eq('id', params.id).maybeSingle();
  if (!o) return fail(404, 'Order not found.');
  const now = new Date().toISOString();
  const log = (details?: Record<string, unknown>) => audit(admin, user.id, `order.${params.action}`, o.order_number, details);

  switch (params.action) {
    case 'cancel': {
      if (o.status === 'delivered' || o.status === 'cancelled') return fail(409, 'This order is already finished.');
      const reason = clean(body.reason, 200) || 'Cancelled by GasRefill';
      const paidMomo = o.payment_status === 'paid' && o.payment_method === 'mobile_money' && o.payment_reference;
      const { data: done } = await admin.from('orders').update({
        status: 'cancelled', cancelled_at: now, cancelled_by: 'admin', cancellation_reason: reason,
        refund_status: paidMomo ? 'pending' : null,
      }).eq('id', o.id).eq('status', o.status).select('id');
      if (!done?.length) return fail(409, 'This order just changed. Refresh.');
      let refund: string | null = null;
      if (paidMomo) {
        refund = await refundTransaction(o.payment_reference);
        await admin.from('orders').update({ refund_status: refund, payment_status: refund === 'refunded' ? 'refunded' : 'paid' }).eq('id', o.id);
      }
      if (o.user_id) await admin.from('notifications').insert({
        user_id: o.user_id, type: 'cancelled', title: 'Order cancelled',
        message: `Order #${o.order_number} was cancelled by GasRefill: ${reason}.${refund ? ' Your MoMo refund is on its way.' : ''}${o.cash_collected_at ? ' Your rider will return your cash and cylinder.' : ''}`,
        data: { orderId: o.id },
      });
      await log({ reason, refund, cashCollected: !!o.cash_collected_at });
      return NextResponse.json({ ok: true, refund });
    }

    case 'assign': {
      if (!['confirmed', 'assigned'].includes(o.status)) return fail(409, 'Only waiting orders, or orders not yet picked up, can be (re)assigned.');
      if (!isUuid(String(body.riderId))) return fail(400, 'Choose a rider.');
      const { data: r } = await admin.from('riders').select('id, status, profiles!riders_id_fkey(name, phone)').eq('id', body.riderId).maybeSingle();
      if (!r || r.status !== 'approved') return fail(400, 'That rider isn’t approved.');
      const p = (r as any).profiles;
      const ok = await assignOrder(admin, o, { id: r.id, name: p?.name ?? null, phone: p?.phone ?? null }, { reassign: o.status === 'assigned' });
      if (!ok) return fail(409, 'This order just changed. Refresh.');
      await log({ rider: r.id, from: o.rider_id });
      return NextResponse.json({ ok: true });
    }

    case 'unassign': {
      if (o.status !== 'assigned') return fail(409, 'Only orders not yet picked up can be put back.');
      const { data: done } = await admin.from('orders').update({
        status: 'confirmed', rider_id: null, rider_name: null, rider_phone: null, assigned_at: null,
        rider_earning: null, platform_fee: null, rider_lat: null, rider_lng: null,
      }).eq('id', o.id).eq('status', 'assigned').select('id');
      if (!done?.length) return fail(409, 'This order just changed. Refresh.');
      await log({ rider: o.rider_id });
      return NextResponse.json({ ok: true });
    }

    case 'advance': {
      const err = await advanceOrder(admin, o, body.next as Status, { by: null, cashCollected: body.cashCollected === true });
      if (err) return fail(409, err);
      await log({ next: body.next });
      return NextResponse.json({ ok: true });
    }

    case 'settle': {
      if (o.status !== 'delivered' || o.payment_method !== 'mobile_money') return fail(409, 'Only delivered MoMo orders are paid to stations by GasRefill.');
      await admin.from('orders').update({ station_settled_at: now }).eq('id', o.id).is('station_settled_at', null);
      await log({ amount: o.subtotal });
      return NextResponse.json({ ok: true });
    }

    case 'refund': {
      if (o.refund_status !== 'pending' || !o.payment_reference) return fail(409, 'No refund waiting on this order.');
      const refund = await refundTransaction(o.payment_reference);
      await admin.from('orders').update({ refund_status: refund, payment_status: refund === 'refunded' ? 'refunded' : 'paid' }).eq('id', o.id);
      await log({ refund });
      return NextResponse.json({ ok: true, refund });
    }
  }
  return fail(404, 'Unknown action.');
}
