"use client";

/**
 * CarrierShell — the carrier portal frame: fixed left sidebar (logo, profile,
 * icon nav, theme toggle, sign out), a slim mobile top bar with a drawer, and
 * the scrollable page area. Mirrors the dispatcher AdminShell architecture and
 * the ShipMate-style reference: soft cards on a warm canvas, accent highlights.
 *
 * The light/dark control toggles the `dispatch-light` scope class (both token
 * sets already exist) and persists the choice.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignOutButton, useUser } from "@clerk/nextjs";

import { cn } from "@/lib/utils";
import { TruckMark } from "@/components/Logo";
import {
  LayoutGrid,
  Package,
  Receipt,
  Wallet,
  FileText,
  User,
  Sun,
  Moon,
  Menu,
  Logout,
  type IconProps,
} from "@/components/icons";

type NavIcon = React.ComponentType<IconProps>;
type NavItem = { label: string; href: string; icon: NavIcon };
const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Menu",
    items: [
      { label: "Dashboard", href: "/carrier/dashboard", icon: LayoutGrid },
      { label: "My Loads", href: "/carrier/loads", icon: Package },
      { label: "Settlements", href: "/carrier/settlements", icon: Receipt },
      { label: "Pay", href: "/carrier/pay", icon: Wallet },
      { label: "Documents", href: "/carrier/documents", icon: FileText },
    ],
  },
  {
    title: "Account",
    items: [{ label: "Profile", href: "/carrier/profile", icon: User }],
  },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

const THEME_KEY = "addis-carrier-theme";

function ProfileCard() {
  const { user } = useUser();
  return (
    <div className="mx-3 flex items-center gap-3 rounded-2xl border border-border bg-muted/40 px-3 py-2.5">
      <UserButton
        appearance={{ elements: { avatarBox: "size-9" } }}
      />
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-semibold text-foreground">
          {user?.fullName ?? user?.username ?? "Carrier"}
        </p>
        <p className="truncate text-xs text-muted-foreground">Carrier</p>
      </div>
    </div>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
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
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-accent/12 font-semibold text-accentDeep"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon size={20} className={active ? "text-accentDeep" : ""} />
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

function ThemeToggle({
  theme,
  setTheme,
}: {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
}) {
  return (
    <div className="flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
      {(["light", "dark"] as const).map((t) => {
        const Icon = t === "light" ? Sun : Moon;
        const active = theme === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => setTheme(t)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium capitalize transition-colors",
              active
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon size={16} />
            {t}
          </button>
        );
      })}
    </div>
  );
}

function SidebarBody({
  theme,
  setTheme,
  onNavigate,
}: {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex h-16 items-center px-4">
        <Link href="/carrier/dashboard" className="flex items-center gap-2.5 text-foreground">
          <TruckMark size={30} />
          <span className="font-heading text-[15px] font-semibold tracking-tight">
            Addis<span className="text-accentDeep">Dispatch</span>
          </span>
        </Link>
      </div>
      <div className="pb-1">
        <ProfileCard />
      </div>
      <NavList onNavigate={onNavigate} />
      <div className="space-y-2 border-t border-border p-3">
        <ThemeToggle theme={theme} setTheme={setTheme} />
        <SignOutButton>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Logout size={18} />
            Log Out
          </button>
        </SignOutButton>
      </div>
    </>
  );
}

export function CarrierShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setThemeState] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") setThemeState(saved);
  }, []);

  const setTheme = (t: "light" | "dark") => {
    setThemeState(t);
    window.localStorage.setItem(THEME_KEY, t);
  };

  const pathname = usePathname();
  // The login route is pre-auth: a clean, centered canvas with no app sidebar.
  if (pathname === "/carrier/login") {
    return (
      <div className="portal-scope dispatch-light min-h-screen bg-background text-foreground">
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "portal-scope flex min-h-screen bg-background text-foreground",
        theme === "light" && "dispatch-light",
      )}
    >
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <SidebarBody theme={theme} setTheme={setTheme} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-card shadow-pop">
            <SidebarBody theme={theme} setTheme={setTheme} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
          >
            <Menu size={20} />
          </button>
          <Link href="/carrier/dashboard" className="flex items-center gap-2 text-foreground">
            <TruckMark size={24} />
            <span className="font-heading text-sm font-semibold">
              Addis<span className="text-accentDeep">Dispatch</span>
            </span>
          </Link>
        </header>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
