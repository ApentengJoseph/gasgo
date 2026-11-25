import { NextRequest, NextResponse } from 'next/server';
import { adminGate } from '@/lib/server/admin';

export const dynamic = 'force-dynamic';

/** GET /api/admin/questions?status=open|answered|closed — questions from the FAQ form. */
export async function GET(req: NextRequest) {
  const g = await adminGate(req);
  if (g.error) return g.error;
  const status = req.nextUrl.searchParams.get('status') ?? 'open';
  const { data, error } = await g.admin.from('support_questions')
    .select('id, user_id, name, contact, question, status, answer, answered_at, created_at')
    .eq('status', ['open', 'answered', 'closed'].includes(status) ? status : 'open')
    .order('created_at', { ascending: status === 'open' }).limit(200);
  if (error) return NextResponse.json({ error: 'Could not load questions.' }, { status: 500 });
  return NextResponse.json({ questions: data ?? [] });
}
