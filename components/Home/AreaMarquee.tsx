import { MapPin } from 'lucide-react';
import { serviceAreas } from '@/lib/data/stations';

/** Slow-moving strip of the neighbourhoods we serve (pauses on hover, static with reduced motion). */
export default function AreaMarquee() {
  const items = [...serviceAreas, ...serviceAreas];
  return (
    <div className="marquee relative overflow-hidden border-y border-line bg-white/60 py-3.5" aria-label={`We pick up across ${serviceAreas.join(', ')}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent z-10" />
      <ul className="marquee-track flex w-max gap-8" aria-hidden="true">
        {items.map((a, i) => (
          <li key={i} className="inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-ink whitespace-nowrap">
            <MapPin className="w-4 h-4 text-flame" /> {a}
          </li>
        ))}
      </ul>
    </div>
  );
}
