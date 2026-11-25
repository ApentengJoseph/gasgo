import { NextRequest, NextResponse } from 'next/server';
import { adminGate } from '@/lib/server/admin';

export const dynamic = 'force-dynamic';

/** GET /api/admin/withdrawals?view=open|done — rider payout requests. */
export async function GET(req: NextRequest) {
  const g = await adminGate(req);
  if (g.error) return g.error;
  const open = req.nextUrl.searchParams.get('view') !== 'done';
  const { data, error } = await g.admin.from('withdrawals')
    .select('id, rider_id, amount, status, momo_number, momo_network, reference, failure_reason, created_at, processed_at, profiles!withdrawals_rider_id_fkey(name, phone)')
    .in('status', open ? ['requested', 'processing'] : ['paid', 'failed', 'rejected'])
    .order('created_at', { ascending: !open }).limit(200);
  if (error) return NextResponse.json({ error: 'Could not load withdrawals.' }, { status: 500 });
  return NextResponse.json({
    withdrawals: (data ?? []).map((w: any) => ({ ...w, name: w.profiles?.name, phone: w.profiles?.phone, profiles: undefined })),
  });
}
