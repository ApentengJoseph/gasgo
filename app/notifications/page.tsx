'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, Loader2, Package, Bike, CheckCircle2, AlertTriangle, CreditCard } from 'lucide-react';
import { PageHeader } from '@/components/UI/PageHeader';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/AuthContext';
import type { Notification } from '@/lib/types/database';

function styleFor(type: string) {
  if (['delivered'].includes(type)) return { Icon: CheckCircle2, cls: 'icon-box-green' };
  if (['cancelled', 'payment_failed'].includes(type)) return { Icon: AlertTriangle, cls: 'bg-[#FDECEC] text-[#DC2626]' };
  if (['assigned', 'rider_assigned', 'at_station', 'collected', 'on_the_way', 'arriving'].includes(type)) return { Icon: Bike, cls: 'icon-box-accent' };
  if (['payment_success', 'paid'].includes(type)) return { Icon: CreditCard, cls: 'icon-box-green' };
  if (['confirmed', 'order_confirmed', 'order_placed'].includes(type)) return { Icon: Package, cls: 'icon-box-primary' };
  return { Icon: Bell, cls: 'icon-box-primary' };
}

function ago(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return `${Math.floor(m / 60)} h ago`;
  return new Date(iso).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' });
}

export default function AlertsPage() {
  const supabase = useRef(createClient()).current;
  const { userId, loading } = useAuth();
  const [items, setItems] = useState<Notification[] | null>(null);

  const load = useCallback(async () => {
    if (!userId) { setItems([]); return; }
    const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
    setItems((data as Notification[]) ?? []);
  }, [supabase, userId]);

  useEffect(() => { if (!loading) load(); }, [loading, load]);

  useEffect(() => {
    if (!userId) return;
    const ch = supabase.channel('my-alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [supabase, userId, load]);

  const unread = (items ?? []).filter(n => !n.read).length;
  const markAll = async () => {
    if (!userId) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
    load();
  };
  const open = async (n: Notification) => {
    if (!n.read) await supabase.from('notifications').update({ read: true }).eq('id', n.id);
  };

  return (
    <div>
      <PageHeader
        back="/profile"
        title="Alerts"
        subtitle="Updates about your deliveries."
        action={unread > 0 ? (
          <button onClick={markAll} className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full btn-ghost text-[0.875rem]">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        ) : undefined}
      />

      {items === null ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-flame animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="card p-8 text-center">
          <span className="icon-box icon-box-xl icon-box-primary mx-auto"><Bell className="w-8 h-8" /></span>
          <h2 className="mt-4 text-[1.125rem] font-bold text-ink">You’re all caught up</h2>
          <p className="mt-1 text-ink-muted">We’ll let you know when your rider is on the way.</p>
        </div>
      ) : (
        <ul className="card overflow-hidden divide-y divide-line">
          {items.map(n => {
            const { Icon, cls } = styleFor(n.type);
            const orderId = (n.data as any)?.orderId;
            const body = (
              <div className={`flex items-start gap-3 p-4 ${n.read ? '' : 'bg-cream/60'}`}>
                <span className={`icon-box icon-box-sm ${cls}`}><Icon className="w-4 h-4" /></span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[0.9375rem] text-ink ${n.read ? 'font-medium' : 'font-bold'}`}>{n.title.replace(/^\S+\s/, m => /\p{Extended_Pictographic}/u.test(m) ? '' : m)}</p>
                  <p className="text-[0.875rem] text-ink-muted">{n.message}</p>
                  <p className="mt-1 text-[0.75rem] text-ink-faint">{ago(n.created_at)}</p>
                </div>
                {!n.read && <span className="mt-2 w-2 h-2 rounded-full bg-flame" />}
              </div>
            );
            return (
              <li key={n.id}>
                {orderId ? <Link href={`/orders/tracking?orderId=${orderId}`} onClick={() => open(n)} className="block hover:bg-cream">{body}</Link> : body}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
