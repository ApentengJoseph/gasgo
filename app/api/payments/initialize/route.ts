import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { sessionUser, sameOrigin, rateLimited, clientIp } from '@/lib/server/guard';

const PAYSTACK_BASE = 'https://api.paystack.co';

// Valid Paystack channel values: 'card', 'mobile_money', 'bank', 'ussd', 'bank_transfer'
// Network selection (MTN/Voda/AirtelTigo) happens inside Paystack's popup
const CHANNEL_MAP: Record<string, string> = {
  mtn: 'mobile_money',
  vod: 'mobile_money',
  tgo: 'mobile_money',
  card: 'card',
};

export async function POST(request: NextRequest) {
  try {
    if (!sameOrigin(request)) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
    if (rateLimited(`init:${clientIp(request)}`, 20, 60 * 60 * 1000)) return NextResponse.json({ error: 'Too many attempts. Please wait a while.' }, { status: 429 });
    const { orderId, email, channel = 'mtn' } = await request.json().catch(() => ({}));
    if (!orderId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Amount and ownership always come from the database, never from the browser
    const user = await sessionUser();
    const { data: order } = await createServiceRoleClient().from('orders').select('total, user_id, status').eq('id', orderId).maybeSingle();
    if (!user || !order || order.user_id !== user.id) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.status !== 'pending') return NextResponse.json({ error: 'This order is already paid or confirmed.' }, { status: 400 });
    const amount = Number(order.total);

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Payment service not configured' }, { status: 503 });
    }

    const reference = `GAS_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const amountPesewas = Math.round(Number(amount) * 100);
    const paystackChannel = CHANNEL_MAP[channel] || 'mtn_mobile_money';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountPesewas,
        reference,
        currency: 'GHS',
        callback_url: `${appUrl}/api/payments/callback?reference=${reference}`,
        channels: [paystackChannel],
        metadata: {
          orderId,
          custom_fields: [{ display_name: 'Order ID', variable_name: 'order_id', value: orderId }],
        },
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.status) {
      return NextResponse.json({ error: data.message || 'Paystack error' }, { status: 400 });
    }

    // Record pending payment in Supabase
    const supabase = createServiceRoleClient();
    await supabase.from('payments').upsert(
      { order_id: orderId, reference, amount: Number(amount), status: 'pending', payment_method: 'paystack', channel: paystackChannel },
      { onConflict: 'order_id' },
    );

    return NextResponse.json({
      success: true,
      reference,
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
    });
  } catch (err: any) {
    console.error('[payments/initialize]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
