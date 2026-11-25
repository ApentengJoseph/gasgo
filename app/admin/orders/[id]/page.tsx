'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Phone, MessageCircle, MapPin, Store, Bike, Banknote, Smartphone, Check, Loader2 } from 'lucide-react';
import { useAdmin, adminSend, money, when, Loading, ErrorNote, OrderPill, PromptSheet, Sheet, orderStatusLabel } from '@/components/Admin/ui';
import { RIDER_NEXT, RIDER_ACTION_LABEL, type Status } from '@/lib/orders/rules';

type Detail = {
  order: Record<string, any>;
  photo: string | null;
  payments: { reference: string; amount: number; status: string; channel: string | null; paid_at: string | null; created_at: string }[];
  ledger: { type: string; amount: number; created_at: string }[];
  station: { name: string; address: string | null; phone: string | null } | null;
  latePayments: { reference: string; outcome: string; created_at: string }[];
  riders: { id: string; name: string; phone: string; vehicle: string; online: boolean }[];
};

const STEPS: [string, string][] = [
  ['created_at', 'Placed'], ['confirmed_at', 'Confirmed'], ['assigned_at', 'Rider accepted'], ['collected_at', 'Picked up empty'],
  ['at_station_at', 'At station'], ['on_the_way_at', 'Bringing back'], ['arriving_at', 'Arriving'], ['delivered_at', 'Delivered'], ['cancelled_at', 'Cancelled'],
];
const wa = (p?: string | null) => (p ? `https://wa.me/233${p.replace(/\D/g, '').replace(/^233/, '').replace(/^0/, '')}` : '');

