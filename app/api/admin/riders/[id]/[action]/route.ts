import { NextRequest, NextResponse } from 'next/server';
import { adminGate, audit, isUuid } from '@/lib/server/admin';
import { fail, clean, isGhanaPhone, normalisePhone } from '@/lib/server/guard';
import { ACTIVE } from '@/lib/orders/rules';

/**
 * Admin rider actions:
 *   approve | reject { reason } | suspend { reason } | reactivate
 *   payout  { momoNumber, momoNetwork }   (only admins can change where money goes)
 *   adjust  { amount, note }              e.g. +200 "Cash handed in at office", −10 "Damaged seal"
 *   vehicle { vehicleType, vehicleReg, licenceNo }
 */
export async function POST(req: NextRequest, { params }: { params: { id: string; action: string } }) {
  const g = await adminGate(req, { write: true });
  if (g.error) return g.error;
  if (!isUuid(params.id)) return fail(404, 'Rider not found.');
  const { admin, user } = g;
  const body = await req.json().catch(() => ({}));
  const { data: rider } = await admin.from('riders').select('*').eq('id', params.id).maybeSingle();
  if (!rider) return fail(404, 'Rider not found.');
  const { data: prof } = await admin.from('profiles').select('name').eq('id', rider.id).maybeSingle();
  const log = (details?: Record<string, unknown>) => audit(admin, user.id, `rider.${params.action}`, prof?.name ?? rider.id, details);
  const notify = (title: string, message: string) => admin.from('notifications').insert({ user_id: rider.id, type: 'account', title, message, data: {} });

  switch (params.action) {
    case 'approve': {
      if (rider.status === 'approved') return NextResponse.json({ ok: true });
      await admin.from('riders').update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: user.id, rejection_reason: null }).eq('id', rider.id);
      await admin.from('profiles').update({ is_active: true }).eq('id', rider.id);
      await notify('You’re approved', 'Welcome to GasRefill! Go online to start getting pickups.');
      await log();
      return NextResponse.json({ ok: true });
    }
    case 'reject':
    case 'suspend': {
      const reason = clean(body.reason, 200);
      if (!reason) return fail(400, 'Add a short reason (the rider sees it).');
      if (params.action === 'reject' && rider.status !== 'pending') return fail(409, 'Only applications waiting for approval can be rejected.');
      const { count } = await admin.from('orders').select('id', { count: 'exact', head: true }).eq('rider_id', rider.id).in('status', ACTIVE);
      await admin.from('riders').update({ status: params.action === 'reject' ? 'rejected' : 'suspended', rejection_reason: reason }).eq('id', rider.id);
      await admin.from('profiles').update({ is_online: false }).eq('id', rider.id);
      await log({ reason, activeJobs: count ?? 0 });
      return NextResponse.json({ ok: true, activeJobs: count ?? 0 });
    }
    case 'reactivate': {
      if (rider.status !== 'suspended' && rider.status !== 'rejected') return fail(409, 'This rider is not paused.');
      await admin.from('riders').update({ status: 'approved', rejection_reason: null, approved_at: rider.approved_at ?? new Date().toISOString(), approved_by: user.id }).eq('id', rider.id);
      await log();
      return NextResponse.json({ ok: true });
    }
    case 'payout': {
      const number = clean(body.momoNumber, 20);
      if (!isGhanaPhone(number)) return fail(400, 'Enter a valid Ghana MoMo number.');
      if (!['MTN', 'TELECEL', 'AIRTELTIGO'].includes(body.momoNetwork)) return fail(400, 'Choose the network.');
      const { count } = await admin.from('withdrawals').select('id', { count: 'exact', head: true }).eq('rider_id', rider.id).in('status', ['requested', 'processing']);
      if (count) return fail(409, 'Finish or reject the open withdrawal first.');
      await admin.from('riders').update({ momo_number: normalisePhone(number), momo_network: body.momoNetwork }).eq('id', rider.id);
      await notify('Payout number changed', `Your payouts now go to ${body.momoNetwork} ${normalisePhone(number).slice(0, 3)}•••${normalisePhone(number).slice(-3)}. If you didn’t ask for this, call GasRefill now.`);
      await log({ from: `${rider.momo_network} ${rider.momo_number}`, to: `${body.momoNetwork} ${normalisePhone(number)}` });
      return NextResponse.json({ ok: true });
    }
    case 'adjust': {
      const amount = Math.round(Number(body.amount) * 100) / 100;
      const note = clean(body.note, 120);
      if (!Number.isFinite(amount) || amount === 0 || Math.abs(amount) > 10000) return fail(400, 'Enter an amount (use minus for a deduction).');
      if (!note) return fail(400, 'Add a note so the rider knows what this is.');
      await admin.from('rider_ledger').insert({ rider_id: rider.id, type: 'adjustment', amount, note });
      await log({ amount, note });
      return NextResponse.json({ ok: true });
    }
    case 'vehicle': {
      if (!['motorbike', 'tricycle'].includes(body.vehicleType)) return fail(400, 'Choose the vehicle type.');
      const reg = clean(body.vehicleReg, 20).toUpperCase();
      if (reg.length < 4) return fail(400, 'Enter the registration number.');
      await admin.from('riders').update({ vehicle_type: body.vehicleType, vehicle_reg: reg, licence_no: clean(body.licenceNo, 30) || rider.licence_no }).eq('id', rider.id);
      await log({ vehicleType: body.vehicleType, reg });
      return NextResponse.json({ ok: true });
    }
  }
  return fail(404, 'Unknown action.');
}
