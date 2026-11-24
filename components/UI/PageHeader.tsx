'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function PageHeader({
  title, subtitle, back, action,
}: { title: string; subtitle?: React.ReactNode; back?: string; action?: React.ReactNode }) {
  return (
    <header className="mb-6 md:mb-8">
      {back && (
        <Link
          href={back}
          className="glass !rounded-full inline-flex items-center gap-1.5 mb-4 h-9 pl-2.5 pr-3.5 text-[0.875rem] font-medium text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      )}
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="mt-1.5 text-[0.9375rem] text-ink-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
    </header>
  );
}

const STEPS = ['Station', 'Address', 'Pay'];

/** Progress for the 3-step order flow. */
export function OrderSteps({ current }: { current: 0 | 1 | 2 }) {
  return (
    <ol className="flex items-center gap-2 mb-6" aria-label="Order progress">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="flex-1">
            <span className={`block h-1.5 rounded-full ${done || active ? 'bg-gradient-to-r from-flame to-flame-light shadow-[0_2px_8px_-2px_rgba(255,107,0,0.6)]' : 'bg-white/70 shadow-[inset_0_1px_2px_rgba(60,35,15,0.08)]'}`} />
            <span className={`mt-2 block text-[0.75rem] ${active ? 'font-bold text-ink' : done ? 'font-medium text-ink-muted' : 'text-ink-faint'}`}>
              {i + 1}. {s}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Fixed bottom action bar (sits above the phone tab bar). */
export function StickyAction({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-[84px] md:bottom-0 z-40 pointer-events-none" style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="max-w-md md:max-w-3xl mx-auto px-4 md:px-6 pb-3 md:pb-6 pointer-events-auto">
        {children}
      </div>
    </div>
  );
}
