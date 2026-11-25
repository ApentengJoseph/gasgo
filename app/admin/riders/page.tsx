'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bike, Truck, ChevronRight } from 'lucide-react';
import { useAdmin, money, ago, PageHead, Tabs, Loading, ErrorNote, Empty } from '@/components/Admin/ui';

type R = { id: string; status: string; vehicle: string; reg: string; created_at: string; name: string; phone: string; online: boolean; balance: number; delivered: number; active: number };
type View = 'pending' | 'approved' | 'suspended' | 'rejected';

export default function AdminRidersPage() {
  const [view, setView] = useState<View>('approved');
  const { data, error, loading, reload } = useAdmin<{ riders: R[]; counts: Record<View, number> }>(`/api/admin/riders?status=${view}`, 30000);
  const c = data?.counts;

  return (
    <>
      <PageHead title="Riders" sub={c ? `${c.approved} approved · ${c.pending} waiting for approval` : undefined} />
      <Tabs<View> value={view} onChange={setView} items={[
        { id: 'approved', label: 'Approved' }, { id: 'pending', label: 'Applications', count: c?.pending },
        { id: 'suspended', label: 'Paused' }, { id: 'rejected', label: 'Not approved' },
      ]} />
      {error && <ErrorNote text={error} retry={reload} />}
      {loading && !data ? <Loading /> : data && (data.riders.length === 0 ? (
        <Empty text={view === 'pending' ? 'No new applications. Riders apply at /rider/apply.' : 'No riders here.'} />
      ) : (
        <ul className="grid md:grid-cols-2 gap-3">
          {data.riders.map(r => {
            const Icon = r.vehicle === 'tricycle' ? Truck : Bike;
            return (
              <li key={r.id}>
                <Link href={`/admin/riders/${r.id}`} className="flex items-center gap-3 rounded-3xl bg-white border border-line p-4 hover:shadow-md transition-shadow">
                  <span className="relative w-12 h-12 rounded-2xl bg-cream flex items-center justify-center text-ink"><Icon className="w-5 h-5" />
                    {r.online && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#16A34A] ring-2 ring-white" title="Online" />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <b className="block text-ink truncate">{r.name}</b>
                    <span className="block text-[0.8125rem] text-ink-muted truncate">{r.phone} · {r.reg}</span>
                    <span className="block text-[0.75rem] text-ink-faint">
                      {view === 'pending' ? `Applied ${ago(r.created_at)}` : `${r.delivered} delivered${r.active ? ` · ${r.active} on now` : ''}`}
                    </span>
                  </span>
                  {view !== 'pending' && <span className={`text-right font-bold tabular-nums text-[0.9375rem] ${r.balance < 0 ? 'text-[#B91C1C]' : 'text-ink'}`}>{money(r.balance)}<span className="block text-[0.6875rem] font-medium text-ink-faint">wallet</span></span>}
                  <ChevronRight className="w-4 h-4 text-ink-faint" />
                </Link>
              </li>
            );
          })}
        </ul>
      ))}
    </>
  );
}
