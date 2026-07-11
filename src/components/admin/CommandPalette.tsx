"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import { searchRecords, type SearchHit } from "@/lib/api";

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
  { label: "Applications", href: "/admin/applications", keywords: "carrier apply leads onboard" },
  { label: "Payroll", href: "/admin/payroll", keywords: "pay settlements carrier" },
];

// A row in the palette: either a page destination or a matched record.
type Row =
  | { kind: "nav"; label: string; href: string }
  | { kind: "record"; hit: SearchHit };

const TYPE_LABEL: Record<SearchHit["type"], string> = {
  load: "Load",
  carrier: "Carrier",
  broker: "Broker",
  invoice: "Invoice",
};

export function CommandPalette() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const seq = useRef(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery("");
        setActive(0);
        setHits([]);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Debounced record search against the backend as the user types.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      setSearching(false);
      return;
    }
    const mine = ++seq.current;
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const token = await getToken();
        const results = await searchRecords(token, q);
        if (mine === seq.current) setHits(results);
      } catch {
        if (mine === seq.current) setHits([]);
      } finally {
        if (mine === seq.current) setSearching(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query, getToken]);

  const navMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DESTINATIONS;
    return DESTINATIONS.filter(
      (d) => d.label.toLowerCase().includes(q) || (d.keywords ?? "").toLowerCase().includes(q),
    );
  }, [query]);

  const rows = useMemo<Row[]>(
    () => [
      ...hits.map((hit) => ({ kind: "record" as const, hit })),
      ...navMatches.map((d) => ({ kind: "nav" as const, label: d.label, href: d.href })),
    ],
    [hits, navMatches],
  );

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
            if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, rows.length - 1));
            else if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
            else if (e.key === "Enter") {
              const row = rows[active];
              if (row) go(row.kind === "nav" ? row.href : row.hit.href);
            }
          }}
          placeholder="Search loads, carriers, brokers, invoices — or jump to a page…"
          className="w-full border-b border-border bg-background px-4 py-3 text-sm outline-none"
        />
        <ul className="max-h-80 overflow-y-auto p-2">
          {rows.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              {searching ? "Searching…" : query.trim().length >= 2 ? "No matches." : "Type to search."}
            </li>
          ) : (
            rows.map((row, i) => (
              <li key={row.kind === "nav" ? `nav-${row.href}` : `rec-${row.hit.type}-${row.hit.id}`}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(row.kind === "nav" ? row.href : row.hit.href)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                    i === active ? "bg-accent text-black" : "hover:bg-muted"
                  }`}
                >
                  {row.kind === "record" && (
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                        i === active ? "bg-black/15 text-black" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {TYPE_LABEL[row.hit.type]}
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate">
                    {row.kind === "nav" ? row.label : row.hit.label}
                    {row.kind === "record" && row.hit.sublabel && (
                      <span
                        className={`ml-2 truncate text-xs ${
                          i === active ? "text-black/70" : "text-muted-foreground"
                        }`}
                      >
                        {row.hit.sublabel}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
