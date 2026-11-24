'use client';

interface PricingBreakdownProps {
  gasCost: number;
  deliveryFee: number;
  safekeeping: number;
  distance?: number;
  isRoundtrip?: boolean;
  baseDeliveryFee?: number;
  distanceFee?: number;
  gasLabel?: string;
}

const money = (n: number) => `GH₵${n.toFixed(2)}`;

/** Itemised price: gas, delivery (base + distance), safekeeping, total. */
export default function PricingBreakdown({
  gasCost,
  deliveryFee,
  safekeeping,
  distance,
  baseDeliveryFee = 10,
  distanceFee = 0,
  gasLabel = 'Gas',
}: PricingBreakdownProps) {
  const total = gasCost + deliveryFee + safekeeping;
  return (
    <div className="card p-5">
      <dl className="space-y-2.5 text-[0.9375rem]">
        <Row label={gasLabel} value={money(gasCost)} />
        <Row
          label="Delivery"
          hint={distance ? `GH₵${baseDeliveryFee.toFixed(0)} + ${distance.toFixed(1)} km round trip` : undefined}
          value={money(deliveryFee || baseDeliveryFee + distanceFee)}
        />
        <Row label="Safekeeping" hint="Cylinder care in transit" value={money(safekeeping)} />
      </dl>
      <div className="mt-4 pt-4 border-t border-dashed border-line flex items-baseline justify-between">
        <span className="font-semibold text-ink">Total</span>
        <span className="text-[1.5rem] font-extrabold tracking-tight text-ink tabular-nums">{money(total)}</span>
      </div>
    </div>
  );
}

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-ink-muted">
        {label}
        {hint && <span className="block text-[0.75rem] text-ink-faint">{hint}</span>}
      </dt>
      <dd className="font-semibold text-ink tabular-nums">{value}</dd>
    </div>
  );
}
