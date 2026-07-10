"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

// Destinations the palette can jump to. Keep in sync with the admin nav.
const DESTINATIONS: { label: string; href: string; keywords?: string }[] = [
  { label: "Command Center", href: "/admin/dashboard", keywords: "home overview dashboard" },
  { label: "Loads", href: "/admin", keywords: "freight" },
  { label: "Load Intake", href: "/admin/loads/intake", keywords: "rate con document upload ai" },
  { label: "POD Review", href: "/admin/pod-review", keywords: "delivery proof" },
  { label: "Inbox", href: "/admin/inbox", keywords: "email mail" },
  { label: "Messages", href: "/admin/messages", keywords: "chat driver carrier" },
  { label: "Profitability", href: "/admin/profitability", keywords: "margin revenue cost" },
  { label: "Brokers", href: "/admin/brokers" },
  { label: "Carriers", href: "/admin/carriers" },
  { label: "Lanes", href: "/admin/lanes" },
  { label: "Invoices", href: "/admin/invoices", keywords: "billing" },
  { label: "Customer Emails", href: "/admin/comm-templates", keywords: "templates milestone" },
  { label: "Carrier Accounts", href: "/admin/carrier-accounts", keywords: "approve signup" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery("");
        setActive(0);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DESTINATIONS;
    return DESTINATIONS.filter(
      (d) =>
        d.label.toLowerCase().includes(q) ||
        (d.keywords ?? "").toLowerCase().includes(q),
    );
  }, [query]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 p-4 pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="portal-scope w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, results.length - 1));
            else if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
            else if (e.key === "Enter" && results[active]) go(results[active].href);
          }}
          placeholder="Jump to…"
          className="w-full border-b border-border bg-background px-4 py-3 text-sm outline-none"
        />
        <ul className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">No matches.</li>
          ) : (
            results.map((d, i) => (
              <li key={d.href}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(d.href)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                    i === active ? "bg-accent text-black" : "hover:bg-muted"
                  }`}
                >
                  {d.label}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
