import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Runs before every page:
 *  1. Refreshes the Supabase session cookie (so sessions don't silently expire).
 *  2. Locks the admin and rider areas on the server: only signed-in users with
 *     the right role get past, everyone else is sent to that area's sign-in page.
 *  3. Admins also need the second sign-in step (authenticator app code), so a
 *     phished password alone can't open the control centre.
 */
const PUBLIC_STAFF_PAGES = ['/admin/login', '/rider/login', '/rider/apply'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  const path = request.nextUrl.pathname;
  const area = path.startsWith('/admin') ? 'admin' : path.startsWith('/rider') ? 'rider' : null;

  if (area && !PUBLIC_STAFF_PAGES.some(p => path === p || path.startsWith(p + '/'))) {
    const loginPath = `/${area}/login`;
    if (!user) return NextResponse.redirect(new URL(loginPath, request.url));
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (profile?.role !== area) {
      const to = new URL(loginPath, request.url);
      to.searchParams.set('e', 'denied');
      return NextResponse.redirect(to);
    }
    if (area === 'admin' && process.env.ADMIN_MFA !== 'off') {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel !== 'aal2') {
        const to = new URL(loginPath, request.url);
        to.searchParams.set('e', 'mfa');
        return NextResponse.redirect(to);
      }
    }
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|images/|favicon|apple-touch-icon|web-app-manifest|manifest.json|sw.js|workbox-|robots.txt|api/events).*)'],
};
