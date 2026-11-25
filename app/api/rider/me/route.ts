import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/server/guard';
import { walletSummary } from '@/lib/server/wallet';

/** GET /api/rider/me — profile, application status, wallet, today's jobs count. */
export async function GET() {
  const r = await requireRole('rider');
  if (r.error) return r.error;
  const { admin, user, profile } = r;
  const [{ data: rider }, wallet, { count: doneToday }, { data: withdrawals }] = await Promise.all([
    admin.from('riders').select('*').eq('id', user.id).maybeSingle(),
    walletSummary(admin, user.id),
    admin.from('orders').select('id', { count: 'exact', head: true }).eq('rider_id', user.id).eq('status', 'delivered')
      .gte('delivered_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    admin.from('withdrawals').select('*').eq('rider_id', user.id).order('created_at', { ascending: false }).limit(20),
  ]);
  const { data: p } = await admin.from('profiles').select('is_online').eq('id', user.id).maybeSingle();
  return NextResponse.json({ profile: { ...profile, is_online: !!p?.is_online, email: user.email }, rider, wallet, doneToday: doneToday ?? 0, withdrawals: withdrawals ?? [] });
}
