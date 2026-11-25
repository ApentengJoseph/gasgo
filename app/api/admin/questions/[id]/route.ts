import { NextRequest, NextResponse } from 'next/server';
import { adminGate, audit, isUuid } from '@/lib/server/admin';
import { fail, clean } from '@/lib/server/guard';

/**
 * POST /api/admin/questions/:id { answer } → saved, and sent to the customer's
 * notifications when they asked from the app. { close: true } just closes it.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const g = await adminGate(req, { write: true });
  if (g.error) return g.error;
  if (!isUuid(params.id)) return fail(404, 'Not found.');
  const { admin, user } = g;
  const body = await req.json().catch(() => ({}));
  const { data: q } = await admin.from('support_questions').select('id, user_id, question').eq('id', params.id).maybeSingle();
  if (!q) return fail(404, 'Not found.');
  const now = new Date().toISOString();

  if (body.close === true) {
    await admin.from('support_questions').update({ status: 'closed', answered_by: user.id, answered_at: now }).eq('id', q.id);
    await audit(admin, user.id, 'question.close', q.id);
    return NextResponse.json({ ok: true });
  }
  const answer = clean(body.answer, 1500);
  if (answer.length < 2) return fail(400, 'Type an answer.');
  await admin.from('support_questions').update({ status: 'answered', answer, answered_by: user.id, answered_at: now }).eq('id', q.id);
  if (q.user_id) {
    await admin.from('notifications').insert({
      user_id: q.user_id, type: 'support', title: 'GasRefill answered your question',
      message: `“${q.question.slice(0, 80)}${q.question.length > 80 ? '…' : ''}” — ${answer}`, data: {},
    });
  }
  await audit(admin, user.id, 'question.answer', q.id);
  return NextResponse.json({ ok: true, notified: !!q.user_id });
}
