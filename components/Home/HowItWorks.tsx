import Link from 'next/link';
import { Smartphone, Flame, Home as HomeIcon, ArrowRight, Clock, Store, MapPin, Bike, PackageCheck } from 'lucide-react';

const steps = [
  {
    icon: Smartphone,
    title: 'Book on your phone',
    body: 'Choose your cylinder sizes and the station you trust. See the full price before you pay.',
    chip: { icon: Clock, text: 'About a minute' },
  },
  {
    icon: Bike,
    title: 'We pick it up',
    body: 'A GasRefill rider comes to your house and collects your empty cylinder.',
    chip: { icon: HomeIcon, text: 'From your door' },
  },
  {
    icon: Flame,
    title: 'We refill it',
    body: 'Your cylinder is filled at the partner station you chose. No queue for you.',
    chip: { icon: Store, text: 'At your chosen station' },
  },
  {
    icon: PackageCheck,
    title: 'Back at your door',
    body: 'Your full cylinder comes straight back. Follow every step live on the map.',
    chip: { icon: MapPin, text: 'Tracked live' },
  },
];

/**
 * One connected flow: a gradient line runs through all three steps
 * (left→right on desktop, top→bottom on phones):
 * book → pick up the empty cylinder at home → refill at the station → bring it back.
 */
export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 relative overflow-hidden bg-gradient-to-b from-white via-[#FFF7EF] to-white">
      <div aria-hidden="true" className="absolute left-1/2 top-24 -translate-x-1/2 w-[46rem] h-[22rem] rounded-full opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, rgba(255,138,61,0.25), transparent)' }} />

      <div className="relative max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <div className="text-center max-w-xl mx-auto">
          <p className="text-[0.75rem] font-bold uppercase tracking-[0.16em] text-flame-deep">How it works</p>
          <h2 className="mt-2.5 text-[2rem] md:text-[2.75rem] leading-[1.02] font-extrabold tracking-[-0.035em]">
            We collect it empty. We bring it back full.
          </h2>
        </div>

        <ol className="relative mt-12 md:mt-16 grid gap-0 md:gap-5 md:grid-cols-4">
          {/* the flow line */}
          <span aria-hidden="true"
            className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-[3px] rounded-full bg-gradient-to-r from-flame via-flame-light to-[#FFC999]" />
          <span aria-hidden="true"
            className="md:hidden absolute left-10 top-10 bottom-10 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-flame via-flame-light to-[#FFC999]" />

          {steps.map(({ icon: Icon, title, body, chip }, i) => (
            <li key={title} className="relative flex md:flex-col md:items-center md:text-center gap-5 md:gap-0 pb-10 md:pb-0 last:pb-0">
              {/* disc on the line */}
              <span className="relative z-10 shrink-0 w-20 h-20 rounded-full glass !bg-white/80 flex items-center justify-center">
                <span className="w-14 h-14 rounded-full bg-gradient-to-br from-flame-light to-flame-deep flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_10px_22px_-8px_rgba(255,107,0,0.75)]">
                  <Icon className="w-6 h-6 text-white" />
                </span>
                <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-ink text-white text-[0.8125rem] font-bold flex items-center justify-center ring-4 ring-white">
                  {i + 1}
                </span>
              </span>

              <div className="pt-2 md:pt-6 md:max-w-[15rem]">
                <h3 className="text-[1.25rem] md:text-[1.375rem] font-extrabold tracking-tight">{title}</h3>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-muted">{body}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 glass !rounded-full px-3 py-1.5 text-[0.8125rem] font-semibold text-ink">
                  <chip.icon className="w-3.5 h-3.5 text-flame" /> {chip.text}
                </span>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 md:mt-16 flex justify-center">
          <Link href="#book" className="inline-flex items-center gap-2 h-14 px-7 rounded-full btn-primary text-[1rem]">
            Start with step 1 <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
