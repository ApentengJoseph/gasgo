/**
 * Partner stations. The database is the source of truth (real ids + prices);
 * FALLBACK_STATIONS is only used for display if the database can't be reached
 * (its ids are not valid for placing orders).
 */

export interface Station {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  /** price per kg in GH₵, derived from the 12 kg price */
  pricePerKg: number;
  /** price by cylinder size in kg */
  prices: Record<number, number>;
  rating: number;
  ratingCount: number;
}

// Shape returned by Supabase: stations + nested station_prices
export interface StationRow {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  rating?: number | null;
  rating_count?: number | null;
  station_prices?: { size_kg: number; price: number }[] | null;
}

export function normalizeStation(row: StationRow): Station {
  const prices: Record<number, number> = {};
  for (const p of row.station_prices ?? []) prices[p.size_kg] = Number(p.price);
  const ref = prices[12] ? prices[12] / 12
    : Object.entries(prices).map(([kg, price]) => price / Number(kg))[0] ?? 0;
  return {
    id: row.id,
    name: row.name,
    address: row.address ?? 'Koforidua',
    lat: row.lat,
    lng: row.lng,
    pricePerKg: Math.round(ref * 100) / 100,
    prices,
    rating: Number(row.rating ?? 0),
    ratingCount: Number(row.rating_count ?? 0),
  };
}

/** Price for any cylinder size: the station's listed price, or per-kg × size for custom sizes. */
export function priceFor(station: Pick<Station, 'prices' | 'pricePerKg'>, kg: number): number {
  return station.prices[kg] ?? Math.round(station.pricePerKg * kg * 100) / 100;
}

export const standardSizes = [
  { kg: 3,  label: '3 kg',  desc: 'Table-top',   size: 'sm' as const },
  { kg: 6,  label: '6 kg',  desc: 'Table-top',   size: 'sm' as const },
  { kg: 12, label: '12 kg', desc: 'Family size', size: 'md' as const },
  { kg: 25, label: '25 kg', desc: 'Large / shop', size: 'lg' as const },
];

const fallbackRows: [string, string, number, number, number][] = [
  ['Goil Gas Station', 'Near Koforidua–Nsutam Rd', 6.098813, -0.27765, 12.86],
  ['Lartey Gas', 'Suhum Road, near All Nations School', 6.109447, -0.292065, 12.86],
  ['Manbah Gas', 'Pipeline Road', 6.11364, -0.249552, 13.01],
  ['Anasset Gas (Bance)', 'Pipeline Road', 6.117014, -0.251796, 13.33],
  ['Dukes Gas (Total 4)', 'Total 4', 6.104499, -0.250154, 14.28],
  ['Morgas', 'Suhum Road', 6.1076519, -0.2799717, 15.0],
  ['Express Gas (Trinity Oil)', 'Near Effitech, close to Asokore', 6.105526, -0.277021, 15.0],
  ['Yokwa Gas Company', 'Adweso Road, near School of Nursing', 6.0754564, -0.2499899, 15.0],
];

export const FALLBACK_STATIONS: Station[] = fallbackRows.map(([name, address, lat, lng, perKg], i) => ({
  id: `fallback-${i + 1}`,
  name, address, lat, lng,
  pricePerKg: perKg,
  prices: { 3: +(perKg * 3).toFixed(2), 6: +(perKg * 6).toFixed(2), 12: +(perKg * 12).toFixed(2), 25: +(perKg * 25).toFixed(2) },
  rating: 0,
  ratingCount: 0,
}));

/** Neighbourhoods covered by the Koforidua service area (see lib/utils/serviceArea.ts). */
export const serviceAreas = [
  'Koforidua Central', 'Adweso', 'Effiduase', 'Asokore', 'Oyoko',
  'Okorase', 'Osabene', 'Large Town', 'Pipeline Road', 'Suhum Road',
];
