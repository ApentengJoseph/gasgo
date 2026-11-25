'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { MessageCircle, Phone, Mail } from 'lucide-react';
import { useAdmin, adminSend, ago, PageHead, Tabs, Loading, ErrorNote, Empty, PromptSheet } from '@/components/Admin/ui';

type Q = { id: string; user_id: string | null; name: string | null; contact: string; question: string; status: string; answer: string | null; answered_at: string | null; created_at: string };
type View = 'open' | 'answered' | 'closed';

/** Questions from the FAQ "Ask us" form: answer in the app, reply on WhatsApp/phone/email, or close. */
export default function AdminQuestionsPage() {
  const [view, setView] = useState<View>('open');
  const { data, error, loading, reload } = useAdmin<{ questions: Q[] }>(`/api/admin/questions?status=${view}`, 30000);
  const [answering, setAnswering] = useState<Q | null>(null);

  const close = async (q: Q) => {
    try { await adminSend(`/api/admin/questions/${q.id}`, { close: true }); toast.success('Closed'); reload(); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <>
      <PageHead title="Questions" sub="Sent from the FAQ on the home page" />
      <Tabs<View> value={view} onChange={setView} items={[{ id: 'open', label: 'New', count: view === 'open' ? data?.questions.length : undefined }, { id: 'answered', label: 'Answered' }, { id: 'closed', label: 'Closed' }]} />
      {error && <ErrorNote text={error} retry={reload} />}
      {loading && !data ? <Loading /> : data && (data.questions.length === 0 ? <Empty text={view === 'open' ? 'No new questions.' : 'Nothing here yet.'} /> : (
        <ul className="space-y-3">
          {data.questions.map(q => {
            const digits = q.contact.replace(/\D/g, '');
            const isPhone = digits.length >= 9 && !q.contact.includes('@');
            const isEmail = /\S+@\S+\.\S+/.test(q.contact);
            return (
              <li key={q.id} className="rounded-3xl bg-white border border-line p-4 md:p-5">
                <p className="text-[0.8125rem] text-ink-muted">{q.name || 'Someone'} · {q.contact} · {ago(q.created_at)}{q.user_id ? ' · has the app' : ''}</p>
                <p className="mt-1.5 text-ink text-[1rem] whitespace-pre-wrap">{q.question}</p>
                {q.answer && <p className="mt-3 rounded-2xl bg-cream px-4 py-3 text-[0.9375rem] text-ink"><b>Answer:</b> {q.answer}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {view === 'open' && <button onClick={() => setAnswering(q)} className="h-10 px-5 rounded-full btn-primary text-[0.875rem]">{q.user_id ? 'Answer in app' : 'Save answer'}</button>}
                  {isPhone && <a href={`https://wa.me/233${digits.replace(/^233/, '').replace(/^0/, '')}?text=${encodeURIComponent(`Hello${q.name ? ` ${q.name}` : ''}, this is GasRefill about your question: “${q.question.slice(0, 120)}”`)}`} target="_blank" rel="noopener noreferrer" className="h-10 px-4 rounded-full bg-[#E8F6EC] text-[#15803D] font-semibold text-[0.875rem] inline-flex items-center gap-1.5"><MessageCircle className="w-4 h-4" /> WhatsApp</a>}
                  {isPhone && <a href={`tel:${q.contact}`} className="h-10 px-4 rounded-full btn-ghost !bg-white text-[0.875rem] inline-flex items-center gap-1.5"><Phone className="w-4 h-4" /> Call</a>}
                  {isEmail && <a href={`mailto:${q.contact}?subject=${encodeURIComponent('Your GasRefill question')}`} className="h-10 px-4 rounded-full btn-ghost !bg-white text-[0.875rem] inline-flex items-center gap-1.5"><Mail className="w-4 h-4" /> Email</a>}
                  {view !== 'closed' && <button onClick={() => close(q)} className="h-10 px-4 rounded-full text-ink-muted font-semibold text-[0.875rem]">Close</button>}
                </div>
              </li>
            );
          })}
        </ul>
      ))}
      <PromptSheet open={!!answering} onClose={() => setAnswering(null)} title="Answer" multiline cta={answering?.user_id ? 'Send answer' : 'Save answer'}
        label={answering?.user_id ? 'They’ll see this in their notifications in the app.' : 'They didn’t ask from a signed-in app, so also reply on WhatsApp, phone or email.'}
        placeholder="Type your answer" onSubmit={async answer => { const r = await adminSend(`/api/admin/questions/${answering!.id}`, { answer }); toast.success(r.notified ? 'Answer sent' : 'Answer saved'); await reload(); }} />
    </>
  );
}
