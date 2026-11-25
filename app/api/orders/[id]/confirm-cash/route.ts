import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { sameOrigin } from '@/lib/server/guard';

/**
 * POST /api/orders/:id/confirm-cash
 * Customer chose "Pay cash at pickup": the order is confirmed straight away
 * so riders can pick it up; payment stays pending until the rider collects it.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Your session expired. Please refresh.' }, { status: 401 });

  const admin = createServiceRoleClient();
  const { data: order } = await admin
    .from('orders').select('id, user_id, status, order_number').eq('id', params.id).maybeSingle();
  if (!order || order.user_id !== user.id) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  if (order.status !== 'pending') return NextResponse.json({ success: true, status: order.status });

  // Same cap as new orders: a few cash orders in progress at once (stops fake orders sending riders around)
  const { count: open } = await admin.from('orders').select('id', { count: 'exact', head: true })
    .eq('user_id', user.id).not('status', 'in', '(pending,delivered,cancelled)')
    .gte('created_at', new Date(Date.now() - 864e5).toISOString());
  if ((open ?? 0) >= 3) {
    return NextResponse.json({ error: 'You already have 3 orders in progress. Wait for one to finish or cancel one in My orders.' }, { status: 409 });
  }

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
    message: `Order #${order.order_number} is confirmed. Pay the rider in cash when they pick up your cylinder.`,
    data: { orderId: order.id },
  });

  return NextResponse.json({ success: true, status: 'confirmed' });
}
