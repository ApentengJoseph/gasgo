'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, Bike, Wallet, MessageSquareText, Users, Store, ScrollText, LogOut, Menu, X, ShieldCheck,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAdmin } from '@/components/Admin/ui';

type Badges = { riders: number; payouts: number; questions: number; orders: number };
const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: Package, badge: 'orders' as const },
  { href: '/admin/riders', label: 'Riders', icon: Bike, badge: 'riders' as const },
  { href: '/admin/payouts', label: 'Payouts', icon: Wallet, badge: 'payouts' as const },
  { href: '/admin/questions', label: 'Questions', icon: MessageSquareText, badge: 'questions' as const },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/stations', label: 'Stations', icon: Store },
  { href: '/admin/activity', label: 'Activity log', icon: ScrollText },
];
const TABS = NAV.slice(0, 4);

/** Control centre frame: sidebar on desktop; top bar, bottom tabs and a menu on phones. */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? '';
  const [menu, setMenu] = useState(false);
  const isLogin = path.startsWith('/admin/login');
  const { data: badges } = useAdmin<Badges>(isLogin ? null : '/api/admin/badges', 30000);
  useEffect(() => setMenu(false), [path]);
  if (isLogin) return <>{children}</>;

  const active = (href: string) => (href === '/admin' ? path === '/admin' : path.startsWith(href));
  const signOut = async () => { await createClient().auth.signOut(); window.location.href = '/admin/login'; };
  const Badge = ({ n }: { n?: number }) => (n ? <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-flame text-white text-[0.6875rem] font-bold flex items-center justify-center">{n > 99 ? '99+' : n}</span> : null);

  const Links = () => (
    <nav className="flex-1 space-y-1">
      {NAV.map(({ href, label, icon: Icon, badge }) => (
        <Link key={href} href={href} aria-current={active(href) ? 'page' : undefined}
          className={`flex items-center gap-3 h-11 px-3.5 rounded-2xl text-[0.9375rem] font-semibold transition-colors ${active(href) ? 'bg-white/[0.12] text-white' : 'text-white/60 hover:text-white hover:bg-white/[0.06]'}`}>
          <Icon className="w-[18px] h-[18px]" /> {label} <Badge n={badge ? badges?.[badge] : 0} />
        </Link>
      ))}
    </nav>
  );
  const Brand = () => (
    <div className="flex items-center gap-2.5 text-white">
      <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-flame-light to-flame-deep flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></span>
      <div>
        <p className="text-[1.0625rem] font-extrabold tracking-tight leading-none">gas<span className="text-flame-light">refill</span></p>
        <p className="text-[0.625rem] text-white/50 font-bold uppercase tracking-[0.16em] mt-0.5">Control centre</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4EFE9]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[248px] bg-ink flex-col p-4 gap-6 z-40">
        <div className="px-2 pt-2"><Brand /></div>
        <Links />
        <button onClick={signOut} className="flex items-center gap-3 h-11 px-3.5 rounded-2xl text-white/60 hover:text-white hover:bg-white/[0.06] font-semibold text-[0.9375rem]">
          <LogOut className="w-[18px] h-[18px]" /> Sign out
        </button>
      </aside>

      {/* Phone top bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-ink px-4 h-14 flex items-center justify-between">
        <Brand />
        <button onClick={() => setMenu(true)} className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center relative" aria-label="Open menu">
          <Menu className="w-5 h-5" />
          {!!badges && (badges.questions + badges.payouts + badges.riders + badges.orders) > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-flame ring-2 ring-ink" />}
        </button>
      </header>

      {/* Phone menu */}
      {menu && (
        <div className="lg:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="absolute inset-0 bg-black/50" onClick={() => setMenu(false)} aria-label="Close menu" />
          <div className="absolute right-0 inset-y-0 w-[82%] max-w-[320px] bg-ink p-4 flex flex-col gap-6 animate-fade-in">
            <div className="flex items-center justify-between"><Brand /><button onClick={() => setMenu(false)} className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center" aria-label="Close menu"><X className="w-5 h-5" /></button></div>
            <Links />
            <button onClick={signOut} className="flex items-center gap-3 h-11 px-3.5 rounded-2xl text-white/70 font-semibold"><LogOut className="w-[18px] h-[18px]" /> Sign out</button>
          </div>
        </div>
      )}

      <main className="lg:pl-[248px]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-5 md:pt-8 pb-28 lg:pb-12">{children}</div>
      </main>

      {/* Phone bottom tabs */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-line pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 h-16">
          {TABS.map(({ href, label, icon: Icon, badge }) => (
            <Link key={href} href={href} className={`relative flex flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-semibold ${active(href) ? 'text-ink' : 'text-ink-faint'}`}>
              <Icon className="w-5 h-5" />{label}
              {badge && !!badges?.[badge] && <span className="absolute top-2 left-1/2 ml-2 w-2 h-2 rounded-full bg-flame" />}
            </Link>
          ))}
          <button onClick={() => setMenu(true)} className="flex flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-semibold text-ink-faint">
            <Menu className="w-5 h-5" />More
          </button>
        </div>
      </nav>
    </div>
  );
}
