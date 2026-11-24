'use client';

import InfoTip from '@/components/UI/InfoTip';
import { PRICING_CONFIG } from '@/lib/utils/constants';
import type { Quote } from '@/lib/utils/quote';

const money = (n: number) => `GH₵${n.toFixed(2)}`;

/** Simple price box: four lines, each with an ⓘ that explains how it's worked out. */
export default function QuoteBreakdown({ q, stationName, hasAddress = true }: { q: Quote; stationName?: string | null; hasAddress?: boolean }) {
  const cyl = `${q.cylinders} ${q.cylinders === 1 ? 'cylinder' : 'cylinders'}`;
  return (
    <div className="card p-5">
      <p className="text-label text-ink-faint mb-4">Your price</p>
      <dl className="space-y-3 text-[0.9375rem]">
        <Row label={`Gas · ${cyl}`} value={money(q.gas)}
          info={<>
            Refill price at {stationName ?? 'your station'}:
            {q.lines.map(l => <span key={l.kg} className="block">{l.qty} × {l.kg} kg — {money(l.amount)}</span>)}
          </>}
        />
        <Row label="Pickup & return" value={hasAddress ? money(q.delivery) : '—'}
          info={hasAddress
            ? <>One trip for your whole order: {money(PRICING_CONFIG.BASE_DELIVERY_FEE)} + {money(PRICING_CONFIG.DISTANCE_RATE)} per km. Your home ⇄ the station is {q.roundTripKm.toFixed(1)} km there and back.
                {q.bulk > 1 && <span className="block mt-1.5">Carrying {q.cylinders} cylinders adds {Math.round((q.bulk - 1) * 100)}% to the trip (15% per extra cylinder, never more than 75%).</span>}</>
            : <>Add your pickup address and we’ll work this out: {money(PRICING_CONFIG.BASE_DELIVERY_FEE)} + {money(PRICING_CONFIG.DISTANCE_RATE)} per km.</>}
        />
        <Row label="Safekeeping" value={money(q.safekeeping)}
          info={<>{money(PRICING_CONFIG.SAFEKEEPING_FEE)} per cylinder, so each one is handled and secured while it’s away from your home.</>}
        />
      </dl>
      <div className="mt-4 pt-4 border-t border-dashed border-line flex items-baseline justify-between">
        <span className="font-semibold text-ink">Total</span>
        <span className="text-[1.5rem] font-extrabold tracking-tight text-ink tabular-nums">{hasAddress ? money(q.total) : '—'}</span>
      </div>
    </div>
  );
}

function Row({ label, value, info }: { label: string; value: string; info: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-ink-muted inline-flex items-center gap-1">
        {label} <InfoTip label={label}>{info}</InfoTip>
      </dt>
      <dd className="font-semibold text-ink tabular-nums">{value}</dd>
    </div>
  );
}
