import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

const PAYSTACK_BASE = 'https://api.paystack.co';
const PAYSTACK_FALLBACK_EMAIL = 'adookwesi@gmail.com';

// Paystack Ghana mobile money provider codes
const PROVIDER_MAP: Record<string, string> = {
  MTN:        'mtn',
  TELECEL:    'vod', // Telecel (formerly Vodafone) uses Paystack's 'vod' provider code
  AIRTELTIGO: 'tgo',
  mtn:        'mtn',
  vod:        'vod',
  tgo:        'tgo',
};

function normalisePhone(phone: string): string {
  // Paystack expects local Ghanaian format: 0XXXXXXXXX (10 digits)
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('233') && digits.length === 12) return `0${digits.slice(3)}`;
  if (digits.startsWith('0') && digits.length === 10) return digits;
  if (digits.length === 9) return `0${digits}`;
  return digits;
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, email: rawEmail, phone, network } = await request.json();
    // Use provided email or fall back to the configured Paystack email
    const email = rawEmail?.trim() || PAYSTACK_FALLBACK_EMAIL;

    if (!orderId || !phone || !network) {
      return NextResponse.json(
        { error: 'orderId, phone and network are all required' },
        { status: 400 },
      );
    }

    // The amount always comes from the order in the database, never from the browser.
    const session = await createServerSupabaseClient();
    const { data: { user } } = await session.auth.getUser();
    const { data: orderRow } = await createServiceRoleClient()
      .from('orders').select('total, user_id, status').eq('id', orderId).maybeSingle();
    if (!user || !orderRow || orderRow.user_id !== user.id) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }
    if (orderRow.status !== 'pending') {
      return NextResponse.json({ error: 'This order is already paid or confirmed.' }, { status: 400 });
    }
    const amount = Number(orderRow.total);

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Payment service not configured' }, { status: 503 });
    }

    const provider = PROVIDER_MAP[network];
    if (!provider) {
      return NextResponse.json(
        { error: `Unsupported network "${network}". Use MTN, VODAFONE, or AIRTELTIGO.` },
        { status: 400 },
      );
    }

    const reference = `GAS_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const amountPesewas = Math.round(Number(amount) * 100);
    const normalisedPhone = normalisePhone(phone);

    const paystackRes = await fetch(`${PAYSTACK_BASE}/charge`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountPesewas,
        email,
        currency: 'GHS',
        reference,
        mobile_money: {
          phone: normalisedPhone,
          provider,
        },
        metadata: {
          orderId,
          custom_fields: [
            { display_name: 'Order ID', variable_name: 'order_id', value: orderId },
          ],
        },
      }),
    });

    const data = await paystackRes.json();

    if (!paystackRes.ok || !data.status) {
      return NextResponse.json(
        { error: data.message || 'Charge initiation failed' },
        { status: 400 },
      );
    }

    const chargeStatus: string = data.data?.status;

    // Record pending payment in Supabase
    try {
      const { createServiceRoleClient } = await import('@/lib/supabase/server');
      const supabase = createServiceRoleClient();
      await supabase.from('payments').upsert(
        {
          order_id: orderId,
          reference,
          amount: Number(amount),
          status: 'pending',
          payment_method: 'paystack',
          channel: `mobile_money_${provider}`,
        },
        { onConflict: 'order_id' },
      );
    } catch {
      // Non-blocking — payment still proceeds
    }

    return NextResponse.json({
      success: true,
      reference,
      status: chargeStatus,
      // "pay_offline" = USSD push sent to phone
      // "send_otp"   = OTP sent (rare for MoMo)
      // "success"    = instant approval
      displayText:
        data.data?.display_text ||
        (chargeStatus === 'pay_offline'
          ? 'A payment prompt has been sent to your phone. Please follow the instructions and enter your PIN to complete.'
          : chargeStatus === 'success'
          ? 'Payment successful!'
          : 'Payment request sent. Please check your phone.'),
    });
  } catch (err: any) {
    console.error('[payments/charge]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
