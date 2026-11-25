import { NextRequest, NextResponse } from 'next/server';
import { adminGate } from '@/lib/server/admin';

export const dynamic = 'force-dynamic';

/** GET /api/admin/audit — the latest admin actions (who did what, when). */
export async function GET(req: NextRequest) {
  const g = await adminGate(req);
  if (g.error) return g.error;
  const { data } = await g.admin.from('admin_audit')
    .select('id, action, target, details, created_at, profiles!admin_audit_admin_id_fkey(name)')
    .order('created_at', { ascending: false }).limit(200);
  return NextResponse.json({
    entries: (data ?? []).map((e: any) => ({ ...e, admin: e.profiles?.name ?? 'Admin', profiles: undefined })),
  });
}
