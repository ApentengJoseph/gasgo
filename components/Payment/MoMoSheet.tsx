'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { X, Loader2, CheckCircle2, AlertCircle, Smartphone } from 'lucide-react';
import PrimaryButton from '@/components/Buttons/PrimaryButton';

type Network = 'MTN' | 'TELECEL' | 'AIRTELTIGO';
type State = 'idle' | 'sending' | 'awaiting_otp' | 'submitting_otp' | 'awaiting_pin' | 'success' | 'failed';

const NETWORKS: { id: Network; label: string; logo: string }[] = [
  { id: 'MTN',        label: 'MTN MoMo',          logo: '/mtn-log.png' },
  { id: 'TELECEL',    label: 'Telecel Cash',      logo: '/telecel-logo.png' },
  { id: 'AIRTELTIGO', label: 'AirtelTigo Money',  logo: '/airtel-tigo-log.png' },
];

/** Guess the network from a Ghana number prefix (customer can still change it). */
function guessNetwork(phone: string): Network | null {
  const d = phone.replace(/\D/g, '').replace(/^233/, '0');
  const p = d.slice(0, 3);
  if (['024', '054', '055', '059', '025', '053'].includes(p)) return 'MTN';
  if (['020', '050'].includes(p)) return 'TELECEL';
  if (['026', '056', '027', '057'].includes(p)) return 'AIRTELTIGO';
  return null;
}

const POLL_MS = 5000;
const TIMEOUT_MS = 180000;

