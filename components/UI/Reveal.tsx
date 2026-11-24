'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Fades its content up when it scrolls into view. Content is visible on the
 * server render and anything already on screen never hides, so there's no
 * flash and nothing breaks without JavaScript.
 */
export default function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return; // already visible
    setHidden(true);
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setHidden(false); io.disconnect(); }
    }, { rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-hidden={hidden} className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}
