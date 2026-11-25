'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Smartphone, Loader2, KeyRound, Copy } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';
import { track } from '@/components/Layout/Analytics';

/** Show a one-time code on this device so another device can open the same account. */
export function ShareToDevice() {
  const [code, setCode] = useState<{ code: string; expiresAt: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (!code) return;
    const tick = () => setLeft(Math.max(0, Math.round((new Date(code.expiresAt).getTime() - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [code]);

  const create = async () => {
    setBusy(true);
    const res = await fetch('/api/auth/link-code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).catch(() => null);
    const d = await res?.json().catch(() => ({}));
    setBusy(false);
    if (!res?.ok) { toast.error(d?.error || 'Could not create a code.'); return; }
    setCode(d);
  };

  return (
    <section className="card p-5">
      <div className="flex items-start gap-3">
        <span className="icon-box icon-box-md icon-box-primary"><Smartphone className="w-5 h-5" /></span>
        <div>
          <h2 className="font-bold text-ink">Use on another device</h2>
          <p className="text-[0.875rem] text-ink-muted mt-0.5">Open your orders on your phone or laptop with a one-time code. No password needed.</p>
        </div>
      </div>
      {code && left > 0 ? (
        <div className="mt-4 rounded-2xl bg-ink text-white p-4 text-center">
          <p className="text-[0.75rem] text-white/60">Your code</p>
          <button onClick={() => { navigator.clipboard?.writeText(code.code); toast.success('Copied'); }}
            className="mt-1 inline-flex items-center gap-2 text-[1.75rem] font-extrabold tracking-[0.18em] tabular-nums">
            {code.code} <Copy className="w-4 h-4 text-white/60" />
          </button>
          <p className="mt-1 text-[0.75rem] text-white/60">
            On the other device: Account → <b className="text-white">I have a code</b>. Expires in {Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}
          </p>
        </div>
      ) : (
        <button onClick={create} disabled={busy} className="mt-4 w-full h-12 rounded-full btn-ghost inline-flex items-center justify-center gap-2">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />} Get a code
        </button>
      )}
    </section>
  );
}

/** Enter a code from another device to open that account here. */
export function RedeemCode({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [open, setOpen] = useState(!compact);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const redeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setBusy(true);
    const res = await fetch('/api/auth/link-code', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }),
    }).catch(() => null);
    const d = await res?.json().catch(() => ({}));
    if (!res?.ok) { setBusy(false); setError(d?.error || 'That code didn’t work.'); return; }
    const supabase = createClient();
    await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    const { error: err } = await supabase.auth.verifyOtp({ type: 'magiclink', token_hash: d.tokenHash });
    setBusy(false);
    if (err) { setError('Could not open the account. Please create a new code.'); return; }
    await refreshProfile();
    track('device_linked');
    toast.success('This device is now linked');
    router.push('/orders');
    router.refresh();
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-[0.875rem] font-semibold text-flame-deep underline underline-offset-2">
        I have a code from another device
      </button>
    );
  }
  return (
    <form onSubmit={redeem} className="card p-5 space-y-3">
      <div>
        <p className="font-bold text-ink">I have a code</p>
        <p className="text-[0.8125rem] text-ink-muted">Get it on your other device under Account → Use on another device.</p>
      </div>
      <input
        value={code}
        onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 9))}
        placeholder="ABCD-EFGH" autoCapitalize="characters" autoComplete="one-time-code" aria-label="Device code"
        className="input-field text-center text-[1.25rem] font-bold tracking-[0.2em]"
      />
      {error && <p role="alert" className="text-[0.875rem] text-[#B91C1C]">{error}</p>}
      <button type="submit" disabled={busy || code.replace('-', '').length < 8} className="w-full h-12 rounded-full btn-primary">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Open my account here'}
      </button>
    </form>
  );
}
