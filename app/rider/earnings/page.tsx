'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, ArrowDownToLine, TrendingUp, Wallet, Info } from 'lucide-react';

type Line = { type: string; amount: number; created_at: string; note: string | null };
type Withdrawal = { id: string; amount: number; status: string; momo_number: string; created_at: string; failure_reason: string | null };
type Data = {
  rider: { momo_number: string; momo_network: string };
  wallet: { balance: number; today: number; week: number; lines: Line[] };
  doneToday: number;
  withdrawals: Withdrawal[];
};

const money = (n: number) => `GH₵${Number(n).toFixed(2)}`;
const when = (iso: string) => new Date(iso).toLocaleString('en-GH', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
const mask = (p: string) => p ? `${p.slice(0, 3)} ••• ${p.slice(-4)}` : '';
const LINE_LABEL: Record<string, string> = {
  earning: 'Delivery earning', cash_kept: 'Cash you kept (owed to GasRefill)', withdrawal: 'Withdrawal',
  withdrawal_reversal: 'Withdrawal returned', adjustment: 'Adjustment',
};
const W_STATUS: Record<string, string> = { requested: 'Requested', processing: 'Sending', paid: 'Paid', failed: 'Failed (returned)', rejected: 'Declined (returned)' };

/** Rider wallet: balance, earnings, MoMo withdrawals and every money movement. */
export default function RiderEarningsPage() {
  const [d, setD] = useState<Data | null>(null);
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/rider/me').catch(() => null);
    if (res?.ok) setD(await res.json());
  }, []);
  useEffect(() => { load(); }, [load]);

  const withdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await fetch('/api/rider/withdraw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: Number(amount) }) }).catch(() => null);
    const r = await res?.json().catch(() => ({}));
    setBusy(false);
    if (!res?.ok) { toast.error(r?.error || 'Could not request withdrawal.'); return; }
    toast.success('Withdrawal requested. You’ll get it on MoMo once approved.');
    setAmount(''); load();
  };

  if (!d) return <div className="flex justify-center pt-32"><Loader2 className="w-7 h-7 text-flame animate-spin" /></div>;
  const open = d.withdrawals.find(w => w.status === 'requested' || w.status === 'processing');
  const owes = d.wallet.balance < 0;

  return (
    <div className="max-w-md mx-auto px-4 pt-6">
      <h1 className="page-title">Earnings</h1>

      <section className="mt-5 glow-flame rounded-[28px] p-6 text-white shadow-[0_24px_50px_-24px_rgba(23,19,15,0.7)]">
        <p className="text-white/70 text-[0.875rem] inline-flex items-center gap-1.5"><Wallet className="w-4 h-4" /> Wallet balance</p>
        <p className={`mt-1 text-[2.5rem] font-extrabold tracking-tight tabular-nums leading-none ${owes ? 'text-[#FCA5A5]' : ''}`}>{money(d.wallet.balance)}</p>
        {owes && <p className="mt-2 text-[0.8125rem] text-white/80">You’re holding cash from cash orders. Pay it to GasRefill to unlock withdrawals.</p>}
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <Stat label="Today" value={money(d.wallet.today)} />
          <Stat label="This week" value={money(d.wallet.week)} />
          <Stat label="Jobs today" value={String(d.doneToday)} />
        </div>
      </section>

      <section className="mt-4 card !bg-white p-5">
        <h2 className="font-bold text-ink inline-flex items-center gap-2"><ArrowDownToLine className="w-4 h-4 text-flame" /> Withdraw to MoMo</h2>
        <p className="text-[0.8125rem] text-ink-muted mt-0.5">Paid to {d.rider.momo_network} {mask(d.rider.momo_number)}. Minimum GH₵20.</p>
        {open ? (
          <p className="mt-4 rounded-2xl bg-[#FEF3DC] px-4 py-3 text-[0.875rem] text-[#92400E]">
            {money(open.amount)} withdrawal is {open.status === 'processing' ? 'being sent' : 'waiting for approval'}. You can request another once it’s done.
          </p>
        ) : (
          <form onSubmit={withdraw} className="mt-4 flex gap-2.5">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted font-semibold">GH₵</span>
              <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^\d.]/g, ''))} inputMode="decimal" placeholder="0.00"
                className="input-field pl-14 font-bold" aria-label="Amount to withdraw" />
            </div>
            <button type="submit" disabled={busy || owes || Number(amount) < 20 || Number(amount) > d.wallet.balance} className="h-[52px] px-5 rounded-full btn-primary disabled:opacity-40">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Withdraw'}
            </button>
          </form>
        )}
        <p className="mt-3 text-[0.75rem] text-ink-faint inline-flex items-start gap-1.5"><Info className="w-3.5 h-3.5 mt-0.5 shrink-0" /> To change your payout number, contact GasRefill. This protects your money if someone gets your password.</p>
      </section>

      {d.withdrawals.length > 0 && (
        <section className="mt-4">
          <h2 className="text-label text-ink-faint mb-2.5">Withdrawals</h2>
          <ul className="card !bg-white overflow-hidden divide-y divide-line">
            {d.withdrawals.map(w => (
              <li key={w.id} className="flex items-center justify-between p-4">
                <div><p className="font-semibold text-ink">{money(w.amount)}</p><p className="text-[0.75rem] text-ink-faint">{when(w.created_at)}</p></div>
                <span className={`pill ${w.status === 'paid' ? 'pill-success' : w.status === 'failed' || w.status === 'rejected' ? 'pill-error' : 'pill-warning'}`}>{W_STATUS[w.status]}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-4 mb-6">
        <h2 className="text-label text-ink-faint mb-2.5 inline-flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Activity</h2>
        {d.wallet.lines.length === 0 ? (
          <p className="card !bg-white p-5 text-ink-muted text-[0.9375rem]">Your earnings show up here after each delivery.</p>
        ) : (
          <ul className="card !bg-white overflow-hidden divide-y divide-line">
            {d.wallet.lines.map((l, i) => (
              <li key={i} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0"><p className="font-semibold text-ink text-[0.9375rem]">{LINE_LABEL[l.type] ?? l.type}</p><p className="text-[0.75rem] text-ink-faint truncate">{l.note} · {when(l.created_at)}</p></div>
                <span className={`font-bold tabular-nums ${Number(l.amount) >= 0 ? 'text-[#15803D]' : 'text-ink'}`}>{Number(l.amount) >= 0 ? '+' : '−'}{money(Math.abs(Number(l.amount)))}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-dark-surface rounded-2xl px-3 py-2.5">
      <p className="text-[1rem] font-extrabold tabular-nums leading-none">{value}</p>
      <p className="text-[0.6875rem] text-white/65 mt-1">{label}</p>
    </div>
  );
}
