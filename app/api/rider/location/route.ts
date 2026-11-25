import { NextRequest, NextResponse } from 'next/server';
import { requireApprovedRider, rateLimited, fail } from '@/lib/server/guard';
import { ACTIVE } from '@/lib/orders/rules';

/**
 * POST /api/rider/location { lat, lng, heading, speed, accuracy }
 * Live position from the rider app (every ~4 s while online). Written to the
 * rider's active orders so each customer's tracking map updates in real time.
 * Rejects impossible coordinates and very inaccurate fixes.
 */
export async function POST(req: NextRequest) {
  const r = await requireApprovedRider();
  if (r.error) return r.error;
  if (rateLimited(`loc:${r.user.id}`, 30, 60 * 1000)) return new NextResponse(null, { status: 204 });
  const { lat, lng, heading, accuracy } = await req.json().catch(() => ({}));
  if (typeof lat !== 'number' || typeof lng !== 'number' || Math.abs(lat) > 90 || Math.abs(lng) > 180) return fail(400, 'Bad position');
  if (typeof accuracy === 'number' && accuracy > 150) return new NextResponse(null, { status: 204 }); // too fuzzy to show
  const h = typeof heading === 'number' && Number.isFinite(heading) ? heading : null;
  await Promise.all([
    r.admin.from('profiles').update({ current_lat: lat, current_lng: lng }).eq('id', r.user.id),
    r.admin.from('orders').update({ rider_lat: lat, rider_lng: lng, ...(h !== null ? { rider_heading: h } : {}) })
      .eq('rider_id', r.user.id).in('status', ACTIVE),
  ]);
  return new NextResponse(null, { status: 204 });
}
