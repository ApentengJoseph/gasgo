'use client';

import { WHATSAPP_NUMBER } from '@/lib/utils/constants';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  MapPin, Bell, ChevronRight, LogOut, MessageCircle, Package, ShieldCheck, Mail, Loader2,
  Pencil, Phone, User, Home, Plus, ChevronDown,
} from 'lucide-react';
import { PageHeader } from '@/components/UI/PageHeader';
import { ShareToDevice, RedeemCode } from '@/components/Account/DeviceLink';
import { useAuth } from '@/lib/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import type { Address } from '@/lib/types/database';


function validPhone(p: string) {
  const d = p.replace(/\D/g, '');
  return (d.length === 10 && d.startsWith('0')) || (d.length === 12 && d.startsWith('233'));
}

export default function AccountPage() {
  const router = useRouter();
  const supabase = useRef(createClient()).current;
  const { user, userId, userName, userPhone, userEmail, isGuest, canSaveAccount, loading, updateDetails, saveAccount, signOut } = useAuth();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [keepOpen, setKeepOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keeping, setKeeping] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [refills, setRefills] = useState<number | null>(null);
  const [home, setHome] = useState<Address | null | undefined>(undefined);

  useEffect(() => { setName(userName ?? ''); setPhone(userPhone ?? ''); }, [userName, userPhone]);
  useEffect(() => { if (!loading && !userName) setEditing(true); }, [loading, userName]);

  useEffect(() => {
    if (!userId) { setRefills(0); setHome(null); return; }
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'delivered')
      .then(({ count }) => setRefills(count ?? 0));
    fetch('/api/addresses').then(r => r.json()).then(d => {
      const list: Address[] = d.addresses ?? [];
      setHome(list.find(a => a.is_default) ?? list[0] ?? null);
    }).catch(() => setHome(null));
  }, [supabase, userId]);

  const canSave = name.trim().length >= 2 && (!phone.trim() || validPhone(phone));
  const save = async () => {
    setSaving(true);
    try { await updateDetails({ name, phone }); toast.success('Saved'); setEditing(false); }
    catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };
  const keep = async () => {
    setKeeping(true);
    try { await saveAccount(email, password || undefined); setEmailSent(true); }
    catch (e: any) { toast.error(e.message); }
    finally { setKeeping(false); }
  };

  const initials = (userName || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const since = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-GH', { month: 'short', year: 'numeric' }) : null;

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-flame animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <PageHeader title="Account" subtitle={isGuest ? 'No sign-up needed. Your details stay on this phone.' : 'Your GasRefill account'} />

      {/* Identity */}
      <section className="glow-flame rounded-[28px] p-5 md:p-6 text-white shadow-[0_24px_50px_-24px_rgba(23,19,15,0.7)]">
        <div className="flex items-center gap-4">
          <span className="w-16 h-16 rounded-[22px] glass-dark-surface flex items-center justify-center text-[1.375rem] font-extrabold">
            {initials || <User className="w-7 h-7" />}
          </span>
          <div className="min-w-0">
            <p className="text-[1.375rem] font-extrabold tracking-tight truncate">{userName ? `Hi, ${userName.split(' ')[0]}` : 'Welcome'}</p>
            <p className="text-white/70 text-[0.875rem] truncate">{userEmail ?? userPhone ?? 'Add your details to order faster'}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <div className="glass-dark-surface rounded-2xl px-4 py-3">
            <p className="text-[1.25rem] font-extrabold leading-none">{refills ?? '–'}</p>
            <p className="text-[0.75rem] text-white/70 mt-1">{refills === 1 ? 'refill delivered' : 'refills delivered'}</p>
          </div>
          <div className="glass-dark-surface rounded-2xl px-4 py-3">
            <p className="text-[1.25rem] font-extrabold leading-none">{since ?? 'New'}</p>
            <p className="text-[0.75rem] text-white/70 mt-1">{since ? 'with GasRefill since' : 'to GasRefill'}</p>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="card p-5" aria-labelledby="details-h">
        <div className="flex items-center justify-between mb-3">
          <h2 id="details-h" className="font-bold text-ink">Your details</h2>
          {!editing && (
            <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full btn-ghost text-[0.8125rem]">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          )}
        </div>
        {editing ? (
          <div className="space-y-3.5">
            <div>
              <label htmlFor="acc-name" className="field-label">Name</label>
              <input id="acc-name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoComplete="name" className="input-field" />
            </div>
            <div>
              <label htmlFor="acc-phone" className="field-label">Phone number</label>
              <input id="acc-phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="024 123 4567" inputMode="tel" autoComplete="tel" className="input-field" />
              {phone && !validPhone(phone) && <p className="mt-1.5 text-[0.8125rem] text-[#DC2626]">Enter a Ghana number, e.g. 024 123 4567.</p>}
            </div>
            <div className="flex gap-2.5 pt-1">
              {userName && <button onClick={() => { setEditing(false); setName(userName ?? ''); setPhone(userPhone ?? ''); }} className="flex-1 h-12 rounded-full btn-ghost">Cancel</button>}
              <button onClick={save} disabled={!canSave || saving} className="flex-1 h-12 rounded-full btn-dark inline-flex items-center justify-center gap-2 disabled:opacity-40">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save
              </button>
            </div>
          </div>
        ) : (
          <dl className="divide-y divide-white/70">
            <DetailRow icon={User} label="Name" value={userName} />
            <DetailRow icon={Phone} label="Phone" value={userPhone} />
            {userEmail && <DetailRow icon={Mail} label="Email" value={userEmail} />}
          </dl>
        )}
      </section>

      {/* Home address */}
      {home !== undefined && (
        <Link href={home ? '/profile/addresses' : '/profile/addresses/add'} className="card-interactive p-4 flex items-center gap-3">
          <span className="icon-box icon-box-md icon-box-accent">{home ? <Home className="w-5 h-5" /> : <Plus className="w-5 h-5" />}</span>
          <span className="flex-1 min-w-0">
            <span className="block font-bold text-ink">{home ? home.label : 'Add your home'}</span>
            <span className="block text-[0.8125rem] text-ink-muted truncate">{home ? home.address : 'So your next pickup takes seconds'}</span>
          </span>
          <ChevronRight className="w-5 h-5 text-ink-faint" />
        </Link>
      )}

      {/* Keep your account (guests) */}
      {user && canSaveAccount && (
        <section className="card overflow-hidden">
          <button onClick={() => setKeepOpen(o => !o)} className="w-full p-4 flex items-center gap-3 text-left" aria-expanded={keepOpen}>
            <span className="icon-box icon-box-md icon-box-green"><ShieldCheck className="w-5 h-5" /></span>
            <span className="flex-1">
              <span className="block font-bold text-ink">Keep your orders on a new phone</span>
              <span className="block text-[0.8125rem] text-ink-muted">Optional · add an email</span>
            </span>
            <ChevronDown className={`w-5 h-5 text-ink-faint transition-transform ${keepOpen ? 'rotate-180' : ''}`} />
          </button>
          {keepOpen && (
            <div className="px-4 pb-4">
              {emailSent ? (
                <p className="rounded-2xl bg-[#E8F6EC] px-4 py-3 text-[0.875rem] text-[#166534]">
                  Check <b>{email}</b> and tap the link to confirm. Then you can sign in on any phone.
                </p>
              ) : (
                <div className="space-y-3">
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" inputMode="email" autoComplete="email" placeholder="you@email.com" className="input-field" aria-label="Email" />
                  <input value={password} onChange={e => setPassword(e.target.value)} type="password" autoComplete="new-password" placeholder="Create a password (min. 6 characters)" className="input-field" aria-label="Password" />
                  <button onClick={keep} disabled={keeping || !/^\S+@\S+\.\S+$/.test(email) || password.length < 6}
                    className="w-full h-12 rounded-full btn-dark inline-flex items-center justify-center gap-2 disabled:opacity-40">
                    {keeping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} Save my account
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Same account on another device */}
      {user && <ShareToDevice />}

      {/* Shortcuts */}
      <nav className="card overflow-hidden divide-y divide-white/70" aria-label="Account">
        <MenuLink href="/orders" icon={Package} label="My orders" />
        <MenuLink href="/profile/addresses" icon={MapPin} label="Saved places" />
        <MenuLink href="/notifications" icon={Bell} label="Alerts" />
        <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="list-row">
          <span className="icon-box icon-box-sm icon-box-green"><MessageCircle className="w-4 h-4" /></span>
          <span className="flex-1 font-semibold text-ink text-[0.9375rem]">Help on WhatsApp</span>
          <ChevronRight className="w-4 h-4 text-ink-faint" />
        </a>
      </nav>

      {isGuest ? (
        <div className="text-center pt-1 space-y-2">
          <RedeemCode compact />
          <p className="text-[0.8125rem] text-ink-muted">Saved an email account? <Link href="/auth/login" className="font-semibold text-ink underline underline-offset-2">Sign in</Link></p>
        </div>
      ) : (
        <button onClick={async () => { await signOut(); router.push('/'); }}
          className="w-full h-12 rounded-full btn-ghost inline-flex items-center justify-center gap-2 !text-[#B91C1C]">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      )}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string | null }) {
  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <Icon className="w-4 h-4 text-ink-faint" />
      <dt className="w-16 text-[0.8125rem] text-ink-muted">{label}</dt>
      <dd className={`flex-1 text-right font-semibold truncate ${value ? 'text-ink' : 'text-ink-faint font-normal'}`}>{value || 'Not added'}</dd>
    </div>
  );
}

function MenuLink({ href, icon: Icon, label }: { href: string; icon: typeof MapPin; label: string }) {
  return (
    <Link href={href} className="list-row">
      <span className="icon-box icon-box-sm icon-box-primary"><Icon className="w-4 h-4" /></span>
      <span className="flex-1 font-semibold text-ink text-[0.9375rem]">{label}</span>
      <ChevronRight className="w-4 h-4 text-ink-faint" />
    </Link>
  );
}
