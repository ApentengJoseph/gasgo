/**
 * Price quote for a basket of cylinders from one station (shared by browser and server).
 *
 * Rules (change here to change them everywhere):
 *  - Gas: the station's price for each size × quantity.
 *  - Delivery: one trip per order — base fee + distance (station ⇄ customer, round trip).
 *    Bulk: each extra cylinder adds BULK_STEP (15%) to the trip, capped at BULK_MAX (+75%),
 *    so even a full load costs less than double a single-cylinder trip.
 *  - Safekeeping: per cylinder (each cylinder is handled and secured in transit).
 *  - One order carries at most MAX_CYLINDERS_PER_ORDER cylinders (a motorbike/tricycle load);
 *    bigger needs go through the bulk/business request.
 */
import { PRICING_CONFIG } from './constants';

export const MAX_CYLINDERS_PER_ORDER = 6;
export const BULK_STEP = 0.15;
export const BULK_MAX = 0.75;

/** Multiplier on the pickup & return fee for n cylinders (1 → 1.00, 2 → 1.15 … 6 → 1.75). */
export function bulkFactor(cylinders: number): number {
  return 1 + Math.min(BULK_STEP * Math.max(0, cylinders - 1), BULK_MAX);
}

export interface BasketItem { kg: number; qty: number }

export interface Quote {
  lines: { kg: number; qty: number; unit: number; amount: number }[];
  cylinders: number;
  gas: number;
  delivery: number;
  safekeeping: number;
  total: number;
  roundTripKm: number;
  /** multiplier applied to the trip for extra cylinders (1 for a single cylinder) */
  bulk: number;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function quote(
  items: BasketItem[],
  unitPrice: (kg: number) => number,
  roundTripKm: number,
): Quote {
  const lines = items
    .filter(i => i.qty > 0 && i.kg > 0)
    .map(i => { const unit = r2(unitPrice(i.kg)); return { kg: i.kg, qty: i.qty, unit, amount: r2(unit * i.qty) }; });
  const cylinders = lines.reduce((n, l) => n + l.qty, 0);
  const gas = r2(lines.reduce((s, l) => s + l.amount, 0));
  const bulk = bulkFactor(cylinders);
  const delivery = cylinders ? r2((PRICING_CONFIG.BASE_DELIVERY_FEE + roundTripKm * PRICING_CONFIG.DISTANCE_RATE) * bulk) : 0;
  const safekeeping = r2(PRICING_CONFIG.SAFEKEEPING_FEE * cylinders);
  return { lines, cylinders, gas, delivery, safekeeping, total: r2(gas + delivery + safekeeping), roundTripKm, bulk };
}

/** "2 × 12 kg + 1 × 6 kg" */
export function describeItems(items: BasketItem[]): string {
  return items.filter(i => i.qty > 0)
    .sort((a, b) => b.kg - a.kg)
    .map(i => `${i.qty} × ${i.kg} kg`).join(' + ');
}

/** Short label for lists: "12 kg cylinder" or "3 cylinders" */
export function shortLabel(items: BasketItem[]): string {
  const live = items.filter(i => i.qty > 0);
  const count = live.reduce((n, i) => n + i.qty, 0);
  if (count === 1) return `${live[0].kg} kg cylinder`;
  return `${count} cylinders`;
}

/** Plain wording for sentences: "your 12 kg cylinder" / "your 2 cylinders". */
export function friendlyItems(items: BasketItem[]): { phrase: string; plural: boolean } {
  const live = items.filter(i => i.qty > 0);
  const count = live.reduce((n, i) => n + i.qty, 0);
  if (count === 1) return { phrase: `your ${live[0].kg} kg cylinder`, plural: false };
  return { phrase: `your ${count} cylinders`, plural: true };
}
