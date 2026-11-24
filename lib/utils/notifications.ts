import { createClient } from '@/lib/supabase/client';
import type { OrderStatus } from '@/lib/types/database';

const STATUS_TEMPLATES: Partial<Record<OrderStatus, { title: string; message: (num: string) => string }>> = {
  assigned:   { title: '🏍️ Rider Assigned',  message: (n) => `A rider has been assigned to order #${n} and is heading to the station.` },
  collected:  { title: 'Cylinder picked up',  message: (n) => `Your rider has your empty cylinder and is taking it to the station (order #${n}).` },
  at_station: { title: 'Refilling now',       message: (n) => `Your cylinder is being refilled at the station (order #${n}).` },
  on_the_way: { title: '🚀 On the Way',       message: (n) => `Your rider is heading to you now. Order #${n} is almost there!` },
  arriving:   { title: '📍 Arriving Soon',    message: (n) => `Your rider is nearby! Get ready to receive order #${n}.` },
  delivered:  { title: '✅ Delivered!',        message: (n) => `Order #${n} delivered. Enjoy your gas! Don't forget to rate your experience.` },
  cancelled:  { title: '❌ Order Cancelled',   message: (n) => `Order #${n} was cancelled. Contact support if this was unexpected.` },
};

export async function notifyOrderStatusChange(
  userId: string,
  orderId: string,
  orderNumber: string,
  status: OrderStatus,
) {
  const tmpl = STATUS_TEMPLATES[status];
  if (!tmpl || !userId) return;
  const supabase = createClient();
  await supabase.from('notifications').insert({
    user_id: userId,
    type: status,
    title: tmpl.title,
    message: tmpl.message(orderNumber),
    data: { orderId },
  });
}

