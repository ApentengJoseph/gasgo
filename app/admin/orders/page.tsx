'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Banknote, Smartphone, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAdmin, money, ago, PageHead, Tabs, Loading, ErrorNote, Empty, OrderPill } from '@/components/Admin/ui';

type Row = {
  id: string; order_number: string; status: string; payment_method: string | null; payment_status: string | null; total: number; quantity: number;
  station_name: string; delivery_address: string; contact_name: string | null; contact_phone: string | null; rider_name: string | null;
  created_at: string; refund_status: string | null; station_settled_at: string | null;
};
type Filter = 'live' | 'waiting' | 'unpaid' | 'delivered' | 'cancelled' | 'unsettled' | 'refunds' | 'all';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'live', label: 'In progress' }, { id: 'waiting', label: 'Waiting for rider' }, { id: 'unpaid', label: 'Unpaid' },
  { id: 'delivered', label: 'Delivered' }, { id: 'cancelled', label: 'Cancelled' }, { id: 'unsettled', label: 'Stations to pay' },
  { id: 'refunds', label: 'Refunds' }, { id: 'all', label: 'All' },
];

function OrdersInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const initial = (sp?.get('filter') as Filter) || 'live';
  const [filter, setFilter] = useState<Filter>(FILTERS.some(f => f.id === initial) ? initial : 'live');
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(0);
  useEffect(() => { const t = setTimeout(() => setDebounced(q), 350); return () => clearTimeout(t); }, [q]);
  useEffect(() => setPage(0), [filter, debounced]);
  useEffect(() => { router.replace(`/admin/orders?filter=${filter}`, { scroll: false }); }, [filter, router]);
  const { data, error, loading, reload } = useAdmin<{ orders: Row[]; total: number }>(
    `/api/admin/orders?filter=${filter}&page=${page}&q=${encodeURIComponent(debounced)}`, filter === 'live' || filter === 'waiting' ? 15000 : 0);

  return (
    <>
      <PageHead title="Orders" sub={data ? `${data.total} ${data.total === 1 ? 'order' : 'orders'}` : undefined}>
        <label className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Order no., name or phone" className="input-field !h-11 pl-10" aria-label="Search orders" />
        </label>
      </PageHead>
      <Tabs<Filter> value={filter} onChange={setFilter} items={FILTERS} />
      {error && <ErrorNote text={error} retry={reload} />}
      {loading && !data ? <Loading /> : data && (data.orders.length === 0 ? <Empty text="No orders here." /> : (
        <>
          {/* Phone: cards */}
          <ul className="md:hidden space-y-2.5">
            {data.orders.map(o => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="block rounded-3xl bg-white border border-line p-4 active:scale-[0.99] transition-transform">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-ink">#{o.order_number}</span><OrderPill status={o.status} />
                  </div>
                  <p className="mt-1.5 text-[0.875rem] text-ink truncate">{o.contact_name || 'Customer'} · {o.contact_phone}</p>
                  <p className="text-[0.8125rem] text-ink-muted truncate">{o.quantity} cyl. · {o.station_name} · {o.rider_name ? `Rider ${o.rider_name.split(' ')[0]}` : 'No rider'}</p>
                  <div className="mt-2 flex items-center justify-between text-[0.8125rem]">
                    <span className="inline-flex items-center gap-1.5 text-ink-muted"><Pay o={o} /></span>
                    <span className="font-bold text-ink tabular-nums">{money(o.total)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {/* Desktop: table */}
          <div className="hidden md:block rounded-3xl bg-white border border-line overflow-hidden">
            <table className="w-full text-[0.875rem]">
              <thead className="bg-cream/60 text-ink-muted text-left">
                <tr>{['Order', 'Customer', 'Station · rider', 'Payment', 'Total', 'Status', ''].map(h => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.orders.map(o => (
                  <tr key={o.id} className="hover:bg-cream/40 cursor-pointer" onClick={() => router.push(`/admin/orders/${o.id}`)}>
                    <td className="px-4 py-3"><b className="text-ink">#{o.order_number}</b><span className="block text-[0.75rem] text-ink-faint">{ago(o.created_at)}</span></td>
                    <td className="px-4 py-3 max-w-[200px]"><span className="block truncate text-ink">{o.contact_name || '—'}</span><span className="text-[0.75rem] text-ink-muted">{o.contact_phone}</span></td>
                    <td className="px-4 py-3 max-w-[220px]"><span className="block truncate text-ink">{o.station_name}</span><span className="text-[0.75rem] text-ink-muted">{o.rider_name || 'No rider yet'}</span></td>
                    <td className="px-4 py-3 text-ink-muted"><span className="inline-flex items-center gap-1.5"><Pay o={o} /></span></td>
                    <td className="px-4 py-3 font-bold tabular-nums text-ink">{money(o.total)}</td>
                    <td className="px-4 py-3"><OrderPill status={o.status} /></td>
                    <td className="px-4 py-3 text-ink-faint"><ChevronRight className="w-4 h-4" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.total > 50 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="h-10 w-10 rounded-full bg-white border border-line flex items-center justify-center disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-[0.875rem] text-ink-muted tabular-nums">Page {page + 1} of {Math.ceil(data.total / 50)}</span>
              <button disabled={(page + 1) * 50 >= data.total} onClick={() => setPage(p => p + 1)} className="h-10 w-10 rounded-full bg-white border border-line flex items-center justify-center disabled:opacity-40" aria-label="Next page"><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
        </>
      ))}
    </>
  );
}

function Pay({ o }: { o: Row }) {
  const cash = o.payment_method === 'cash';
  const Icon = cash ? Banknote : Smartphone;
  const state = o.refund_status === 'pending' ? 'refund pending' : o.refund_status === 'refunded' ? 'refunded'
    : o.payment_status === 'paid' ? 'paid' : cash ? 'at pickup' : 'not paid';
  return <><Icon className="w-3.5 h-3.5" />{cash ? 'Cash' : 'MoMo'} · {state}</>;
}

export default function AdminOrdersPage() {
  return <Suspense fallback={<Loading />}><OrdersInner /></Suspense>;
}
