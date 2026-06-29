"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/portal/format";
import type { NotificationRow } from "@/lib/portal/types";

export default function NotificationBell() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(15);
      if (active) setItems((data ?? []) as NotificationRow[]);
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unread = items.filter((i) => !i.read).length;

  async function markAll() {
    const supabase = createClient();
    const ids = items.filter((i) => !i.read).map((i) => i.id);
    if (ids.length === 0) return;
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    await supabase.from("notifications").update({ read: true }).in("id", ids);
  }

  async function markOne(id: string) {
    const supabase = createClient();
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)));
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-textMuted transition-colors hover:bg-bgElevated hover:text-textPrimary"
      >
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-bold text-black">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-portalBorder bg-bgElevated shadow-2xl">
          <div className="flex items-center justify-between border-b border-portalBorder px-4 py-3">
            <span className="text-sm font-semibold text-textPrimary">Notifications</span>
            {unread > 0 && (
              <button type="button" onClick={markAll} className="text-xs font-medium text-gold hover:underline">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm font-light text-textMuted">No notifications.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markOne(n.id)}
                  className={`flex w-full items-start gap-2.5 border-b border-portalBorder px-4 py-3 text-left transition-colors hover:bg-bgSurface ${
                    n.read ? "" : "bg-gold/5"
                  }`}
                >
                  <span className={`mt-1.5 h-1.5 w-1.5 flex-none rounded-full ${n.read ? "bg-transparent" : "bg-gold"}`} />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-textPrimary">{n.title}</span>
                    {n.body && <span className="block truncate text-xs font-light text-textMuted">{n.body}</span>}
                    <span className="mt-0.5 block text-[0.65rem] text-textMuted/70">{timeAgo(n.created_at)}</span>
                  </span>
                </button>
              ))
            )}
          </div>

          <Link
            href="/portal/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-portalBorder px-4 py-2.5 text-center text-sm font-medium text-gold hover:bg-bgSurface"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
}
