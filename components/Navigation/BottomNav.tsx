'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Home, Flame, Package, User } from 'lucide-react';

const RiderNavigation = dynamic(() => import('./RiderNav'), { ssr: false });
const AdminNavigation = dynamic(() => import('./AdminNav'), { ssr: false });

const tabs = [
  { href: '/',         label: 'Home',      icon: Home,    match: (p: string) => p === '/' },
  { href: '/stations', label: 'Order',     icon: Flame,   match: (p: string) => p === '/order' || ['/stations', '/checkout'].some(r => p.startsWith(r)) },
  { href: '/orders',   label: 'My orders', icon: Package, match: (p: string) => p.startsWith('/orders') },
  { href: '/profile',  label: 'Account',   icon: User,    match: (p: string) => p.startsWith('/profile') || p.startsWith('/notifications') || p.startsWith('/auth') },
];

/** Phone-only tab bar (desktop uses TopNav). */
export default function BottomNavigation() {
  const pathname = usePathname() ?? '/';
  if (pathname.startsWith('/rider')) return <RiderNavigation />;
  if (pathname.startsWith('/admin')) return <AdminNavigation />;

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 px-3"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)' }}
      aria-label="Main"
    >
      <ul className="glass !rounded-full grid grid-cols-4 h-[64px] px-1.5 !bg-white/70">
        {tabs.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className="h-full flex flex-col items-center justify-center gap-1"
              >
                <span className={`h-8 w-14 rounded-full flex items-center justify-center transition-all ${active ? 'bg-gradient-to-b from-white to-flame-soft shadow-[inset_0_1px_0_#fff,0_4px_10px_-4px_rgba(255,107,0,0.5)]' : ''}`}>
                  <Icon className={`w-[21px] h-[21px] ${active ? 'text-flame-deep' : 'text-ink-faint'}`} strokeWidth={active ? 2.3 : 1.9} />
                </span>
                <span className={`text-[0.6875rem] leading-none ${active ? 'font-bold text-ink' : 'font-medium text-ink-faint'}`}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
