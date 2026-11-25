'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import { useAdmin, adminSend, money, ago, PageHead, Loading, ErrorNote, Empty, PromptSheet } from '@/components/Admin/ui';

type C = { id: string; name: string; phone: string | null; is_active: boolean | null; created_at: string; orders: number; delivered: number; cancelled: number; spent: number; last: string | null };

/** Customers with what they've ordered. Block an account that keeps placing fake orders. */
export default function AdminCustomersPage() {
  const [q, setQ] = useState('');
  const [deb, setDeb] = useState('');
  useEffect(() => { const t = setTimeout(() => setDeb(q), 350); return () => clearTimeout(t); }, [q]);
  const { data, error, loading, reload } = useAdmin<{ customers: C[]; total: number }>(`/api/admin/customers?q=${encodeURIComponent(deb)}`);
  const [blocking, setBlocking] = useState<C | null>(null);

  const unblock = async (c: C) => {
    try { await adminSend(`/api/admin/customers/${c.id}`, { blocked: false }); toast.success(`${c.name} can order again`); reload(); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <>
      <PageHead title="Customers" sub={data ? `${data.total} people with a name on file` : undefined}>
        <label className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Name or phone" className="input-field !h-11 pl-10" aria-label="Search customers" />
        </label>
      </PageHead>
      {error && <ErrorNote text={error} retry={reload} />}
      {loading && !data ? <Loading /> : data && (data.customers.length === 0 ? <Empty text="No customers found." /> : (
        <ul className="grid md:grid-cols-2 gap-3">
          {data.customers.map(c => (
            <li key={c.id} className="rounded-3xl bg-white border border-line p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-ink truncate">{c.name}{c.is_active === false && <span className="pill pill-error ml-2 align-middle">Blocked</span>}</p>
                  <p className="text-[0.875rem] text-ink-muted">{c.phone ?? '—'} · joined {ago(c.created_at)}</p>
                </div>
                <p className="text-right font-bold tabular-nums text-ink">{money(c.spent)}<span className="block text-[0.6875rem] font-medium text-ink-faint">spent</span></p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[0.8125rem] text-ink-muted">
                <span>{c.delivered} delivered · {c.orders} placed{c.cancelled ? ` · ${c.cancelled} cancelled` : ''}{c.last ? ` · last ${ago(c.last)}` : ''}</span>
                {c.is_active === false
                  ? <button onClick={() => unblock(c)} className="font-semibold text-flame-deep">Unblock</button>
                  : <button onClick={() => setBlocking(c)} className="font-semibold text-[#B91C1C]">Block</button>}
              </div>
            </li>
          ))}
        </ul>
      ))}
      <PromptSheet open={!!blocking} onClose={() => setBlocking(null)} title={`Block ${blocking?.name ?? ''}?`} danger
        label="They won’t be able to place new orders. Reason (for your records):" placeholder="e.g. Repeated fake cash orders" cta="Block"
        onSubmit={async reason => { await adminSend(`/api/admin/customers/${blocking!.id}`, { blocked: true, reason }); toast.success('Blocked'); await reload(); }} />
    </>
  );
}
