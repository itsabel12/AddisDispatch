import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { fmtDateTime, timeAgo } from "@/lib/portal/format";
import type { NotificationRow } from "@/lib/portal/types";
import PageHeader from "@/components/portal/PageHeader";
import { markAllRead } from "./actions";

export const metadata: Metadata = { title: "Notifications — AddisDispatch Portal" };

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  const items = (data ?? []) as NotificationRow[];
  const unread = items.filter((i) => !i.read).length;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        subtitle="Loads, settlements, agreements, and compliance alerts."
        action={
          unread > 0 ? (
            <form action={markAllRead}>
              <button
                type="submit"
                className="rounded-full border border-portalBorder px-4 py-2 text-sm font-medium text-textMuted transition-colors hover:border-gold/50 hover:text-gold"
              >
                Mark all read
              </button>
            </form>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-portalBorder bg-bgSurface p-10 text-center text-sm font-light text-textMuted">
          No notifications yet.
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li
              key={n.id}
              className={`flex items-start gap-3 rounded-2xl border p-4 ${
                n.read ? "border-portalBorder bg-bgSurface" : "border-gold/30 bg-gold/5"
              }`}
            >
              <span className={`mt-1.5 h-2 w-2 flex-none rounded-full ${n.read ? "bg-portalBorder" : "bg-gold"}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-textPrimary">{n.title}</span>
                  <span className="text-xs font-light text-textMuted" title={fmtDateTime(n.created_at)}>
                    {timeAgo(n.created_at)}
                  </span>
                </div>
                {n.body && <p className="mt-0.5 text-sm font-light text-textMuted">{n.body}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
