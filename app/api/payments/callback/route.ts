import { NextRequest, NextResponse } from 'next/server';
import { confirmPayment } from '@/lib/payments/confirm';

/**
 * GET /api/payments/callback?reference=…  — Paystack redirects here after a
 * hosted payment. We verify the payment server-side (amount-checked) and send
 * the customer to their order. The redirect target is always our own site.
 */
export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('reference') || '';
  const r = reference ? await confirmPayment(reference) : { status: 'unknown' as const };
  const to = new URL(r.orderId ? `/orders/tracking?orderId=${r.orderId}` : '/orders', request.url);
  return NextResponse.redirect(to);
}
