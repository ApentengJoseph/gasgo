'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, ArrowRight, Bell, User } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';

const links = [
  { href: '/stations', label: 'Order gas' },
  { href: '/orders',   label: 'My orders' },
];

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="GasRefill home">
      <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-flame-light to-flame-deep shadow-[0_6px_14px_-6px_rgba(255,107,0,0.8)]">
        <Flame className="w-5 h-5 text-white" strokeWidth={2.4} />
      </span>
      <span className={`text-[1.3rem] font-extrabold tracking-[-0.045em] ${dark ? 'text-white' : 'text-ink'}`}>
        gas<span className={dark ? 'text-flame-light' : 'text-flame'}>refill</span>
      </span>
    </Link>
  );
}

/**
 * variant="home": transparent bar over the dark hero (all screen sizes).
 * variant="app":  white bar on app pages (desktop only — phones use the bottom tab bar).
 */
export default function TopNav({ variant }: { variant: 'home' | 'app' }) {
  const pathname = usePathname() ?? '/';
  const { userName } = useAuth();
  const onDark = variant === 'home';
  const firstName = userName?.split(' ')[0];

  const linkCls = (active: boolean) =>
    `px-3.5 h-10 inline-flex items-center rounded-full text-[0.9375rem] font-medium transition-colors ${
      onDark
        ? 'text-white/75 hover:text-white hover:bg-white/10'
        : active ? 'text-ink bg-cream-deep' : 'text-ink-muted hover:text-ink hover:bg-cream'
    }`;
  const iconBtn = (active: boolean) =>
    `w-10 h-10 inline-flex items-center justify-center rounded-full transition-colors ${
      onDark ? 'text-white/80 hover:bg-white/10' : active ? 'bg-cream-deep text-ink' : 'text-ink-muted hover:bg-cream hover:text-ink'
    }`;

  return (
    <header
      className={onDark
        ? 'absolute top-0 inset-x-0 z-40'
        : 'hidden md:block sticky top-3 z-40 px-4'}
    >
      <div className={`max-w-6xl mx-auto flex items-center gap-6 ${onDark ? 'px-5 md:px-8 h-16 md:h-[72px]' : 'glass !rounded-full h-[64px] pl-4 pr-2'}`}>
        <Logo dark={onDark} />

        <nav className="hidden md:flex items-center gap-1" aria-label="Main">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={linkCls(pathname.startsWith(l.href))}>{l.label}</Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Link href="/notifications" aria-label="Alerts" className={`hidden md:inline-flex ${iconBtn(pathname.startsWith('/notifications'))}`}>
            <Bell className="w-[19px] h-[19px]" />
          </Link>
          <Link
            href="/profile"
            className={`hidden md:inline-flex items-center gap-2 h-10 pl-2 pr-3.5 rounded-full text-[0.9375rem] font-medium transition-colors ${
              onDark ? 'text-white/85 hover:bg-white/10' : pathname.startsWith('/profile') ? 'bg-cream-deep text-ink' : 'text-ink-muted hover:bg-cream hover:text-ink'
            }`}
          >
            <span className={`w-7 h-7 rounded-full flex items-center justify-center ${onDark ? 'bg-white/15' : 'bg-cream-deep'}`}>
              <User className="w-4 h-4" />
            </span>
            {firstName ?? 'Account'}
          </Link>
          <Link
            href="/stations"
            className="ml-1.5 inline-flex items-center gap-1.5 h-10 px-4 md:px-5 rounded-full btn-primary text-[0.875rem] md:text-[0.9375rem] font-bold"
          >
            Order gas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