export default function AdminOrderPage({ params }: { params: { id: string } }) {
  const { data, error, loading, reload } = useAdmin<Detail>(`/api/admin/orders/${params.id}`, 15000);
  const [sheet, setSheet] = useState<'cancel' | 'assign' | 'cash' | null>(null);
  const [busy, setBusy] = useState('');

  const act = async (action: string, body: Record<string, unknown> = {}, ok = 'Done') => {
    setBusy(action);
    try { const r = await adminSend(`/api/admin/orders/${params.id}/${action}`, body); toast.success(r.note || ok); await reload(); }
    catch (e) { toast.error((e as Error).message); }
    setBusy('');
  };

  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorNote text={error} retry={reload} />;
  if (!data) return null;
  const o = data.order;
  const finished = o.status === 'delivered' || o.status === 'cancelled';
  const next = (RIDER_NEXT[o.status as Status] ?? [])[0];
  const cash = o.payment_method === 'cash';
  const items: { kg: number; qty: number; unit: number }[] = Array.isArray(o.items) ? o.items : [];

  return (
    <div className="max-w-4xl">
      <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-ink-muted text-[0.875rem] mb-3"><ArrowLeft className="w-4 h-4" /> Orders</Link>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h1 className="text-[1.625rem] md:text-[2rem] font-extrabold tracking-tight text-ink">#{o.order_number}</h1>
        <OrderPill status={o.status} />
        {o.refund_status && <span className={`pill ${o.refund_status === 'refunded' ? 'pill-success' : 'pill-warning'}`}>Refund {o.refund_status}</span>}
      </div>

      {/* Actions */}
      {!finished && (
        <div className="flex flex-wrap gap-2 mb-5">
          {['confirmed', 'assigned'].includes(o.status) && (
            <button onClick={() => setSheet('assign')} className="h-11 px-5 rounded-full btn-primary text-[0.875rem]">{o.rider_id ? 'Change rider' : 'Assign a rider'}</button>
          )}
          {o.status === 'assigned' && (
            <button onClick={() => act('unassign', {}, 'Back to waiting for a rider')} disabled={!!busy} className="h-11 px-5 rounded-full btn-ghost !bg-white text-[0.875rem]">Remove rider</button>
          )}
          {next && o.rider_id && (
            <button onClick={() => (next === 'collected' && cash ? setSheet('cash') : act('advance', { next }, `Moved to “${orderStatusLabel(next)}”`))} disabled={!!busy}
              className="h-11 px-5 rounded-full btn-ghost !bg-white text-[0.875rem]">
              {busy === 'advance' ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Mark: {RIDER_ACTION_LABEL[o.status as Status]}</>}
            </button>
          )}
          <button onClick={() => setSheet('cancel')} className="h-11 px-5 rounded-full bg-white border border-[#F3C4C4] text-[#B91C1C] font-semibold text-[0.875rem]">Cancel order</button>
        </div>
      )}
      {o.status === 'delivered' && o.payment_method === 'mobile_money' && !o.station_settled_at && (
        <div className="mb-5 rounded-3xl bg-[#FFF4EC] border border-[#FFD9BD] p-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[0.9375rem] text-ink">Pay <b>{data.station?.name}</b> {money(o.subtotal)} for the gas.</p>
          <button onClick={() => act('settle', {}, 'Marked as paid to the station')} disabled={!!busy} className="h-10 px-5 rounded-full btn-primary text-[0.875rem]">I’ve paid the station</button>
        </div>
      )}
      {o.refund_status === 'pending' && (
        <div className="mb-5 rounded-3xl bg-[#FEF3DC] p-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[0.9375rem] text-[#92400E]">The MoMo refund didn’t go through yet.</p>
          <button onClick={() => act('refund', {}, 'Refund sent')} disabled={!!busy} className="h-10 px-5 rounded-full btn-primary text-[0.875rem]">Try refund again</button>
        </div>
      )}

      <div className="grid md:grid-cols-[1.2fr_1fr] gap-4">
        <div className="space-y-4">
          <Card title="Customer">
            <p className="font-semibold text-ink">{o.contact_name || 'Customer'}</p>
            <p className="text-ink-muted text-[0.9375rem]">{o.contact_phone}</p>
            <div className="flex items-start gap-2 mt-3 text-[0.9375rem]"><MapPin className="w-4 h-4 mt-0.5 text-ink-faint shrink-0" /><span>{o.delivery_address}{o.delivery_notes && <span className="block text-ink-muted text-[0.8125rem]">“{o.delivery_notes}”</span>}</span></div>
            {o.contact_phone && <Contact phone={o.contact_phone} />}
          </Card>
          <Card title="Rider">
            {o.rider_id ? (
              <>
                <p className="font-semibold text-ink inline-flex items-center gap-2"><Bike className="w-4 h-4" /> {o.rider_name}</p>
                <p className="text-ink-muted text-[0.9375rem]">{o.rider_phone}</p>
                {o.rider_phone && <Contact phone={o.rider_phone} />}
                <Link href={`/admin/riders/${o.rider_id}`} className="mt-3 inline-block text-[0.875rem] font-semibold text-flame-deep">View rider</Link>
              </>
            ) : <p className="text-ink-muted">No rider yet.</p>}
          </Card>
          <Card title="Station">
            <p className="font-semibold text-ink inline-flex items-center gap-2"><Store className="w-4 h-4" /> {o.station_name}</p>
            {data.station?.address && <p className="text-ink-muted text-[0.875rem]">{data.station.address}</p>}
            {o.station_settled_at && <p className="mt-2 pill pill-success">Station paid {when(o.station_settled_at)}</p>}
          </Card>
          {data.photo && (
            <Card title="Refill photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <a href={data.photo} target="_blank" rel="noopener noreferrer"><img src={data.photo} alt="Refilled cylinder" className="rounded-2xl max-h-72 object-cover" /></a>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card title="Money">
            <dl className="space-y-1.5 text-[0.9375rem]">
              {items.map(i => <Row key={i.kg} k={`${i.qty} × ${i.kg} kg`} v={money(i.unit * i.qty)} />)}
              <Row k="Pickup & return" v={money(o.delivery_fee)} />
              <Row k="Safekeeping" v={money(o.safekeeping_fee)} />
              <div className="border-t border-dashed border-line pt-1.5"><Row k={<b>Total</b>} v={<b>{money(o.total)}</b>} /></div>
              {o.rider_earning != null && <>
                <Row k="Rider earns" v={money(o.rider_earning)} muted />
                <Row k="GasRefill keeps" v={money(o.platform_fee)} muted />
              </>}
            </dl>
            <p className="mt-3 inline-flex items-center gap-1.5 text-[0.875rem] text-ink-muted">
              {cash ? <Banknote className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
              {cash ? (o.cash_collected_at ? `Cash collected ${when(o.cash_collected_at)}` : 'Cash at pickup (not yet collected)') : o.payment_status === 'paid' ? 'Paid with MoMo' : `MoMo ${o.payment_status ?? 'not paid'}`}
            </p>
            {data.payments.map(p => <p key={p.reference} className="text-[0.75rem] text-ink-faint mt-1 break-all">Paystack {p.reference} · {p.status}</p>)}
            {data.latePayments.map(p => <p key={p.reference} className="text-[0.75rem] text-[#B45309] mt-1 break-all">Late payment {p.reference} · {p.outcome}</p>)}
          </Card>
          <Card title="Timeline">
            <ol className="space-y-2">
              {STEPS.filter(([k]) => o[k]).map(([k, label]) => (
                <li key={k} className="flex items-center gap-2.5 text-[0.875rem]">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center ${k === 'cancelled_at' ? 'bg-[#FDECEC] text-[#B91C1C]' : 'bg-[#E8F6EC] text-[#15803D]'}`}><Check className="w-3 h-3" /></span>
                  <span className="flex-1 text-ink">{label}</span><span className="text-ink-muted tabular-nums">{when(o[k])}</span>
                </li>
              ))}
            </ol>
            {o.cancellation_reason && <p className="mt-3 text-[0.8125rem] text-ink-muted">Reason: {o.cancellation_reason} {o.cancelled_by && `(by ${o.cancelled_by})`}</p>}
          </Card>
        </div>
      </div>

      <PromptSheet open={sheet === 'cancel'} onClose={() => setSheet(null)} title={`Cancel #${o.order_number}?`} danger
        label={`Reason (the customer sees this).${o.payment_status === 'paid' && !cash ? ' Their MoMo payment will be refunded.' : ''}${o.cash_collected_at ? ' The rider already has their cash — make sure it’s returned.' : ''}`}
        placeholder="e.g. Station out of gas" cta="Cancel order"
        onSubmit={async reason => { await adminSend(`/api/admin/orders/${params.id}/cancel`, { reason }); toast.success('Order cancelled'); await reload(); }} />

      <Sheet open={sheet === 'assign'} onClose={() => setSheet(null)} title="Choose a rider">
        {data.riders.length === 0 ? <p className="text-ink-muted">No approved riders yet.</p> : (
          <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
            {[...data.riders].sort((a, b) => Number(b.online) - Number(a.online)).map(r => (
              <li key={r.id}>
                <button disabled={!!busy || r.id === o.rider_id} onClick={async () => { await act('assign', { riderId: r.id }, `Given to ${r.name}`); setSheet(null); }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-line text-left hover:bg-cream disabled:opacity-50">
                  <span className={`w-2.5 h-2.5 rounded-full ${r.online ? 'bg-[#16A34A]' : 'bg-line'}`} />
                  <span className="flex-1"><b className="text-ink">{r.name}</b><span className="block text-[0.8125rem] text-ink-muted">{r.online ? 'Online' : 'Offline'} · {r.vehicle} · {r.phone}</span></span>
                  {r.id === o.rider_id && <span className="pill pill-gray">Current</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Sheet>

      <Sheet open={sheet === 'cash'} onClose={() => setSheet(null)} title="Cash collected?">
        <p className="text-ink-muted">Only confirm if the rider told you they collected <b className="text-ink">{money(o.total)}</b> in cash from the customer.</p>
        <button onClick={async () => { await act('advance', { next: 'collected', cashCollected: true }, 'Marked as picked up'); setSheet(null); }} className="mt-4 w-full h-12 rounded-full btn-primary">Yes, cash collected</button>
      </Sheet>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-3xl bg-white border border-line p-4 md:p-5"><h2 className="text-label text-ink-faint mb-2.5">{title}</h2>{children}</section>;
}
function Row({ k, v, muted }: { k: React.ReactNode; v: React.ReactNode; muted?: boolean }) {
  return <div className={`flex justify-between gap-3 ${muted ? 'text-ink-muted text-[0.875rem]' : 'text-ink'}`}><dt>{k}</dt><dd className="tabular-nums">{v}</dd></div>;
}
function Contact({ phone }: { phone: string }) {
  return (
    <div className="flex gap-2 mt-3">
      <a href={`tel:${phone}`} className="h-9 px-4 rounded-full bg-ink text-white text-[0.8125rem] font-semibold inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Call</a>
      <a href={wa(phone)} target="_blank" rel="noopener noreferrer" className="h-9 px-4 rounded-full bg-[#E8F6EC] text-[#15803D] text-[0.8125rem] font-semibold inline-flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</a>
    </div>
  );
}
