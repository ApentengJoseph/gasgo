import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

/**
 * POST /api/orders/:id/confirm-cash
 * Customer chose "Pay cash on delivery": the order is confirmed straight away
 * so riders can pick it up; payment stays pending until the rider collects it.
 */
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Your session expired. Please refresh.' }, { status: 401 });

  const admin = createServiceRoleClient();
  const { data: order } = await admin
    .from('orders').select('id, user_id, status, order_number').eq('id', params.id).maybeSingle();
  if (!order || order.user_id !== user.id) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  if (order.status !== 'pending') return NextResponse.json({ success: true, status: order.status });

  const { error } = await admin.from('orders').update({
    payment_method: 'cash',
    payment_status: 'pending',
    status: 'confirmed',
    confirmed_at: new Date().toISOString(),
  }).eq('id', order.id).eq('status', 'pending');
  if (error) return NextResponse.json({ error: 'Could not confirm the order.' }, { status: 500 });

  await admin.from('notifications').insert({
    user_id: user.id,
    type: 'confirmed',
    title: 'Order confirmed',
    message: `Order #${order.order_number} is confirmed. Pay the rider in cash on delivery.`,
    data: { orderId: order.id },
  });

  return NextResponse.json({ success: true, status: 'confirmed' });
}
