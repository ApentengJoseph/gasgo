import { NextRequest, NextResponse } from 'next/server';
import { adminGate, audit, isUuid } from '@/lib/server/admin';
import { fail, clean } from '@/lib/server/guard';

/** POST /api/admin/customers/:id { blocked: boolean, reason? } — stop (or allow again) orders from an account. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const g = await adminGate(req, { write: true });
  if (g.error) return g.error;
  if (!isUuid(params.id)) return fail(404, 'Not found.');
  const body = await req.json().catch(() => ({}));
  const { data: p } = await g.admin.from('profiles').select('id, role, name').eq('id', params.id).maybeSingle();
  if (!p || p.role !== 'customer') return fail(404, 'Customer not found.');
  const blocked = body.blocked === true;
  await g.admin.from('profiles').update({ is_active: !blocked }).eq('id', p.id);
  await audit(g.admin, g.user.id, blocked ? 'customer.block' : 'customer.unblock', p.name ?? p.id, { reason: clean(body.reason, 160) || null });
  return NextResponse.json({ ok: true });
}
