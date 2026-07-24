"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Sidebar, SidebarTrigger, useSidebar } from "@/components/admin/Sidebar";
import { CommandPalette } from "@/components/admin/CommandPalette";
import { AssistantWidget } from "@/components/admin/AssistantWidget";
import { AdminFeedbackProvider } from "@/components/admin/feedback";
import { TruckMark } from "@/components/Logo";
import { SkipLink } from "@/components/ui/skip-link";
import { Search, Bell } from "@/components/icons";

function openPalette() {
  // CommandPalette listens for ⌘K / Ctrl-K on window; synthesize it so the
  // top-bar search affordance opens the same palette.
  window.dispatchEvent(
    new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true, bubbles: true }),
  );
}

/**
 * AdminShell — the dispatcher portal frame: fixed left sidebar, a slim top
 * utility bar (mobile menu, ⌘K search, notifications), and the scrollable page
 * area. Every /admin page renders inside this on the warm light canvas.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const drawer = useSidebar();
  const pathname = usePathname();

  // The login route is pre-auth: render a clean centered canvas, no sidebar.
  if (pathname === "/admin/login") {
    return (
      <div className="portal-scope dispatch-dark flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        {children}
      </div>
    );
  }

  return (
    <AdminFeedbackProvider>
    <div className="portal-scope dispatch-dark flex min-h-screen bg-background text-foreground">
      <SkipLink />
      <Sidebar mobileOpen={drawer.mobileOpen} onClose={drawer.close} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur lg:px-8">
          <SidebarTrigger onOpen={drawer.open} />
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 font-heading text-sm font-semibold text-foreground lg:hidden"
          >
            <TruckMark size={24} />
            Addis<span className="text-accentDeep">Dispatch</span>
          </Link>

          <button
            type="button"
            onClick={openPalette}
            className="hidden h-9 flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm text-muted-foreground transition-colors hover:border-accent/40 sm:flex sm:max-w-sm"
          >
            <Search size={16} />
            Search or jump to…
            <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">
              ⌘K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-1 sm:ml-0">
            <Link
              href="/admin/dashboard"
              aria-label="Alerts"
              className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Bell size={20} />
            </Link>
          </div>
        </header>

        {/* Skip-link focus target. Each page supplies its own <main> landmark,
            so this stays a <div> to avoid nesting two <main> elements. */}
        <div id="main-content" tabIndex={-1} className="min-w-0 flex-1 outline-none">
          {children}
        </div>
      </div>

      <CommandPalette />
      <AssistantWidget />
    </div>
    </AdminFeedbackProvider>
  );
}
