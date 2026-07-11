"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

import {
  getCarrierApplications,
  setApplicationStatus,
  onboardApplication,
  type CarrierApplication,
} from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { useToast, useConfirm } from "@/components/admin/feedback";

const STATUS_TONE: Record<string, "accent" | "info" | "success" | "neutral"> = {
  new: "accent",
  contacted: "info",
  onboarded: "success",
  declined: "neutral",
};

const FILTERS = ["all", "new", "contacted", "onboarded", "declined"] as const;

const fmtDate = (iso: string) => iso.slice(0, 10);

export function Applications() {
  const { getToken } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const [applications, setApplications] = useState<CarrierApplication[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      setApplications(
        await getCarrierApplications(await getToken(), filter === "all" ? undefined : filter),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }, [getToken, filter]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function onStatus(app: CarrierApplication, status: string) {
    if (status === "declined") {
      const ok = await confirm({
        title: `Decline ${app.company_name}?`,
        body: "You can still onboard them later from the Declined filter.",
        confirmLabel: "Decline",
        destructive: true,
      });
      if (!ok) return;
    }
    setBusyId(app.id);
    try {
      await setApplicationStatus(await getToken(), app.id, status);
      toast.success(`${app.company_name} marked ${status}.`);
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function onOnboard(app: CarrierApplication) {
    const ok = await confirm({
      title: `Onboard ${app.company_name}?`,
      body: "This creates a carrier record and emails the onboarding document packet.",
      confirmLabel: "Onboard",
    });
    if (!ok) return;
    setBusyId(app.id);
    try {
      const carrier = await onboardApplication(await getToken(), app.id);
      toast.success(
        `${carrier.name} created — onboarding packet emailed. Set their pay profile in Carriers.`,
      );
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Onboard failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl p-5 lg:p-8">
      <PageHeader
        title="Applications"
        subtitle="Carrier applications from the website. Onboarding creates the carrier record and emails the document packet."
        actions={
          <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                  filter === f
                    ? "bg-accent text-[#1a1712] shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        }
      />

      {error && (
        <p className="mb-4 rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground shadow-soft">
          No applications{filter !== "all" ? ` with status "${filter}"` : " yet"}. They
          arrive here when a carrier applies at{" "}
          <Link href="/apply" className="text-accentDeep hover:underline">
            /apply
          </Link>
          .
        </div>
      ) : (
        <ul className="space-y-3">
          {applications.map((app) => (
            <li key={app.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-heading font-semibold">{app.company_name}</span>
                    <Badge tone={STATUS_TONE[app.status] ?? "neutral"} dot>
                      {app.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {app.contact_name} · {app.email}
                    {app.phone ? ` · ${app.phone}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/80">
                    {[
                      app.mc_number && `MC ${app.mc_number}`,
                      app.dot_number && `DOT ${app.dot_number}`,
                      app.equipment_type && app.equipment_type.replace(/_/g, " "),
                      app.truck_count && `${app.truck_count} truck(s)`,
                      app.preferred_lanes && `Lanes: ${app.preferred_lanes}`,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "No freight details provided"}
                    {" · applied "}
                    {fmtDate(app.created_at)}
                  </p>
                  {app.notes && (
                    <p className="mt-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                      “{app.notes}”
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  {app.status !== "onboarded" && (
                    <>
                      {app.status === "new" && (
                        <button
                          type="button"
                          disabled={busyId === app.id}
                          onClick={() => onStatus(app, "contacted")}
                          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
                        >
                          Mark contacted
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busyId === app.id}
                        onClick={() => onOnboard(app)}
                        className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-[#1a1712] shadow-soft transition-colors hover:bg-accentDeep disabled:opacity-50"
                      >
                        {busyId === app.id ? "Working…" : "Onboard →"}
                      </button>
                      {app.status !== "declined" && (
                        <button
                          type="button"
                          disabled={busyId === app.id}
                          onClick={() => onStatus(app, "declined")}
                          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
                        >
                          Decline
                        </button>
                      )}
                    </>
                  )}
                  {app.status === "onboarded" && (
                    <Link
                      href="/admin/carriers"
                      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-accentDeep transition-colors hover:bg-muted"
                    >
                      View in Carriers →
                    </Link>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
