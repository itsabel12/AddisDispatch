import Link from "next/link";
import { ClerkProvider } from "@clerk/nextjs";

import { HeaderAuth } from "@/components/header-auth";

// Auth-gated and reads Clerk keys at render time, so it renders on request
// rather than being prerendered at build.
export const dynamic = "force-dynamic";

/**
 * Carrier portal layout — a separate experience from the admin console: its own
 * Clerk provider, header, and navigation. Carriers only ever see this shell.
 */

const nav = [
  { label: "Dashboard", href: "/carrier/dashboard" },
  { label: "My Loads", href: "/carrier/loads" },
  { label: "Settlements", href: "/carrier/settlements" },
  { label: "Pay", href: "/carrier/pay" },
  { label: "Documents", href: "/carrier/documents" },
  { label: "Profile", href: "/carrier/profile" },
];

export default function CarrierLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <div className="portal-scope dispatch-light flex min-h-screen flex-col bg-background text-foreground">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-6">
            <Link href="/" className="shrink-0 text-sm font-semibold tracking-tight">
              Addis<span className="text-accentDeep">Dispatch</span>
              <span className="ml-2 hidden font-normal text-muted-foreground sm:inline">
                Carrier Portal
              </span>
            </Link>
            {/* Desktop nav */}
            <nav className="hidden gap-4 text-sm text-muted-foreground sm:flex">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <HeaderAuth />
        </header>

        {/* Mobile nav — horizontally scrollable pill row, shown under the header. */}
        <nav className="flex gap-2 overflow-x-auto border-b border-border bg-card/60 px-4 py-2 sm:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {children}
      </div>
    </ClerkProvider>
  );
}
