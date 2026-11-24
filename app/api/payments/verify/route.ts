import { NextRequest, NextResponse } from 'next/server';

const PAYSTACK_BASE = 'https://api.paystack.co';

export async function POST(request: NextRequest) {
  try {
    const { reference, orderId } = await request.json();
    if (!reference) return NextResponse.json({ error: 'Reference required' }, { status: 400 });

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) return NextResponse.json({ error: 'Payment not configured' }, { status: 503 });

    const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const data = await res.json();

    if (!res.ok || !data.status) {
      return NextResponse.json({ success: false, error: data.message }, { status: 400 });
    }

    const txn = data.data;
    const isSuccess = txn.status === 'success';

    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = createServiceRoleClient();

    if (isSuccess) {
      // Update payment record
      await supabase.from('payments').update({
        status: 'completed',
        paid_at: txn.paid_at || new Date().toISOString(),
        channel: txn.channel,
      }).eq('reference', reference);

      // Find orderId from payment if not provided
      let targetOrderId = orderId;
      if (!targetOrderId) {
        const { data: pmt } = await supabase.from('payments').select('order_id').eq('reference', reference).single();
        targetOrderId = pmt?.order_id;
      }

      if (targetOrderId) {
        await supabase.from('orders').update({
          payment_status: 'paid',
          payment_reference: reference,
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
        }).eq('id', targetOrderId);

        // Create notification for customer
        const { data: orderData } = await supabase.from('orders').select('user_id, order_number').eq('id', targetOrderId).single();
        if (orderData?.user_id) {
          await supabase.from('notifications').insert({
            user_id: orderData.user_id,
            type: 'payment_success',
            title: 'Payment Confirmed',
            message: `Payment for order #${orderData.order_number} confirmed. Your rider is being assigned.`,
          });
        }
      }
    } else {
      await supabase.from('payments').update({ status: 'failed' }).eq('reference', reference);
    }

    return NextResponse.json({
      success: isSuccess,
      status: txn.status,
      amount: txn.amount / 100,
      reference,
    });
  } catch (err: any) {
    console.error('[payments/verify]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
