/** Cylinder sizes stations list prices for in the control centre. */
export const PRICE_SIZES = [3, 6, 12, 25];

/** Validates { 3: 45, 6: 80, … } → rows for station_prices. */
export function priceRows(stationId: string, prices: unknown) {
  if (!prices || typeof prices !== 'object') return { rows: [] as { station_id: string; size_kg: number; price: number }[] };
  const rows: { station_id: string; size_kg: number; price: number }[] = [];
  for (const [k, v] of Object.entries(prices as Record<string, unknown>)) {
    const kg = Number(k), price = Math.round(Number(v) * 100) / 100;
    if (!PRICE_SIZES.includes(kg)) continue;
    if (v === '' || v == null) continue;
    if (!Number.isFinite(price) || price < 1 || price > 5000) return { error: `Check the ${kg} kg price.` };
    rows.push({ station_id: stationId, size_kg: kg, price });
  }
  return { rows };
}
