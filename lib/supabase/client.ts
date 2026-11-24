import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase settings come from NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * If they're missing (e.g. not yet added in Vercel), we still build and render
 * the site with a placeholder project; data calls simply fail until the real
 * values are set and the site is redeployed.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabaseConfigured = !!(url && anonKey);

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-anon-key';

let warned = false;

// We use `any` on the Database generic to avoid strict Supabase type mapping issues.
// All table row types are imported separately from @/lib/types/database.
export function createClient() {
  if (!supabaseConfigured && !warned && typeof window !== 'undefined') {
    warned = true;
    console.warn('GasRefill: Supabase settings are missing (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).');
  }
  // eslint-disable-next-line
  return createBrowserClient<any>(url || PLACEHOLDER_URL, anonKey || PLACEHOLDER_KEY);
}
