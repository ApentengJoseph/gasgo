'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, User } from 'lucide-react';

const tabs = [
  { href: '/rider', label: 'Drive', icon: Home, match: (p: string) => p === '/rider' },
  { href: '/rider/earnings', label: 'Earnings', icon: Wallet, match: (p: string) => p.startsWith('/rider/earnings') },
  { href: '/rider/profile', label: 'Profile', icon: User, match: (p: string) => p.startsWith('/rider/profile') },
];

/** Rider app frame: full-width screens with a dark tab bar (no tab bar on sign-in/apply). */
export default function RiderLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/rider';
  const bare = pathname.startsWith('/rider/login') || pathname.startsWith('/rider/apply');
  return (
    <div className="min-h-screen bg-[#F4EFE9]">
      <div className={bare ? '' : 'pb-24'}>{children}</div>
      {!bare && (
        <nav className="fixed bottom-0 inset-x-0 z-50 px-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)' }} aria-label="Rider">
          <ul className="max-w-md mx-auto grid grid-cols-3 h-16 rounded-full bg-ink/95 backdrop-blur-xl shadow-[0_18px_40px_-12px_rgba(0,0,0,0.5)] px-1.5">
            {tabs.map(({ href, label, icon: Icon, match }) => {
              const active = match(pathname);
              return (
                <li key={href}>
                  <Link href={href} aria-current={active ? 'page' : undefined} className="h-full flex flex-col items-center justify-center gap-1">
                    <span className={`h-8 w-14 rounded-full flex items-center justify-center transition-colors ${active ? 'bg-flame' : ''}`}>
                      <Icon className={`w-[20px] h-[20px] ${active ? 'text-white' : 'text-white/55'}`} strokeWidth={active ? 2.3 : 1.9} />
                    </span>
                    <span className={`text-[0.6875rem] leading-none ${active ? 'font-bold text-white' : 'font-medium text-white/55'}`}>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
