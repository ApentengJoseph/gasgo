'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Phone, MessageCircle, Check, MapPin, Store, AlertTriangle, Loader2, Star, Banknote, Smartphone,
  ChevronDown, FlaskConical, Bike,
} from 'lucide-react';
import LiveTrackingMap from '@/components/Map/LiveTrackingMap';
import RatingModal from '@/components/Rating/RatingModal';
import InfoTip from '@/components/UI/InfoTip';
import PaymentRecovery from '@/components/Payment/PaymentRecovery';
import OrderActions from '@/components/Order/OrderActions';
import { createClient } from '@/lib/supabase/client';
import type { Order } from '@/lib/types/database';

type TrackedOrder = Order & {
  rider_name?: string | null; rider_phone?: string | null;
  cash_collected_at?: string | null; refill_photo_path?: string | null; refund_status?: string | null;
};

const DEMO_RIDER = process.env.NEXT_PUBLIC_DEMO_AUTO_RIDER === 'true';

// Five steps the customer cares about; several DB statuses map onto one step.
const STEPS = ['Confirmed', 'Picked up', 'Refilling', 'Coming back', 'Delivered'];
const STEP_OF: Record<string, number> = {
  pending: -1, confirmed: 0, assigned: 0, collected: 1, at_station: 2, on_the_way: 3, arriving: 3, delivered: 4,
};
const STEP_TIME: (keyof Order)[] = ['confirmed_at', 'collected_at', 'at_station_at', 'on_the_way_at', 'delivered_at'];

const HEADLINE: Record<string, { title: string; sub: string }> = {
  pending:    { title: 'Waiting for payment',              sub: 'Approve the MoMo prompt on your phone to confirm the order.' },
  confirmed:  { title: 'Finding you a rider',              sub: 'Your order is confirmed. A nearby rider will accept it shortly.' },
  assigned:   { title: 'Rider is coming for your cylinder', sub: 'Have your empty cylinder ready at the door.' },
  collected:  { title: 'Cylinder picked up',               sub: 'Your rider is taking it to the station for a refill.' },
  at_station: { title: 'Refilling at the station',         sub: 'Your cylinder is being filled now.' },
  on_the_way: { title: 'Bringing it back',                 sub: 'Your full cylinder is on the way. Keep your phone close.' },
  arriving:   { title: 'Almost at your door',              sub: 'Your rider is just around the corner.' },
  delivered:  { title: 'Delivered. Enjoy your cooking!',   sub: 'Thanks for using GasRefill.' },
  cancelled:  { title: 'Order cancelled',                  sub: 'This order was cancelled.' },
};

const time = (ts?: unknown) =>
  typeof ts === 'string' ? new Date(ts).toLocaleTimeString('en-GH', { hour: 'numeric', minute: '2-digit' }) : '';
const money = (n: number) => `GH₵${Number(n).toFixed(2)}`;

