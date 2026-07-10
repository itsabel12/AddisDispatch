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
  { label: "Profile", href: "/carrier/profile" },
];

export default function CarrierLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <div className="portal-scope flex min-h-screen flex-col bg-background text-foreground">
        <header className="flex items-center justify-between border-b border-border px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-semibold tracking-tight">
              Addis<span className="text-accent">Dispatch</span>
              <span className="ml-2 font-normal text-muted-foreground">
                Carrier Portal
              </span>
            </Link>
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
        {children}
      </div>
    </ClerkProvider>
  );
}
