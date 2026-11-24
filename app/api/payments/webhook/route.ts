import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.arrayBuffer();
    const rawBodyStr = Buffer.from(rawBody).toString('utf8');
    const signature = request.headers.get('x-paystack-signature') || '';

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error('[webhook] PAYSTACK_SECRET_KEY not set');
      return NextResponse.json({ received: true }); // Always 200 to Paystack
    }

    // Verify HMAC-SHA512 signature
    const expectedSig = crypto
      .createHmac('sha512', secretKey)
      .update(rawBodyStr)
      .digest('hex');

    if (expectedSig !== signature) {
      console.warn('[webhook] Invalid signature — ignoring event');
      return NextResponse.json({ received: true }); // Still 200 — don't reveal signature mismatch
    }

    const event = JSON.parse(rawBodyStr);

    if (event.event === 'charge.success') {
      const reference = event.data?.reference;
      if (reference) {
        // Delegate to verify endpoint logic inline
        const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference }),
        });
        if (!verifyRes.ok) {
          console.error('[webhook] Verification failed for', reference);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[webhook] Error:', err);
    // Always return 200 to prevent Paystack retry storms
    return NextResponse.json({ received: true });
  }
}
