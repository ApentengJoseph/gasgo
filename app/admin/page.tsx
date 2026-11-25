'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bike, Wallet, MessageSquareText, Clock, RotateCcw, ChevronRight, AlertTriangle } from 'lucide-react';
import { useAdmin, money, PageHead, Tabs, Loading, ErrorNote, Stat } from '@/components/Admin/ui';

type Metrics = {
  range: string;
  orders: { total: number; delivered: number; live: number; cancelled: number; unpaid: number; completionRate: number; avgAcceptMinutes: number | null; avgDeliveryMinutes: number | null };
  money: { gmv: number; gas: number; fees: number; riders: number; profit: number; cashShare: number; owedToRiders: number; owedByRiders: number; stationDue: number };
  riders: { approved: number; pending: number; suspended: number; online: number };
  customers: { new: number; ordering: number; repeat: number };
  usage: { sessions: number; activeUsers: number; avgMinutes: number; mobileShare: number; signIns: number; devicesLinked: number; pageViews: number };
  funnel: { label: string; value: number }[];
  chart: { label: string; orders: number; delivered: number; revenue: number }[];
  topStations: { name: string; orders: number }[];
  attention: { pendingRiders: number; withdrawals: number; questions: number; waitingOrders: number; refunds: number };
};
type Range = 'today' | '7d' | '30d';

// Validated categorical slots (blue, aqua, orange) — see the money split legend
const SPLIT = { gas: '#2a78d6', riders: '#1baf7a', profit: '#eb6834' };

