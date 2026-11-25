'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ChevronRight, Flame, ShoppingBag, Loader2, Plus, RotateCcw, CalendarClock } from 'lucide-react';
import StatusBadge, { statusLabel } from '@/components/Badges/StatusBadge';
import { PageHeader } from '@/components/UI/PageHeader';
import { cylinderPhoto } from '@/components/Icons/GasCylinder';
import { useGuestOrder, useOrderHydrated, basketOf } from '@/lib/store/guestOrder';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';
import { itemsOf, loadReorder } from '@/lib/utils/reorder';
import { shortLabel } from '@/lib/utils/quote';
import type { Order } from '@/lib/types/database';

const LIVE = ['confirmed', 'assigned', 'collected', 'at_station', 'on_the_way', 'arriving'];
const STEP: Record<string, number> = { confirmed: 0, assigned: 0, collected: 1, at_station: 2, on_the_way: 3, arriving: 3, delivered: 4 };
const STEP_LABEL = ['Confirmed', 'Picked up', 'Refilling', 'Coming back', 'Delivered'];

const day = (iso: string) => new Date(iso).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' });
const time = (iso: string) => new Date(iso).toLocaleTimeString('en-GH', { hour: 'numeric', minute: '2-digit' });
const month = (iso: string) => new Date(iso).toLocaleDateString('en-GH', { month: 'long', year: 'numeric' });

/** Unpaid checkouts older than a day were abandoned (until then the customer can still pay). */
const abandoned = (o: Order) => o.status === 'pending' && Date.now() - new Date(o.created_at).getTime() > 864e5;

