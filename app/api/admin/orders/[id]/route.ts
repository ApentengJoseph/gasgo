import { NextRequest, NextResponse } from 'next/server';
import { adminGate, isUuid } from '@/lib/server/admin';
import { fail } from '@/lib/server/guard';

export const dynamic = 'force-dynamic';

/** GET /api/admin/orders/:id — the order with its payment, wallet lines, photo and available riders. */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const g = await adminGate(req);
  if (g.error) return g.error;
  if (!isUuid(params.id)) return fail(404, 'Order not found.');
  const { admin } = g;
  const { data: order } = await admin.from('orders').select('*').eq('id', params.id).maybeSingle();
  if (!order) return fail(404, 'Order not found.');

  const [payments, ledger, station, riders, events] = await Promise.all([
    admin.from('payments').select('reference, amount, status, channel, paid_at, created_at').eq('order_id', order.id),
    admin.from('rider_ledger').select('type, amount, created_at').eq('order_id', order.id),
    admin.from('stations').select('name, address, phone').eq('id', order.station_id).maybeSingle(),
    admin.from('riders').select('id, vehicle_type, profiles!riders_id_fkey(name, phone, is_online)').eq('status', 'approved'),
    admin.from('payment_events').select('reference, outcome, created_at').eq('order_id', order.id),
  ]);
  const photo = order.refill_photo_path
    ? (await admin.storage.from('refill-photos').createSignedUrl(order.refill_photo_path, 600)).data?.signedUrl ?? null
    : null;

  return NextResponse.json({
    order, photo,
    payments: payments.data ?? [], ledger: ledger.data ?? [], station: station.data, latePayments: events.data ?? [],
    riders: (riders.data ?? []).map((r: any) => ({ id: r.id, vehicle: r.vehicle_type, name: r.profiles?.name, phone: r.profiles?.phone, online: !!r.profiles?.is_online })),
  });
}
