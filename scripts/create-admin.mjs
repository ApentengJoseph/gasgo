#!/usr/bin/env node
/**
 * Create (or reset) a GasRefill control-centre admin.
 *
 *   npm run admin:create -- you@example.com "Your Name"
 *
 * Prints a strong random password ONCE. Sign in at /admin/login; on the first
 * sign-in you'll scan a QR code with an authenticator app (Google Authenticator,
 * Microsoft Authenticator, Authy). Admin rights can only be given from here or
 * the Supabase SQL editor — never from the app itself.
 *
 *   npm run admin:create -- you@example.com --reset-2fa   (lost phone: clears the authenticator)
 */
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8').split('\n')
  .filter(l => l.includes('=') && !l.trim().startsWith('#'))
  .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^"|"$/g, '')]));
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const [email, ...rest] = process.argv.slice(2);
const reset2fa = rest.includes('--reset-2fa');
const name = rest.filter(a => !a.startsWith('--')).join(' ') || 'GasRefill admin';
if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
  console.log('Usage: npm run admin:create -- you@example.com "Your Name" [--reset-2fa]');
  process.exit(1);
}

const { data: list } = await db.auth.admin.listUsers({ perPage: 1000 });
let user = list?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

if (reset2fa) {
  if (!user) { console.error('✗ No account with that email.'); process.exit(1); }
  const { data: f } = await db.auth.admin.mfa.listFactors({ userId: user.id });
  for (const factor of f?.factors ?? []) await db.auth.admin.mfa.deleteFactor({ userId: user.id, id: factor.id });
  console.log(`✓ Authenticator cleared for ${email}. They'll set up a new one at the next sign-in.`);
  process.exit(0);
}

const password = `${randomBytes(12).toString('base64url')}#${randomBytes(2).toString('hex')}`;
if (!user) {
  const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) { console.error('✗', error.message); process.exit(1); }
  user = data.user;
} else {
  const { error } = await db.auth.admin.updateUserById(user.id, { password });
  if (error) { console.error('✗', error.message); process.exit(1); }
}
const { error } = await db.from('profiles').upsert({ id: user.id, name, role: 'admin', is_active: true }, { onConflict: 'id' });
if (error) { console.error('✗ profile:', error.message); process.exit(1); }

console.log(`\n✓ Admin ready: ${email}`);
console.log(`  Password (shown once — store it in a password manager): ${password}`);
console.log('  Sign in at /admin/login and set up your authenticator app.\n');
