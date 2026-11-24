import { createClient } from '@supabase/supabase-js';
import { FALLBACK_STATIONS, normalizeStation, type Station, type StationRow } from './stations';

/** Server-side station list (public data, no user session needed). */
export async function getStations(): Promise<{ stations: Station[]; live: boolean }> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    );
    const { data, error } = await supabase
      .from('stations')
      .select('id, name, address, lat, lng, rating, rating_count, station_prices(size_kg, price)')
      .eq('is_active', true);
    if (error || !data?.length) throw error ?? new Error('no stations');
    return { stations: (data as StationRow[]).map(normalizeStation), live: true };
  } catch {
    return { stations: FALLBACK_STATIONS, live: false };
  }
}
