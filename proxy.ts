import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(list, headers) {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  const { data, error } = await supabase.auth.getClaims();
  const signedIn = !error && Boolean(data?.claims.sub);
  const { pathname, search } = request.nextUrl;
  const isLogin = pathname === '/admin/login';

  // Server Actions check the session themselves and answer "session expired", so the open form is not lost to a redirect.
  if (request.headers.has('next-action')) return response;

  if (signedIn === isLogin) {
    const target = request.nextUrl.clone();
    target.pathname = isLogin ? '/admin' : '/admin/login';
    target.search = isLogin ? '' : `?next=${encodeURIComponent(pathname + search)}`;
    const redirect = NextResponse.redirect(target);
    response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
    return redirect;
  }
  return response;
}

export const config = { matcher: ['/admin/:path*'] };
