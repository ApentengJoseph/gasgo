import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomInt } from 'crypto';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { sessionUser, fail, rateLimited, clientIp, sameOrigin } from '@/lib/server/guard';

/**
 * Use the same GasRefill account on another device.
 *
 * POST /api/auth/link-code            (signed in)  → { code, expiresAt }   create a one-time code
 * POST /api/auth/link-code { code }   (new device) → { email, tokenHash }  redeem it
 *
 * Codes: 8 characters from an unambiguous alphabet, valid 10 minutes, single use,
 * stored only as a SHA-256 hash, max 5 wrong tries per code and 10 tries per IP/hour.
 */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O, 1/I/L
const hash = (c: string) => createHash('sha256').update(c.toUpperCase().replace(/[^A-Z0-9]/g, '')).digest('hex');

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return fail(403, 'Not allowed.');
  const body = await req.json().catch(() => ({}));
  const admin = createServiceRoleClient();

  // ── Redeem on the new device ──
  if (body.code) {
    if (rateLimited(`link-redeem:${clientIp(req)}`, 10, 60 * 60 * 1000)) return fail(429, 'Too many tries. Please wait and try again.');
    const h = hash(String(body.code));
    const { data: row } = await admin.from('link_codes').select('*').eq('code_hash', h).maybeSingle();
    if (!row || row.used_at || new Date(row.expires_at) < new Date() || row.attempts >= 5) {
      return fail(400, 'That code is wrong or has expired. Create a new one on your other device.');
    }
    // Mark used first (single use even under races)
    const { data: claimed } = await admin.from('link_codes').update({ used_at: new Date().toISOString() })
      .eq('code_hash', h).is('used_at', null).select('user_id');
    if (!claimed?.length) return fail(400, 'That code was already used.');

    const { data: u } = await admin.auth.admin.getUserById(row.user_id);
    let email = u?.user?.email;
    if (!email) {
      // Anonymous account: give it a private placeholder email so a sign-in link can be made
      email = `guest-${row.user_id}@guests.gasrefill.invalid`;
      await admin.auth.admin.updateUserById(row.user_id, { email, email_confirm: true });
    }
    const { data: link, error } = await admin.auth.admin.generateLink({ type: 'magiclink', email });
    if (error || !link?.properties?.hashed_token) return fail(500, 'Could not link this device. Please try again.');
    return NextResponse.json({ email, tokenHash: link.properties.hashed_token });
  }

  // ── Create on the signed-in device ──
  const user = await sessionUser();
  if (!user) return fail(401, 'Please refresh and try again.');
  if (rateLimited(`link-create:${user.id}`, 5, 60 * 60 * 1000)) return fail(429, 'Too many codes. Please wait a little.');
  const code = Array.from({ length: 8 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await admin.from('link_codes').delete().eq('user_id', user.id).is('used_at', null); // one live code per account
  const { error } = await admin.from('link_codes').insert({ code_hash: hash(code), user_id: user.id, expires_at: expiresAt });
  if (error) return fail(500, 'Could not create a code. Please try again.');
  return NextResponse.json({ code: `${code.slice(0, 4)}-${code.slice(4)}`, expiresAt });
}
