import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { sessionUser, rateLimited, clientIp, clean } from '@/lib/server/guard';

/**
 * POST /api/events { sessionId, device, events: [{ event, path, meta }] }
 * Anonymous product analytics for the admin dashboard (sessions, time in app,
 * funnel). No names, phones or addresses are stored here.
 */
const ALLOWED = new Set(['session_start', 'page_view', 'heartbeat', 'checkout_start', 'order_placed', 'payment_retry', 'order_cancelled', 'sign_in', 'device_linked']);

export async function POST(req: NextRequest) {
  if (rateLimited(`events:${clientIp(req)}`, 120, 60 * 1000)) return new NextResponse(null, { status: 204 });
  const body = await req.json().catch(() => null);
  const sessionId = clean(body?.sessionId, 64);
  if (!sessionId || !Array.isArray(body?.events)) return new NextResponse(null, { status: 204 });
  const user = await sessionUser().catch(() => null);
  const device = body.device === 'mobile' ? 'mobile' : 'desktop';
  const rows = body.events.slice(0, 20)
    .filter((e: any) => ALLOWED.has(e?.event))
    .map((e: any) => ({
      user_id: user?.id ?? null, session_id: sessionId, event: e.event, device,
      path: clean(e.path, 120) || null,
      meta: e.meta && typeof e.meta === 'object' ? JSON.parse(JSON.stringify(e.meta).slice(0, 500)) : null,
    }));
  if (rows.length) await createServiceRoleClient().from('app_events').insert(rows).then(() => {}, () => {});
  return new NextResponse(null, { status: 204 });
}