/** Control centre overview: what needs attention, money, orders, riders, customers and app usage. */
export default function AdminOverview() {
  const [range, setRange] = useState<Range>('7d');
  const { data: m, error, loading, reload } = useAdmin<Metrics>(`/api/admin/metrics?range=${range}`, 60000);
  const mins = (n: number | null) => (n == null ? '—' : n < 60 ? `${n} min` : `${Math.floor(n / 60)} h ${n % 60} min`);
  const span = range === 'today' ? 'today' : range === '7d' ? 'in the last 7 days' : 'in the last 30 days';

  return (
    <>
      <PageHead title="Overview" sub={`How GasRefill is doing ${span}`}>
        <Tabs<Range> value={range} onChange={setRange} items={[{ id: 'today', label: 'Today' }, { id: '7d', label: '7 days' }, { id: '30d', label: '30 days' }]} />
      </PageHead>
      {error && <ErrorNote text={error} retry={reload} />}
      {loading && !m ? <Loading /> : m && (
        <div className="space-y-6">
          <Attention a={m.attention} />

          {/* Money */}
          <section>
            <h2 className="text-label text-ink-faint mb-2.5">Money (delivered orders)</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat label="GasRefill made" value={money(m.money.profit)} tone="flame" hint="Fees kept after paying riders" />
              <Stat label="Riders earned" value={money(m.money.riders)} hint="Their share of pickup & return" />
              <Stat label="Customers paid" value={money(m.money.gmv)} hint={`${m.money.cashShare}% paid in cash`} />
              <Stat label="Gas (to stations)" value={money(m.money.gas)} hint="Passed straight to stations" />
            </div>
            <MoneySplit gas={m.money.gas} riders={m.money.riders} profit={m.money.profit} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <Stat label="We owe riders" value={money(m.money.owedToRiders)} hint="Wallet balances (all time)" />
              <Stat label="Riders hold for us" value={money(m.money.owedByRiders)} tone={m.money.owedByRiders > 0 ? 'red' : undefined} hint="Cash from cash orders to collect" />
              <Stat label="Owed to stations" value={money(m.money.stationDue)} hint="MoMo orders not yet settled" />
            </div>
          </section>

          {/* Orders */}
          <section>
            <h2 className="text-label text-ink-faint mb-2.5">Orders</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat label="Delivered" value={m.orders.delivered} tone="green" hint={`${m.orders.completionRate}% of placed orders`} />
              <Stat label="In progress now" value={m.orders.live} />
              <Stat label="Cancelled" value={m.orders.cancelled} />
              <Stat label="Not paid / abandoned" value={m.orders.unpaid} hint="Started but never confirmed" />
              <Stat label="Time to accept" value={mins(m.orders.avgAcceptMinutes)} hint="Confirmed → rider accepts" />
              <Stat label="Time to deliver" value={mins(m.orders.avgDeliveryMinutes)} hint="Confirmed → back at the door" />
              <Stat label="Customers who ordered" value={m.customers.ordering} hint={`${m.customers.repeat} came back again`} />
              <Stat label="New customers" value={m.customers.new} />
            </div>
            <OrdersChart rows={m.chart} hourly={m.range === 'today'} />
          </section>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Funnel */}
            <section>
              <h2 className="text-label text-ink-faint mb-2.5">From visit to delivery</h2>
              <Funnel steps={m.funnel} />
            </section>
            {/* Usage */}
            <section>
              <h2 className="text-label text-ink-faint mb-2.5">App use</h2>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Visits" value={m.usage.sessions} hint={`${m.usage.mobileShare}% on phones`} />
                <Stat label="Average time in app" value={`${m.usage.avgMinutes} min`} hint="Per visit" />
                <Stat label="Signed-in users" value={m.usage.activeUsers} />
                <Stat label="Staff sign-ins" value={m.usage.signIns} hint={`${m.usage.devicesLinked} devices linked`} />
              </div>
            </section>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <section>
              <h2 className="text-label text-ink-faint mb-2.5">Riders</h2>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Online now" value={m.riders.online} tone="green" />
                <Stat label="Approved" value={m.riders.approved} />
                <Stat label="Waiting for approval" value={m.riders.pending} tone={m.riders.pending ? 'flame' : undefined} />
                <Stat label="Paused" value={m.riders.suspended} />
              </div>
            </section>
            <section>
              <h2 className="text-label text-ink-faint mb-2.5">Busiest stations</h2>
              {m.topStations.length === 0 ? (
                <p className="rounded-3xl bg-white border border-line p-5 text-ink-muted">No deliveries {span} yet.</p>
              ) : (
                <ol className="rounded-3xl bg-white border border-line divide-y divide-line">
                  {m.topStations.map((s, i) => (
                    <li key={s.name} className="flex items-center gap-3 px-4 py-3">
                      <span className="w-7 h-7 rounded-full bg-cream text-ink font-bold text-[0.8125rem] flex items-center justify-center">{i + 1}</span>
                      <span className="flex-1 font-semibold text-ink truncate">{s.name}</span>
                      <span className="tabular-nums text-ink-muted">{s.orders} deliveries</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        </div>
      )}
    </>
  );
}

function Attention({ a }: { a: Metrics['attention'] }) {
  const items = [
    { n: a.waitingOrders, label: 'orders waiting 10+ min for a rider', href: '/admin/orders?filter=waiting', icon: Clock, urgent: true },
    { n: a.pendingRiders, label: 'rider applications to review', href: '/admin/riders', icon: Bike },
    { n: a.withdrawals, label: 'rider payouts to send', href: '/admin/payouts', icon: Wallet },
    { n: a.questions, label: 'customer questions to answer', href: '/admin/questions', icon: MessageSquareText },
    { n: a.refunds, label: 'refunds to check', href: '/admin/orders?filter=refunds', icon: RotateCcw, urgent: true },
  ].filter(i => i.n > 0);
  if (!items.length) return <p className="rounded-3xl bg-[#E8F6EC] text-[#15803D] font-semibold px-5 py-4">All clear — nothing is waiting for you.</p>;
  return (
    <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map(({ n, label, href, icon: Icon, urgent }) => (
        <Link key={href} href={href} className={`rounded-3xl p-4 flex items-center gap-3 border ${urgent ? 'bg-[#FFF4EC] border-[#FFD9BD]' : 'bg-white border-line'} hover:shadow-md transition-shadow`}>
          <span className={`w-10 h-10 rounded-2xl flex items-center justify-center ${urgent ? 'bg-flame text-white' : 'bg-cream text-ink'}`}>
            {urgent ? <AlertTriangle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
          </span>
          <span className="flex-1 text-[0.9375rem] text-ink"><b className="text-[1.125rem] tabular-nums">{n}</b> {label}</span>
          <ChevronRight className="w-4 h-4 text-ink-faint" />
        </Link>
      ))}
    </section>
  );
}

/** Where each cedi of delivered orders went: stations, riders, GasRefill. Legend carries the values (no colour-only reading). */
function MoneySplit({ gas, riders, profit }: { gas: number; riders: number; profit: number }) {
  const total = gas + riders + profit;
  if (total <= 0) return null;
  const parts = [
    { key: 'gas', label: 'Stations (gas)', v: gas, c: SPLIT.gas },
    { key: 'riders', label: 'Riders', v: riders, c: SPLIT.riders },
    { key: 'profit', label: 'GasRefill', v: profit, c: SPLIT.profit },
  ];
  return (
    <div className="mt-3 rounded-3xl bg-white border border-line p-4">
      <p className="text-[0.875rem] font-semibold text-ink mb-3">Where the money went</p>
      <div className="flex h-4 gap-[2px] rounded-[4px] overflow-hidden" role="img" aria-label={parts.map(p => `${p.label} ${money(p.v)}`).join(', ')}>
        {parts.filter(p => p.v > 0).map(p => (
          <div key={p.key} style={{ width: `${(p.v / total) * 100}%`, background: p.c }} title={`${p.label}: ${money(p.v)} (${Math.round(p.v / total * 100)}%)`} />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.8125rem]">
        {parts.map(p => (
          <li key={p.key} className="inline-flex items-center gap-2 text-ink-muted">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.c }} />
            {p.label} <b className="text-ink tabular-nums">{money(p.v)}</b> <span className="text-ink-faint">({Math.round(p.v / total * 100)}%)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Orders per day (or hour today). One series; hover/tap a bar for the numbers. */
function OrdersChart({ rows, hourly }: { rows: Metrics['chart']; hourly: boolean }) {
  const max = Math.max(1, ...rows.map(r => r.orders));
  const [hover, setHover] = useState<number | null>(null);
  const label = (r: Metrics['chart'][number]) => hourly ? `${r.label}:00` : new Date(`${r.label}T00:00:00Z`).toLocaleDateString('en-GH', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
  const h = hover != null ? rows[hover] : null;
  const total = rows.reduce((s, r) => s + r.orders, 0);
  return (
    <div className="mt-3 rounded-3xl bg-white border border-line p-4">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <p className="text-[0.875rem] font-semibold text-ink">Orders placed {hourly ? 'by hour' : 'by day'}</p>
        <p className="text-[0.8125rem] text-ink-muted tabular-nums min-h-5">
          {h ? <>{label(h)} · <b className="text-ink">{h.orders}</b> placed · {h.delivered} delivered · {money(h.revenue)} made</> : <>{total} in total</>}
        </p>
      </div>
      <div className="relative h-40 flex items-end gap-[2px] border-b border-line" onMouseLeave={() => setHover(null)}>
        {[0.5, 1].map(f => <div key={f} className="absolute inset-x-0 border-t border-dashed border-line" style={{ bottom: `${f * 100}%` }} aria-hidden />)}
        {rows.map((r, i) => (
          <button key={r.label} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onClick={() => setHover(i)}
            aria-label={`${label(r)}: ${r.orders} orders, ${r.delivered} delivered`}
            className="relative flex-1 h-full flex items-end group">
            <span className={`w-full rounded-t-[4px] transition-colors ${hover === i ? 'bg-flame' : 'bg-ink'}`}
              style={{ height: r.orders ? `${Math.max(3, (r.orders / max) * 100)}%` : '0%' }} />
          </button>
        ))}
        <span className="absolute -left-0 -top-1 text-[0.6875rem] text-ink-faint tabular-nums bg-white pr-1">{max}</span>
      </div>
      <div className="flex justify-between mt-1.5 text-[0.6875rem] text-ink-faint">
        <span>{label(rows[0])}</span><span>{label(rows[rows.length - 1])}</span>
      </div>
    </div>
  );
}

function Funnel({ steps }: { steps: Metrics['funnel'] }) {
  const top = Math.max(1, steps[0]?.value ?? 1);
  return (
    <ol className="rounded-3xl bg-white border border-line p-4 space-y-3">
      {steps.map((s, i) => {
        const prev = i ? steps[i - 1].value : 0;
        return (
          <li key={s.label}>
            <div className="flex justify-between text-[0.875rem] mb-1">
              <span className="font-semibold text-ink">{s.label}</span>
              <span className="tabular-nums text-ink-muted"><b className="text-ink">{s.value}</b>{i > 0 && prev > 0 && <> · {Math.round(s.value / prev * 100)}%</>}</span>
            </div>
            <div className="h-2.5 rounded-full bg-cream overflow-hidden">
              <div className="h-full rounded-full bg-flame" style={{ width: `${Math.min(100, (s.value / top) * 100)}%` }} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
