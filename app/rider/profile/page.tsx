'use client';

import { useEffect, useState } from 'react';
import { Loader2, LogOut, Bike, Truck, Phone, Mail, Wallet, BadgeCheck, ShieldCheck, MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { WHATSAPP_NUMBER } from '@/lib/utils/constants';

type Data = {
  profile: { name: string; phone: string; email: string };
  rider: { status: string; vehicle_type: string; vehicle_reg: string; licence_no: string | null; ghana_card_no: string | null; momo_number: string; momo_network: string; approved_at: string | null };
};
const mask = (s?: string | null) => (s ? `${s.slice(0, 3)}•••${s.slice(-3)}` : '—');
const STATUS: Record<string, [string, string]> = {
  approved: ['Approved', 'pill-success'], pending: ['Waiting for approval', 'pill-warning'],
  rejected: ['Not approved', 'pill-error'], suspended: ['Paused', 'pill-error'],
};

/** Rider profile: identity, vehicle and payout details (changes go through GasRefill for safety). */
export default function RiderProfilePage() {
  const [d, setD] = useState<Data | null>(null);
  useEffect(() => { fetch('/api/rider/me').then(r => r.ok ? r.json() : null).then(setD).catch(() => {}); }, []);

  if (!d) return <div className="flex justify-center pt-32"><Loader2 className="w-7 h-7 text-flame animate-spin" /></div>;
  const [label, cls] = STATUS[d.rider?.status] ?? ['Unknown', 'pill-gray'];
  const VehicleIcon = d.rider?.vehicle_type === 'tricycle' ? Truck : Bike;

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-6 space-y-4">
      <h1 className="page-title">Profile</h1>
      <section className="glow-flame rounded-[28px] p-5 text-white flex items-center gap-4">
        <span className="w-16 h-16 rounded-[22px] glass-dark-surface flex items-center justify-center text-[1.5rem] font-extrabold">
          {(d.profile.name || 'R').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="text-[1.25rem] font-extrabold tracking-tight truncate">{d.profile.name}</p>
          <span className={`pill ${cls} mt-1`}>{label}</span>
        </div>
      </section>

      <section className="card !bg-white divide-y divide-line">
        <Row icon={Phone} label="Phone" value={d.profile.phone} />
        <Row icon={Mail} label="Email" value={d.profile.email} />
        <Row icon={VehicleIcon} label={d.rider.vehicle_type === 'tricycle' ? 'Tricycle' : 'Motorbike'} value={d.rider.vehicle_reg} />
        <Row icon={BadgeCheck} label="Licence" value={mask(d.rider.licence_no)} />
        <Row icon={ShieldCheck} label="Ghana Card" value={mask(d.rider.ghana_card_no)} />
        <Row icon={Wallet} label="Payouts" value={`${d.rider.momo_network} ${mask(d.rider.momo_number)}`} />
      </section>

      <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello GasRefill, I’m a rider and need help with my account.')}`} target="_blank" rel="noopener noreferrer"
        className="card !bg-white p-4 flex items-center gap-3">
        <span className="icon-box icon-box-md icon-box-green"><MessageCircle className="w-5 h-5" /></span>
        <span className="flex-1"><b className="text-ink">Need to change something?</b><span className="block text-[0.8125rem] text-ink-muted">Message GasRefill support on WhatsApp</span></span>
      </a>

      <button onClick={async () => { await createClient().auth.signOut(); window.location.href = '/rider/login'; }}
        className="w-full h-12 rounded-full btn-ghost !bg-white inline-flex items-center justify-center gap-2 !text-[#B91C1C]">
        <LogOut className="w-4 h-4" /> Sign out
      </button>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <Icon className="w-4 h-4 text-ink-faint" />
      <span className="w-24 text-[0.8125rem] text-ink-muted">{label}</span>
      <span className="flex-1 text-right font-semibold text-ink truncate">{value || '—'}</span>
    </div>
  );
}
