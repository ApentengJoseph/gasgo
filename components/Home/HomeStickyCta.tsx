'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/** Phone-only "Order gas" pill that appears once the hero has scrolled away. */
export default function HomeStickyCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div
      aria-hidden={!show}
      className={`md:hidden fixed inset-x-0 z-40 flex justify-center transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 86px)' }}
    >
      <Link href="/stations" tabIndex={show ? 0 : -1} className="h-12 px-6 rounded-full btn-primary text-[0.9375rem] shadow-[0_16px_36px_-12px_rgba(255,107,0,0.75)]">
        Order gas <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
