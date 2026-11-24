import { Check, Phone, Bike } from 'lucide-react';

const ROUTE = 'M70 300 C 120 250, 150 230, 200 215 S 290 170, 320 140 S 390 90, 430 70';

const steps = [
  { label: 'Picked up', done: true },
  { label: 'Refilled', done: true },
  { label: 'Bringing it back', current: true },
  { label: 'Delivered', done: false },
];

/** Illustrative live-tracking card for the homepage (no JS, animates with SVG). */
export default function TrackingPreview() {
  return (
    <div className="relative rounded-[28px] overflow-hidden bg-[#F3EADF] aspect-[4/3.4] md:aspect-[4/3.2] shadow-[0_30px_80px_-30px_rgba(23,19,15,0.45)]">
      <svg viewBox="0 0 500 380" className="absolute inset-0 w-full h-full" aria-hidden="true">
        {/* blocks */}
        <g fill="#EADFD1">
          <rect x="20"  y="20"  width="120" height="90" rx="10" />
          <rect x="170" y="10"  width="110" height="70" rx="10" />
          <rect x="320" y="170" width="150" height="90" rx="10" />
          <rect x="30"  y="140" width="100" height="80" rx="10" />
          <rect x="210" y="270" width="120" height="90" rx="10" />
          <rect x="370" y="290" width="110" height="70" rx="10" />
        </g>
        {/* roads */}
        <g stroke="#FFFFFF" strokeWidth="14" fill="none" strokeLinecap="round">
          <path d="M0 125 H500" />
          <path d="M155 0 V380" />
          <path d="M0 250 C 150 240, 300 270, 500 265" />
          <path d="M300 0 C 300 120, 350 200, 360 380" />
        </g>
        {/* route */}
        <path d={ROUTE} stroke="#FF6B00" strokeOpacity="0.22" strokeWidth="12" fill="none" strokeLinecap="round" />
        <path d={ROUTE} stroke="#FF6B00" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="2 9" />
        {/* station */}
        <g transform="translate(70 300)">
          <circle r="14" fill="#17130F" />
          <text y="5" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="700">S</text>
        </g>
        {/* home */}
        <g transform="translate(430 70)">
          <circle r="22" fill="#FF6B00" opacity="0.18" />
          <circle r="12" fill="#FF6B00" />
          <circle r="4.5" fill="#fff" />
        </g>
        {/* rider */}
        <g className="tracking-rider">
          <circle r="16" fill="#fff" stroke="#FF6B00" strokeWidth="3" />
          <circle r="5" fill="#FF6B00" />
          <animateMotion dur="9s" repeatCount="indefinite" path={ROUTE} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
        </g>
      </svg>

      <span className="absolute top-4 left-4 text-[0.6875rem] font-semibold uppercase tracking-wider text-[#8A7F74] bg-white/80 rounded-full px-2.5 py-1">
        Preview
      </span>

      <div className="absolute left-3 right-3 bottom-3 md:left-5 md:right-5 md:bottom-5">
        <TrackingStatusCard />
      </div>
    </div>
  );
}

/** The rider status card on its own, e.g. laid over a photo. */
export function TrackingStatusCard() {
  return (
        <div className="rounded-[22px] p-4 bg-white/75 backdrop-blur-2xl border border-white/70 shadow-[inset_0_1px_0_#fff,0_18px_44px_-14px_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-[var(--flame-soft)] flex items-center justify-center text-[var(--flame-deep)]">
              <Bike className="w-5 h-5" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[0.75rem] font-medium text-[#8A7F74]">Your full cylinder is on its way back</p>
              <p className="font-display text-[1.125rem] font-bold text-[var(--ink)] leading-tight">Back in about 8 min</p>
            </div>
            <span className="w-10 h-10 rounded-full bg-[var(--ink)] text-white flex items-center justify-center" aria-hidden="true">
              <Phone className="w-4 h-4" />
            </span>
          </div>
          <ol className="mt-3.5 grid grid-cols-4 gap-1.5">
            {steps.map(s => (
              <li key={s.label} className="flex flex-col gap-1.5">
                <span className={`h-1.5 rounded-full ${s.done ? 'bg-[var(--flame)]' : s.current ? 'bg-[var(--flame)]/40' : 'bg-[#EEE7DF]'}`} />
                <span className={`text-[0.6875rem] leading-tight ${s.done || s.current ? 'text-[var(--ink)] font-medium' : 'text-[#A69B90]'}`}>
                  {s.done && <Check className="inline w-3 h-3 mr-0.5 -mt-0.5 text-[var(--flame)]" />}
                  {s.label}
                </span>
              </li>
            ))}
          </ol>
        </div>
  );
}
