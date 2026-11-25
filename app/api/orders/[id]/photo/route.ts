import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { sessionUser, fail } from '@/lib/server/guard';

/** GET /api/orders/:id/photo — short-lived link to the refill photo (order owner, its rider, or admin). */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await sessionUser();
  if (!user) return fail(401, 'Please sign in.');
  const admin = createServiceRoleClient();
  const { data: o } = await admin.from('orders').select('user_id, rider_id, refill_photo_path').eq('id', params.id).maybeSingle();
  if (!o?.refill_photo_path) return fail(404, 'No photo.');
  if (o.user_id !== user.id && o.rider_id !== user.id) {
    const { data: p } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (p?.role !== 'admin') return fail(404, 'No photo.');
  }
  const { data } = await admin.storage.from('refill-photos').createSignedUrl(o.refill_photo_path, 60 * 10);
  return NextResponse.json({ url: data?.signedUrl ?? null });
}
