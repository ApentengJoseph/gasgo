'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Eye, EyeOff, Flame, ShieldCheck, Bike, KeyRound, Copy } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { track } from '@/components/Layout/Analytics';

type Step = 'password' | 'challenge' | 'enroll';

/**
 * Email + password sign-in for riders and admins. After signing in we check
 * the role; anyone without the right role is signed straight back out.
 * Admins then confirm with a 6-digit code from an authenticator app (set up
 * once by scanning a QR code), so a stolen or phished password isn't enough.
 * Error messages never reveal whether an email exists.
 */
function Form({ role, mfa }: { role: 'rider' | 'admin'; mfa: boolean }) {
  const router = useRouter();
  const reason = useSearchParams()?.get('e');
  const isAdmin = role === 'admin';
  const [step, setStep] = useState<Step>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [code, setCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [qr, setQr] = useState('');
  const [secret, setSecret] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(reason === 'denied' ? 'Please sign in with an account that has access.' : '');

  const done = useCallback(() => {
    track('sign_in', { role });
    router.replace(isAdmin ? '/admin' : '/rider');
    router.refresh();
  }, [router, isAdmin, role]);

  /** Admin second step: use the existing authenticator, or set one up. */
  const startMfa = useCallback(async () => {
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.mfa.listFactors();
    if (err) { setError('Could not start the security check. Try again.'); return false; }
    const verified = data.totp.find(f => f.status === 'verified');
    if (verified) { setFactorId(verified.id); setStep('challenge'); return true; }
    // Clear half-finished setups, then start a fresh one
    for (const f of data.all.filter(f => f.status !== 'verified')) await supabase.auth.mfa.unenroll({ factorId: f.id }).catch(() => {});
    const { data: en, error: enErr } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: `GasRefill admin ${Date.now()}` });
    if (enErr || !en) { setError('Could not set up the authenticator. Try again.'); return false; }
    setFactorId(en.id); setQr(en.totp.qr_code); setSecret(en.totp.secret); setStep('enroll');
    return true;
  }, []);

  // Already signed in with a password but not the code yet (sent back here by the server)
  useEffect(() => {
    if (!isAdmin || !mfa || reason !== 'mfa') return;
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (p?.role === 'admin') { setEmail(user.email ?? ''); await startMfa(); }
    })();
  }, [isAdmin, mfa, reason, startMfa]);

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setBusy(true);
    const supabase = createClient();
    await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    const { data, error: err } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (err || !data.user) { setBusy(false); setError('Email or password is incorrect.'); return; }
    const { data: p } = await supabase.from('profiles').select('role, is_active').eq('id', data.user.id).maybeSingle();
    if (p?.role !== role || p?.is_active === false) {
      await supabase.auth.signOut().catch(() => {});
      setBusy(false); setError('Email or password is incorrect.');
      return;
    }
    setPassword('');
    if (isAdmin && mfa) { await startMfa(); setBusy(false); return; }
    done();
  };

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setBusy(true);
    const { error: err } = await createClient().auth.mfa.challengeAndVerify({ factorId, code: code.replace(/\D/g, '') });
    if (err) { setBusy(false); setCode(''); setError('That code didn’t work. Use the newest code in your app.'); return; }
    done();
  };

  const cancel = async () => {
    await createClient().auth.signOut().catch(() => {});
    setStep('password'); setCode(''); setQr(''); setSecret(''); setError('');
  };

  const field = 'w-full h-12 px-4 rounded-2xl bg-white/10 border border-white/15 text-white placeholder:text-white/40 outline-none focus:border-flame';

  return (
    <div className={`min-h-screen flex items-center justify-center px-5 py-10 ${isAdmin ? 'bg-ink' : 'glow-flame'}`}>
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8 text-white">
          <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-flame-light to-flame-deep flex items-center justify-center shadow-[0_10px_24px_-8px_rgba(255,107,0,0.8)]">
            {isAdmin ? <ShieldCheck className="w-6 h-6" /> : <Bike className="w-6 h-6" />}
          </span>
          <div>
            <p className="text-[1.25rem] font-extrabold tracking-tight leading-none">gas<span className="text-flame-light">refill</span></p>
            <p className="text-[0.75rem] text-white/60 font-semibold uppercase tracking-[0.14em] mt-1">{isAdmin ? 'Control centre' : 'Rider'}</p>
          </div>
        </div>

        <div className="rounded-[28px] bg-white/[0.06] border border-white/[0.12] backdrop-blur-xl p-6 text-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
          {step === 'password' && (
            <form onSubmit={submitPassword} className="space-y-4">
              <div>
                <h1 className="text-[1.375rem] font-extrabold tracking-tight">{isAdmin ? 'Admin sign in' : 'Sign in to ride'}</h1>
                <p className="text-white/60 text-[0.875rem] mt-1">{isAdmin ? 'Authorised GasRefill staff only.' : 'Use the email and password you applied with.'}</p>
              </div>
              <div>
                <label htmlFor="email" className="block text-[0.8125rem] font-semibold text-white/80 mb-1.5">Email</label>
                <input id="email" type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} className={field} placeholder="you@email.com" />
              </div>
              <div>
                <label htmlFor="password" className="block text-[0.8125rem] font-semibold text-white/80 mb-1.5">Password</label>
                <div className="relative">
                  <input id="password" type={show ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className={`${field} pr-12`} />
                  <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white/60">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && <Alert text={error} />}
              <button type="submit" disabled={busy} className="w-full h-12 rounded-full btn-primary">{busy ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}</button>
            </form>
          )}

          {step === 'enroll' && (
            <form onSubmit={submitCode} className="space-y-4">
              <div>
                <h1 className="text-[1.25rem] font-extrabold tracking-tight">Protect your admin account</h1>
                <p className="text-white/65 text-[0.875rem] mt-1">Scan this with Google Authenticator, Microsoft Authenticator or Authy. You’ll enter a code from the app every time you sign in.</p>
              </div>
              {qr && (
                <div className="mx-auto w-48 h-48 rounded-2xl bg-white p-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qr} alt="Authenticator QR code" className="w-full h-full" />
                </div>
              )}
              <button type="button" onClick={() => navigator.clipboard?.writeText(secret)} className="w-full text-[0.75rem] text-white/55 inline-flex items-center justify-center gap-1.5 break-all">
                <Copy className="w-3.5 h-3.5 shrink-0" /> Can’t scan? Key: <span className="font-mono text-white/80">{secret}</span>
              </button>
              <CodeInput code={code} setCode={setCode} />
              {error && <Alert text={error} />}
              <button type="submit" disabled={busy || code.length < 6} className="w-full h-12 rounded-full btn-primary">{busy ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Turn on and sign in'}</button>
              <button type="button" onClick={cancel} className="w-full text-[0.8125rem] text-white/55">Cancel</button>
            </form>
          )}

          {step === 'challenge' && (
            <form onSubmit={submitCode} className="space-y-4">
              <div>
                <span className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center mb-3"><KeyRound className="w-5 h-5" /></span>
                <h1 className="text-[1.25rem] font-extrabold tracking-tight">Enter your code</h1>
                <p className="text-white/65 text-[0.875rem] mt-1">Open your authenticator app and type the 6-digit GasRefill code{email ? ` for ${email}` : ''}.</p>
              </div>
              <CodeInput code={code} setCode={setCode} />
              {error && <Alert text={error} />}
              <button type="submit" disabled={busy || code.length < 6} className="w-full h-12 rounded-full btn-primary">{busy ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}</button>
              <button type="button" onClick={cancel} className="w-full text-[0.8125rem] text-white/55">Use a different account</button>
            </form>
          )}
        </div>

        {!isAdmin && (
          <p className="mt-5 text-center text-[0.875rem] text-white/70">
            Want to ride with GasRefill? <Link href="/rider/apply" className="font-bold text-white underline underline-offset-2">Apply here</Link>
          </p>
        )}
        <p className="mt-6 flex items-center justify-center gap-1.5 text-[0.75rem] text-white/40 text-center">
          <Flame className="w-3.5 h-3.5 shrink-0" /> GasRefill will never ask for your password or codes by phone or WhatsApp.
        </p>
      </div>
    </div>
  );
}

function CodeInput({ code, setCode }: { code: string; setCode: (v: string) => void }) {
  return (
    <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" autoFocus
      placeholder="000000" aria-label="6-digit code"
      className="w-full h-14 rounded-2xl bg-white/10 border border-white/15 text-white text-center text-[1.5rem] font-bold tracking-[0.5em] outline-none focus:border-flame placeholder:text-white/25" />
  );
}

function Alert({ text }: { text: string }) {
  return <p role="alert" className="rounded-2xl bg-[#DC2626]/20 border border-[#DC2626]/40 px-4 py-3 text-[0.875rem] text-[#FCA5A5]">{text}</p>;
}

export default function StaffLogin({ role, mfa = false }: { role: 'rider' | 'admin'; mfa?: boolean }) {
  return <Suspense><Form role={role} mfa={mfa} /></Suspense>;
}
