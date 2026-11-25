'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useAdmin, adminSend, money, when, ago, PageHead, Tabs, Loading, ErrorNote, Empty, PromptSheet, Sheet } from '@/components/Admin/ui';

type W = { id: string; rider_id: string; amount: number; status: string; momo_number: string; momo_network: string; reference: string; failure_reason: string | null; created_at: string; processed_at: string | null; name: string; phone: string };
const NET: Record<string, string> = { MTN: 'MTN', TELECEL: 'Telecel', AIRTELTIGO: 'AirtelTigo' };

/** Rider withdrawal requests: send via Paystack, mark paid by hand, or decline (money goes back to the wallet). */
export default function AdminPayoutsPage() {
  const [view, setView] = useState<'open' | 'done'>('open');
  const { data, error, loading, reload } = useAdmin<{ withdrawals: W[] }>(`/api/admin/withdrawals?view=${view}`, 20000);
  const [confirm, setConfirm] = useState<{ w: W; how: 'pay' | 'mark_paid' } | null>(null);
  const [reject, setReject] = useState<W | null>(null);
  const [busy, setBusy] = useState(false);
  const total = (data?.withdrawals ?? []).filter(w => w.status === 'requested').reduce((s, w) => s + Number(w.amount), 0);

  const go = async () => {
    if (!confirm) return;
    setBusy(true);
    try { const r = await adminSend(`/api/admin/withdrawals/${confirm.w.id}/${confirm.how}`); toast.success(r.note || 'Marked as paid'); setConfirm(null); await reload(); }
    catch (e) { toast.error((e as Error).message); }
    setBusy(false);
  };

  return (
    <>
      <PageHead title="Payouts" sub={view === 'open' && data ? `${money(total)} waiting to be sent` : 'Rider withdrawals to MoMo'} />
      <Tabs<'open' | 'done'> value={view} onChange={setView} items={[{ id: 'open', label: 'To send', count: data && view === 'open' ? data.withdrawals.length : undefined }, { id: 'done', label: 'History' }]} />
      {error && <ErrorNote text={error} retry={reload} />}
      {loading && !data ? <Loading /> : data && (data.withdrawals.length === 0 ? <Empty text={view === 'open' ? 'No payouts waiting.' : 'No payouts yet.'} /> : (
        <ul className="space-y-3">
          {data.withdrawals.map(w => (
            <li key={w.id} className="rounded-3xl bg-white border border-line p-4 md:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[1.5rem] font-extrabold tabular-nums tracking-tight text-ink leading-none">{money(w.amount)}</p>
                  <p className="mt-1.5 text-[0.9375rem] text-ink"><Link href={`/admin/riders/${w.rider_id}`} className="font-semibold underline-offset-2 hover:underline">{w.name}</Link> · {NET[w.momo_network] ?? w.momo_network} {w.momo_number}</p>
                  <p className="text-[0.75rem] text-ink-faint">Asked {ago(w.created_at)} · {w.reference}</p>
                  {w.failure_reason && <p className="text-[0.8125rem] text-[#B91C1C] mt-1">{w.failure_reason}</p>}
                </div>
                {w.status === 'requested' ? (
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setConfirm({ w, how: 'pay' })} className="h-10 px-5 rounded-full btn-primary text-[0.875rem]">Send with Paystack</button>
                    <button onClick={() => setConfirm({ w, how: 'mark_paid' })} className="h-10 px-4 rounded-full btn-ghost !bg-white text-[0.875rem]">I paid it myself</button>
                    <button onClick={() => setReject(w)} className="h-10 px-4 rounded-full text-[#B91C1C] font-semibold text-[0.875rem]">Decline</button>
                  </div>
                ) : (
                  <span className={`pill ${w.status === 'paid' ? 'pill-success' : w.status === 'processing' ? 'pill-warning' : 'pill-error'}`}>
                    {w.status === 'processing' ? 'Sending…' : w.status === 'paid' ? `Paid ${when(w.processed_at)}` : w.status === 'rejected' ? 'Declined' : 'Failed (returned)'}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      ))}

      <Sheet open={!!confirm} onClose={() => setConfirm(null)} title={confirm?.how === 'pay' ? 'Send this payout?' : 'Mark as paid?'}>
        {confirm && <>
          <p className="text-ink">{money(confirm.w.amount)} to <b>{confirm.w.name}</b></p>
          <p className="text-ink-muted">{NET[confirm.w.momo_network]} {confirm.w.momo_number}</p>
          <p className="mt-3 rounded-2xl bg-cream px-4 py-3 text-[0.8125rem] text-ink-muted inline-flex gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-flame-deep" />
            {confirm.how === 'pay' ? 'Money goes only to the number on the rider’s profile. Paystack sends it from your Paystack balance.' : 'Only do this if you already sent the money another way.'}
          </p>
          <button onClick={go} disabled={busy} className="mt-4 w-full h-12 rounded-full btn-primary">{busy ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : confirm.how === 'pay' ? `Send ${money(confirm.w.amount)}` : 'Yes, it’s paid'}</button>
        </>}
      </Sheet>
      <PromptSheet open={!!reject} onClose={() => setReject(null)} title="Decline payout" danger label="Reason (the rider sees this). The money goes back to their wallet." placeholder="e.g. Cash from cash orders not yet handed in" cta="Decline"
        onSubmit={async reason => { await adminSend(`/api/admin/withdrawals/${reject!.id}/reject`, { reason }); toast.success('Declined. Money returned to the wallet.'); await reload(); }} />
    </>
  );
}
