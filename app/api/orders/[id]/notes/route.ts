import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { sessionUser, fail, sameOrigin, clean } from '@/lib/server/guard';

/** POST /api/orders/:id/notes { notes } — change directions for the rider until the cylinder is picked up. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!sameOrigin(req)) return fail(403, 'Not allowed.');
  const user = await sessionUser();
  if (!user) return fail(401, 'Please refresh and try again.');
  const { notes } = await req.json().catch(() => ({}));
  const admin = createServiceRoleClient();
  const { data: o } = await admin.from('orders').select('id, user_id, status').eq('id', params.id).maybeSingle();
  if (!o || o.user_id !== user.id) return fail(404, 'Order not found.');
  if (!['pending', 'confirmed', 'assigned'].includes(o.status)) return fail(409, 'Your cylinder has already been picked up.');
  await admin.from('orders').update({ delivery_notes: clean(notes, 300) || null }).eq('id', o.id);
  return NextResponse.json({ ok: true });
}
