'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Home, Briefcase, MapPin, Plus, Trash2, Star, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/UI/PageHeader';
import { useAuth } from '@/lib/contexts/AuthContext';
import type { Address } from '@/lib/types/database';

export default function SavedPlacesPage() {
  const { userId, loading } = useAuth();
  const [list, setList] = useState<Address[] | null>(null);

  const load = useCallback(async () => {
    if (!userId) { setList([]); return; }
    const d = await (await fetch('/api/addresses')).json();
    setList(d.addresses ?? []);
  }, [userId]);

  useEffect(() => { if (!loading) load(); }, [loading, load]);

  const makeDefault = async (id: string) => {
    await fetch('/api/addresses', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ addressId: id }) });
    load();
  };
  const remove = async (id: string) => {
    const res = await fetch(`/api/addresses?id=${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Place removed'); load(); } else toast.error('Could not remove that place');
  };

  return (
    <div>
      <PageHeader
        back="/profile"
        title="Saved places"
        subtitle="Home, work, or anywhere you get gas delivered."
        action={<Link href="/profile/addresses/add" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full btn-dark text-[0.875rem]"><Plus className="w-4 h-4" /> Add</Link>}
      />

      {list === null ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-flame animate-spin" /></div>
      ) : list.length === 0 ? (
        <div className="card p-8 text-center">
          <span className="icon-box icon-box-xl icon-box-accent mx-auto"><MapPin className="w-8 h-8" /></span>
          <h2 className="mt-4 text-[1.125rem] font-bold text-ink">No saved places yet</h2>
          <p className="mt-1 text-ink-muted">Save your home so your next order takes seconds.</p>
          <Link href="/profile/addresses/add" className="mt-5 inline-flex h-12 px-6 items-center rounded-full btn-primary">Add a place</Link>
        </div>
      ) : (
        <ul className="card overflow-hidden divide-y divide-line">
          {list.map(a => {
            const Icon = a.label?.toLowerCase() === 'home' ? Home : a.label?.toLowerCase() === 'work' || a.label?.toLowerCase() === 'office' ? Briefcase : MapPin;
            return (
              <li key={a.id} className="flex items-center gap-3 p-4">
                <span className="icon-box icon-box-sm icon-box-primary"><Icon className="w-4 h-4" /></span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink flex items-center gap-2">{a.label}{a.is_default && <span className="pill pill-accent">Default</span>}</p>
                  <p className="text-[0.8125rem] text-ink-faint truncate">{a.address}</p>
                </div>
                {!a.is_default && (
                  <button onClick={() => makeDefault(a.id)} aria-label="Make default" className="w-9 h-9 rounded-full hover:bg-cream flex items-center justify-center text-ink-muted">
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => remove(a.id)} aria-label="Remove" className="w-9 h-9 rounded-full hover:bg-[#FDECEC] flex items-center justify-center text-ink-muted hover:text-[#DC2626]">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
