import { NextRequest, NextResponse } from 'next/server';
import { requireApprovedRider, fail, sameOrigin } from '@/lib/server/guard';

/**
 * POST /api/rider/orders/:id/photo (multipart "photo") — optional photo of the
 * full cylinder at the station, shown to the customer. JPEG/PNG/WebP up to 6 MB,
 * stored in a private bucket (customers see it through a short-lived link).
 */
const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!sameOrigin(req)) return fail(403, 'Not allowed.');
  const r = await requireApprovedRider();
  if (r.error) return r.error;
  const { admin, user } = r;
  const { data: o } = await admin.from('orders').select('id, rider_id, status').eq('id', params.id).maybeSingle();
  if (!o || o.rider_id !== user.id) return fail(403, 'This is not your job.');
  if (!['collected', 'at_station', 'on_the_way', 'arriving'].includes(o.status)) return fail(409, 'Add the photo at the station.');

  const form = await req.formData().catch(() => null);
  const file = form?.get('photo');
  if (!(file instanceof File)) return fail(400, 'No photo received.');
  const ext = TYPES[file.type];
  if (!ext) return fail(400, 'Use a JPG, PNG or WebP photo.');
  if (file.size > 6 * 1024 * 1024) return fail(400, 'Photo is too large (max 6 MB).');

  const path = `${o.id}/${Date.now()}.${ext}`;
  const { error } = await admin.storage.from('refill-photos').upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
  if (error) return fail(500, 'Upload failed. Please try again.');
  await admin.from('orders').update({ refill_photo_path: path }).eq('id', o.id);
  return NextResponse.json({ ok: true });
}
