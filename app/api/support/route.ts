import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { sessionUser, fail, rateLimited, clientIp, sameOrigin, clean } from '@/lib/server/guard';

/** POST /api/support { name?, contact, question } — "Ask us a question" from the FAQ. */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return fail(403, 'Not allowed.');
  if (rateLimited(`support:${clientIp(req)}`, 5, 60 * 60 * 1000)) return fail(429, 'You’ve sent a few questions already. Please try again later or WhatsApp us.');
  const body = await req.json().catch(() => ({}));
  const question = clean(body.question, 1000);
  const contact = clean(body.contact, 100);
  if (question.length < 5) return fail(400, 'Please type your question.');
  if (contact.length < 5) return fail(400, 'Add a phone number or email so we can reply.');
  const user = await sessionUser();
  const { error } = await createServiceRoleClient().from('support_questions').insert({
    user_id: user?.id ?? null, name: clean(body.name, 80) || null, contact, question,
  });
  if (error) return fail(500, 'Could not send your question. Please try again.');
  return NextResponse.json({ ok: true });
}
