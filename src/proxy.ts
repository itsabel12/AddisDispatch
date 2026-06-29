import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 renamed Middleware to Proxy. Same behavior; runs before matched routes.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Only guard the carrier portal; the marketing site is untouched.
  matcher: ["/portal/:path*"],
};
