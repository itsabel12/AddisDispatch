"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { HeaderAuth } from "@/components/header-auth";
import { TruckMark } from "@/components/Logo";
import {
  LayoutGrid,
  Package,
  Checklist,
  ClipboardCheck,
  FileInvoice,
  Wallet,
  Receipt,
  ChartBar,
  UserPlus,
  Building,
  Truck,
  Route,
  UserCheck,
  Mail,
  MessageCircle,
  FileText,
  LifeBuoy,
  Menu,
  X,
  type IconProps,
} from "@/components/icons";

type NavIcon = React.ComponentType<IconProps>;
type NavItem = { label: string; href: string; icon: NavIcon };
const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [{ label: "Command Center", href: "/admin/dashboard", icon: LayoutGrid }],
  },
  {
    title: "Operations",
    items: [
      { label: "Loads", href: "/admin", icon: Package },
      { label: "Load Intake", href: "/admin/loads/intake", icon: Checklist },
      { label: "POD Review", href: "/admin/pod-review", icon: ClipboardCheck },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Invoices", href: "/admin/invoices", icon: FileInvoice },
      { label: "Payroll", href: "/admin/payroll", icon: Wallet },
      { label: "Expenses", href: "/admin/expenses", icon: Receipt },
      { label: "Profitability", href: "/admin/profitability", icon: ChartBar },
    ],
  },
  {
    title: "Network",
    items: [
      { label: "Applications", href: "/admin/applications", icon: UserPlus },
      { label: "Brokers", href: "/admin/brokers", icon: Building },
      { label: "Carriers", href: "/admin/carriers", icon: Truck },
      { label: "Lanes", href: "/admin/lanes", icon: Route },
      { label: "Carrier Accounts", href: "/admin/carrier-accounts", icon: UserCheck },
    ],
  },
  {
    title: "Communication",
    items: [
      { label: "Inbox", href: "/admin/inbox", icon: Mail },
      { label: "Messages", href: "/admin/messages", icon: MessageCircle },
      { label: "Customer Emails", href: "/admin/comm-templates", icon: FileText },
    ],
  },
  {
    title: "Help",
    items: [{ label: "Help / Support", href: "/admin/support", icon: LifeBuoy }],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

function Logo() {
  return (
    <Link href="/admin/dashboard" className="flex items-center gap-2.5 px-2 text-foreground">
      <TruckMark size={30} />
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
                    <Icon size={20} className={active ? "text-[#1a1712]" : ""} />
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
                <X size={18} />
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
      <Menu size={20} />
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
