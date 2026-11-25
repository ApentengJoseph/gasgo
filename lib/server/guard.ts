import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

/**
 * Server-side checks shared by every API route.
 * Never trust the browser: identity comes from the Supabase session cookie,
 * roles come from the database, money comes from the database.
 */

export type Role = 'customer' | 'rider' | 'admin';

export async function sessionUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/** Admins must have passed the second sign-in step (authenticator code) in this session. */
export const adminMfaRequired = () => process.env.ADMIN_MFA !== 'off';
async function hasAal2() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  return data?.currentLevel === 'aal2';
}

export function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

type Profile = { id: string; name: string | null; phone: string | null; role: Role; is_active: boolean | null };
type Admin = ReturnType<typeof createServiceRoleClient>;
export type Denied = { error: NextResponse; user?: undefined; profile?: undefined; admin?: undefined; rider?: undefined };
export type RoleOk = { error?: undefined; user: User; profile: Profile; admin: Admin };
export type RiderOk = RoleOk & { rider: Record<string, any> };

/** Returns the signed-in user and profile if they have `role`, otherwise a 401/403 response. */
export async function requireRole(role: Role): Promise<RoleOk | Denied> {
  const user = await sessionUser();
  if (!user) return { error: fail(401, 'Please sign in again.') };
  const admin = createServiceRoleClient();
  const { data: profile } = await admin.from('profiles').select('id, name, phone, role, is_active').eq('id', user.id).maybeSingle();
  if (!profile || profile.role !== role || profile.is_active === false) return { error: fail(403, 'You do not have access to this.') };
  if (role === 'admin' && adminMfaRequired() && !(await hasAal2())) return { error: fail(403, 'Confirm your sign-in with your authenticator code.') };
  return { user, profile: profile as Profile, admin };
}

/** Approved rider only (role rider + riders.status = approved). */
export async function requireApprovedRider(): Promise<RiderOk | Denied> {
  const r = await requireRole('rider');
  if (r.error) return { error: r.error };
  const { data: rider } = await r.admin.from('riders').select('*').eq('id', r.user.id).maybeSingle();
  if (!rider) return { error: fail(403, 'Your rider profile is missing. Contact GasRefill.') };
  if (rider.status !== 'approved') return { error: fail(403, rider.status === 'pending' ? 'Your account is waiting for approval.' : 'Your rider account is not active.') };
  return { ...r, rider };
}

// ── Rate limiting (per server instance; good against bursts and brute force) ──
const buckets = new Map<string, number[]>();
export function rateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter(t => now - t < windowMs);
  if (hits.length >= limit) { buckets.set(key, hits); return true; }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) buckets.clear(); // memory guard
  return false;
}

export function clientIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'local';
}

/** Rejects cross-site form posts (CSRF) for state-changing routes. */
export function sameOrigin(req: NextRequest) {
  const origin = req.headers.get('origin');
  if (!origin) return true; // same-origin fetches from older browsers may omit it
  try { return new URL(origin).host === req.headers.get('host'); } catch { return false; }
}

export const clean = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
export const isGhanaPhone = (p: string) => {
  const d = p.replace(/\D/g, '');
  return (d.length === 10 && d.startsWith('0')) || (d.length === 12 && d.startsWith('233'));
};
export const normalisePhone = (p: string) => {
  const d = p.replace(/\D/g, '');
  return d.startsWith('233') ? `0${d.slice(3)}` : d;
};
