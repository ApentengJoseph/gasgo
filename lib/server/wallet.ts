import type { SupabaseClient } from '@supabase/supabase-js';
import { fetchAll } from '@/lib/server/admin';

type Line = { type: string; amount: number; created_at: string; order_id: string | null; note: string | null };

/** Rider wallet numbers from the ledger (balance = sum of ALL lines, newest 50 shown). */
export async function walletSummary(admin: SupabaseClient, riderId: string) {
  const all = await fetchAll<Line>((f, t) => admin.from('rider_ledger')
    .select('type, amount, created_at, order_id, note').eq('rider_id', riderId)
    .order('created_at', { ascending: false }).range(f, t), 200000);
  const r2 = (n: number) => Math.round(n * 100) / 100;
  const balance = r2(all.reduce((s, l) => s + Number(l.amount), 0));
  const startOfDay = new Date(); startOfDay.setUTCHours(0, 0, 0, 0); // Ghana time = UTC
  const weekAgo = new Date(Date.now() - 7 * 864e5);
  const earned = (since: Date) => r2(all.filter(l => l.type === 'earning' && new Date(l.created_at) >= since).reduce((s, l) => s + Number(l.amount), 0));
  return { balance, today: earned(startOfDay), week: earned(weekAgo), lines: all.slice(0, 50) };
}