export default function MyOrdersPage() {
  const router = useRouter();
  const supabase = useRef(createClient()).current;
  const hydrated = useOrderHydrated();
  const { userId, loading: authLoading } = useAuth();
  const { order: basket, isOrderValid } = useGuestOrder();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) { setOrders([]); return; }
    const { data } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    setOrders((data as Order[]) ?? []);
  }, [supabase, userId]);

  useEffect(() => { if (!authLoading) load(); }, [authLoading, load]);
  useEffect(() => {
    if (!userId) return;
    const ch = supabase.channel('my-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${userId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [supabase, userId, load]);

  const { live, awaiting, history, stats } = useMemo(() => {
    const all = (orders ?? []).filter(o => !abandoned(o));
    const delivered = all.filter(o => o.status === 'delivered');
    const last = delivered[0];
    return {
      live: all.filter(o => LIVE.includes(o.status)),
      awaiting: all.filter(o => o.status === 'pending'),
      history: all.filter(o => o.status === 'delivered' || o.status === 'cancelled'),
      stats: {
        refills: delivered.length,
        spent: delivered.reduce((s, o) => s + Number(o.total), 0),
        daysSince: last ? Math.floor((Date.now() - new Date(last.delivered_at ?? last.created_at).getTime()) / 864e5) : null,
        last,
      },
    };
  }, [orders]);

  const groups = useMemo(() => {
    const m = new Map<string, Order[]>();
    for (const o of history) { const k = month(o.created_at); m.set(k, [...(m.get(k) ?? []), o]); }
    return [...m.entries()];
  }, [history]);

  const reorder = async (o: Order) => {
    setBusyId(o.id);
    const ok = await loadReorder(o).catch(() => false);
    setBusyId(null);
    if (!ok) { toast.error('That station isn’t available now. Pick another.'); router.push('/stations'); return; }
    router.push('/checkout');
  };

  const hasBasket = hydrated && isOrderValid();

  return (
    <div>
      <PageHeader
        title="My orders"
        subtitle="Live refills and everything you’ve ordered before."
        action={<Link href="/stations" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full btn-dark text-[0.875rem]"><Plus className="w-4 h-4" /> New</Link>}
      />

      {orders === null ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-flame animate-spin" /></div>
      ) : (
        <div className="space-y-7">
          {/* At a glance */}
          {stats.refills > 0 && (
            <section className="grid grid-cols-3 gap-2.5" aria-label="Your refills">
              <Stat value={String(stats.refills)} label={stats.refills === 1 ? 'refill' : 'refills'} />
              <Stat value={`GH₵${Math.round(stats.spent).toLocaleString()}`} label="spent" />
              <Stat value={stats.daysSince === 0 ? 'Today' : `${stats.daysSince}d`} label="since last refill" />
            </section>
          )}

          {/* Gentle reminder after three weeks */}
          {stats.last && (stats.daysSince ?? 0) >= 21 && live.length === 0 && (
            <button onClick={() => reorder(stats.last!)} className="w-full glass-dark-surface glow-flame !rounded-[24px] p-5 flex items-center gap-4 text-left text-white">
              <CalendarClock className="w-8 h-8 text-flame-light shrink-0" />
              <span className="flex-1">
                <span className="block font-bold">It’s been {stats.daysSince} days since your last refill</span>
                <span className="block text-[0.8125rem] text-white/70">Running low? Order the same again in one tap.</span>
              </span>
              <span className="h-10 px-4 rounded-full bg-white text-ink font-bold text-[0.875rem] inline-flex items-center">Refill</span>
            </button>
          )}

          {hasBasket && (
            <Link href="/checkout" className="card-interactive p-4 flex items-center gap-3">
              <span className="icon-box icon-box-md icon-box-flame"><ShoppingBag className="w-5 h-5" /></span>
              <span className="flex-1 min-w-0">
                <span className="block font-bold text-ink">Finish your order</span>
                <span className="block text-[0.8125rem] text-ink-muted truncate">{shortLabel(basketOf(basket))} · {basket.stationName}</span>
              </span>
              <ChevronRight className="w-5 h-5 text-ink-faint" />
            </Link>
          )}

          {/* Live */}
          {(live.length > 0 || awaiting.length > 0) && (
            <section>
              <h2 className="text-label text-ink-faint mb-3">In progress</h2>
              <ul className="space-y-3">
                {[...live, ...awaiting].map(o => {
                  const items = itemsOf(o);
                  const step = STEP[o.status] ?? -1;
                  return (
                    <li key={o.id}>
                      <Link href={`/orders/tracking?orderId=${o.id}`} className="card-interactive block p-4 md:p-5">
                        <div className="flex items-center gap-3.5">
                          <Thumb kg={items[0].kg} count={items.reduce((n, i) => n + i.qty, 0)} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <StatusBadge status={o.status} />
                              <span className="text-[0.75rem] text-ink-faint">{day(o.created_at)}, {time(o.created_at)}</span>
                            </div>
                            <p className="mt-1 font-bold text-ink truncate">{shortLabel(items)}</p>
                            <p className="text-[0.8125rem] text-ink-muted truncate">{o.station_name}</p>
                          </div>
                          <span className="hidden sm:inline-flex h-10 px-4 items-center rounded-full btn-primary text-[0.875rem]">{o.status === 'pending' ? 'Pay now' : 'Track'}</span>
                          <ChevronRight className="sm:hidden w-5 h-5 text-ink-faint" />
                        </div>
                        {o.status === 'pending' && (
                          <p className="mt-3 text-[0.8125rem] text-flame-deep font-semibold">Payment not received · tap to finish</p>
                        )}
                        {step >= 0 && (
                          <div className="mt-4">
                            <div className="flex gap-1.5">
                              {STEP_LABEL.map((_, i) => (
                                <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-gradient-to-r from-flame to-flame-light' : 'bg-white/70 shadow-[inset_0_1px_2px_rgba(60,35,15,0.08)]'}`} />
                              ))}
                            </div>
                            <p className="mt-2 text-[0.75rem] text-ink-muted">Now: <b className="text-ink">{statusLabel(o.status)}</b></p>
                          </div>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* History */}
          {groups.map(([label, list]) => (
            <section key={label}>
              <h2 className="text-label text-ink-faint mb-3">{label}</h2>
              <ul className="card overflow-hidden divide-y divide-white/70">
                {list.map(o => {
                  const items = itemsOf(o);
                  return (
                    <li key={o.id} className="flex items-center gap-3 p-3.5">
                      <Link href={`/orders/tracking?orderId=${o.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                        <Thumb kg={items[0].kg} count={items.reduce((n, i) => n + i.qty, 0)} small />
                        <span className="flex-1 min-w-0">
                          <span className="block font-semibold text-ink text-[0.9375rem] truncate">{shortLabel(items)}</span>
                          <span className="block text-[0.8125rem] text-ink-faint truncate">{o.station_name} · {day(o.created_at)}</span>
                        </span>
                        <span className="text-right shrink-0">
                          <span className="block font-bold text-ink tabular-nums text-[0.9375rem]">GH₵{Number(o.total).toFixed(2)}</span>
                          {o.status === 'cancelled' && <span className="text-[0.75rem] text-[#DC2626]">Cancelled</span>}
                        </span>
                      </Link>
                      {o.status === 'delivered' && (
                        <button onClick={() => reorder(o)} disabled={busyId === o.id} aria-label="Order again"
                          className="w-10 h-10 shrink-0 rounded-full btn-ghost inline-flex items-center justify-center">
                          {busyId === o.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          {/* Empty */}
          {!live.length && !awaiting.length && !history.length && !hasBasket && (
            <div className="card p-8 md:p-10 text-center">
              <span className="icon-box icon-box-xl icon-box-flame mx-auto"><Flame className="w-8 h-8" /></span>
              <h2 className="mt-4 text-[1.25rem] font-bold text-ink">No refills yet</h2>
              <p className="mt-1 text-ink-muted max-w-xs mx-auto">Book your first refill and follow your cylinder live from here.</p>
              <Link href="/stations" className="mt-6 inline-flex h-12 px-6 items-center rounded-full btn-primary">Order gas</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="card p-3.5 text-center">
      <p className="text-[1.25rem] font-extrabold tracking-tight text-ink tabular-nums leading-none">{value}</p>
      <p className="mt-1.5 text-[0.75rem] text-ink-muted leading-tight">{label}</p>
    </div>
  );
}

function Thumb({ kg, count, small }: { kg: number; count: number; small?: boolean }) {
  return (
    <span className={`relative shrink-0 rounded-xl overflow-hidden bg-cream-deep ${small ? 'w-10 h-[52px]' : 'w-12 h-16'}`}>
      <Image src={cylinderPhoto(kg)} alt="" fill sizes="48px" className="object-cover" />
      {count > 1 && (
        <span className="absolute bottom-0.5 right-0.5 min-w-5 h-5 px-1 rounded-full bg-ink text-white text-[0.6875rem] font-bold flex items-center justify-center">×{count}</span>
      )}
    </span>
  );
}
