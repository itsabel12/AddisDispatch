"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { HeaderAuth } from "@/components/header-auth";

/* — compact 20px stroke icon set (currentColor) — */
type Ico = (p: { className?: string }) => React.ReactElement;
const svg = (path: React.ReactNode): Ico =>
  function Icon({ className }) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("size-[18px]", className)}
        aria-hidden
      >
        {path}
      </svg>
    );
  };

const I = {
  grid: svg(<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>),
  truck: svg(<><path d="M3 6h11v9H3z" /><path d="M14 9h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></>),
  scan: svg(<><path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8" /><path d="M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8" /><path d="M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16" /><path d="M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" /><path d="M7 12h10" /></>),
  podcheck: svg(<><path d="M8 3h6l4 4v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M14 3v4h4" /><path d="M9 14l2 2 4-4" /></>),
  receipt: svg(<><path d="M6 3h12v18l-3-1.5L12 21l-3-1.5L6 21z" /><path d="M9 8h6M9 12h6" /></>),
  wallet: svg(<><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /><circle cx="17" cy="14" r="1" /></>),
  chart: svg(<><path d="M4 20V4" /><path d="M4 20h16" /><path d="M8 16v-4M12 16V8M16 16v-6" /></>),
  building: svg(<><rect x="5" y="3" width="14" height="18" rx="1.5" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" /></>),
  users: svg(<><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 6a3 3 0 0 1 0 6M18 20a6 6 0 0 0-3-5" /></>),
  route: svg(<><circle cx="6" cy="6" r="2" /><circle cx="18" cy="18" r="2" /><path d="M8 6h7a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h7" /></>),
  usercheck: svg(<><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 11-3.3" /><path d="M16 18l1.5 1.5L21 16" /></>),
  mail: svg(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>),
  chat: svg(<><path d="M4 5h16v11H9l-4 3v-3H4z" /><path d="M8 10h8M8 13h5" /></>),
  template: svg(<><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>),
};

type NavItem = { label: string; href: string; icon: Ico };
const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [{ label: "Command Center", href: "/admin/dashboard", icon: I.grid }],
  },
  {
    title: "Operations",
    items: [
      { label: "Loads", href: "/admin", icon: I.truck },
      { label: "Load Intake", href: "/admin/loads/intake", icon: I.scan },
      { label: "POD Review", href: "/admin/pod-review", icon: I.podcheck },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Invoices", href: "/admin/invoices", icon: I.receipt },
      { label: "Payroll", href: "/admin/payroll", icon: I.wallet },
      { label: "Profitability", href: "/admin/profitability", icon: I.chart },
    ],
  },
  {
    title: "Network",
    items: [
      { label: "Brokers", href: "/admin/brokers", icon: I.building },
      { label: "Carriers", href: "/admin/carriers", icon: I.users },
      { label: "Lanes", href: "/admin/lanes", icon: I.route },
      { label: "Carrier Accounts", href: "/admin/carrier-accounts", icon: I.usercheck },
    ],
  },
  {
    title: "Communication",
    items: [
      { label: "Inbox", href: "/admin/inbox", icon: I.mail },
      { label: "Messages", href: "/admin/messages", icon: I.chat },
      { label: "Customer Emails", href: "/admin/comm-templates", icon: I.template },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

function Logo() {
  return (
    <Link href="/admin/dashboard" className="flex items-center gap-2.5 px-2">
      <span className="grid size-8 place-items-center rounded-xl bg-accent text-white shadow-soft">
        <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
          <path
            d="M3 7h11v8H3zM14 10h4l3 3v2h-7z"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
          <circle cx="7" cy="17" r="1.4" fill="currentColor" />
          <circle cx="17" cy="17" r="1.4" fill="currentColor" />
        </svg>
      </span>
      <span className="font-heading text-[15px] font-semibold tracking-tight">
        Addis<span className="text-accentDeep">Dispatch</span>
      </span>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-2">
      {GROUPS.map((group) => (
        <div key={group.title}>
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
            {group.title}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-accent font-semibold text-[#1a1712] shadow-soft"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className={active ? "text-[#1a1712]" : ""} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Desktop sidebar (fixed) + mobile drawer, sharing one nav list. */
export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center">
          <Logo />
        </div>
        <NavList />
        <div className="border-t border-border p-3">
          <HeaderAuth />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-card shadow-pop">
            <div className="flex h-16 items-center justify-between pr-3">
              <Logo />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            </div>
            <NavList onNavigate={onClose} />
            <div className="border-t border-border p-3">
              <HeaderAuth />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

/** Hamburger for the mobile top bar (controls the drawer). */
export function SidebarTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open menu"
      className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted lg:hidden"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-5">
        <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
      </svg>
    </button>
  );
}

// Local state hook so the layout can wire the drawer without prop-drilling.
export function useSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return {
    mobileOpen,
    open: () => setMobileOpen(true),
    close: () => setMobileOpen(false),
  };
}
