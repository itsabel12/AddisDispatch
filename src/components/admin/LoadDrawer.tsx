"use client";

/**
 * Load detail drawer — a right-side slide-over with the full load record,
 * profitability figures, and linked documents. Opened from the loads table or
 * a ⌘K record hit (?load=<id>).
 */

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import {
  getLoadDocuments,
  fetchDocumentPreview,
  type IntakeDocument,
  type Load,
} from "@/lib/api";
import { StatusBadge } from "@/components/ui/badge";
import { useToast } from "@/components/admin/feedback";

const money = (n: number | null) =>
  n == null
    ? "—"
    : n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const dateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  );
}

export function LoadDrawer({ load, onClose }: { load: Load | null; onClose: () => void }) {
  const { getToken } = useAuth();
  const toast = useToast();
  const [docs, setDocs] = useState<IntakeDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const loadDocs = useCallback(async () => {
    if (!load) return;
    setLoadingDocs(true);
    try {
      setDocs(await getLoadDocuments(await getToken(), load.id));
    } catch {
      setDocs([]);
    } finally {
      setLoadingDocs(false);
    }
  }, [getToken, load]);

  useEffect(() => {
    void loadDocs();
  }, [loadDocs]);

  // Close on Escape.
  useEffect(() => {
    if (!load) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [load, onClose]);

  async function preview(doc: IntakeDocument) {
    try {
      const url = await fetchDocumentPreview(await getToken(), doc);
      window.open(url, "_blank", "noopener");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open document.");
    }
  }

  if (!load) return null;

  const lane = `${load.origin_city}, ${load.origin_state} → ${load.dest_city}, ${load.dest_state}`;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-black/40" onClick={onClose}>
      <aside
        className="flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className="sticky top-0 flex items-start justify-between gap-3 border-b border-border bg-card/90 px-5 py-4 backdrop-blur">
          <div className="min-w-0">
            <p className="truncate font-heading text-lg font-semibold">{load.broker_name}</p>
            <p className="truncate text-sm text-muted-foreground">{lane}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StatusBadge status={load.status} />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-4">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </header>

        <div className="space-y-6 px-5 py-5">
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Rate & scoring
            </h3>
            <dl className="grid grid-cols-2 gap-4">
              <Field label="Rate" value={money(load.rate)} />
              <Field label="RPM" value={load.rpm != null ? `$${load.rpm.toFixed(2)}` : "—"} />
              <Field label="Loaded miles" value={load.loaded_miles ?? "—"} />
              <Field label="Deadhead" value={load.deadhead_miles ?? "—"} />
              <Field label="Score" value={load.score ?? "—"} />
              <Field label="Recommendation" value={load.recommendation ?? "—"} />
            </dl>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Lane & schedule
            </h3>
            <dl className="grid grid-cols-2 gap-4">
              <Field label="Origin" value={`${load.origin_city}, ${load.origin_state}`} />
              <Field label="Destination" value={`${load.dest_city}, ${load.dest_state}`} />
              <Field label="Pickup" value={dateTime(load.pickup_at)} />
              <Field label="Delivery" value={dateTime(load.delivery_at)} />
              <Field label="Weight (lbs)" value={load.weight_lbs ?? "—"} />
              <Field label="Carrier" value={load.carrier_name ?? "Unassigned"} />
            </dl>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Documents {docs.length > 0 && `(${docs.length})`}
            </h3>
            {loadingDocs ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : docs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents linked to this load.</p>
            ) : (
              <ul className="space-y-2">
                {docs.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{d.filename}</p>
                      <p className="text-xs text-muted-foreground">{d.type.replace(/_/g, " ")}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => preview(d)}
                      className="shrink-0 text-xs font-medium text-accentDeep hover:underline"
                    >
                      View
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {load.source && (
            <p className="text-xs text-muted-foreground">Source: {load.source}</p>
          )}
        </div>
      </aside>
    </div>
  );
}
