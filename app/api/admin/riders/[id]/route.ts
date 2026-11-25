import { NextRequest, NextResponse } from 'next/server';
import { adminGate, isUuid } from '@/lib/server/admin';
import { fail } from '@/lib/server/guard';
import { walletSummary } from '@/lib/server/wallet';

export const dynamic = 'force-dynamic';

/** GET /api/admin/riders/:id — application details, wallet, withdrawals and recent jobs. */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const g = await adminGate(req);
  if (g.error) return g.error;
  if (!isUuid(params.id)) return fail(404, 'Rider not found.');
  const { admin } = g;
  const [{ data: rider }, { data: profile }, auth, wallet, withdrawals, jobs] = await Promise.all([
    admin.from('riders').select('*').eq('id', params.id).maybeSingle(),
    admin.from('profiles').select('name, phone, is_online, is_active, created_at').eq('id', params.id).maybeSingle(),
    admin.auth.admin.getUserById(params.id),
    walletSummary(admin, params.id),
    admin.from('withdrawals').select('id, amount, status, momo_number, momo_network, reference, failure_reason, created_at, processed_at').eq('rider_id', params.id).order('created_at', { ascending: false }).limit(20),
    admin.from('orders').select('id, order_number, status, total, rider_earning, payment_method, created_at, delivered_at').eq('rider_id', params.id).order('created_at', { ascending: false }).limit(25),
  ]);
  if (!rider || !profile) return fail(404, 'Rider not found.');
  return NextResponse.json({
    rider, profile, email: auth.data.user?.email ?? null, lastSignIn: auth.data.user?.last_sign_in_at ?? null,
    wallet, withdrawals: withdrawals.data ?? [], jobs: jobs.data ?? [],
  });
}
