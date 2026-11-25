'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Bike, Truck, Check, ArrowLeft } from 'lucide-react';

const field = 'w-full h-12 px-4 rounded-2xl bg-white border border-line text-ink outline-none focus:border-flame focus:shadow-[0_0_0_4px_rgba(255,107,0,0.12)]';

/** Apply to ride. Creates a login + pending rider profile; an admin approves before any jobs. */
export default function RiderApplyPage() {
  const [f, setF] = useState({
    name: '', phone: '', email: '', password: '', vehicleType: 'motorbike', vehicleReg: '',
    licenceNo: '', ghanaCardNo: '', momoNumber: '', momoNetwork: 'MTN', emergencyContact: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF(v => ({ ...v, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setBusy(true);
    const res = await fetch('/api/rider/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) }).catch(() => null);
    const d = await res?.json().catch(() => ({}));
    setBusy(false);
    if (!res?.ok) { setError(d?.error || 'Could not send your application.'); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen glow-flame flex items-center justify-center px-5 text-white text-center">
        <div className="max-w-sm">
          <span className="mx-auto w-16 h-16 rounded-full bg-white/15 flex items-center justify-center"><Check className="w-8 h-8" /></span>
          <h1 className="mt-5 text-[1.75rem] font-extrabold tracking-tight">Application sent</h1>
          <p className="mt-2 text-white/75">We’ll check your details and approve your account. Sign in anytime to see your status.</p>
          <Link href="/rider/login" className="mt-7 inline-flex h-12 px-7 items-center rounded-full btn-primary">Go to sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EFE9]">
      <div className="glow-flame text-white px-5 pt-10 pb-16">
        <div className="max-w-lg mx-auto">
          <Link href="/rider/login" className="inline-flex items-center gap-1.5 text-white/70 text-[0.875rem]"><ArrowLeft className="w-4 h-4" /> Sign in</Link>
          <h1 className="mt-4 text-[2rem] leading-tight font-extrabold tracking-tight">Ride with GasRefill</h1>
          <p className="mt-1.5 text-white/75">Earn on every pickup in Koforidua. Get paid to your MoMo.</p>
        </div>
      </div>
      <form onSubmit={submit} className="max-w-lg mx-auto -mt-10 px-4 pb-16 space-y-4">
        {error && <p role="alert" className="rounded-2xl bg-[#FDECEC] px-4 py-3 text-[0.875rem] text-[#B91C1C]">{error}</p>}

        <section className="card !bg-white p-5 space-y-3.5">
          <h2 className="font-bold text-ink">About you</h2>
          <input className={field} placeholder="Full name (as on Ghana Card)" value={f.name} onChange={set('name')} required autoComplete="name" />
          <input className={field} placeholder="Phone number" value={f.phone} onChange={set('phone')} required inputMode="tel" autoComplete="tel" />
          <input className={field} placeholder="Ghana Card number (GHA-XXXXXXXXX-X)" value={f.ghanaCardNo} onChange={set('ghanaCardNo')} required />
          <input className={field} placeholder="Emergency contact (name and phone)" value={f.emergencyContact} onChange={set('emergencyContact')} />
        </section>

        <section className="card !bg-white p-5 space-y-3.5">
          <h2 className="font-bold text-ink">Your vehicle</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {([['motorbike', 'Motorbike', Bike], ['tricycle', 'Tricycle (aboboyaa)', Truck]] as const).map(([v, label, Icon]) => (
              <button type="button" key={v} onClick={() => setF(x => ({ ...x, vehicleType: v }))} aria-pressed={f.vehicleType === v}
                className={`h-16 rounded-2xl border-[1.5px] flex items-center justify-center gap-2 font-semibold text-[0.875rem] ${f.vehicleType === v ? 'border-flame bg-cream text-ink' : 'border-line text-ink-muted bg-white'}`}>
                <Icon className="w-5 h-5" /> {label}
              </button>
            ))}
          </div>
          <input className={field} placeholder="Registration number (e.g. M-24-ER 1234)" value={f.vehicleReg} onChange={set('vehicleReg')} required />
          <input className={field} placeholder="Driver’s licence number" value={f.licenceNo} onChange={set('licenceNo')} required />
        </section>

        <section className="card !bg-white p-5 space-y-3.5">
          <h2 className="font-bold text-ink">Payouts</h2>
          <p className="text-[0.8125rem] text-ink-muted -mt-2">Your earnings are paid to this Mobile Money number. Only GasRefill can change it later.</p>
          <div className="grid grid-cols-[1fr_auto] gap-2.5">
            <input className={field} placeholder="MoMo number" value={f.momoNumber} onChange={set('momoNumber')} required inputMode="tel" />
            <select className={`${field} !w-auto`} value={f.momoNetwork} onChange={set('momoNetwork')} aria-label="MoMo network">
              <option value="MTN">MTN</option><option value="TELECEL">Telecel</option><option value="AIRTELTIGO">AirtelTigo</option>
            </select>
          </div>
        </section>

        <section className="card !bg-white p-5 space-y-3.5">
          <h2 className="font-bold text-ink">Your sign-in</h2>
          <input className={field} type="email" placeholder="Email" value={f.email} onChange={set('email')} required autoComplete="email" />
          <input className={field} type="password" placeholder="Password (8+ characters, letters and numbers)" value={f.password} onChange={set('password')} required minLength={8} autoComplete="new-password" />
        </section>

        <button type="submit" disabled={busy} className="w-full h-14 rounded-full btn-primary text-[1rem]">
          {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send application'}
        </button>
        <p className="text-center text-[0.75rem] text-ink-faint">By applying you agree to GasRefill’s rider terms and safety rules for carrying LPG.</p>
      </form>
    </div>
  );
}
