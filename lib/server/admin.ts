import type { NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireRole, sameOrigin, rateLimited, fail, type RoleOk, type Denied } from '@/lib/server/guard';

/**
 * Entry check for every /api/admin route: signed-in admin who passed the
 * authenticator step. Changes also need a same-site request and are rate limited.
 */
export async function adminGate(req: NextRequest, opts: { write?: boolean } = {}): Promise<RoleOk | Denied> {
  if (opts.write && !sameOrigin(req)) return { error: fail(403, 'Not allowed.') };
  const r = await requireRole('admin');
  if (r.error) return { error: r.error };
  if (opts.write && rateLimited(`admin-write:${r.user.id}`, 120, 60 * 1000)) return { error: fail(429, 'Slow down a little.') };
  return r;
}

/** Record an admin action (who, what, on which record). Never blocks the action. */
export async function audit(admin: SupabaseClient, adminId: string, action: string, target: string, details?: Record<string, unknown>) {
  await admin.from('admin_audit').insert({ admin_id: adminId, action, target, details: details ?? null }).then(() => {}, () => {});
}

/** Supabase returns at most 1000 rows per request; this pages through everything. */
export async function fetchAll<T = Record<string, unknown>>(
  build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
  max = 50000,
): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; from < max; from += 1000) {
    const { data, error } = await build(from, from + 999);
    if (error || !data) break;
    out.push(...data);
    if (data.length < 1000) break;
  }
  return out;
}

export const sum = (rows: Record<string, unknown>[], key: string) =>
  Math.round(rows.reduce((s, r) => s + (Number(r[key]) || 0), 0) * 100) / 100;

export const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
