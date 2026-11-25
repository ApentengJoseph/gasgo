import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { confirmPayment } from '@/lib/payments/confirm';
import { sessionUser, rateLimited, clientIp } from '@/lib/server/guard';

/**
 * GET /api/payments/charge/status?reference=…   (or ?orderId=… for the signed-in owner)
 * Asks Paystack whether a MoMo charge went through; confirmation itself is done
 * by confirmPayment() (amount-checked, only moves orders still waiting to be paid).
 */
export async function GET(request: NextRequest) {
  if (rateLimited(`status:${clientIp(request)}`, 60, 60 * 1000)) return NextResponse.json({ status: 'unknown' }, { status: 429 });
  let reference = request.nextUrl.searchParams.get('reference');
  const orderId = request.nextUrl.searchParams.get('orderId');

  if (!reference && orderId) {
    const user = await sessionUser();
    const admin = createServiceRoleClient();
    const { data: ord } = await admin.from('orders').select('user_id, status').eq('id', orderId).maybeSingle();
    if (!user || !ord || ord.user_id !== user.id) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (ord.status !== 'pending') return NextResponse.json({ status: 'success', orderStatus: ord.status });
    const { data: pmt } = await admin.from('payments').select('reference').eq('order_id', orderId).maybeSingle();
    if (!pmt?.reference) return NextResponse.json({ status: 'none' });
    reference = pmt.reference;
  }
  if (!reference) return NextResponse.json({ error: 'reference or orderId required' }, { status: 400 });

  const r = await confirmPayment(reference);
  return NextResponse.json({ status: r.status === 'mismatch' ? 'failed' : r.status, reference });
}
