'use client';

import { useState } from 'react';
import { Loader2, MessageCircleQuestion, Check } from 'lucide-react';

/** "Didn't find your answer?" — sends a question to the GasRefill team (answered from the admin dashboard). */
export default function AskQuestion() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [contact, setContact] = useState('');
  const [name, setName] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setState('sending');
    const res = await fetch('/api/support', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, contact, name }),
    }).catch(() => null);
    const d = await res?.json().catch(() => ({}));
    if (!res?.ok) { setError(d?.error || 'Could not send. Please try again.'); setState('idle'); return; }
    setState('sent');
  };

  if (state === 'sent') {
    return (
      <div className="mt-8 card p-5 flex items-center gap-3">
        <span className="icon-box icon-box-md icon-box-green"><Check className="w-5 h-5" /></span>
        <p className="text-ink"><b>Thanks, we got your question.</b> <span className="text-ink-muted">We’ll reply on the number or email you gave.</span></p>
      </div>
    );
  }

  return (
    <div className="mt-8 card p-5">
      {!open ? (
        <button onClick={() => setOpen(true)} className="w-full flex items-center gap-3 text-left">
          <span className="icon-box icon-box-md icon-box-accent"><MessageCircleQuestion className="w-5 h-5" /></span>
          <span className="flex-1">
            <span className="block font-bold text-ink">Didn’t find your answer?</span>
            <span className="block text-[0.875rem] text-ink-muted">Ask us anything. We usually reply the same day.</span>
          </span>
          <span className="h-10 px-4 rounded-full btn-dark text-[0.875rem] inline-flex items-center">Ask</span>
        </button>
      ) : (
        <form onSubmit={send} className="space-y-3">
          <label htmlFor="q" className="field-label">Your question</label>
          <textarea id="q" value={question} onChange={e => setQuestion(e.target.value)} rows={3} maxLength={1000} required
            placeholder="e.g. Can you pick up two cylinders from my shop?" className="input-field resize-none" />
          <div className="grid sm:grid-cols-2 gap-3">
            <input value={name} onChange={e => setName(e.target.value)} maxLength={80} placeholder="Your name (optional)" aria-label="Your name" className="input-field" />
            <input value={contact} onChange={e => setContact(e.target.value)} maxLength={100} required placeholder="Phone or email for our reply" aria-label="Phone or email" className="input-field" />
          </div>
          {error && <p role="alert" className="text-[0.875rem] text-[#B91C1C]">{error}</p>}
          <div className="flex gap-2.5">
            <button type="button" onClick={() => setOpen(false)} className="h-12 px-5 rounded-full btn-ghost">Cancel</button>
            <button type="submit" disabled={state === 'sending'} className="flex-1 h-12 rounded-full btn-primary">
              {state === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send question'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
