import { ClerkProvider } from "@clerk/nextjs";

import { CarrierShell } from "@/components/carrier/CarrierShell";

// Auth-gated and reads Clerk keys at render time, so it renders on request
// rather than being prerendered at build.
export const dynamic = "force-dynamic";

/**
 * Carrier portal layout — a separate experience from the admin console: its own
 * Clerk provider and the CarrierShell frame (sidebar, profile, theme, nav).
 * Carriers only ever see this shell.
 */
export default function CarrierLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <CarrierShell>{children}</CarrierShell>
    </ClerkProvider>
  );
}
