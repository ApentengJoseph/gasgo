import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, MapPin, Smartphone, Receipt, Store, Footprints,
  Phone, MessageCircle, Plus, Check, Banknote,
} from 'lucide-react';
import HeroBooking from '@/components/Home/HeroBooking';
import { TrackingStatusCard } from '@/components/Home/TrackingPreview';
import HowItWorks from '@/components/Home/HowItWorks';
import Reveal from '@/components/UI/Reveal';
import AreaMarquee from '@/components/Home/AreaMarquee';
import HomeStickyCta from '@/components/Home/HomeStickyCta';
import AskQuestion from '@/components/Home/AskQuestion';
import { Logo } from '@/components/Navigation/TopNav';
import { serviceAreas, priceFor } from '@/lib/data/stations';
import { getStations } from '@/lib/data/getStations';
import officeImg from '@/public/images/office-work.jpg';
import boyImg from '@/public/images/hero-boy-cylinder.jpg';
import riderImg from '@/public/images/gas-delivery.jpg';
import streetImg from '@/public/images/street-ghana.jpg';

export const revalidate = 300; // refresh station prices every 5 minutes

import { SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL, WHATSAPP_NUMBER, BUSINESS_REG_NO } from '@/lib/utils/constants';


const faqs = [
  { q: 'How does GasRefill work?', a: 'Book a refill and choose a partner station. A GasRefill rider comes to your house, picks up your empty cylinder, refills it at that station and brings it back full. You can follow every step live.' },
  { q: 'How much does delivery cost?', a: 'You pay the station’s gas price, plus a GH₵10 delivery fee, a GH₵5 safekeeping fee, and GH₵1.80 per km for the trip between the station and you (there and back). The full breakdown is shown before you pay.' },
  { q: 'Which areas do you cover?', a: `The Koforidua area, including ${serviceAreas.slice(1, 7).join(', ')} and nearby. If your address is outside our area, we tell you before you pay.` },
  { q: 'How do I pay?', a: 'Mobile Money (MTN, Telecel or AirtelTigo, processed securely by Paystack) or cash to the rider when they pick up your cylinder.' },
  { q: 'Do I need an account?', a: 'No. Choose your size and station, then add your name and phone number at checkout. You can save an account later if you want.' },
];

const eyebrow = 'text-[0.75rem] font-bold uppercase tracking-[0.16em] text-flame-deep';
const h2 = 'text-[2rem] md:text-[2.75rem] leading-[1.02] font-extrabold tracking-[-0.035em]';

