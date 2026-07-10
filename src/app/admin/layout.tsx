import { ClerkProvider } from "@clerk/nextjs";

import { AdminShell } from "@/components/admin/AdminShell";

// Auth-gated and reads Clerk keys at render time, so it renders on request
// rather than being prerendered at build.
export const dynamic = "force-dynamic";

/**
 * Admin/dispatcher layout. Its own Clerk provider and the AdminShell frame
 * (left sidebar + top bar) — completely separate from the carrier portal.
 * Renders on the warm light `.portal-scope` token layer from globals.css.
 */
export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <AdminShell>{children}</AdminShell>
    </ClerkProvider>
  );
}
