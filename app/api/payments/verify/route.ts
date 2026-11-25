import { NextRequest, NextResponse } from 'next/server';
import { confirmPayment } from '@/lib/payments/confirm';
import { rateLimited, clientIp } from '@/lib/server/guard';

/** POST /api/payments/verify { reference } — re-checks a payment with Paystack (amount-checked). */
export async function POST(request: NextRequest) {
  if (rateLimited(`verify:${clientIp(request)}`, 30, 60 * 1000)) return NextResponse.json({ error: 'Slow down' }, { status: 429 });
  const { reference } = await request.json().catch(() => ({}));
  if (!reference) return NextResponse.json({ error: 'Reference required' }, { status: 400 });
  const r = await confirmPayment(String(reference));
  return NextResponse.json({ success: r.status === 'success', status: r.status, orderId: r.orderId });
}
