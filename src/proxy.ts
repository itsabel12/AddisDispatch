import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// All admin portal pages except the login page itself. The trailing "/"
// boundary keeps this from matching unrelated public routes that merely start
// with "/admin" (there are none today, but it mirrors the carrier fix below).
const isAdminPortal = createRouteMatcher(["/admin", "/admin/((?!login).*)"]);

// All carrier portal pages except the login page itself. The "/carrier/"
// boundary is important: without it, "/carrier((?!/login).*)" also matched the
// public "/carrier-agreement" legal page and redirected it to /carrier/login.
const isCarrierPortal = createRouteMatcher(["/carrier", "/carrier/((?!login).*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminPortal(req)) {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    // Role is read from the JWT metadata claim (embedded via Clerk session-token
    // customization — see SETUP.md §4 step 3). The canonical admin role value is
    // "admin" everywhere (backend require_admin and the page-level RequireAdmin
    // guard both accept only "admin"; "dispatcher" is human-facing copy, not a
    // role). If the claim is absent (setup not yet done), fall through to the
    // page-level RequireAdmin guard.
    const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
    if (role !== undefined && role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  if (isCarrierPortal(req)) {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.redirect(new URL("/carrier/login", req.url));
    }

    const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
    if (role !== undefined && role !== "carrier") {
      return NextResponse.redirect(new URL("/carrier/login", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
