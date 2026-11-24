import { NextRequest, NextResponse } from 'next/server';
import { randomUUID, randomBytes } from 'crypto';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { GUEST_EMAIL_DOMAIN } from '@/lib/utils/constants';

/**
 * POST /api/auth/guest
 * Fallback for when Supabase "anonymous sign-ins" is switched off: creates a
 * private guest login for this device and returns its credentials, which the
 * browser uses once to sign in. The email is a non-deliverable placeholder.
 */

// Basic abuse guard (per server instance): at most 10 guest logins per IP per hour.
const hits = new Map<string, number[]>();
function allowed(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter(t => now - t < 36e5);
  if (recent.length >= 10) return false;
  hits.set(ip, [...recent, now]);
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (!allowed(ip)) return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });

  const email = `guest-${randomUUID()}@${GUEST_EMAIL_DOMAIN}`;
  const password = randomBytes(24).toString('base64url');
  const admin = createServiceRoleClient();
  const create = () => admin.auth.admin.createUser({ email, password, email_confirm: true })
    .catch(e => ({ data: { user: null }, error: e as Error }));
  let { data, error } = await create();
  if (error && /fetch failed|ECONNRESET|network/i.test(error.message)) ({ data, error } = await create()); // one retry for dropped connections
  if (error || !data.user) {
    console.error('[auth/guest]', error?.message);
    return NextResponse.json({ error: 'Could not start a guest session.' }, { status: 500 });
  }
  await admin.from('profiles').upsert({ id: data.user.id, role: 'customer' }, { onConflict: 'id' });
  return NextResponse.json({ email, password });
}
