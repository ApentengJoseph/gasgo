/**
 * Order business rules: one place for the status flow, who can cancel, and
 * how money splits. Used by API routes (enforcement) and screens (labels).
 *
 * Flow:  pending → confirmed → assigned → collected → at_station → on_the_way → (arriving) → delivered
 *        pending:   waiting for MoMo payment (cash orders skip straight to confirmed)
 *        assigned:  rider accepted, heading to the customer
 *        collected: rider picked up the empty cylinder (cash orders: cash is paid HERE)
 *        at_station: refilling;  on_the_way/arriving: bringing it back
 */

export type Status = 'pending' | 'confirmed' | 'assigned' | 'collected' | 'at_station' | 'on_the_way' | 'arriving' | 'delivered' | 'cancelled';

/** Steps a rider may move an order to, from each status. */
export const RIDER_NEXT: Partial<Record<Status, Status[]>> = {
  assigned:   ['collected'],
  collected:  ['at_station'],
  at_station: ['on_the_way'],
  on_the_way: ['arriving', 'delivered'],
  arriving:   ['delivered'],
};

export const RIDER_ACTION_LABEL: Partial<Record<Status, string>> = {
  assigned:   'Picked up empty cylinder',
  collected:  'Arrived at station',
  at_station: 'Refilled · heading back',
  on_the_way: 'Delivered',
  arriving:   'Delivered',
};

export const ACTIVE: Status[] = ['assigned', 'collected', 'at_station', 'on_the_way', 'arriving'];

/** Riders earn this share of the pickup & return fee. GasRefill keeps the rest plus safekeeping. */
export const RIDER_SHARE = 0.75;
export const MIN_WITHDRAWAL = 20;
export const MAX_ACTIVE_JOBS = 4; // a rider can batch nearby pickups, but not unlimited

const r2 = (n: number) => Math.round(n * 100) / 100;

export function splitFees(deliveryFee: number, safekeeping: number) {
  const riderEarning = r2(deliveryFee * RIDER_SHARE);
  return { riderEarning, platformFee: r2(deliveryFee + safekeeping - riderEarning) };
}

/**
 * Can the customer cancel? Before a rider accepts: yes (paid MoMo orders are refunded).
 * After a rider accepts: no in-app cancel — they call/WhatsApp the rider or support.
 */
export function customerCanCancel(o: { status: string; rider_id: string | null }) {
  return o.status === 'pending' || (o.status === 'confirmed' && !o.rider_id);
}

/** Can the customer change the order (cylinders/address)? Only while nothing is paid or accepted. */
export function customerCanEdit(o: { status: string; rider_id: string | null; payment_status: string | null }) {
  return customerCanCancel(o) && o.payment_status !== 'paid';
}
