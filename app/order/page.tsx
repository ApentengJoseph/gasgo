'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Home, Briefcase, ArrowRight, Pencil, Check } from 'lucide-react';
import AddressAutocomplete from '@/components/Address/AddressAutocomplete';
import MapView from '@/components/Map/MapView';
import QuoteBreakdown from '@/components/Order/QuoteBreakdown';
import { PageHeader, OrderSteps, StickyAction } from '@/components/UI/PageHeader';
import { useGuestOrder, useOrderHydrated, basketOf } from '@/lib/store/guestOrder';
import { useAuth } from '@/lib/contexts/AuthContext';
import { calculateDistance } from '@/lib/utils/pricing';
import { quote, friendlyItems } from '@/lib/utils/quote';
import type { Address } from '@/lib/types/database';
import { OrderFlowSkeleton } from '@/components/UI/Skeletons';

const NOTE_CHIPS = ['Call when you arrive', 'Cylinder is at the gate', 'Ring the bell', 'Ask the security man'];

export default function PickupAddressPage() {
  const router = useRouter();
  const hydrated = useOrderHydrated();
  const { userId } = useAuth();
  const { order, updateAddress, updateInstructions } = useGuestOrder();

  const [saved, setSaved] = useState<Address[]>([]);
  const [typing, setTyping] = useState('');
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (hydrated && (!order.stationId || !order.cylinderSize)) router.replace('/stations');
  }, [hydrated, order.stationId, order.cylinderSize, router]);

  useEffect(() => { if (hydrated) setNotes(order.deliveryInstructions ?? ''); }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!userId) return;
    fetch('/api/addresses').then(r => r.json()).then(d => {
      const list: Address[] = d.addresses ?? [];
      setSaved(list);
      if (!order.deliveryAddress && list.length) {
        const def = list.find(a => a.is_default) ?? list[0];
        updateAddress(def.address, { lat: def.lat, lng: def.lng });
      }
    }).catch(() => {});
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { router.prefetch('/checkout'); }, [router]);

  if (!hydrated || !order.stationId) return <OrderFlowSkeleton step={1} />;

  const loc = order.deliveryLocation;
  const km = order.stationLocation && loc
    ? calculateDistance(order.stationLocation.lat, order.stationLocation.lng, loc.lat, loc.lng) * 2 : 0;
  const unit = (kg: number) => order.items.find(i => i.id === `${kg}kg`)?.price ?? (order.estimatedPrice ?? 0);
  const q = quote(basketOf(order), unit, km);
  const hasAddress = !!(order.deliveryAddress && loc);
  const showSearch = !hasAddress || editing;

  const toggleChip = (chip: string) => {
    setNotes(n => {
      const parts = n.split(' · ').map(p => p.trim()).filter(Boolean);
      return (parts.includes(chip) ? parts.filter(p => p !== chip) : [...parts, chip]).join(' · ');
    });
  };

  return (
    <div className="pb-28">
      <OrderSteps current={1} />
      <PageHeader back="/stations" title="Where do we pick up?" subtitle={(() => { const f = friendlyItems(basketOf(order)); return <>We’ll pick up <b className="text-ink">{f.phrase}</b> here and bring {f.plural ? 'them' : 'it'} back full.</>; })()} />

      <div className="md:grid md:grid-cols-[1.25fr_1fr] md:gap-6 md:items-start animate-slide-up">
        <div className="space-y-4">
          {/* Saved places as one-tap chips */}
          {saved.length > 0 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
              {saved.map(a => {
                const active = a.address === order.deliveryAddress;
                const Icon = /home/i.test(a.label) ? Home : /work|office/i.test(a.label) ? Briefcase : MapPin;
                return (
                  <button key={a.id} onClick={() => { updateAddress(a.address, { lat: a.lat, lng: a.lng }); setEditing(false); }}
                    className={`glass !rounded-full shrink-0 inline-flex items-center gap-2 h-11 pl-3 pr-4 text-[0.875rem] font-semibold transition ${active ? 'card-selected text-ink' : 'text-ink-muted'}`}>
                    <Icon className={`w-4 h-4 ${active ? 'text-flame' : ''}`} /> {a.label}
                    {active && <Check className="w-4 h-4 text-flame" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Chosen pickup point with a map preview */}
          {hasAddress && !editing && (
            <div className="card p-2">
              <div className="rounded-[18px] overflow-hidden">
                <MapView center={loc!} markers={[{ id: 'pickup', position: loc!, label: 'Pickup' }]} zoom={16} height="180px" showControls={false} />
              </div>
              <div className="flex items-start gap-3 p-3">
                <span className="icon-box icon-box-md icon-box-flame"><MapPin className="w-5 h-5" /></span>
                <div className="flex-1 min-w-0">
                  <p className="text-[0.75rem] font-semibold text-flame-deep">Pick up & return to</p>
                  <p className="font-semibold text-ink leading-snug">{order.deliveryAddress}</p>
                </div>
                <button onClick={() => { setEditing(true); setTyping(''); }} className="inline-flex items-center gap-1 h-9 px-3 rounded-full btn-ghost text-[0.8125rem]">
                  <Pencil className="w-3.5 h-3.5" /> Change
                </button>
              </div>
            </div>
          )}

          {showSearch && (
            <div className="card p-4 md:p-5">
              <p className="font-semibold text-ink mb-3">Search your area, street or landmark</p>
              <AddressAutocomplete
                value={typing}
                onChange={(addr, l) => { setTyping(addr); if (l) { updateAddress(addr, l); setEditing(false); } }}
                placeholder="e.g. Adweso, near the School of Nursing"
                showCurrentLocation
              />
              <p className="mt-3 text-[0.8125rem] text-ink-faint">We cover Koforidua and nearby areas.</p>
            </div>
          )}

          {/* Notes for the rider */}
          <div className="card p-4 md:p-5">
            <label htmlFor="notes" className="field-label">Notes for the rider <span className="font-normal text-ink-faint">(optional)</span></label>
            <div className="flex flex-wrap gap-2 mb-3">
              {NOTE_CHIPS.map(c => {
                const on = notes.split(' · ').includes(c);
                return (
                  <button key={c} type="button" onClick={() => toggleChip(c)} aria-pressed={on}
                    className={`h-9 px-3.5 rounded-full text-[0.8125rem] font-semibold transition ${on ? 'bg-ink text-white' : 'glass !rounded-full text-ink-muted'}`}>
                    {c}
                  </button>
                );
              })}
            </div>
            <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="e.g. Blue gate opposite the church" className="input-field resize-none leading-relaxed" />
          </div>
        </div>

        <div className="mt-4 md:mt-0 md:sticky md:top-28">
          <QuoteBreakdown q={q} stationName={order.stationName} hasAddress={hasAddress} />
        </div>
      </div>

      {hasAddress && !editing && (
        <StickyAction>
          <button onClick={() => { updateInstructions(notes.trim()); router.push('/checkout'); }}
            className="w-full h-14 rounded-full btn-primary !justify-between pl-6 pr-2 text-[1rem]">
            <span>Continue to payment</span>
            <span className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-white/20 tabular-nums">
              GH₵{q.total.toFixed(2)} <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </StickyAction>
      )}
    </div>
  );
}
