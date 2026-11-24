'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShoppingBag, ChevronRight } from 'lucide-react';
import GasCylinder from '@/components/Icons/GasCylinder';
import { useGuestOrder, useOrderHydrated } from '@/lib/store/guestOrder';
import { standardSizes } from '@/lib/data/stations';


export default function HeroBooking(_: { lowestPricePerKg?: number }) {
  const [kg, setKg] = useState(12);
  const { order, isOrderValid } = useGuestOrder();
  const hydrated = useOrderHydrated();
  const [hasOrder, setHasOrder] = useState(false);

  useEffect(() => { if (hydrated) setHasOrder(isOrderValid()); }, [hydrated, isOrderValid, order]);


  return (
    <div className="card-elevated p-6 md:p-7 !bg-white/70">
      {hasOrder && (
        <Link
          href="/checkout"
          className="flex items-center gap-3 mb-5 p-3.5 rounded-2xl bg-[var(--cream)] border border-[var(--cream-deep)] hover:border-[var(--flame)] transition-colors"
        >
          <span className="w-10 h-10 rounded-xl bg-[var(--flame-soft)] text-[var(--flame-deep)] flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[0.75rem] font-semibold text-[var(--flame-deep)]">Order in progress</span>
            <span className="block text-[0.875rem] font-semibold text-[var(--ink)] truncate">
              {order.cylinderName} · GH₵{order.estimatedPrice?.toFixed(2)}
            </span>
          </span>
          <ChevronRight className="w-4 h-4 text-[#A39789]" />
        </Link>
      )}

      <p className="text-[1.25rem] font-bold text-ink leading-tight">What size is your cylinder?</p>
      <p className="text-[0.875rem] text-ink-muted mt-1 mb-5">Pick a size to start. No sign-up needed.</p>

      <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Cylinder size">
        {standardSizes.map(s => {
          const active = kg === s.kg;
          return (
            <button
              key={s.kg}
              role="radio"
              aria-checked={active}
              onClick={() => setKg(s.kg)}
              className={`glass !rounded-[18px] flex flex-col items-center p-1.5 pb-2 transition-all ${active ? 'card-selected' : 'hover:!bg-white/80'}`}
            >
              <GasCylinder kg={s.kg} height={60} className="mb-1.5 !w-full !h-[60px]" />
              <span className="text-[0.875rem] font-bold text-ink">{s.label}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-[0.8125rem] text-ink-muted text-center">You’ll see the exact price before you pay.</p>

      <Link
        href={`/stations?size=${kg}`}
        className="mt-4 w-full h-14 rounded-full btn-primary text-[1rem]"
      >
        Order this size <ArrowRight className="w-5 h-5" />
      </Link>

      <div className="mt-4 flex items-center justify-center gap-3">
        <span className="text-[0.75rem] text-[#8A7F74]">Pay with</span>
        <Image src="/mtn-log.png" alt="MTN MoMo" width={40} height={24} className="h-6 w-auto object-contain" />
        <Image src="/telecel-logo.png" alt="Telecel Cash" width={40} height={24} className="h-6 w-auto object-contain" />
        <Image src="/airtel-tigo-log.png" alt="AirtelTigo Money" width={40} height={24} className="h-6 w-auto object-contain" />
      </div>
    </div>
  );
}
