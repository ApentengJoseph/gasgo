'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Power, Navigation, Phone, MessageCircle, Banknote, Camera, Loader2, MapPin, Store, Check, X, Hourglass, ShieldAlert,
} from 'lucide-react';
import MapView from '@/components/Map/MapView';
import { createClient } from '@/lib/supabase/client';
import { RIDER_ACTION_LABEL, type Status } from '@/lib/orders/rules';

type Me = {
  profile: { name: string | null; is_online: boolean };
  rider: { status: string; rejection_reason?: string | null } | null;
  wallet: { balance: number; today: number };
  doneToday: number;
};
type Request = {
  id: string; orderNumber: string; area: string; stationName: string; cylinders: number; sizes: string;
  earning: number; cash: boolean; cashToCollect: number; gasCost: number; toPickupKm: number | null; tripKm: number | null;
  pickup: { lat: number; lng: number };
};
type Job = Record<string, any>;

const OFFER_SECONDS = 30;
const SEND_EVERY_MS = 4000;
const NEXT: Record<string, Status> = { assigned: 'collected', collected: 'at_station', at_station: 'on_the_way', on_the_way: 'delivered', arriving: 'delivered' };
const money = (n: number) => `GH₵${Number(n).toFixed(2)}`;
const metres = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371000, r = (d: number) => d * Math.PI / 180;
  const x = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};
const navUrl = (p: { lat: number; lng: number }) => `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}&travelmode=driving`;
const waUrl = (phone?: string | null) => phone ? `https://wa.me/${phone.replace(/\D/g, '').replace(/^0/, '233')}` : '#';
const post = (url: string, body?: unknown) =>
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body ?? {}) })
    .then(async r => ({ ok: r.ok, data: await r.json().catch(() => ({})) }))
    .catch(() => ({ ok: false, data: { error: 'Network problem. Try again.' } }));

/**
 * Rider "Drive" screen, modelled on Bolt/Uber driver apps:
 *  - Go online → GPS streams every ~4 s (or after 20 m) and the screen stays awake.
 *  - The nearest paid request appears with a 30 s countdown (auto-declines).
 *  - The current job has one big button for the next step; cash orders confirm
 *    the cash at pickup; at the station the rider can add a photo of the full cylinder.
 */
