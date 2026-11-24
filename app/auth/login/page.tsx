'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/Navigation/TopNav';

/**
 * Sign in for saved accounts (customers who added an email), riders and admins.
 * New customers never need this page: they can order straight away as guests.
 */
function Login() {
  const router = useRouter();
  const redirect = useSearchParams()?.get('redirect');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setBusy(true);
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (err || !data.user) {
      setError(err?.message?.toLowerCase().includes('invalid') ? 'That email and password don’t match.' : (err?.message ?? 'Could not sign in.'));
      setBusy(false);
      return;
    }
    const { data: prof } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
    const dest = prof?.role === 'rider' ? '/rider' : prof?.role === 'admin' ? '/admin' : (redirect?.startsWith('/') ? redirect : '/orders');
    router.replace(dest);
    router.refresh();
  };

  const forgot = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Enter your email first, then tap “Forgot password”.'); return; }
    setError('');
    await createClient().auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/auth/login` });
    setResetSent(true);
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8"><Logo /></div>
        <div className="card p-6 md:p-7">
          <h1 className="text-[1.5rem] font-extrabold tracking-tight text-ink">Welcome back</h1>
          <p className="text-ink-muted text-[0.9375rem] mt-1 mb-6">Sign in with the email you saved on your account.</p>

          <form onSubmit={signIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="field-label">Email</label>
              <input id="email" type="email" inputMode="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@email.com" required />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="field-label">Password</label>
                <button type="button" onClick={forgot} className="text-[0.8125rem] font-semibold text-flame-deep mb-2">Forgot password?</button>
              </div>
              <div className="relative">
                <input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="input-field pr-12" required />
                <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-ink-faint">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p role="alert" className="rounded-2xl bg-[#FDECEC] px-4 py-3 text-[0.875rem] text-[#B91C1C]">{error}</p>}
            {resetSent && <p className="rounded-2xl bg-[#E8F6EC] px-4 py-3 text-[0.875rem] text-[#166534]">Check your email for a link to reset your password.</p>}
            <button type="submit" disabled={busy} className="w-full h-14 rounded-full btn-primary disabled:opacity-60">
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-[0.9375rem] text-ink-muted">
          New here? <Link href="/stations" className="font-semibold text-ink underline underline-offset-2">Just order. No account needed.</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><Login /></Suspense>;
}
