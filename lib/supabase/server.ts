import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Placeholders keep builds working when settings are missing (see lib/supabase/client.ts).
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

// eslint-disable-next-line
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  // eslint-disable-next-line
  return createServerClient<any>(
    URL_,
    ANON,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server component — cookie writes are ignored
          }
        },
      },
    },
  );
}

// eslint-disable-next-line
export function createServiceRoleClient() {
  return createSupabaseClient(
    URL_,
    SERVICE,
    { auth: { persistSession: false } },
  );
}