export default function RiderDrivePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [online, setOnline] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState('');
  const [active, setActive] = useState<Job[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [stations, setStations] = useState<Record<string, { lat: number; lng: number; name: string }>>({});
  const [countdown, setCountdown] = useState(OFFER_SECONDS);
  const [busy, setBusy] = useState<string | null>(null);
  const [cashSheet, setCashSheet] = useState<Job | null>(null);
  const declined = useRef<Set<string>>(new Set());
  const lastSent = useRef<{ t: number; p: { lat: number; lng: number } | null }>({ t: 0, p: null });
  const lastOffer = useRef<string | null>(null);
  const posRef = useRef<{ lat: number; lng: number } | null>(null);

  const loadMe = useCallback(async () => {
    const res = await fetch('/api/rider/me').catch(() => null);
    if (!res?.ok) return;
    const d = await res.json();
    setMe(d);
    setOnline(!!d.profile?.is_online);
  }, []);
  useEffect(() => { loadMe(); }, [loadMe]);
  const approved = me?.rider?.status === 'approved';

  const loadJobs = useCallback(async () => {
    const p = posRef.current;
    const res = await fetch(`/api/rider/jobs${p ? `?lat=${p.lat}&lng=${p.lng}` : ''}`).catch(() => null);
    if (!res?.ok) return;
    const d = await res.json();
    setActive(d.active);
    setRequests(d.requests.filter((r: Request) => !declined.current.has(r.id)));
    setStations(Object.fromEntries((d.stations ?? []).map((s: any) => [s.id, s])));
  }, []);

  const working = approved && (online || active.length > 0);

  // Poll for jobs while online or working on a job
  useEffect(() => {
    if (!working) return;
    loadJobs();
    const t = setInterval(() => { if (document.visibilityState === 'visible') loadJobs(); }, 6000);
    return () => clearInterval(t);
  }, [working, loadJobs]);

  // GPS while working: send at most every 4 s, or sooner after 20 m of movement
  useEffect(() => {
    if (!working || !navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (p) => {
        const here = { lat: p.coords.latitude, lng: p.coords.longitude };
        posRef.current = here; setPos(here); setGpsError('');
        const now = Date.now();
        const moved = lastSent.current.p ? metres(lastSent.current.p, here) : Infinity;
        if (now - lastSent.current.t >= SEND_EVERY_MS || moved > 20) {
          lastSent.current = { t: now, p: here };
          fetch('/api/rider/location', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...here, heading: p.coords.heading, speed: p.coords.speed, accuracy: p.coords.accuracy }),
          }).catch(() => {});
        }
      },
      () => setGpsError('Turn on location so customers can follow you on the map.'),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [working]);

  // Keep the screen awake while online (like Bolt/Uber driver apps)
  useEffect(() => {
    if (!online || !('wakeLock' in navigator)) return;
    let lock: any = null;
    (navigator as any).wakeLock.request('screen').then((l: any) => { lock = l; }).catch(() => {});
    return () => { lock?.release?.().catch?.(() => {}); };
  }, [online]);

  // Offer countdown for the nearest request
  const offer = online && active.length < 4 ? requests[0] : undefined;
  useEffect(() => {
    if (!offer) return;
    if (lastOffer.current !== offer.id) {
      lastOffer.current = offer.id;
      setCountdown(OFFER_SECONDS);
      navigator.vibrate?.([120, 80, 120]);
    }
    const t = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [offer]);

  const decline = useCallback((id: string, timedOut = false) => {
    declined.current.add(id);
    setRequests(r => r.filter(x => x.id !== id));
    post(`/api/rider/orders/${id}/decline`);
    if (timedOut) toast('Request passed to another rider', { icon: '⏱️' });
  }, []);
  useEffect(() => { if (offer && countdown <= 0) decline(offer.id, true); }, [countdown, offer, decline]);

  const toggleOnline = async () => {
    setToggling(true);
    const { ok, data } = await post('/api/rider/online', { online: !online });
    setToggling(false);
    if (!ok) { toast.error(data.error || 'Could not change status.'); return; }
    setOnline(data.online);
    toast(data.online ? 'You’re online. Requests will appear here.' : 'You’re offline.', { icon: data.online ? '🟢' : '⚪' });
  };

  const accept = async (id: string) => {
    setBusy(id);
    const { ok, data } = await post(`/api/rider/orders/${id}/accept`);
    setBusy(null);
    if (!ok) { toast.error(data.error || 'Could not accept.'); declined.current.add(id); }
    else toast.success('Accepted. Head to the customer.');
    loadJobs(); loadMe();
  };

  const advance = async (job: Job, next: Status, extra: Record<string, unknown> = {}) => {
    setBusy(job.id);
    const { ok, data } = await post(`/api/rider/orders/${job.id}/status`, { next, ...extra });
    setBusy(null);
    if (!ok) { toast.error(data.error || 'Could not update.'); loadJobs(); return; }
    if (next === 'delivered') toast.success(`Delivered! ${money(job.rider_earning ?? 0)} added to your wallet.`);
    setCashSheet(null);
    loadJobs(); loadMe();
  };

  const uploadPhoto = async (job: Job, file: File) => {
    setBusy(`photo-${job.id}`);
    const form = new FormData(); form.append('photo', file);
    const res = await fetch(`/api/rider/orders/${job.id}/photo`, { method: 'POST', body: form }).catch(() => null);
    setBusy(null);
    if (!res?.ok) { const d = await res?.json().catch(() => ({})); toast.error(d?.error || 'Photo upload failed.'); return; }
    toast.success('Photo added. The customer can see it.');
    loadJobs();
  };

  // ── Not approved yet ──
  if (me && !approved) {
    const s = me.rider?.status ?? 'missing';
    return (
      <div className="min-h-screen glow-flame flex items-center justify-center px-6 text-white text-center">
        <div className="max-w-sm">
          <span className="mx-auto w-16 h-16 rounded-full bg-white/[0.12] flex items-center justify-center">
            {s === 'pending' ? <Hourglass className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
          </span>
          <h1 className="mt-5 text-[1.625rem] font-extrabold tracking-tight">
            {s === 'pending' ? 'Waiting for approval' : s === 'rejected' ? 'Application not approved' : s === 'suspended' ? 'Account paused' : 'Profile incomplete'}
          </h1>
          <p className="mt-2 text-white/75">
            {s === 'pending' ? 'We’re checking your details. You can start taking pickups as soon as you’re approved.' : me.rider?.rejection_reason || 'Please contact GasRefill for help.'}
          </p>
          <button onClick={async () => { await createClient().auth.signOut(); window.location.href = '/rider/login'; }}
            className="mt-7 inline-flex h-12 px-6 items-center rounded-full bg-white/[0.12] font-semibold">Sign out</button>
        </div>
      </div>
    );
  }

  const job = active[0];
  const station = job ? stations[job.station_id] : null;
  const customer = job ? { lat: job.delivery_lat, lng: job.delivery_lng } : null;
  const target = job ? ((job.status === 'collected' || job.status === 'at_station') && station ? station : customer) : null;
  const markers = [
    ...(offer ? [{ id: `req-${offer.id}`, position: offer.pickup, label: offer.area }] : []),
    ...(target ? [{ id: 'target', position: { lat: target.lat, lng: target.lng }, label: job.status === 'collected' ? 'Station' : 'Customer' }] : []),
  ];
  const isCash = job?.payment_method === 'cash';

  return (
    <div className="relative min-h-screen">
      {/* Map */}
      <div className="fixed inset-x-0 top-0 h-[58vh] z-0">
        <MapView center={pos ?? (target ? { lat: target.lat, lng: target.lng } : { lat: 6.0945, lng: -0.2591 })} markers={markers} userLocation={pos} zoom={14} height="58vh" showControls={false} className="!rounded-none" />
      </div>

      {/* Top bar */}
      <div className="fixed top-0 inset-x-0 z-20 px-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)' }}>
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <Link href="/rider/earnings" className="h-11 pl-2 pr-4 rounded-full bg-ink text-white inline-flex items-center gap-2 shadow-lg">
            <span className="w-7 h-7 rounded-full bg-flame flex items-center justify-center text-[0.8125rem] font-bold">₵</span>
            <span className="text-[0.9375rem] font-extrabold tabular-nums">{me ? money(me.wallet.today) : '—'}</span>
            <span className="text-[0.75rem] text-white/60">today</span>
          </Link>
          <span className={`h-9 px-3.5 rounded-full inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold shadow ${online ? 'bg-[#15803D] text-white' : 'bg-white text-ink-muted'}`}>
            <span className={`w-2 h-2 rounded-full ${online ? 'bg-white animate-pulse' : 'bg-ink-faint'}`} /> {online ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Bottom sheet */}
      <div className="relative z-10 pt-[50vh]">
        <div className="max-w-md mx-auto rounded-t-[30px] bg-[#F4EFE9] min-h-[50vh] px-4 pt-3 pb-6 shadow-[0_-18px_40px_-20px_rgba(0,0,0,0.35)]">
          <span className="block mx-auto w-10 h-1.5 rounded-full bg-black/10 mb-4" aria-hidden="true" />
          {gpsError && <p className="mb-3 rounded-2xl bg-[#FEF3DC] px-4 py-3 text-[0.8125rem] text-[#92400E]">{gpsError}</p>}

          {/* Incoming request */}
          {offer && (
            <section className="mb-4 rounded-[26px] bg-ink text-white p-5 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.6)] animate-slide-up" aria-live="assertive">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.75rem] font-bold uppercase tracking-wider text-flame-light">New pickup request</p>
                  <p className="mt-1 text-[2rem] font-extrabold tracking-tight leading-none">{money(offer.earning)}</p>
                  <p className="text-[0.8125rem] text-white/60 mt-1">your earning</p>
                </div>
                <CountdownRing seconds={countdown} total={OFFER_SECONDS} />
              </div>
              <div className="mt-4 space-y-2 text-[0.9375rem]">
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-flame-light shrink-0" /> Pick up in <b>{offer.area}</b>{offer.toPickupKm != null && <span className="text-white/60"> · {offer.toPickupKm} km away</span>}</p>
                <p className="flex items-center gap-2"><Store className="w-4 h-4 text-flame-light shrink-0" /> Refill at {offer.stationName}{offer.tripKm != null && <span className="text-white/60"> · {offer.tripKm} km trip</span>}</p>
                <p className="flex items-center gap-2"><span className="w-4 text-center text-flame-light">⛽</span> {offer.cylinders === 1 ? '1 cylinder' : `${offer.cylinders} cylinders`} <span className="text-white/60">({offer.sizes})</span></p>
                {offer.cash && <p className="flex items-center gap-2 text-[#FCD34D]"><Banknote className="w-4 h-4 shrink-0" /> Cash order: collect {money(offer.cashToCollect)} at pickup</p>}
              </div>
              <div className="mt-5 grid grid-cols-[auto_1fr] gap-2.5">
                <button onClick={() => decline(offer.id)} className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center" aria-label="Decline"><X className="w-6 h-6" /></button>
                <button onClick={() => accept(offer.id)} disabled={busy === offer.id} className="h-14 rounded-full btn-primary text-[1.0625rem]">
                  {busy === offer.id ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Accept'}
                </button>
              </div>
            </section>
          )}

          {/* Current job */}
          {job ? (
            <section className="rounded-[26px] bg-white p-5 shadow-[0_12px_30px_-16px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between">
                <p className="text-[0.75rem] font-bold uppercase tracking-wider text-flame-deep">
                  {job.status === 'assigned' ? 'Go to customer' : job.status === 'collected' ? 'Go to station' : job.status === 'at_station' ? 'Refilling' : 'Return to customer'}
                </p>
                <span className="text-[0.75rem] text-ink-faint">#{job.order_number}{active.length > 1 && ` · +${active.length - 1} more`}</span>
              </div>
              <h2 className="mt-1.5 text-[1.25rem] font-extrabold tracking-tight text-ink leading-tight">
                {job.status === 'collected' || job.status === 'at_station' ? (station?.name ?? job.station_name) : job.delivery_address}
              </h2>
              {job.status !== 'collected' && job.status !== 'at_station' && job.delivery_notes && (
                <p className="mt-1 text-[0.875rem] text-ink-muted">“{job.delivery_notes}”</p>
              )}

              <div className="mt-3 flex flex-wrap gap-2 text-[0.8125rem]">
                <span className="pill pill-gray">{Number(job.quantity) === 1 ? `${job.cylinder_size} kg cylinder` : `${job.quantity} cylinders`}</span>
                {isCash
                  ? <span className="pill pill-warning">{job.cash_collected_at ? 'Cash collected' : `Collect ${money(job.total)} cash`}</span>
                  : <span className="pill pill-success">Paid by MoMo</span>}
                {isCash && (job.status === 'collected' || job.status === 'at_station') && <span className="pill pill-accent">Pay station {money(job.cylinder_price)}</span>}
                {!isCash && (job.status === 'collected' || job.status === 'at_station') && <span className="pill pill-accent">Station billed to GasRefill</span>}
              </div>

              <div className="mt-4 flex items-center gap-2.5">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink truncate">{job.contact_name ?? 'Customer'}</p>
                  <p className="text-[0.8125rem] text-ink-muted">You earn {money(job.rider_earning ?? 0)}</p>
                </div>
                {job.contact_phone && <>
                  <a href={waUrl(job.contact_phone)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp customer" className="w-11 h-11 rounded-full bg-[#E8F6EC] text-[#15803D] flex items-center justify-center"><MessageCircle className="w-5 h-5" /></a>
                  <a href={`tel:${job.contact_phone}`} aria-label="Call customer" className="w-11 h-11 rounded-full bg-ink text-white flex items-center justify-center"><Phone className="w-5 h-5" /></a>
                </>}
                {target && job.status !== 'at_station' && (
                  <a href={navUrl(target)} target="_blank" rel="noopener noreferrer" aria-label="Navigate" className="w-11 h-11 rounded-full bg-flame text-white flex items-center justify-center"><Navigation className="w-5 h-5" /></a>
                )}
              </div>

              {job.status === 'at_station' && (
                <label className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-line p-3.5 cursor-pointer">
                  <span className="icon-box icon-box-sm icon-box-primary">
                    {busy === `photo-${job.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : job.refill_photo_path ? <Check className="w-4 h-4 text-[#15803D]" /> : <Camera className="w-4 h-4" />}
                  </span>
                  <span className="flex-1 text-[0.875rem]">
                    <b className="text-ink">{job.refill_photo_path ? 'Photo added' : 'Snap the full cylinder'}</b>
                    <span className="block text-ink-muted text-[0.8125rem]">Optional · reassures the customer</span>
                  </span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadPhoto(job, f); e.target.value = ''; }} />
                </label>
              )}

              <div className="mt-4 space-y-2.5">
                {job.status === 'on_the_way' && (
                  <button onClick={() => advance(job, 'arriving')} disabled={busy === job.id} className="w-full h-12 rounded-full btn-ghost">I’m almost there</button>
                )}
                <button
                  onClick={() => (job.status === 'assigned' && isCash) ? setCashSheet(job) : advance(job, NEXT[job.status])}
                  disabled={busy === job.id}
                  className="w-full h-14 rounded-full btn-primary text-[1.0625rem]"
                >
                  {busy === job.id ? <Loader2 className="w-5 h-5 animate-spin" /> : RIDER_ACTION_LABEL[job.status as Status] ?? 'Next'}
                </button>
              </div>
            </section>
          ) : !offer && (
            <section className="text-center py-6">
              <button onClick={toggleOnline} disabled={toggling || !me}
                className={`mx-auto w-32 h-32 rounded-full flex flex-col items-center justify-center gap-1 font-extrabold text-[1.0625rem] transition-all shadow-[0_24px_50px_-20px_rgba(0,0,0,0.5)] active:scale-95 ${online ? 'bg-ink text-white' : 'bg-gradient-to-br from-flame-light to-flame-deep text-white'}`}>
                {toggling ? <Loader2 className="w-7 h-7 animate-spin" /> : <Power className="w-8 h-8" />}
                {online ? 'Go offline' : 'Go online'}
              </button>
              <p className="mt-4 text-[0.9375rem] text-ink-muted">
                {online ? 'Looking for pickups near you…' : 'Go online to start receiving pickups.'}
              </p>
              {me && <p className="mt-1 text-[0.8125rem] text-ink-faint">{me.doneToday} {me.doneToday === 1 ? 'delivery' : 'deliveries'} today · wallet {money(me.wallet.balance)}</p>}
            </section>
          )}

          {(job || offer) && (
            <button onClick={toggleOnline} disabled={toggling} className="mt-4 w-full h-11 rounded-full btn-ghost text-[0.875rem] inline-flex items-center justify-center gap-2">
              <Power className="w-4 h-4" /> {online ? 'Stop new requests (go offline)' : 'Go online'}
            </button>
          )}
        </div>
      </div>

      {/* Cash at pickup confirmation */}
      {cashSheet && (
        <div className="fixed inset-0 z-[60] bg-ink/60 backdrop-blur-sm flex items-end justify-center" onClick={() => setCashSheet(null)}>
          <div onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Collect cash" className="w-full max-w-md bg-white rounded-t-[30px] p-6 animate-slide-up" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
            <span className="icon-box icon-box-lg icon-box-accent"><Banknote className="w-7 h-7" /></span>
            <h3 className="mt-4 text-[1.375rem] font-extrabold tracking-tight text-ink">Collect {money(cashSheet.total)} cash</h3>
            <p className="mt-1 text-ink-muted">Take the payment from {cashSheet.contact_name ?? 'the customer'} now, with the empty cylinder. At the station you’ll pay {money(cashSheet.cylinder_price)} for the gas.</p>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button onClick={() => setCashSheet(null)} className="h-12 rounded-full btn-ghost">Not yet</button>
              <button onClick={() => advance(cashSheet, 'collected', { cashCollected: true })} disabled={busy === cashSheet.id} className="h-12 rounded-full btn-primary">
                {busy === cashSheet.id ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Cash received'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const pct = Math.max(0, seconds) / total;
  const c = 2 * Math.PI * 22;
  return (
    <span className="relative w-14 h-14 shrink-0" role="timer" aria-label={`${Math.max(0, seconds)} seconds left`}>
      <svg viewBox="0 0 50 50" className="w-14 h-14 -rotate-90" aria-hidden="true">
        <circle cx="25" cy="25" r="22" stroke="rgba(255,255,255,0.15)" strokeWidth="4" fill="none" />
        <circle cx="25" cy="25" r="22" stroke="#FF8A3D" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} style={{ transition: 'stroke-dashoffset 1s linear' }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[0.9375rem] font-bold tabular-nums">{Math.max(0, seconds)}</span>
    </span>
  );
}
