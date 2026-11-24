'use client';

import { usePathname } from 'next/navigation';
import TopNav from '@/components/Navigation/TopNav';
import { useOrderHydrated } from '@/lib/store/guestOrder';

/**
 * Page frame per route:
 *  - "/"                 → full-width marketing page
 *  - /rider, /admin      → staff screens (narrow mobile frame)
 *  - customer app pages  → phone width on mobile; on desktop a top nav and a wider column
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/';
  useOrderHydrated(); // restore an in-progress order saved on this device

  if (pathname.startsWith('/rider') || pathname.startsWith('/admin')) {
    return (
      <main className="min-h-screen pb-24 pt-2 bg-[var(--surface-bg)]">
        <div className="max-w-md mx-auto px-4">{children}</div>
      </main>
    );
  }

  if (pathname === '/') {
    return (
      <>
        <TopNav variant="home" />
        <main className="min-h-screen pb-16 md:pb-0">{children}</main>
      </>
    );
  }

  return (
    <>
      <div className="app-backdrop" aria-hidden="true" />
      <TopNav variant="app" />
      <main className="min-h-screen pb-32 pt-5 md:pb-20 md:pt-10">
        <div className="max-w-md md:max-w-3xl mx-auto px-4 md:px-6">{children}</div>
      </main>
    </>
  );
}
