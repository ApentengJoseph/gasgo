'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { MapPin, Store, Smartphone, Banknote, ShieldCheck, Loader2, Lock } from 'lucide-react';
import QuoteBreakdown from '@/components/Order/QuoteBreakdown';
import MoMoSheet from '@/components/Payment/MoMoSheet';
import { PageHeader, OrderSteps, StickyAction } from '@/components/UI/PageHeader';
import { OrderFlowSkeleton } from '@/components/UI/Skeletons';
import { useGuestOrder, useOrderHydrated, basketOf } from '@/lib/store/guestOrder';
import { useAuth } from '@/lib/contexts/AuthContext';
import { calculateDistance } from '@/lib/utils/pricing';
import { quote } from '@/lib/utils/quote';
import { fetchWithTimeout } from '@/lib/utils/timeout';

type Method = 'momo' | 'cash';
const PENDING_KEY = 'gaso-pending-order';

/** Ghana numbers: 0XXXXXXXXX or +233XXXXXXXXX */
function validPhone(p: string) {
  const d = p.replace(/\D/g, '');
  return (d.length === 10 && d.startsWith('0')) || (d.length === 12 && d.startsWith('233'));
}

export default function CheckoutPage() {
  const router = useRouter();
  const hydrated = useOrderHydrated();
  const { order, isOrderValid, clearOrder } = useGuestOrder();
  const { profile, userEmail, updateDetails, ensureSession, loading: authLoading } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState<Method>('momo');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [momo, setMomo] = useState<{ orderId: string; total: number } | null>(null);
  const [editDetails, setEditDetails] = useState(false);
  // Set once the order is placed, so emptying the basket doesn't trigger the 'no basket' redirect
  const placed = useRef(false);

  useEffect(() => {
    if (hydrated && !placed.current && !isOrderValid()) router.replace(order.stationId ? '/order' : '/stations');
  }, [hydrated, isOrderValid, order.stationId, router]);

  // Prefill from the saved profile
  useEffect(() => {
    if (profile?.name) setName(n => n || profile.name!);
    if (profile?.phone) setPhone(p => p || profile.phone!);
  }, [profile]);

  if (!hydrated || !isOrderValid()) return <OrderFlowSkeleton step={2} />;

  const km = order.stationLocation && order.deliveryLocation
    ? calculateDistance(order.stationLocation.lat, order.stationLocation.lng, order.deliveryLocation.lat, order.deliveryLocation.lng) * 2
    : 0;
  const basket = basketOf(order);
  const unit = (kg: number) => order.items.find(i => i.id === `${kg}kg`)?.price ?? (order.estimatedPrice ?? 0);
  const q = quote(basket, unit, km);
  const nameOk = name.trim().length >= 2;
  const phoneOk = validPhone(phone);

  /** One server order per basket: reuse it if the customer retries payment. */
  const getOrCreateOrder = async (uid: string): Promise<{ orderId: string; total: number }> => {
    const basketKey = `${order.createdAt}|${order.stationId}|${JSON.stringify(basket)}|${order.deliveryAddress}`;
    try {
      // Reuse an unpaid order only if it's for this exact basket AND this session
      const saved = JSON.parse(localStorage.getItem(PENDING_KEY) || 'null');
      if (saved?.basketKey === basketKey && saved.uid === uid && saved.orderId) return saved;
    } catch { /* ignore */ }

    const res = await fetchWithTimeout('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stationId: order.stationId,
        cylinderSize: order.cylinderSize,
        items: basket,
        deliveryAddress: order.deliveryAddress,
        deliveryLatitude: order.deliveryLocation!.lat,
        deliveryLongitude: order.deliveryLocation!.lng,
        deliveryNotes: order.deliveryInstructions || null,
      }),
    }, 25000);
    const d = await res.json();
    if (!res.ok || !d.orderId) throw new Error(d.error || 'We could not create your order.');
    const created = { orderId: d.orderId as string, total: Number(d.total), basketKey, uid };
    localStorage.setItem(PENDING_KEY, JSON.stringify(created));
    return created;
  };

  const finish = (orderId: string) => {
    placed.current = true;
    localStorage.removeItem(PENDING_KEY);
    router.push(`/orders/tracking?orderId=${orderId}`);
    // empty the basket once we're on the tracking page
    setTimeout(clearOrder, 1500);
  };

  const placeOrder = async () => {
    setTouched(true);
    setError('');
    if (!nameOk || !phoneOk) return;
    setBusy(true);
    try {
      const uid = await ensureSession();
      await updateDetails({ name, phone });
      let created = await getOrCreateOrder(uid);
      if (method === 'cash') {
        let res = await fetchWithTimeout(`/api/orders/${created.orderId}/confirm-cash`, { method: 'POST' });
        if (res.status === 404) {
          // saved order no longer valid for this session: make a fresh one
          localStorage.removeItem(PENDING_KEY);
          created = await getOrCreateOrder(uid);
          res = await fetchWithTimeout(`/api/orders/${created.orderId}/confirm-cash`, { method: 'POST' });
        }
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || 'Could not confirm your order.');
        toast.success('Order placed! Pay the rider in cash.');
        finish(created.orderId);
      } else {
        setMomo(created);
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pb-32 md:pb-12">
      <OrderSteps current={2} />
      <PageHeader back="/order" title="Confirm & pay" subtitle="No account needed. Check everything, then pay your way." />

      <div className="md:grid md:grid-cols-[1.25fr_1fr] md:gap-6 md:items-start space-y-4 md:space-y-0">
        <div className="space-y-4">
          {/* Your details */}
          {profile?.name && profile?.phone && !editDetails ? (
            <section className="card p-4 flex items-center gap-3" aria-label="Your details">
              <span className="w-11 h-11 rounded-full bg-gradient-to-br from-flame-light to-flame-deep text-white font-bold flex items-center justify-center">
                {name.trim().charAt(0).toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-ink truncate">{name}</p>
                <p className="text-[0.8125rem] text-ink-muted">{phone} · the rider will call this number</p>
              </div>
              <button onClick={() => setEditDetails(true)} className="h-9 px-3.5 rounded-full btn-ghost text-[0.8125rem]">Edit</button>
            </section>
          ) : (
          <section className="card p-5" aria-labelledby="details-h">
            <h2 id="details-h" className="text-[1.0625rem] font-bold text-ink">Your details</h2>
            <p className="text-[0.8125rem] text-ink-muted mt-0.5 mb-4">So the rider knows who to look for and can call you.</p>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="field-label">Your name</label>
                <input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="e.g. Akosua Mensah"
                  className={`input-field ${touched && !nameOk ? '!border-[#DC2626]' : ''}`}
                />
                {touched && !nameOk && <p className="mt-1.5 text-[0.8125rem] text-[#DC2626]">Please add your name.</p>}
              </div>
              <div>
                <label htmlFor="phone" className="field-label">Phone number</label>
                <input
                  id="phone"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="024 123 4567"
                  className={`input-field ${touched && !phoneOk ? '!border-[#DC2626]' : ''}`}
                />
                {touched && !phoneOk && <p className="mt-1.5 text-[0.8125rem] text-[#DC2626]">Enter a Ghana number, e.g. 024 123 4567.</p>}
              </div>
            </div>
          </section>
          )}

          {/* Delivery summary */}
          <section className="card overflow-hidden" aria-label="Delivery">
            <SummaryRow icon={Store} label={`Refill ${basket.reduce((n, i) => n + i.qty, 0) === 1 ? `${basket[0].kg} kg cylinder` : `${basket.reduce((n, i) => n + i.qty, 0)} cylinders`} at`} value={order.stationName ?? ''} href="/stations" />
            <SummaryRow icon={MapPin} label="Pick up & return to" value={order.deliveryAddress ?? ''} note={order.deliveryInstructions} href="/order" border />
          </section>

          {/* Payment method */}
          <section className="card p-5" aria-labelledby="pay-h">
            <h2 id="pay-h" className="text-[1.0625rem] font-bold text-ink mb-3">How would you like to pay?</h2>
            <div className="grid grid-cols-2 gap-2.5">
              <MethodButton active={method === 'momo'} onClick={() => setMethod('momo')} icon={Smartphone} title="Mobile Money" sub="MTN · Telecel · AirtelTigo">
                <span className="mt-2.5 flex items-center gap-1.5">
                  <Image src="/mtn-log.png" alt="" width={30} height={18} className="h-[18px] w-auto rounded" />
                  <Image src="/telecel-logo.png" alt="" width={30} height={18} className="h-[18px] w-auto rounded" />
                  <Image src="/airtel-tigo-log.png" alt="" width={30} height={18} className="h-[18px] w-auto rounded" />
                </span>
              </MethodButton>
              <MethodButton active={method === 'cash'} onClick={() => setMethod('cash')} icon={Banknote} title="Cash" sub="Pay the rider when your gas is back" />
            </div>
          </section>
        </div>

        {/* Total + pay */}
        <div className="md:sticky md:top-28 space-y-4">
          <QuoteBreakdown q={q} stationName={order.stationName} />

          {error && <p role="alert" className="rounded-2xl bg-[#FDECEC] px-4 py-3 text-[0.875rem] text-[#B91C1C]">{error}</p>}

          <div className="hidden md:block">
            <PayButton onClick={placeOrder} busy={busy} disabled={authLoading} label={method === 'cash' ? `Place order · GH₵${q.total.toFixed(2)}` : `Pay GH₵${q.total.toFixed(2)}`} />
          </div>
          <p className="flex items-center justify-center gap-1.5 text-[0.75rem] text-ink-faint">
            <ShieldCheck className="w-3.5 h-3.5" /> Your number is only shared with your rider.
          </p>
        </div>
      </div>

      <div className="md:hidden">
        <StickyAction>
          <PayButton onClick={placeOrder} busy={busy} disabled={authLoading} label={method === 'cash' ? `Place order · GH₵${q.total.toFixed(2)}` : `Pay GH₵${q.total.toFixed(2)}`} />
        </StickyAction>
      </div>

      {momo && (
        <MoMoSheet
          open
          onClose={() => setMomo(null)}
          orderId={momo.orderId}
          total={momo.total}
          phone={phone}
          email={userEmail}
          onPaid={() => { toast.success('Paid! Finding you a rider…'); finish(momo.orderId); }}
        />
      )}
    </div>
  );
}

function SummaryRow({ icon: Icon, label, value, note, href, border }: {
  icon: typeof MapPin; label: string; value: string; note?: string; href: string; border?: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 p-4 ${border ? 'border-t border-line' : ''}`}>
      <span className="icon-box icon-box-sm icon-box-primary"><Icon className="w-4 h-4" /></span>
      <div className="flex-1 min-w-0">
        <p className="text-[0.75rem] text-ink-faint">{label}</p>
        <p className="font-semibold text-ink leading-snug">{value}</p>
        {note && <p className="text-[0.8125rem] text-ink-muted mt-0.5">“{note}”</p>}
      </div>
      <Link href={href} className="text-[0.8125rem] font-semibold text-flame-deep hover:underline underline-offset-2">Change</Link>
    </div>
  );
}

function PayButton({ onClick, busy, disabled, label }: { onClick: () => void; busy: boolean; disabled: boolean; label: string }) {
  return (
    <button onClick={onClick} disabled={busy || disabled}
      className="w-full h-14 rounded-full btn-primary text-[1rem] inline-flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99] transition">
      {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-4 h-4" />} {label}
    </button>
  );
}

function MethodButton({ active, onClick, icon: Icon, title, sub, children }: {
  active: boolean; onClick: () => void; icon: typeof MapPin; title: string; sub: string; children?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`glass !rounded-[20px] text-left p-3.5 transition-all ${active ? 'card-selected' : 'hover:!bg-white/80'}`}
    >
      <Icon className={`w-5 h-5 ${active ? 'text-flame-deep' : 'text-ink-muted'}`} />
      <p className="mt-2 font-bold text-ink text-[0.9375rem]">{title}</p>
      <p className="text-[0.75rem] text-ink-muted leading-snug">{sub}</p>
      {children}
    </button>
  );
}
