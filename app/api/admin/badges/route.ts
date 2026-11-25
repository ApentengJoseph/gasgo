import { NextRequest, NextResponse } from 'next/server';
import { adminGate } from '@/lib/server/admin';

export const dynamic = 'force-dynamic';

/** GET /api/admin/badges — small counts for the menu (things waiting for an admin). */
export async function GET(req: NextRequest) {
  const g = await adminGate(req);
  if (g.error) return g.error;
  const { admin } = g;
  const [riders, payouts, questions, waiting, refunds] = await Promise.all([
    admin.from('riders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('withdrawals').select('id', { count: 'exact', head: true }).eq('status', 'requested'),
    admin.from('support_questions').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    admin.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'confirmed').is('rider_id', null),
    admin.from('orders').select('id', { count: 'exact', head: true }).eq('refund_status', 'pending'),
  ]);
  return NextResponse.json({
    riders: riders.count ?? 0, payouts: payouts.count ?? 0, questions: questions.count ?? 0,
    orders: (waiting.count ?? 0) + (refunds.count ?? 0),
  });
}
