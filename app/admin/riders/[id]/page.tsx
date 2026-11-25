'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Phone, MessageCircle, Loader2 } from 'lucide-react';
import { useAdmin, adminSend, money, when, ago, Loading, ErrorNote, OrderPill, PromptSheet, Sheet } from '@/components/Admin/ui';

type Detail = {
  rider: Record<string, any>;
  profile: { name: string; phone: string; is_online: boolean; created_at: string };
  email: string | null; lastSignIn: string | null;
  wallet: { balance: number; today: number; week: number; lines: { type: string; amount: number; created_at: string; note: string | null }[] };
  withdrawals: { id: string; amount: number; status: string; momo_number: string; momo_network: string; created_at: string; failure_reason: string | null }[];
  jobs: { id: string; order_number: string; status: string; total: number; rider_earning: number | null; payment_method: string; created_at: string }[];
};
const STATUS: Record<string, [string, string]> = {
  approved: ['Approved', 'pill-success'], pending: ['Waiting for approval', 'pill-warning'], suspended: ['Paused', 'pill-error'], rejected: ['Not approved', 'pill-error'],
};
const LINE: Record<string, string> = { earning: 'Earning', cash_kept: 'Cash kept', withdrawal: 'Withdrawal', withdrawal_reversal: 'Withdrawal returned', adjustment: 'Adjustment' };

