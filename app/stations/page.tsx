'use client';

import { WHATSAPP_NUMBER } from '@/lib/utils/constants';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin, Clock, Map as MapIcon, List, Check, LocateFixed, ArrowRight, Loader2, Minus, Plus, Building2, X } from 'lucide-react';
import MapView from '@/components/Map/MapView';
import InfoTip from '@/components/UI/InfoTip';
import { cylinderPhoto } from '@/components/Icons/GasCylinder';
import { PageHeader, OrderSteps, StickyAction } from '@/components/UI/PageHeader';
import { useGuestOrder, useOrderHydrated, basketOf } from '@/lib/store/guestOrder';
import { calculateDistance } from '@/lib/utils/pricing';
import { saveUserLocation, getSavedUserLocation } from '@/lib/utils/location';
import { standardSizes, priceFor, type Station } from '@/lib/data/stations';
import { MAX_CYLINDERS_PER_ORDER, describeItems, type BasketItem } from '@/lib/utils/quote';

const CITY_CENTRE = { lat: 6.0833, lng: -0.25 };
type Sort = 'price' | 'distance';

export default function OrderGasPage() {
  const router = useRouter();
  const hydrated = useOrderHydrated();
  const { order, updateStation, updateCylinder, updatePrice } = useGuestOrder();

  const [stations, setStations] = useState<Station[] | null>(null);
  const [live, setLive] = useState(true);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [customKg, setCustomKg] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>('distance');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locApprox, setLocApprox] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => { router.prefetch('/order'); router.prefetch('/checkout'); }, [router]);

  useEffect(() => {
    fetch('/api/stations').then(r => r.json())
      .then(d => { setStations(d.stations ?? []); setLive(d.live !== false); })
      .catch(() => { setStations([]); setLive(false); });
  }, []);

  // Start from ?size= (homepage), else the saved basket, else one 12 kg
  useEffect(() => {
    if (!hydrated) return;
    const q = Number(new URLSearchParams(window.location.search).get('size'));
    const saved = basketOf(order);
    setBasket(q ? [{ kg: q, qty: 1 }] : saved.length ? saved : [{ kg: 12, qty: 1 }]);
    if (order.stationId) setSelectedId(order.stationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const locate = () => {
    if (!navigator.geolocation) { setUserLoc(CITY_CENTRE); setLocApprox(true); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      p => { const loc = { lat: p.coords.latitude, lng: p.coords.longitude }; saveUserLocation(loc); setUserLoc(loc); setLocApprox(false); setLocating(false); },
      () => { setUserLoc(prev => prev ?? CITY_CENTRE); setLocApprox(true); setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };
  useEffect(() => {
    const saved = getSavedUserLocation();
    if (saved) setUserLoc({ lat: saved.lat, lng: saved.lng }); else locate();
  }, []);

  // ── Basket ─────────────────────────────────
  const count = basket.reduce((n, i) => n + i.qty, 0);
  const full = count >= MAX_CYLINDERS_PER_ORDER;
  const qtyOf = (kg: number) => basket.find(i => i.kg === kg)?.qty ?? 0;
  const setQty = (kg: number, qty: number) => {
    setBasket(prev => {
      const others = prev.filter(i => i.kg !== kg);
      const othersCount = others.reduce((n, i) => n + i.qty, 0);
      const capped = Math.max(0, Math.min(qty, MAX_CYLINDERS_PER_ORDER - othersCount));
      const next = capped ? [...others, { kg, qty: capped }] : others;
      return next.sort((a, b) => a.kg - b.kg);
    });
  };
  const addCustom = () => {
    const kg = Math.min(50, Math.max(1, Number(customKg)));
    if (!kg || full) return;
    setQty(kg, qtyOf(kg) + 1);
    setCustomKg('');
  };
  const customLines = basket.filter(i => !standardSizes.some(s => s.kg === i.kg));

  // Cheapest per-size price across stations, for the "from" label on each tile
  const fromPrice = (kg: number) => stations?.length ? Math.min(...stations.map(s => priceFor(s, kg))) : null;

  // ── Stations priced for this basket ───────
  const rows = useMemo(() => {
    if (!stations) return [];
    const origin = userLoc ?? CITY_CENTRE;
    const list = stations.map(s => {
      const km = calculateDistance(origin.lat, origin.lng, s.lat, s.lng);
      const gas = basket.reduce((sum, i) => sum + priceFor(s, i.kg) * i.qty, 0);
      return { ...s, km, eta: Math.round((km / 22) * 60) + 5, gas: Math.round(gas * 100) / 100 };
    });
    const cheapest = Math.min(...list.map(r => r.gas));
    const nearest = Math.min(...list.map(r => r.km));
    return list
      .map(r => ({ ...r, cheapest: r.gas === cheapest, nearest: r.km === nearest }))
      .sort((a, b) => sort === 'price' ? a.gas - b.gas || a.km - b.km : a.km - b.km);
  }, [stations, userLoc, basket, sort]);

  const selected = rows.find(r => r.id === selectedId) ?? null;
  const canOrder = live && !!selected && count > 0;

  const handleContinue = () => {
    if (!selected) return;
    updateStation(selected.id, selected.name, { lat: selected.lat, lng: selected.lng });
    // first line drives cylinderSize; full basket goes in items
    const lines = basket.filter(i => i.qty > 0);
    updateCylinder(String(lines[0].kg), describeItems(lines), selected.gas);
    useGuestOrder.setState(s => ({
      order: { ...s.order, items: lines.map(i => ({ id: `${i.kg}kg`, name: `${i.kg} kg`, price: priceFor(selected, i.kg), quantity: i.qty })) },
    }));
    updatePrice(selected.gas);
    router.push('/order');
  };

  const bulkLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello GasRefill, I need a bulk gas refill (more than 6 cylinders) in Koforidua.')}`;

  return (
    <div className="pb-28">
      <OrderSteps current={0} />
      <PageHeader title="What do you need?" subtitle={`Mix any sizes, up to ${MAX_CYLINDERS_PER_ORDER} cylinders per delivery.`} />

      {/* ── Sizes ─────────────────────────────── */}
      <section aria-label="Cylinder sizes" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {standardSizes.map(s => {
          const qty = qtyOf(s.kg);
          const from = fromPrice(s.kg);
          return (
            <div key={s.kg} className={`glass !rounded-[22px] p-2 transition-all ${qty ? 'card-selected' : ''}`}>
              <div className="relative aspect-[3/4] rounded-[16px] overflow-hidden bg-cream-deep">
                <Image src={cylinderPhoto(s.kg)} alt={`${s.kg} kg gas cylinder`} fill priority sizes="(min-width: 768px) 180px, 45vw" className="object-cover" />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
                <div className="absolute left-3 bottom-2.5 text-white">
                  <p className="text-[1.375rem] font-extrabold leading-none tracking-tight">{s.label}</p>
                  <p className="text-[0.75rem] text-white/80 mt-1">{s.desc}</p>
                </div>
                {qty > 0 && (
                  <span className="absolute top-2 right-2 min-w-7 h-7 px-2 rounded-full bg-flame text-white text-[0.8125rem] font-bold flex items-center justify-center shadow-[0_6px_14px_-4px_rgba(255,107,0,0.8)]">
                    ×{qty}
                  </span>
                )}
              </div>
              <div className="px-1.5 pt-2.5 pb-1">
                <p className="text-[0.8125rem] text-ink-muted">{from != null ? <>from <b className="text-ink">GH₵{from.toFixed(2)}</b></> : '…'}</p>
                {qty === 0 ? (
                  <button
                    onClick={() => setQty(s.kg, 1)}
                    disabled={full}
                    className="mt-2 w-full h-10 rounded-full btn-ghost inline-flex items-center justify-center gap-1.5 text-[0.875rem] disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                ) : (
                  <div className="mt-2 h-10 rounded-full bg-ink text-white flex items-center justify-between px-1">
                    <button onClick={() => setQty(s.kg, qty - 1)} aria-label={`One less ${s.label}`} className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                    <span className="text-[0.9375rem] font-bold tabular-nums" aria-live="polite">{qty}</span>
                    <button onClick={() => setQty(s.kg, qty + 1)} disabled={full} aria-label={`One more ${s.label}`} className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center disabled:opacity-30"><Plus className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Other sizes */}
      <div className="mt-3 glass !rounded-[20px] p-3 flex items-center gap-2.5 flex-wrap">
        <span className="text-[0.875rem] font-semibold text-ink pl-1">Other size</span>
        <span className="flex items-center gap-1.5 h-10 pl-3.5 pr-2 rounded-full bg-white/80 border border-line">
          <input
            inputMode="numeric"
            value={customKg}
            onChange={e => setCustomKg(e.target.value.replace(/\D/g, '').slice(0, 2))}
            onKeyDown={e => e.key === 'Enter' && addCustom()}
            placeholder="e.g. 14"
            aria-label="Cylinder size in kg"
            className="w-16 bg-transparent outline-none text-[0.9375rem] font-semibold text-ink placeholder:text-ink-faint placeholder:font-normal"
          />
          <span className="text-[0.8125rem] text-ink-muted">kg</span>
        </span>
        <button onClick={addCustom} disabled={!customKg || full} className="h-10 px-4 rounded-full btn-dark text-[0.875rem] disabled:opacity-40">Add</button>
        {customLines.map(l => (
          <span key={l.kg} className="inline-flex items-center gap-1.5 h-9 pl-3 pr-1.5 rounded-full bg-flame-soft text-flame-deep text-[0.8125rem] font-bold">
            {l.qty} × {l.kg} kg
            <button onClick={() => setQty(l.kg, 0)} aria-label={`Remove ${l.kg} kg`} className="w-6 h-6 rounded-full hover:bg-white/60 flex items-center justify-center"><X className="w-3.5 h-3.5" /></button>
          </span>
        ))}
      </div>

      {/* Basket line + bulk */}
      <div className="mt-3 flex items-center justify-between gap-3 px-1 text-[0.875rem]">
        <p className="text-ink-muted inline-flex items-center gap-1">
          {count ? <>
            <b className="text-ink">{count === 1 ? `1 cylinder (${basket.find(i => i.qty)?.kg} kg)` : `${count} cylinders`}</b>
            {count > 1 && <InfoTip label="your cylinders">{describeItems(basket)}</InfoTip>}
          </> : 'Add at least one cylinder.'}
        </p>
        {count > 0 && <button onClick={() => setBasket([])} className="font-semibold text-ink-muted hover:text-ink">Clear</button>}
      </div>
      {full && (
        <p className="mt-2 px-1 text-[0.8125rem] text-flame-deep">That’s a full load for one rider. Need more? <a href={bulkLink} target="_blank" rel="noopener noreferrer" className="font-bold underline underline-offset-2">Ask for a bulk delivery</a>.</p>
      )}

      <a href={bulkLink} target="_blank" rel="noopener noreferrer" className="mt-4 glass !rounded-[20px] p-4 flex items-center gap-3 hover:!bg-white/80 transition">
        <span className="icon-box icon-box-md icon-box-primary"><Building2 className="w-5 h-5" /></span>
        <span className="flex-1 min-w-0">
          <span className="block font-bold text-ink text-[0.9375rem]">Restaurant, chop bar, school or hostel?</span>
          <span className="block text-[0.8125rem] text-ink-muted">Bulk refills and weekly scheduled deliveries. Chat with us.</span>
        </span>
        <ArrowRight className="w-5 h-5 text-ink-faint" />
      </a>

      {/* ── Stations ─────────────────────────── */}
      <section aria-label="Stations" className="mt-9">
        <div className="flex items-end justify-between gap-3 mb-3">
          <div>
            <h2 className="text-[1.25rem] font-extrabold tracking-tight text-ink">Where should we refill?</h2>
            <p className="text-[0.8125rem] text-ink-muted inline-flex items-center gap-1">
              Gas price for your whole order
              <InfoTip label="station prices">Each station sets its own gas price. Pickup & return and safekeeping are added on the next step, once we know your address.</InfoTip>
            </p>
          </div>
          <button onClick={() => setView(v => (v === 'list' ? 'map' : 'list'))}
            className="glass !rounded-full inline-flex items-center gap-1.5 h-9 px-3.5 text-[0.8125rem] font-semibold text-ink shrink-0">
            {view === 'list' ? <><MapIcon className="w-4 h-4" /> Map</> : <><List className="w-4 h-4" /> List</>}
          </button>
        </div>

        <div className="glass !rounded-full inline-flex p-1 mb-3">
          {(['distance', 'price'] as Sort[]).map(s => (
            <button key={s} onClick={() => setSort(s)}
              className={`h-8 px-3.5 rounded-full text-[0.8125rem] font-semibold transition-all ${sort === s ? 'bg-ink text-white shadow-[0_4px_10px_-4px_rgba(23,19,15,0.6)]' : 'text-ink-muted'}`}>
              {s === 'price' ? 'Cheapest' : 'Nearest'}
            </button>
          ))}
        </div>

        {locApprox && (
          <button onClick={locate} className="glass w-full mb-3 flex items-center gap-2.5 !rounded-2xl px-4 py-3 text-left text-[0.8125rem] text-ink-muted">
            {locating ? <Loader2 className="w-4 h-4 animate-spin text-flame" /> : <LocateFixed className="w-4 h-4 text-flame" />}
            Distances are from Koforidua centre. <span className="font-semibold text-ink underline underline-offset-2">Use my location</span>
          </button>
        )}
        {!live && stations && (
          <p className="mb-3 rounded-2xl bg-[#FEF3DC] px-4 py-3 text-[0.8125rem] text-[#92400E]">
            We can’t reach our station list right now, so prices may be out of date and ordering is paused. Please try again shortly.
          </p>
        )}

        {view === 'map' && (
          <div className="glass mb-4 p-1.5 overflow-hidden"><div className="rounded-[18px] overflow-hidden">
            <MapView center={userLoc ?? CITY_CENTRE} markers={rows.map(r => ({ id: r.id, position: { lat: r.lat, lng: r.lng }, label: r.name }))}
              userLocation={userLoc} selectedMarkerId={selectedId} zoom={13} height="320px" />
          </div></div>
        )}

        {!stations ? (
          <div className="space-y-2.5">{[0, 1, 2, 3].map(i => <div key={i} className="glass h-[96px] animate-pulse" />)}</div>
        ) : (
          <ul className="space-y-2.5">
            {rows.map(r => {
              const isSel = r.id === selectedId;
              return (
                <li key={r.id}>
                  <button onClick={() => setSelectedId(r.id)} aria-pressed={isSel}
                    className={`glass w-full text-left p-4 transition-all ${isSel ? 'card-selected' : 'hover:!bg-white/80'}`}>
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${isSel ? 'bg-flame border-flame' : 'border-[#D9CCBE] bg-white/60'}`}>
                        {isSel && <Check className="w-3 h-3 text-white" strokeWidth={3.5} />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-bold text-[1rem] leading-snug text-ink truncate">{r.name}</p>
                          <p className="text-[1.125rem] md:text-[1.25rem] leading-none font-extrabold tracking-tight text-ink tabular-nums whitespace-nowrap">
                            {count ? `GH₵${r.gas.toFixed(2)}` : '—'}
                          </p>
                        </div>
                        <p className="text-[0.8125rem] text-ink-faint truncate mt-0.5">{r.address}</p>
                        <div className="mt-2.5 flex items-center gap-x-3 gap-y-1.5 flex-wrap text-[0.8125rem] text-ink-muted">
                          {r.cheapest && count > 0 && <span className="pill pill-accent">Lowest price</span>}
                          {r.nearest && sort === 'distance' && <span className="pill pill-gray">Nearest</span>}
                          <span className="inline-flex items-center gap-1 whitespace-nowrap"><MapPin className="w-3.5 h-3.5" />{r.km.toFixed(1)} km</span>
                          <span className="inline-flex items-center gap-1 whitespace-nowrap"><Clock className="w-3.5 h-3.5" />~{r.eta} min</span>
                          <span className="hidden sm:inline ml-auto text-[0.75rem] text-ink-faint whitespace-nowrap">GH₵{r.pricePerKg.toFixed(2)}/kg</span>
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {canOrder && selected && (
        <StickyAction>
          <button onClick={handleContinue}
            className="w-full h-14 rounded-full btn-primary !justify-between pl-6 pr-2 text-[1rem]">
            <span className="truncate">{count} {count === 1 ? 'cylinder' : 'cylinders'} · {selected.name}</span>
            <span className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-white/20 tabular-nums">
              GH₵{selected.gas.toFixed(2)} <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </StickyAction>
      )}
    </div>
  );
}
