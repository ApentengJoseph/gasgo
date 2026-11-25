'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import GasCylinder from '@/components/Icons/GasCylinder';
import { standardSizes } from '@/lib/data/stations';


export default function HeroBooking(_: { lowestPricePerKg?: number }) {
  const [kg, setKg] = useState(12);

  return (
    <div className="card-elevated p-6 md:p-7 !bg-white/70">
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
