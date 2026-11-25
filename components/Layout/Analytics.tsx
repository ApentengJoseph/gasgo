'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Anonymous usage tracking for the admin dashboard: sessions, page views and
 * time in app (a heartbeat every 30 s while the page is visible). Events are
 * batched and sent with sendBeacon so they never slow the app down.
 */
const HEARTBEAT_MS = 30000;
let queue: { event: string; path?: string; meta?: Record<string, unknown> }[] = [];

function sessionId() {
  try {
    let id = sessionStorage.getItem('gr-session');
    if (!id) { id = crypto.randomUUID(); sessionStorage.setItem('gr-session', id); }
    return id;
  } catch { return 'no-storage'; }
}

function flush() {
  if (!queue.length) return;
  const body = JSON.stringify({ sessionId: sessionId(), device: window.innerWidth < 768 ? 'mobile' : 'desktop', events: queue.splice(0, 20) });
  if (navigator.sendBeacon) navigator.sendBeacon('/api/events', new Blob([body], { type: 'application/json' }));
  else fetch('/api/events', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
}

/** Record a business event from anywhere (e.g. track('order_placed')). */
export function track(event: string, meta?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  queue.push({ event, path: location.pathname, meta });
  setTimeout(flush, 500);
}

export default function Analytics() {
  const pathname = usePathname();
  const started = useRef(false);

  useEffect(() => {
    if (!started.current) {
      started.current = true;
      try { if (!sessionStorage.getItem('gr-started')) { sessionStorage.setItem('gr-started', '1'); track('session_start'); } } catch { /* ignore */ }
      const beat = setInterval(() => { if (document.visibilityState === 'visible') track('heartbeat'); }, HEARTBEAT_MS);
      const hide = () => { if (document.visibilityState === 'hidden') flush(); };
      document.addEventListener('visibilitychange', hide);
      return () => { clearInterval(beat); document.removeEventListener('visibilitychange', hide); };
    }
  }, []);

  useEffect(() => { if (pathname && !pathname.startsWith('/admin')) track('page_view'); }, [pathname]);
  return null;
}
