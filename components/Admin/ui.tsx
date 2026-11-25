'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, X, Inbox } from 'lucide-react';

/** Fetch JSON from an admin API; reloads on demand and every `poll` ms. Session problems send you to sign in. */
export function useAdmin<T>(url: string | null, poll = 0) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const alive = useRef(true);
  const load = useCallback(async () => {
    if (!url) return;
    const res = await fetch(url, { cache: 'no-store' }).catch(() => null);
    if (!alive.current) return;
    if (res?.status === 401 || res?.status === 403) { window.location.href = '/admin/login?e=mfa'; return; }
    const d = await res?.json().catch(() => null);
    if (!res?.ok || !d) setError(d?.error || 'Could not load. Check your connection.');
    else { setData(d); setError(''); }
    setLoading(false);
  }, [url]);
  useEffect(() => {
    alive.current = true;
    setLoading(true);
    load();
    if (!poll) return () => { alive.current = false; };
    const t = setInterval(() => { if (document.visibilityState === 'visible') load(); }, poll);
    return () => { alive.current = false; clearInterval(t); };
  }, [load, poll]);
  return { data, error, loading, reload: load };
}

/** POST/PATCH to an admin API. Returns the JSON or throws with the server's message. */
export async function adminSend(url: string, body: unknown = {}, method = 'POST') {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => null);
  const d = await res?.json().catch(() => ({}));
  if (!res?.ok) throw new Error(d?.error || 'Something went wrong. Try again.');
  return d;
}

export const money = (n: number | string | null | undefined) => `GH₵${Number(n ?? 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const when = (iso?: string | null) => (iso ? new Date(iso).toLocaleString('en-GH', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—');
export const ago = (iso?: string | null) => {
  if (!iso) return '—';
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
};

const ORDER_STATUS: Record<string, [string, string]> = {
  pending: ['Unpaid', 'pill-gray'], confirmed: ['Waiting for rider', 'pill-warning'], assigned: ['Rider coming', 'pill-accent'],
  collected: ['Picked up', 'pill-accent'], at_station: ['Refilling', 'pill-accent'], on_the_way: ['Bringing back', 'pill-accent'],
  arriving: ['Arriving', 'pill-accent'], delivered: ['Delivered', 'pill-success'], cancelled: ['Cancelled', 'pill-error'],
};
export function OrderPill({ status }: { status: string }) {
  const [label, cls] = ORDER_STATUS[status] ?? [status, 'pill-gray'];
  return <span className={`pill ${cls} whitespace-nowrap`}>{label}</span>;
}
export const orderStatusLabel = (s: string) => ORDER_STATUS[s]?.[0] ?? s;

export function PageHead({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div>
        <h1 className="text-[1.625rem] md:text-[2rem] font-extrabold tracking-tight text-ink leading-tight">{title}</h1>
        {sub && <p className="text-ink-muted text-[0.9375rem] mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

/** Pill-style tabs that scroll sideways on phones. */
export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { id: T; label: string; count?: number }[] }) {
  return (
    <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto scrollbar-hide mb-4">
      <div className="inline-flex gap-1.5 p-1 rounded-full bg-white border border-line">
        {items.map(i => (
          <button key={i.id} onClick={() => onChange(i.id)} aria-pressed={value === i.id}
            className={`h-9 px-4 rounded-full text-[0.875rem] font-semibold whitespace-nowrap inline-flex items-center gap-1.5 transition-colors ${value === i.id ? 'bg-ink text-white' : 'text-ink-muted hover:text-ink'}`}>
            {i.label}
            {!!i.count && <span className={`min-w-5 h-5 px-1.5 rounded-full text-[0.6875rem] flex items-center justify-center ${value === i.id ? 'bg-flame text-white' : 'bg-flame-soft text-flame-deep'}`}>{i.count}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Loading() {
  return <div className="flex justify-center py-24"><Loader2 className="w-7 h-7 text-flame animate-spin" /></div>;
}
export function ErrorNote({ text, retry }: { text: string; retry?: () => void }) {
  return (
    <div className="rounded-2xl bg-[#FDECEC] px-4 py-3 text-[0.875rem] text-[#B91C1C] flex items-center justify-between gap-3">
      {text}{retry && <button onClick={retry} className="font-bold underline">Retry</button>}
    </div>
  );
}
export function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-3xl bg-white border border-line py-14 px-6 text-center">
      <Inbox className="w-8 h-8 text-ink-faint mx-auto" />
      <p className="mt-3 text-ink-muted">{text}</p>
    </div>
  );
}

/** Bottom sheet on phones, centred dialog on desktop. */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button className="absolute inset-0 bg-ink/50 animate-fade-in" onClick={onClose} aria-label="Close" />
      <div className="relative w-full md:max-w-md bg-white rounded-t-[28px] md:rounded-[28px] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[1.125rem] font-extrabold text-ink">{title}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-cream flex items-center justify-center" aria-label="Close"><X className="w-4 h-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Ask for a short reason/text, then run `onSubmit`. */
export function PromptSheet({ open, onClose, title, label, placeholder, cta, danger, onSubmit, multiline }: {
  open: boolean; onClose: () => void; title: string; label: string; placeholder?: string; cta: string; danger?: boolean; multiline?: boolean;
  onSubmit: (text: string) => Promise<void>;
}) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => { if (open) { setText(''); setErr(''); } }, [open]);
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <form onSubmit={async e => { e.preventDefault(); setBusy(true); setErr(''); try { await onSubmit(text.trim()); onClose(); } catch (x) { setErr((x as Error).message); } setBusy(false); }} className="space-y-3">
        <label className="block text-[0.8125rem] font-semibold text-ink-muted">{label}</label>
        {multiline
          ? <textarea value={text} onChange={e => setText(e.target.value)} placeholder={placeholder} rows={4} className="input-field" autoFocus />
          : <input value={text} onChange={e => setText(e.target.value)} placeholder={placeholder} className="input-field" autoFocus />}
        {err && <p className="text-[0.875rem] text-[#B91C1C]">{err}</p>}
        <button disabled={busy || !text.trim()} className={`w-full h-12 rounded-full font-bold disabled:opacity-40 ${danger ? 'bg-[#B91C1C] text-white' : 'btn-primary'}`}>
          {busy ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : cta}
        </button>
      </form>
    </Sheet>
  );
}

/** A stat tile: big number + label (+ optional hint). */
export function Stat({ label, value, hint, tone }: { label: string; value: string | number; hint?: string; tone?: 'flame' | 'green' | 'red' }) {
  const color = tone === 'flame' ? 'text-flame-deep' : tone === 'green' ? 'text-[#15803D]' : tone === 'red' ? 'text-[#B91C1C]' : 'text-ink';
  return (
    <div className="rounded-3xl bg-white border border-line p-4">
      <p className="text-[0.8125rem] text-ink-muted font-medium">{label}</p>
      <p className={`mt-1 text-[1.5rem] md:text-[1.75rem] font-extrabold tracking-tight tabular-nums leading-none ${color}`}>{value}</p>
      {hint && <p className="mt-1.5 text-[0.75rem] text-ink-faint">{hint}</p>}
    </div>
  );
}
