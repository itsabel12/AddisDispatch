import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every matched request and gates the
 * carrier portal. This runs in the Next.js Proxy (formerly Middleware).
 *
 * Security note: this is the optimistic edge check. The real isolation boundary
 * is Postgres RLS — every carrier-scoped query is filtered server-side by policy.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: do not run code between createServerClient and getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthPage =
    path === "/portal/login" || path === "/portal/signup";

  // Unauthenticated → bounce to login (preserve intended destination).
  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/portal/login";
    if (path !== "/portal") url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  // Already authenticated → keep them out of the auth pages.
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/portal";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
