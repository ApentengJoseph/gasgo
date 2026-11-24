'use client';

/**
 * Guest-first identity.
 *
 * Customers never have to "sign up". The first time they do something that
 * needs an account (placing an order), we silently create an anonymous
 * Supabase session for this device. At checkout they add a name and phone
 * number; later they can add an email to keep the account on other devices.
 * Riders and admins sign in with email + password as before.
 */

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { GUEST_EMAIL_DOMAIN } from '@/lib/utils/constants';
import { withTimeout, fetchWithTimeout } from '@/lib/utils/timeout';

const isFallbackGuest = (u: User | null) => !!u?.email?.endsWith(`@${GUEST_EMAIL_DOMAIN}`);

export interface Profile {
  name: string | null;
  phone: string | null;
  role: 'customer' | 'rider' | 'admin';
}

interface AuthContextType {
  user: User | null;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  userPhone: string | null;
  profile: Profile | null;
  /** true when this device has no saved account yet (no session, or an anonymous one without an email) */
  isGuest: boolean;
  /** guest sessions that can be upgraded to an email account in place */
  canSaveAccount: boolean;
  /** true when name + phone are filled in (enough to place an order) */
  hasDetails: boolean;
  loading: boolean;
  /** Returns the user id, creating an anonymous session first if needed. */
  ensureSession: () => Promise<string>;
  /** Saves name/phone on the profile (creates the guest session if needed). */
  updateDetails: (d: { name?: string; phone?: string }) => Promise<void>;
  /** Adds an email (+ optional password) so the account works on other devices. */
  saveAccount: (email: string, password?: string) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string) => {
    const { data } = await supabase.from('profiles').select('name, phone, role').eq('id', uid).maybeSingle();
    setProfile(data ? { name: data.name, phone: data.phone, role: data.role } : { name: null, phone: null, role: 'customer' });
  }, [supabase]);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      setUser(session?.user ?? null);
      if (session?.user) await loadProfile(session.user.id);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // Never call Supabase directly inside this callback: it runs while the auth
      // lock is held, so a query here can deadlock a sign-out → sign-in switch.
      if (session?.user) { const id = session.user.id; setTimeout(() => loadProfile(id), 0); }
      else setProfile(null);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [supabase, loadProfile]);

  const ensureSession = useCallback(async () => {
    // Ask the server, not just the browser: a stored session can belong to a
    // login that has expired or been removed. If so, start a fresh guest session.
    const { data: { user: current }, error: checkErr } = await withTimeout(supabase.auth.getUser(), 12000);
    if (current && !checkErr) return current.id;
    await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    let { data, error } = await withTimeout(supabase.auth.signInAnonymously(), 15000);
    if (error || !data.user) {
      // Anonymous sign-ins switched off in Supabase: fall back to a server-made guest login
      const res = await fetchWithTimeout('/api/auth/guest', { method: 'POST' }, 20000);
      const creds = await res.json().catch(() => ({}));
      if (!res.ok || !creds.email) throw new Error(creds.error || 'We could not start your session. Check your connection and try again.');
      ({ data, error } = await withTimeout(supabase.auth.signInWithPassword({ email: creds.email, password: creds.password }), 15000) as any);
      if (error || !data.user) throw new Error('We could not start your session. Please try again.');
    }
    setUser(data.user);
    // Profile row is created by the on_auth_user_created trigger; make sure it exists.
    await supabase.from('profiles').upsert({ id: data.user.id }, { onConflict: 'id', ignoreDuplicates: true });
    await loadProfile(data.user.id);
    return data.user.id;
  }, [supabase, loadProfile]);

  const updateDetails = useCallback(async (d: { name?: string; phone?: string }) => {
    const uid = await ensureSession();
    const patch: Record<string, string> = {};
    if (d.name !== undefined) patch.name = d.name.trim();
    if (d.phone !== undefined) patch.phone = d.phone.trim();
    // upsert: also creates the profile row if it's missing
    const { error } = await withTimeout(supabase.from('profiles').upsert({ id: uid, ...patch }, { onConflict: 'id' }), 15000);
    if (error) throw new Error('Could not save your details. Please try again.');
    setProfile(p => ({ name: p?.name ?? null, phone: p?.phone ?? null, role: p?.role ?? 'customer', ...patch }));
  }, [supabase, ensureSession]);

  const saveAccount = useCallback(async (email: string, password?: string) => {
    await ensureSession();
    const { data, error } = await supabase.auth.updateUser({ email: email.trim(), ...(password ? { password } : {}) });
    if (error) {
      throw new Error(error.message.toLowerCase().includes('already')
        ? 'That email is already used by another GasRefill account. Sign in with it instead.'
        : error.message);
    }
    // Supabase sends a confirmation link; the email becomes active once clicked.
    return { needsConfirmation: data.user?.email !== email.trim() };
  }, [supabase, ensureSession]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut().catch(() => {});
    setUser(null);
    setProfile(null);
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user, loadProfile]);

  const value: AuthContextType = {
    user,
    userId: user?.id ?? null,
    userName: profile?.name ?? null,
    userEmail: isFallbackGuest(user) ? null : user?.email || null,
    userPhone: profile?.phone ?? null,
    profile,
    isGuest: !user || isFallbackGuest(user) || (user.is_anonymous === true && !user.email),
    canSaveAccount: !!user && user.is_anonymous === true && !user.email,
    hasDetails: !!(profile?.name && profile?.phone),
    loading,
    ensureSession,
    updateDetails,
    saveAccount,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