function Tracking() {
  const orderId = useSearchParams()?.get('orderId');
  const supabase = useRef(createClient()).current;
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [station, setStation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading');
  const [eta, setEta] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [rating, setRating] = useState(false);
  const [rated, setRated] = useState(false);

  const load = useCallback(async () => {
    if (!orderId) { setState('missing'); return; }
    const { data } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle();
    if (!data) { setState('missing'); return; }
    setOrder(data as TrackedOrder);
    setState('ready');
    if (data.station_id) {
      const { data: s } = await supabase.from('stations').select('lat, lng, name').eq('id', data.station_id).maybeSingle();
      if (s) setStation(s);
    }
  }, [orderId, supabase]);

  useEffect(() => { load(); }, [load]);

  // Live updates (Supabase Realtime) + a slow poll as a safety net
  useEffect(() => {
    if (!orderId) return;
    const channel = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => setOrder(prev => ({ ...(prev ?? {}), ...(payload.new as TrackedOrder) })))
      .subscribe();
    const t = setInterval(() => { if (document.visibilityState === 'visible') load(); }, 15000);
    return () => { supabase.removeChannel(channel); clearInterval(t); };
  }, [orderId, supabase, load]);

  // Test mode: the demo rider accepts and drives the route, one step every few seconds
  const status = order?.status;
  useEffect(() => {
    if (!DEMO_RIDER || !orderId || !status || ['pending', 'delivered', 'cancelled'].includes(status)) return;
    const tick = async () => {
      if (document.visibilityState !== 'visible') return;
      const res = await fetch('/api/demo/advance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId }),
      }).catch(() => null);
      if (res?.ok) load();
    };
    const first = setTimeout(tick, status === 'confirmed' ? 2500 : 600);
    const t = setInterval(tick, 3500);
    return () => { clearTimeout(first); clearInterval(t); };
  }, [orderId, status, load]);

  // Ask for a rating once, when delivered
  const asked = useRef(false);
  useEffect(() => {
    if (status === 'delivered' && !asked.current) { asked.current = true; setTimeout(() => setRating(true), 1200); }
  }, [status]);

  if (state === 'loading') {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-7 h-7 text-flame animate-spin" /></div>;
  }
  if (state === 'missing' || !order) {
    return (
      <div className="card p-8 text-center max-w-md mx-auto mt-6">
        <AlertTriangle className="w-10 h-10 mx-auto text-[#B45309]" />
        <h1 className="mt-3 text-[1.25rem] font-bold text-ink">We couldn’t find that order</h1>
        <p className="mt-1 text-ink-muted">It may belong to another phone, or the link is incomplete.</p>
        <Link href="/orders" className="mt-5 inline-flex h-12 px-6 items-center rounded-full btn-dark">See my orders</Link>
      </div>
    );
  }

  const step = STEP_OF[order.status] ?? -1;
  const head = HEADLINE[order.status] ?? HEADLINE.confirmed;
  const cancelled = order.status === 'cancelled';
  const delivered = order.status === 'delivered';
  const riderActive = ['assigned', 'collected', 'at_station', 'on_the_way', 'arriving'].includes(order.status);
  const hasRiderPos = order.rider_lat != null && order.rider_lng != null;
  const stationPos = station ?? { lat: order.delivery_lat, lng: order.delivery_lng, name: order.station_name };
  const waNumber = order.rider_phone?.replace(/\D/g, '').replace(/^0/, '233');
  const etaShown = eta != null && ['on_the_way', 'arriving', 'assigned'].includes(order.status);
  const items: { kg: number; qty: number; unit: number }[] = Array.isArray((order as any).items) ? (order as any).items : [];
  const cylinders = Number(order.quantity) || 1;

  const handleRating = async (stars: number, comment: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('ratings').insert({
        user_id: user.id, station_id: order.station_id, order_id: order.id, rating: stars, comment: comment || null,
      });
    }
    setRated(true); setRating(false);
  };

  return (
    <div className="pb-10 md:grid md:grid-cols-[1.35fr_1fr] md:gap-6 md:items-start">
      {/* ── Map ─────────────────────────────── */}
      <div className="-mx-4 -mt-5 md:m-0 md:sticky md:top-28">
        <div className="relative md:rounded-[28px] overflow-hidden md:shadow-[0_24px_50px_-24px_rgba(23,19,15,0.45)]">
          {riderActive || delivered ? (
            <LiveTrackingMap
              orderId={order.id}
              stationPosition={stationPos}
              riderPosition={hasRiderPos ? { lat: order.rider_lat!, lng: order.rider_lng!, heading: order.rider_heading ?? 0 } : { lat: stationPos.lat, lng: stationPos.lng, heading: 0 }}
              destinationPosition={{ lat: order.delivery_lat, lng: order.delivery_lng, address: order.delivery_address }}
              orderStatus={order.status}
              height="min(56vh, 520px)"
              className="!rounded-none"
              onETAUpdate={(m) => setEta(m)}
            />
          ) : (
            <div className="h-[34vh] md:h-[520px] glow-flame flex flex-col items-center justify-center text-white text-center px-6">
              <span className="relative flex w-16 h-16">
                {!cancelled && <span className="absolute inset-0 rounded-full bg-flame/40 animate-ping-soft" />}
                <span className="relative w-16 h-16 rounded-full glass-dark-surface flex items-center justify-center">
                  {cancelled ? <AlertTriangle className="w-7 h-7" /> : <Bike className="w-7 h-7" />}
                </span>
              </span>
              <p className="mt-4 text-white/75 text-[0.875rem] max-w-xs">
                {cancelled ? 'This order was cancelled.' : 'The live map appears as soon as a rider accepts your order.'}
              </p>
            </div>
          )}
          {DEMO_RIDER && !cancelled && !delivered && (
            <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-ink/80 text-white text-[0.75rem] font-semibold backdrop-blur">
              <FlaskConical className="w-3.5 h-3.5 text-flame-light" /> Test mode · simulated rider
            </span>
          )}
        </div>
      </div>

      {/* ── Sheet ───────────────────────────── */}
      <div className="relative -mt-7 md:mt-0 space-y-3">
        <section className="card !rounded-[28px] md:!rounded-[24px] p-5 !bg-white/85" aria-live="polite">
          <span className="md:hidden block mx-auto -mt-2 mb-3 w-10 h-1.5 rounded-full bg-cream-deep" aria-hidden="true" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[0.75rem] font-semibold text-ink-faint">Order #{order.order_number}</p>
              <h1 className="mt-1 text-[1.5rem] leading-tight font-extrabold tracking-tight text-ink">{head.title}</h1>
              <p className="mt-1 text-[0.9375rem] text-ink-muted">{head.sub}</p>
            </div>
            {etaShown && (
              <div className="shrink-0 text-center rounded-2xl bg-ink text-white px-3.5 py-2.5">
                <p className="text-[1.375rem] font-extrabold leading-none tabular-nums">{eta}</p>
                <p className="text-[0.6875rem] text-white/70 mt-1">min</p>
              </div>
            )}
          </div>

          {!cancelled && (
            <div className="mt-5">
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                    i < step || delivered ? 'bg-flame' : i === step ? 'bg-gradient-to-r from-flame to-flame-light animate-pulse-glow' : 'bg-cream-deep'
                  }`} />
                ))}
              </div>
              <ol className="mt-2.5 grid grid-cols-5 gap-1.5">
                {STEPS.map((label, i) => {
                  const done = i < step || delivered;
                  const current = i === step && !delivered;
                  const ts = time(order[STEP_TIME[i]]);
                  return (
                    <li key={label} className="min-w-0">
                      <p className={`text-[0.6875rem] leading-tight ${done || current ? 'font-semibold text-ink' : 'text-ink-faint'}`}>
                        {done && <Check className="inline w-3 h-3 -mt-0.5 mr-0.5 text-flame" strokeWidth={3} />}{label}
                      </p>
                      {(done || current) && ts && <p className="text-[0.625rem] text-ink-faint mt-0.5">{ts}</p>}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
          {cancelled && order.cancellation_reason && <p className="mt-3 text-[0.875rem] text-[#B91C1C]">{order.cancellation_reason}</p>}
        </section>

        {order.status === 'pending' && (
          <PaymentRecovery orderId={order.id} total={Number(order.total)} phone={(order as any).contact_phone} onConfirmed={load} />
        )}

        {/* Rider */}
        {order.rider_id && !cancelled && (
          <section className="card p-4 flex items-center gap-3">
            <span className="w-12 h-12 rounded-full bg-gradient-to-br from-flame-light to-flame-deep text-white font-bold text-[1.125rem] flex items-center justify-center shadow-[0_8px_18px_-8px_rgba(255,107,0,0.8)]">
              {(order.rider_name || 'R').charAt(0).toUpperCase()}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-ink truncate">{order.rider_name || 'Your rider'}</p>
              <p className="text-[0.8125rem] text-ink-muted">Your GasRefill rider</p>
            </div>
            {order.rider_phone && (
              <>
                {waNumber && (
                  <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp rider"
                    className="w-11 h-11 rounded-full bg-[#E8F6EC] text-[#15803D] flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </a>
                )}
                <a href={`tel:${order.rider_phone}`} aria-label="Call rider" className="w-11 h-11 rounded-full bg-ink text-white flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </a>
              </>
            )}
          </section>
        )}

        {order.refill_photo_path && <RefillPhoto orderId={order.id} path={order.refill_photo_path} />}

        {!cancelled && !delivered && <OrderActions order={order} onChanged={load} />}

        {/* Details (collapsed by default) */}
        <section className="card overflow-hidden">
          <button onClick={() => setShowDetails(d => !d)} aria-expanded={showDetails} className="w-full flex items-center gap-3 p-4 text-left">
            <span className="icon-box icon-box-sm icon-box-primary"><Store className="w-4 h-4" /></span>
            <span className="flex-1 min-w-0">
              <span className="block font-semibold text-ink truncate">
                {cylinders === 1 ? `${order.cylinder_size} kg cylinder` : `${cylinders} cylinders`} · {order.station_name}
              </span>
              <span className="block text-[0.8125rem] text-ink-muted">
                {money(order.total)} · {order.payment_method === 'cash' ? (order.cash_collected_at ? 'Paid in cash' : 'Cash at pickup') : order.payment_status === 'paid' ? 'Paid with MoMo' : 'Payment pending'}
              </span>
            </span>
            <ChevronDown className={`w-5 h-5 text-ink-faint transition-transform ${showDetails ? 'rotate-180' : ''}`} />
          </button>
          {showDetails && (
            <div className="px-4 pb-4 space-y-3 animate-fade-in">
              <div className="flex items-start gap-3 pt-3 border-t border-white/70">
                <MapPin className="w-4 h-4 mt-0.5 text-ink-faint shrink-0" />
                <div>
                  <p className="text-[0.75rem] text-ink-faint">Pick up & return</p>
                  <p className="font-semibold text-ink leading-snug">{order.delivery_address}</p>
                  {order.delivery_notes && <p className="text-[0.8125rem] text-ink-muted mt-0.5">“{order.delivery_notes}”</p>}
                </div>
              </div>
              <dl className="pt-3 border-t border-white/70 space-y-2 text-[0.875rem]">
                <div className="flex justify-between text-ink-muted">
                  <dt className="inline-flex items-center gap-1">Gas
                    {items.length > 0 && <InfoTip label="your cylinders">{items.map(i => <span key={i.kg} className="block">{i.qty} × {i.kg} kg — {money(i.unit * i.qty)}</span>)}</InfoTip>}
                  </dt>
                  <dd className="tabular-nums">{money(order.cylinder_price)}</dd>
                </div>
                <div className="flex justify-between text-ink-muted"><dt>Pickup & return</dt><dd className="tabular-nums">{money(order.delivery_fee)}</dd></div>
                <div className="flex justify-between text-ink-muted"><dt>Safekeeping</dt><dd className="tabular-nums">{money(order.safekeeping_fee)}</dd></div>
                <div className="flex justify-between pt-2 border-t border-dashed border-line font-bold text-ink text-[1rem]"><dt>Total</dt><dd className="tabular-nums">{money(order.total)}</dd></div>
              </dl>
              <p className="inline-flex items-center gap-1.5 text-[0.8125rem] text-ink-muted">
                {order.payment_method === 'cash' ? <><Banknote className="w-4 h-4" /> {order.cash_collected_at ? 'Cash paid at pickup' : 'Pay the rider in cash when they pick up your cylinder'}</> : <><Smartphone className="w-4 h-4" /> Mobile Money</>}
              </p>
            </div>
          )}
        </section>

        {delivered && !rated && (
          <button onClick={() => setRating(true)} className="w-full card-interactive p-4 flex items-center gap-3 text-left">
            <span className="icon-box icon-box-md icon-box-accent"><Star className="w-5 h-5" /></span>
            <span className="flex-1"><b className="text-ink">Rate {order.station_name}</b><span className="block text-[0.8125rem] text-ink-muted">Help neighbours pick a good station</span></span>
          </button>
        )}
        {(delivered || cancelled) && (
          <Link href="/stations" className="w-full h-14 rounded-full btn-primary text-[1rem]">Order again</Link>
        )}
      </div>

      <RatingModal isOpen={rating} onClose={() => setRating(false)} onSubmit={handleRating} stationName={order.station_name} orderId={order.id} />
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-7 h-7 text-flame animate-spin" /></div>}>
      <Tracking />
    </Suspense>
  );
}

/** The optional photo the rider took of the full cylinder at the station (private, short-lived link). */
function RefillPhoto({ orderId, path }: { orderId: string; path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let alive = true;
    fetch(`/api/orders/${orderId}/photo`).then(r => r.ok ? r.json() : null).then(d => { if (alive && d?.url) setUrl(d.url); }).catch(() => {});
    return () => { alive = false; };
  }, [orderId, path]);
  if (!url) return null;
  return (
    <section className="card p-3 flex items-center gap-3">
      <button onClick={() => setOpen(true)} className="shrink-0 rounded-2xl overflow-hidden w-16 h-16 bg-cream" aria-label="View refill photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="Your refilled cylinder" className="w-full h-full object-cover" />
      </button>
      <div className="min-w-0">
        <p className="font-semibold text-ink">Refilled at the station</p>
        <p className="text-[0.8125rem] text-ink-muted">Your rider took a photo of your full cylinder.</p>
      </div>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Refill photo" onClick={() => setOpen(false)}
          className="fixed inset-0 z-[80] bg-black/85 flex items-center justify-center p-4 animate-fade-in">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Your refilled cylinder" className="max-h-[85vh] max-w-full rounded-2xl" />
        </div>
      )}
    </section>
  );
}