export default async function HomePage() {
  const { stations } = await getStations();
  const byPrice = [...stations].sort((a, b) => a.pricePerKg - b.pricePerKg);
  const lowestPerKg = byPrice[0]?.pricePerKg ?? 0;

  const benefits = [
    { icon: Footprints, title: 'No carrying',     body: 'We collect from your door and bring it back.' },
    { icon: Store,      title: 'Your station',    body: `${stations.length} partner stations to choose from.` },
    { icon: Receipt,    title: 'Clear prices',    body: 'Every cedi shown before you pay.' },
    { icon: Smartphone, title: 'MoMo or cash',    body: 'MTN, Telecel, AirtelTigo, or cash.' },
  ];

  return (
    <div className="bg-white text-ink">

      {/* ── Hero: the problem — carrying gas to the station ── */}
      <section className="relative isolate overflow-hidden bg-ink text-white min-h-[88svh] lg:min-h-[680px] flex">
        <div className="absolute inset-x-0 top-0 h-[60%] lg:h-auto lg:bottom-0 lg:left-[46%] -z-20">
          <Image
            src={boyImg}
            alt="A boy carrying a red gas cylinder on his shoulder"
            fill
            priority
            placeholder="blur"
            sizes="(min-width: 1024px) 54vw, 100vw"
            className="object-cover object-[50%_18%] lg:object-[50%_35%]"
          />
        </div>
        <div aria-hidden="true" className="absolute inset-0 -z-10 lg:hidden"
          style={{ background: 'linear-gradient(180deg, rgba(23,19,15,0.45) 0%, rgba(23,19,15,0) 18%, rgba(23,19,15,0) 34%, rgba(23,19,15,0.85) 52%, #17130F 62%)' }} />
        <div aria-hidden="true" className="absolute inset-0 -z-10 hidden lg:block"
          style={{ background: 'linear-gradient(90deg, #17130F 0%, #17130F 44%, rgba(23,19,15,0.55) 56%, rgba(23,19,15,0) 72%)' }} />
        <div aria-hidden="true" className="absolute -bottom-40 -left-40 w-[40rem] h-[40rem] rounded-full -z-10 opacity-70"
          style={{ background: 'radial-gradient(closest-side, rgba(255,107,0,0.45), rgba(255,107,0,0))' }} />

        <div className="w-full max-w-6xl mx-auto px-5 md:px-8 pt-24 pb-12 md:pb-20 flex flex-col justify-end lg:justify-center">
          <div className="max-w-lg">
            <span className="rise inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3.5 py-1.5 text-[0.8125rem] font-semibold">
              <MapPin className="w-3.5 h-3.5 text-[#FFB27A]" /> Gas delivery in Koforidua
            </span>
            <h1 style={{ animationDelay: '90ms' }} className="rise mt-5 text-[2.75rem] leading-[0.95] sm:text-[3.75rem] lg:text-[4.5rem] font-extrabold tracking-[-0.045em]">
              Stop carrying gas to the{' '}
              <span className="bg-gradient-to-r from-[#FF7A1A] via-[#FF9A4D] to-[#FFC999] bg-clip-text text-transparent">station.</span>
            </h1>
            <p style={{ animationDelay: '180ms' }} className="rise mt-4 md:mt-6 text-[1.0625rem] md:text-[1.1875rem] leading-snug text-white/80 max-w-md">
              Book on your phone. A rider picks up your empty cylinder, refills it at the station you choose and brings it back full.
            </p>
            <div style={{ animationDelay: '270ms' }} className="rise mt-7 flex flex-col sm:flex-row gap-3">
              <Link href="#book" className="inline-flex items-center justify-center gap-2 h-14 px-7 rounded-full btn-primary text-[1rem]">
                Get my price <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#how-it-works" className="inline-flex items-center justify-center h-14 px-7 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white font-semibold text-[1rem] transition-colors">
                How it works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Booking: the solution, next to the result ── */}
      <section id="book" className="scroll-mt-20 bg-gradient-to-b from-[#FFF4EA] to-white">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-14 md:py-20 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="relative rounded-[28px] overflow-hidden min-h-[320px] md:min-h-[500px] order-2 lg:order-1">
            <Image src={officeImg} alt="A woman working on her laptop in an office" fill placeholder="blur" loading="eager"
              sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-[40%_50%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(23,19,15,0.85)] via-[rgba(23,19,15,0.1)] to-transparent" />
            <div className="absolute left-6 right-6 bottom-6 md:left-8 md:bottom-8 text-white">
              <p className="text-[1.625rem] md:text-[2.125rem] leading-[1] font-extrabold tracking-tight">You work.<br />We refill.</p>
              <p className="mt-2 text-white/80 text-[0.9375rem]">We pick up your cylinder, refill it and bring it back while you get on with your day.</p>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <p className={eyebrow}>Your price</p>
            <h2 className={`${h2} mt-2.5 mb-6`}>Book in a minute.</h2>
            <HeroBooking lowestPricePerKg={lowestPerKg} />
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="border-y border-line">
        <ul className="max-w-6xl mx-auto px-5 md:px-8 py-8 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6">
          {benefits.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="icon-box icon-box-md icon-box-flame"><Icon className="w-5 h-5" /></span>
              <span>
                <span className="block font-bold text-[0.9375rem]">{title}</span>
                <span className="block text-[0.8125rem] text-ink-muted leading-snug mt-0.5">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <AreaMarquee />

      <Reveal><HowItWorks /></Reveal>

      {/* ── Rider + live tracking ── */}
      <Reveal>
      <section className="px-3 md:px-6">
        <div className="max-w-7xl mx-auto rounded-[32px] overflow-hidden bg-gradient-to-br from-[#FFF4EA] via-[#FFE9D6] to-[#FFD2AE]">
          <div className="grid lg:grid-cols-2 items-stretch">
            <div className="px-6 md:px-14 py-12 md:py-16 flex flex-col justify-center">
              <p className={eyebrow}>Live tracking</p>
              <h2 className={`${h2} mt-2.5`}>Watch it come to you.</h2>
              <p className="mt-4 text-[1.0625rem] leading-relaxed text-[#5E544A] max-w-md">
                Follow your cylinder from your door to the station and back, with every step shown as it happens.
              </p>
              <ul className="mt-6 space-y-2.5">
                {['Live rider location', 'Status at every step', 'Call or WhatsApp your rider'].map(t => (
                  <li key={t} className="flex items-center gap-3 text-[1rem] font-medium">
                    <span className="w-6 h-6 rounded-full bg-flame flex items-center justify-center"><Check className="w-3.5 h-3.5 text-white" strokeWidth={3} /></span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative min-h-[460px] md:min-h-[560px]">
              <Image src={riderImg} alt="A GasRefill delivery worker carrying a gas cylinder from the delivery truck" fill placeholder="blur" loading="eager"
                sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-[55%_50%]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(23,19,15,0.55)] via-transparent to-transparent" />
              <div className="absolute left-4 right-4 bottom-4 md:left-10 md:right-10 md:bottom-10 max-w-md">
                <TrackingStatusCard />
              </div>
            </div>
          </div>
        </div>
      </section>

      </Reveal>

      {/* ── Station prices ── */}
      <Reveal>
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24 grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16 items-start">
        <div className="lg:sticky lg:top-28">
          <p className={eyebrow}>Prices</p>
          <h2 className={`${h2} mt-2.5`}>Compare. Choose. Save.</h2>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-muted">Every partner station in Koforidua, cheapest first.</p>
          <Link href="/stations" className="mt-7 inline-flex items-center gap-2 h-12 px-6 rounded-full btn-dark">
            See stations near you <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="rounded-[24px] border border-line overflow-hidden">
          <div className="grid grid-cols-[1fr_auto] gap-x-6 px-5 md:px-6 py-3 bg-[#FBF7F3] text-label text-ink-faint">
            <span>Station</span><span className="text-right">12 kg refill</span>
          </div>
          <ul>
            {byPrice.map(s => {
              const lowest = s.pricePerKg === lowestPerKg;
              return (
                <li key={s.id} className="grid grid-cols-[1fr_auto] gap-x-6 items-center px-5 md:px-6 py-4 border-t border-line">
                  <div className="min-w-0">
                    <p className="font-bold text-[0.9375rem] md:text-[1rem] truncate">
                      {s.name}
                      {lowest && <span className="ml-2 align-middle pill bg-gradient-to-r from-flame to-flame-light text-white">Lowest</span>}
                    </p>
                    <p className="text-[0.8125rem] text-ink-faint truncate">{s.address} · GH₵{s.pricePerKg.toFixed(2)}/kg</p>
                  </div>
                  <span className={`text-right tabular-nums font-extrabold text-[1.125rem] md:text-[1.25rem] ${lowest ? 'text-flame-deep' : ''}`}>
                    GH₵{priceFor(s, 12).toFixed(0)}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="px-5 md:px-6 py-3 bg-[#FBF7F3] text-[0.8125rem] text-ink-faint border-t border-line">
            Gas price only. Delivery and distance are added at checkout.
          </p>
        </div>
      </section>

      </Reveal>

      {/* ── Areas ── */}
      <section className="relative isolate overflow-hidden text-white">
        <Image src={streetImg} alt="A residential street in Ghana with a motor tricycle" fill placeholder="blur" loading="eager" sizes="100vw" className="object-cover -z-20" />
        <div aria-hidden="true" className="absolute inset-0 -z-10"
          style={{ background: 'linear-gradient(100deg, rgba(23,19,15,0.9) 0%, rgba(23,19,15,0.6) 45%, rgba(226,86,0,0.25) 100%)' }} />
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
          <p className="text-[0.75rem] font-bold uppercase tracking-[0.16em] text-[#FFB27A]">Where we deliver</p>
          <h2 className={`${h2} mt-2.5 max-w-2xl`}>Made for Koforidua.</h2>
          <p className="mt-4 text-[1.0625rem] text-white/75 max-w-lg">One town, served properly. These are the areas we cover today.</p>
          <ul className="mt-8 flex flex-wrap gap-2 max-w-3xl">
            {serviceAreas.map(a => (
              <li key={a} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.12] backdrop-blur border border-white/20 px-3.5 py-2 text-[0.875rem] font-semibold">
                <MapPin className="w-3.5 h-3.5 text-[#FFB27A]" /> {a}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── FAQ ── */}
      <Reveal>
      <section className="max-w-3xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <h2 className={`${h2} text-center`}>Questions?</h2>
        <div className="mt-10 divide-y divide-line border-y border-line">
          {faqs.map(f => (
            <details key={f.q} className="group py-5">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-[1.0625rem] md:text-[1.1875rem] font-bold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="w-8 h-8 shrink-0 rounded-full bg-cream flex items-center justify-center transition-transform group-open:rotate-45">
                  <Plus className="w-4 h-4 text-flame-deep" />
                </span>
              </summary>
              <p className="mt-3 text-[1rem] leading-relaxed text-ink-muted pr-10">{f.a}</p>
            </details>
          ))}
        </div>
        <AskQuestion />
      </section>

      </Reveal>

      {/* ── Final CTA ── */}
      <Reveal>
      <section className="px-3 md:px-6 pb-3 md:pb-6">
        <div className="max-w-7xl mx-auto rounded-[32px] overflow-hidden relative px-6 py-14 md:px-16 md:py-20 text-white bg-gradient-to-br from-[#FF8A3D] via-flame to-[#C64400]">
          <div aria-hidden="true" className="absolute -right-32 -top-32 w-[28rem] h-[28rem] rounded-full bg-white/15 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-end gap-7 md:gap-12">
            <h2 className="flex-1 text-[2.5rem] md:text-[4rem] leading-[0.95] font-extrabold tracking-[-0.04em]">Running low<br />on gas?</h2>
            <Link href="/stations" className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-ink hover:bg-black font-bold text-[1rem] transition-colors">
              Order gas now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      </Reveal>

      {/* ── Footer ── */}
      <footer className="max-w-6xl mx-auto px-5 md:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10 text-[0.9375rem]">
          <div>
            <Logo />
            <p className="mt-1.5 text-[0.75rem] text-ink-faint">Business Reg. No. {BUSINESS_REG_NO}</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-ink-muted">
            <Link href="/stations" className="hover:text-ink">Order gas</Link>
            <Link href="/orders" className="hover:text-ink">Track an order</Link>
            <Link href="#how-it-works" className="hover:text-ink">How it works</Link>
          </nav>
          <div className="md:ml-auto flex flex-wrap gap-2.5">
            <a href={`tel:${SUPPORT_PHONE_TEL}`} className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-line hover:border-ink font-medium transition-colors">
              <Phone className="w-4 h-4" /> {SUPPORT_PHONE_DISPLAY}
            </a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-[#25D366] text-white font-semibold">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          </div>
        </div>
        <p className="mt-8 text-[0.75rem] text-ink-faint">
          © {new Date().getFullYear()} GasRefill · Gas delivery in Koforidua · <Link href="/credits" className="hover:text-ink">Credits</Link>
        </p>
      </footer>
      <HomeStickyCta />
    </div>
  );
}
