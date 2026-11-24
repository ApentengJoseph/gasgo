import { createBrowserClient } from '@supabase/ssr';

// We use `any` on the Database generic to avoid strict Supabase type mapping issues.
// All table row types are imported separately from @/lib/types/database.
export function createClient() {
  // eslint-disable-next-line
  return createBrowserClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