export default function MoMoSheet({
  open, onClose, orderId, total, phone: initialPhone, email, onPaid,
}: {
  open: boolean;
  onClose: () => void;
  orderId: string;
  total: number;
  phone: string;
  email?: string | null;
  onPaid: (reference: string) => void;
}) {
  const [phone, setPhone] = useState(initialPhone);
  const [network, setNetwork] = useState<Network | null>(guessNetwork(initialPhone));
  const [state, setState] = useState<State>('idle');
  const [message, setMessage] = useState('');
  const [reference, setReference] = useState('');
  const [otp, setOtp] = useState('');
  const poll = useRef<ReturnType<typeof setTimeout> | null>(null);
  const started = useRef(0);

  useEffect(() => { setPhone(initialPhone); setNetwork(guessNetwork(initialPhone)); }, [initialPhone]);
  useEffect(() => () => { if (poll.current) clearTimeout(poll.current); }, []);

  const succeed = async (ref: string) => {
    setState('success');
    setMessage('Payment received');
    // Make sure the order is marked paid on the server
    await fetch(`/api/payments/charge/status?reference=${ref}`).catch(() => {});
    setTimeout(() => onPaid(ref), 1000);
  };

  const check = async (ref: string) => {
    if (Date.now() - started.current > TIMEOUT_MS) {
      setState('failed'); setMessage('We didn’t get a confirmation in time. If money left your wallet, contact us.'); return;
    }
    try {
      const d = await (await fetch(`/api/payments/charge/status?reference=${ref}`)).json();
      if (d.status === 'success') return succeed(ref);
      if (d.status === 'failed') { setState('failed'); setMessage('The payment was declined. Please try again.'); return; }
    } catch { /* keep polling */ }
    poll.current = setTimeout(() => check(ref), POLL_MS);
  };

  const handleResult = (d: any, ref: string) => {
    if (d.status === 'success') return succeed(ref);
    if (d.status === 'send_otp') { setState('awaiting_otp'); setMessage(d.displayText || 'Enter the code sent to your phone.'); return; }
    setState('awaiting_pin');
    setMessage(d.displayText || 'Check your phone and enter your MoMo PIN to approve.');
    started.current = Date.now();
    poll.current = setTimeout(() => check(ref), POLL_MS);
  };

  const pay = async () => {
    if (!network) return;
    setState('sending'); setMessage('');
    try {
      const res = await fetch('/api/payments/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, phone, network, email: email || undefined }),
      });
      const d = await res.json();
      if (!res.ok || !d.success) { setState('failed'); setMessage(d.error || 'We could not start the payment.'); return; }
      setReference(d.reference);
      handleResult(d, d.reference);
    } catch {
      setState('failed'); setMessage('Network problem. Please try again.');
    }
  };

  const submitOtp = async () => {
    setState('submitting_otp');
    try {
      const res = await fetch('/api/payments/charge/submit-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otp.trim(), reference }),
      });
      const d = await res.json();
      if (!res.ok || !d.success) { setState('awaiting_otp'); setMessage(d.error || 'That code didn’t work. Try again.'); return; }
      handleResult(d, reference);
    } catch {
      setState('awaiting_otp'); setMessage('Network problem. Please try again.');
    }
  };

  if (!open) return null;
  const busy = state === 'sending' || state === 'awaiting_pin' || state === 'submitting_otp' || state === 'success';
  const phoneOk = phone.replace(/\D/g, '').length >= 9;

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-ink/60 backdrop-blur-sm" onClick={busy ? undefined : onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pay with Mobile Money"
        onClick={e => e.stopPropagation()}
        className="w-full md:max-w-md bg-white/85 backdrop-blur-2xl border border-white/80 shadow-[inset_0_1px_0_#fff,0_30px_80px_-20px_rgba(0,0,0,0.45)] rounded-t-[32px] md:rounded-[32px] p-6 pb-8 animate-slide-up"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[0.8125rem] text-ink-muted">Pay with Mobile Money</p>
            <p className="text-[1.75rem] font-extrabold tracking-tight text-ink tabular-nums">GH₵{total.toFixed(2)}</p>
          </div>
          {!busy && (
            <button onClick={onClose} aria-label="Close" className="w-10 h-10 rounded-full bg-cream flex items-center justify-center hover:bg-cream-deep">
              <X className="w-5 h-5 text-ink" />
            </button>
          )}
        </div>

        {state === 'success' ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-14 h-14 mx-auto text-[#15803D]" />
            <p className="mt-3 text-[1.25rem] font-bold text-ink">Payment received</p>
            <p className="text-ink-muted">Taking you to live tracking…</p>
          </div>
        ) : state === 'awaiting_pin' ? (
          <div className="py-6 text-center">
            <div className="relative w-16 h-16 mx-auto">
              <span className="absolute inset-0 rounded-full bg-flame/30 animate-ping-soft" />
              <span className="relative w-16 h-16 rounded-full bg-flame-soft flex items-center justify-center">
                <Smartphone className="w-7 h-7 text-flame-deep" />
              </span>
            </div>
            <p className="mt-4 text-[1.125rem] font-bold text-ink">Approve on your phone</p>
            <p className="mt-1 text-ink-muted text-[0.9375rem]">{message}</p>
            <p className="mt-4 inline-flex items-center gap-2 text-[0.8125rem] text-ink-faint"><Loader2 className="w-4 h-4 animate-spin" /> Waiting for confirmation</p>
          </div>
        ) : state === 'awaiting_otp' || state === 'submitting_otp' ? (
          <div>
            <p className="text-ink-muted mb-3 text-[0.9375rem]">{message}</p>
            <input
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
              inputMode="numeric"
              autoFocus
              placeholder="Code"
              className="input-field text-center text-[1.25rem] tracking-[0.4em] font-bold"
            />
            <PrimaryButton fullWidth size="lg" className="mt-4" onClick={submitOtp} loading={state === 'submitting_otp'} disabled={otp.length < 4}>
              Confirm code
            </PrimaryButton>
          </div>
        ) : (
          <div>
            <label className="field-label" htmlFor="momo-phone">MoMo number</label>
            <input
              id="momo-phone"
              value={phone}
              onChange={e => { setPhone(e.target.value); const g = guessNetwork(e.target.value); if (g) setNetwork(g); }}
              inputMode="tel"
              placeholder="024 123 4567"
              className="input-field"
            />
            <p className="field-label mt-5">Network</p>
            <div className="grid grid-cols-3 gap-2.5">
              {NETWORKS.map(n => (
                <button
                  key={n.id}
                  onClick={() => setNetwork(n.id)}
                  aria-pressed={network === n.id}
                  className={`glass !rounded-[20px] h-20 flex flex-col items-center justify-center gap-1.5 transition-all ${network === n.id ? 'card-selected' : ''}`}
                >
                  <Image src={n.logo} alt="" width={44} height={26} className="h-6 w-auto object-contain" />
                  <span className="text-[0.75rem] font-semibold text-ink">{n.label}</span>
                </button>
              ))}
            </div>

            {state === 'failed' && (
              <p className="mt-4 flex items-start gap-2 rounded-2xl bg-[#FDECEC] px-4 py-3 text-[0.875rem] text-[#B91C1C]">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {message}
              </p>
            )}

            <PrimaryButton fullWidth size="lg" className="mt-6" onClick={pay} loading={state === 'sending'} disabled={!network || !phoneOk}>
              Send payment request
            </PrimaryButton>
            <p className="mt-3 text-center text-[0.75rem] text-ink-faint">Secured by Paystack. You’ll approve with your MoMo PIN.</p>
          </div>
        )}
      </div>
    </div>
  );
}
