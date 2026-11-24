import { NextRequest, NextResponse } from 'next/server';

const PAYSTACK_BASE = 'https://api.paystack.co';

export async function POST(request: NextRequest) {
  try {
    const { otp, reference } = await request.json();

    if (!otp || !reference) {
      return NextResponse.json({ error: 'otp and reference required' }, { status: 400 });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const res = await fetch(`${PAYSTACK_BASE}/charge/submit_otp`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ otp, reference }),
    });

    const data = await res.json();

    if (!res.ok || !data.status) {
      return NextResponse.json(
        { error: data.message || 'OTP submission failed' },
        { status: 400 },
      );
    }

    const nextStatus: string = data.data?.status;

    return NextResponse.json({
      success: true,
      status: nextStatus,
      // pay_offline = USSD push now sent to phone
      // success     = payment completed immediately
      displayText:
        data.data?.display_text ||
        (nextStatus === 'pay_offline'
          ? 'A payment prompt has been sent to your phone. Please follow the instructions and enter your PIN to complete.'
          : nextStatus === 'success'
          ? 'Payment confirmed!'
          : 'Processing payment…'),
    });
  } catch (err) {
    console.error('[charge/submit-otp]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