export default function AdminRiderPage({ params }: { params: { id: string } }) {
  const { data, error, loading, reload } = useAdmin<Detail>(`/api/admin/riders/${params.id}`);
  const [sheet, setSheet] = useState<'reject' | 'suspend' | 'adjust' | 'payout' | 'vehicle' | null>(null);
  const [busy, setBusy] = useState(false);
  const send = async (action: string, body: Record<string, unknown> = {}, ok = 'Saved') => {
    const r = await adminSend(`/api/admin/riders/${params.id}/${action}`, body);
    toast.success(r.activeJobs ? `${ok}. They still have ${r.activeJobs} job(s) — reassign them in Orders.` : ok);
    await reload();
  };
  const quick = async (action: string, ok: string) => { setBusy(true); try { await send(action, {}, ok); } catch (e) { toast.error((e as Error).message); } setBusy(false); };

  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorNote text={error} retry={reload} />;
  if (!data) return null;
  const { rider: r, profile: p, wallet: w } = data;
  const [label, cls] = STATUS[r.status] ?? [r.status, 'pill-gray'];

  return (
    <div className="max-w-4xl">
      <Link href="/admin/riders" className="inline-flex items-center gap-1.5 text-ink-muted text-[0.875rem] mb-3"><ArrowLeft className="w-4 h-4" /> Riders</Link>
      <div className="flex flex-wrap items-center gap-3 mb-1">
        <h1 className="text-[1.625rem] md:text-[2rem] font-extrabold tracking-tight text-ink">{p.name}</h1>
        <span className={`pill ${cls}`}>{label}</span>
        {r.status === 'approved' && <span className={`pill ${p.is_online ? 'pill-success' : 'pill-gray'}`}>{p.is_online ? 'Online' : 'Offline'}</span>}
      </div>
      <p className="text-ink-muted text-[0.875rem] mb-5">Applied {when(r.created_at)} · last sign-in {ago(data.lastSignIn)}</p>
      {r.rejection_reason && r.status !== 'approved' && <p className="mb-4 rounded-2xl bg-[#FDECEC] px-4 py-3 text-[0.875rem] text-[#B91C1C]">Reason: {r.rejection_reason}</p>}

      <div className="flex flex-wrap gap-2 mb-5">
        {r.status === 'pending' && <>
          <button onClick={() => quick('approve', 'Rider approved')} disabled={busy} className="h-11 px-6 rounded-full btn-primary text-[0.875rem]">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve rider'}</button>
          <button onClick={() => setSheet('reject')} className="h-11 px-5 rounded-full bg-white border border-[#F3C4C4] text-[#B91C1C] font-semibold text-[0.875rem]">Don’t approve</button>
        </>}
        {r.status === 'approved' && <button onClick={() => setSheet('suspend')} className="h-11 px-5 rounded-full bg-white border border-[#F3C4C4] text-[#B91C1C] font-semibold text-[0.875rem]">Pause rider</button>}
        {(r.status === 'suspended' || r.status === 'rejected') && <button onClick={() => quick('reactivate', 'Rider is active again')} disabled={busy} className="h-11 px-6 rounded-full btn-primary text-[0.875rem]">Approve again</button>}
        <button onClick={() => setSheet('adjust')} className="h-11 px-5 rounded-full btn-ghost !bg-white text-[0.875rem]">Add to / deduct from wallet</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <section className="rounded-3xl bg-white border border-line p-5 space-y-2.5 text-[0.9375rem]">
          <h2 className="text-label text-ink-faint">Details</h2>
          <Info k="Phone" v={p.phone} />
          <Info k="Email" v={data.email ?? '—'} />
          <Info k="Ghana Card" v={r.ghana_card_no ?? '—'} />
          <Info k="Licence" v={r.licence_no ?? '—'} />
          <Info k="Vehicle" v={`${r.vehicle_type === 'tricycle' ? 'Tricycle' : 'Motorbike'} · ${r.vehicle_reg}`} action={() => setSheet('vehicle')} />
          <Info k="Payouts to" v={`${r.momo_network} ${r.momo_number}`} action={() => setSheet('payout')} />
          <Info k="Emergency" v={r.emergency_contact ?? '—'} />
          <div className="flex gap-2 pt-1">
            <a href={`tel:${p.phone}`} className="h-9 px-4 rounded-full bg-ink text-white text-[0.8125rem] font-semibold inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Call</a>
            <a href={`https://wa.me/233${p.phone.replace(/\D/g, '').replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer" className="h-9 px-4 rounded-full bg-[#E8F6EC] text-[#15803D] text-[0.8125rem] font-semibold inline-flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</a>
          </div>
        </section>

        <section className="rounded-3xl bg-ink text-white p-5">
          <h2 className="text-label text-white/50">Wallet</h2>
          <p className={`mt-1 text-[2.25rem] font-extrabold tabular-nums tracking-tight ${w.balance < 0 ? 'text-[#FCA5A5]' : ''}`}>{money(w.balance)}</p>
          <p className="text-white/60 text-[0.8125rem]">{w.balance < 0 ? 'Rider is holding this much cash for GasRefill.' : 'GasRefill owes the rider this much.'}</p>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl bg-white/[0.08] p-3"><p className="font-bold tabular-nums">{money(w.today)}</p><p className="text-[0.75rem] text-white/55">Earned today</p></div>
            <div className="rounded-2xl bg-white/[0.08] p-3"><p className="font-bold tabular-nums">{money(w.week)}</p><p className="text-[0.75rem] text-white/55">Last 7 days</p></div>
          </div>
          <ul className="mt-4 space-y-2 max-h-56 overflow-y-auto text-[0.8125rem]">
            {w.lines.slice(0, 15).map((l, i) => (
              <li key={i} className="flex justify-between gap-3"><span className="text-white/70 truncate">{LINE[l.type] ?? l.type}{l.note ? ` · ${l.note}` : ''}</span><span className="tabular-nums shrink-0">{Number(l.amount) >= 0 ? '+' : '−'}{money(Math.abs(Number(l.amount)))}</span></li>
            ))}
          </ul>
        </section>
      </div>

      {data.withdrawals.length > 0 && (
        <section className="mt-4 rounded-3xl bg-white border border-line p-5">
          <h2 className="text-label text-ink-faint mb-2.5">Withdrawals</h2>
          <ul className="divide-y divide-line">
            {data.withdrawals.map(x => (
              <li key={x.id} className="flex items-center justify-between py-2.5 text-[0.9375rem]">
                <span><b className="tabular-nums">{money(x.amount)}</b> <span className="text-ink-muted text-[0.8125rem]">· {when(x.created_at)}</span></span>
                <span className={`pill ${x.status === 'paid' ? 'pill-success' : x.status === 'requested' || x.status === 'processing' ? 'pill-warning' : 'pill-error'}`}>{x.status}</span>
              </li>
            ))}
          </ul>
          <Link href="/admin/payouts" className="mt-2 inline-block text-[0.875rem] font-semibold text-flame-deep">Go to payouts</Link>
        </section>
      )}

      <section className="mt-4 rounded-3xl bg-white border border-line p-5">
        <h2 className="text-label text-ink-faint mb-2.5">Recent jobs</h2>
        {data.jobs.length === 0 ? <p className="text-ink-muted">No jobs yet.</p> : (
          <ul className="divide-y divide-line">
            {data.jobs.map(j => (
              <li key={j.id}>
                <Link href={`/admin/orders/${j.id}`} className="flex items-center gap-3 py-2.5 text-[0.9375rem]">
                  <span className="flex-1"><b>#{j.order_number}</b> <span className="text-ink-muted text-[0.8125rem]">· {when(j.created_at)} · {j.payment_method === 'cash' ? 'Cash' : 'MoMo'}</span></span>
                  {j.rider_earning != null && <span className="tabular-nums text-ink-muted text-[0.875rem]">+{money(j.rider_earning)}</span>}
                  <OrderPill status={j.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <PromptSheet open={sheet === 'reject'} onClose={() => setSheet(null)} title="Don’t approve this rider" danger label="Reason (the rider sees this)" placeholder="e.g. Licence number didn’t match" cta="Don’t approve"
        onSubmit={reason => send('reject', { reason }, 'Application declined')} />
      <PromptSheet open={sheet === 'suspend'} onClose={() => setSheet(null)} title="Pause this rider" danger label="Reason (the rider sees this). They’ll go offline and can’t take jobs." placeholder="e.g. Customer complaint under review" cta="Pause rider"
        onSubmit={reason => send('suspend', { reason }, 'Rider paused')} />
      <AdjustSheet open={sheet === 'adjust'} onClose={() => setSheet(null)} onSubmit={b => send('adjust', b, 'Wallet updated')} />
      <PayoutSheet open={sheet === 'payout'} onClose={() => setSheet(null)} current={{ number: r.momo_number, network: r.momo_network }} onSubmit={b => send('payout', b, 'Payout number changed')} />
      <VehicleSheet open={sheet === 'vehicle'} onClose={() => setSheet(null)} current={{ vehicleType: r.vehicle_type, vehicleReg: r.vehicle_reg, licenceNo: r.licence_no ?? '' }} onSubmit={b => send('vehicle', b, 'Vehicle updated')} />
    </div>
  );
}

function Info({ k, v, action }: { k: string; v: string; action?: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-ink-muted text-[0.8125rem] shrink-0">{k}</span>
      <span className="flex-1 font-semibold text-ink break-all">{v}</span>
      {action && <button onClick={action} className="text-[0.8125rem] font-semibold text-flame-deep">Change</button>}
    </div>
  );
}

function FormSheet({ open, onClose, title, cta, onSubmit, children, note }: { open: boolean; onClose: () => void; title: string; cta: string; note?: string; onSubmit: () => Promise<void>; children: React.ReactNode }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <form className="space-y-3" onSubmit={async e => { e.preventDefault(); setBusy(true); setErr(''); try { await onSubmit(); onClose(); } catch (x) { setErr((x as Error).message); } setBusy(false); }}>
        {note && <p className="text-[0.875rem] text-ink-muted">{note}</p>}
        {children}
        {err && <p className="text-[0.875rem] text-[#B91C1C]">{err}</p>}
        <button disabled={busy} className="w-full h-12 rounded-full btn-primary">{busy ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : cta}</button>
      </form>
    </Sheet>
  );
}

function AdjustSheet({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (b: { amount: number; note: string }) => Promise<void> }) {
  const [amount, setAmount] = useState(''); const [note, setNote] = useState(''); const [sign, setSign] = useState<1 | -1>(1);
  return (
    <FormSheet open={open} onClose={onClose} title="Wallet adjustment" cta="Save" note="Use “Add” when a rider hands in cash they held, or for a bonus. Use “Deduct” for a charge."
      onSubmit={() => onSubmit({ amount: sign * Number(amount), note })}>
      <div className="grid grid-cols-2 gap-2">
        {([[1, 'Add'], [-1, 'Deduct']] as const).map(([s, l]) => (
          <button type="button" key={s} onClick={() => setSign(s)} aria-pressed={sign === s} className={`h-11 rounded-2xl font-semibold border-[1.5px] ${sign === s ? 'border-flame bg-cream text-ink' : 'border-line text-ink-muted'}`}>{l}</button>
        ))}
      </div>
      <input className="input-field" inputMode="decimal" placeholder="Amount (GH₵)" value={amount} onChange={e => setAmount(e.target.value.replace(/[^\d.]/g, ''))} required />
      <input className="input-field" placeholder="Note the rider will see, e.g. Cash handed in at office" value={note} onChange={e => setNote(e.target.value)} required maxLength={120} />
    </FormSheet>
  );
}

function PayoutSheet({ open, onClose, current, onSubmit }: { open: boolean; onClose: () => void; current: { number: string; network: string }; onSubmit: (b: { momoNumber: string; momoNetwork: string }) => Promise<void> }) {
  const [number, setNumber] = useState(''); const [network, setNetwork] = useState(current.network);
  return (
    <FormSheet open={open} onClose={onClose} title="Change payout number" cta="Change number"
      note={`Now: ${current.network} ${current.number}. Only change this after calling the rider on their registered phone — scammers ask for this.`}
      onSubmit={() => onSubmit({ momoNumber: number, momoNetwork: network })}>
      <input className="input-field" inputMode="tel" placeholder="New MoMo number" value={number} onChange={e => setNumber(e.target.value)} required />
      <select className="input-field" value={network} onChange={e => setNetwork(e.target.value)} aria-label="Network">
        <option value="MTN">MTN</option><option value="TELECEL">Telecel</option><option value="AIRTELTIGO">AirtelTigo</option>
      </select>
    </FormSheet>
  );
}

function VehicleSheet({ open, onClose, current, onSubmit }: { open: boolean; onClose: () => void; current: { vehicleType: string; vehicleReg: string; licenceNo: string }; onSubmit: (b: typeof current) => Promise<void> }) {
  const [v, setV] = useState(current);
  return (
    <FormSheet open={open} onClose={onClose} title="Vehicle" cta="Save" onSubmit={() => onSubmit(v)}>
      <select className="input-field" value={v.vehicleType} onChange={e => setV({ ...v, vehicleType: e.target.value })} aria-label="Vehicle type">
        <option value="motorbike">Motorbike</option><option value="tricycle">Tricycle (aboboyaa)</option>
      </select>
      <input className="input-field" placeholder="Registration number" value={v.vehicleReg} onChange={e => setV({ ...v, vehicleReg: e.target.value })} required />
      <input className="input-field" placeholder="Licence number" value={v.licenceNo} onChange={e => setV({ ...v, licenceNo: e.target.value })} />
    </FormSheet>
  );
}
