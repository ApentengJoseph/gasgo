import { NextRequest, NextResponse } from 'next/server';
import { requireApprovedRider, sameOrigin, fail } from '@/lib/server/guard';

/** POST /api/rider/online { online } — go online/offline (approved riders only). */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return fail(403, 'Not allowed.');
  const r = await requireApprovedRider();
  if (r.error) return r.error;
  const { online } = await req.json().catch(() => ({}));
  await r.admin.from('profiles').update({ is_online: !!online }).eq('id', r.user.id);
  return NextResponse.json({ ok: true, online: !!online });
}
