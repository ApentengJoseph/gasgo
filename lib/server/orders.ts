import type { SupabaseClient } from '@supabase/supabase-js';
import { RIDER_NEXT, splitFees, type Status } from '@/lib/orders/rules';

/**
 * Shared order steps used by the rider app and the admin control centre,
 * so the status rules, cash handling, wallet credits and customer messages
 * are identical whoever moves the order.
 */

const NOTE: Partial<Record<Status, [string, string]>> = {
  assigned:   ['Rider on the way', 'is coming to pick up your empty cylinder'],
  collected:  ['Cylinder picked up', 'has your cylinder and is heading to the station'],
  at_station: ['Refilling now', 'is refilling your cylinder at the station'],
  on_the_way: ['Bringing it back', 'is bringing your full cylinder back'],
  arriving:   ['Almost there', 'is nearly at your door'],
  delivered:  ['Delivered', 'has delivered your gas. Enjoy your cooking!'],
};

type Order = Record<string, any>;

export async function notifyCustomer(admin: SupabaseClient, o: Order, status: Status, riderName?: string | null) {
  const n = NOTE[status];
  if (!n || !o.user_id) return;
  await admin.from('notifications').insert({
    user_id: o.user_id, type: status, title: n[0],
    message: `${(riderName || o.rider_name || 'Your rider').split(' ')[0]} ${n[1]} (order #${o.order_number}).`,
    data: { orderId: o.id },
  });
}

/** Give an order to a rider (rider accepting, or admin assigning). Atomic: fails if it changed meanwhile. */
export async function assignOrder(admin: SupabaseClient, o: Order, rider: { id: string; name: string | null; phone: string | null }, opts: { reassign?: boolean } = {}) {
  const { riderEarning, platformFee } = splitFees(Number(o.delivery_fee), Number(o.safekeeping_fee));
  let q = admin.from('orders').update({
    rider_id: rider.id, rider_name: rider.name, rider_phone: rider.phone,
    status: 'assigned', assigned_at: new Date().toISOString(), rider_earning: riderEarning, platform_fee: platformFee,
  }).eq('id', o.id);
  q = opts.reassign
    ? q.eq('status', o.status).in('status', ['confirmed', 'assigned'])
    : q.eq('status', 'confirmed').is('rider_id', null);
  const { data } = await q.select('id');
  if (!data?.length) return false;
  await notifyCustomer(admin, o, 'assigned', rider.name);
  return true;
}

/**
 * Move an order one step. `by` is the rider id (must own the job) or null for admin.
 * Returns an error message, or null when done.
 */
export async function advanceOrder(admin: SupabaseClient, o: Order, next: Status, opts: { by: string | null; cashCollected?: boolean }) {
  const allowed = RIDER_NEXT[o.status as Status] ?? [];
  if (!allowed.includes(next)) return 'That step isn’t possible right now. Refresh.';
  if (!o.rider_id) return 'No rider on this order.';
  const isCash = o.payment_method === 'cash';
  if (next === 'collected' && isCash && opts.cashCollected !== true) {
    return `Collect GH₵${Number(o.total).toFixed(2)} cash from the customer, then confirm.`;
  }
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { status: next, [`${next}_at`]: now };
  if (next === 'collected' && isCash) Object.assign(patch, { cash_collected_at: now, payment_status: 'paid' });

  let q = admin.from('orders').update(patch).eq('id', o.id).eq('status', o.status);
  if (opts.by) q = q.eq('rider_id', opts.by);
  const { data: moved } = await q.select('id');
  if (!moved?.length) return 'This job just changed. Refresh.';

  if (next === 'delivered') await creditDelivery(admin, o);
  await notifyCustomer(admin, o, next);
  return null;
}

/**
 * Wallet lines for a delivered order (exactly once per order — unique key):
 *  + the rider's earning;
 *  − for cash orders, the pickup & return + safekeeping the rider kept from the
 *    customer's cash (they paid the station for the gas from the same cash).
 */
export async function creditDelivery(admin: SupabaseClient, o: Order) {
  const earning = Number(o.rider_earning ?? splitFees(Number(o.delivery_fee), Number(o.safekeeping_fee)).riderEarning);
  const lines: Record<string, unknown>[] = [{ rider_id: o.rider_id, order_id: o.id, type: 'earning', amount: earning, note: `Order #${o.order_number}` }];
  if (o.payment_method === 'cash' && o.payment_status !== 'refunded') {
    lines.push({ rider_id: o.rider_id, order_id: o.id, type: 'cash_kept', amount: -(Number(o.delivery_fee) + Number(o.safekeeping_fee)), note: `Cash kept · order #${o.order_number}` });
  }
  await admin.from('rider_ledger').upsert(lines, { onConflict: 'order_id,type', ignoreDuplicates: true });
}
