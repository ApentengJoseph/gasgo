'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Info } from 'lucide-react';

/**
 * Small ⓘ button that explains something in plain words.
 * Tap/click to open, tap outside or press Escape to close.
 */
export default function InfoTip({ label, children, align = 'left' }: {
  label: string;
  children: React.ReactNode;
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | TouchEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={`About ${label}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(o => !o)}
        className={`w-6 h-6 -my-1 rounded-full inline-flex items-center justify-center transition-colors ${open ? 'text-flame-deep bg-flame-soft' : 'text-ink-faint hover:text-ink'}`}
      >
        <Info className="w-[15px] h-[15px]" />
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className={`absolute z-50 top-7 ${align === 'right' ? 'right-0' : 'left-0'} w-64 rounded-2xl bg-ink text-white text-[0.8125rem] leading-relaxed font-normal p-3.5 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.5)] animate-scale-in`}
        >
          {children}
        </span>
      )}
    </span>
  );
}
