"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import {
  getPodQueue,
  approvePod,
  rejectPod,
  fetchDocumentPreview,
  type PodReviewItem,
} from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/badge";

const money = (n: number | null) =>
  n == null
    ? "—"
    : n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function PodReview() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<PodReviewItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setItems(await getPodQueue(await getToken()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load the POD queue.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Poll while any POD is still being read.
  useEffect(() => {
    const processing = items.some(
      (i) => i.document.status === "processing" || i.document.status === "uploaded",
    );
    if (!processing) return;
    const t = setInterval(() => void reload(), 2500);
    return () => clearInterval(t);
  }, [items, reload]);

  async function onView(item: PodReviewItem) {
    try {
      const url = await fetchDocumentPreview(await getToken(), item.document);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setError("Could not open the document.");
    }
  }

  async function onApprove(item: PodReviewItem) {
    setBusyId(item.document.id);
    setError(null);
    setMessage(null);
    try {
      const invoice = await approvePod(await getToken(), item.document.id);
      setMessage(
        `Load marked delivered — invoice ${invoice.invoice_number} queued (${money(invoice.amount)}).`,
      );
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Approve failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function onReject(item: PodReviewItem) {
    setBusyId(item.document.id);
    setError(null);
    try {
      await rejectPod(await getToken(), item.document.id);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reject failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl p-5 lg:p-8">
      <PageHeader
        title="POD Review"
        subtitle="Proofs of delivery uploaded by carriers. Approving marks the load delivered and auto-generates its invoice."
      />

      {error && (
        <p className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {message && (
        <p className="mb-6 rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
          {message}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-border p-10 text-center text-sm text-muted-foreground">
          No PODs awaiting review. When a carrier uploads one, it appears here.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const delivery = item.document.extraction?.fields?.delivery_at;
            return (
              <li
                key={item.document.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-soft"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-semibold">
                        {item.load?.lane ?? "Unlinked POD"}
                      </span>
                      <StatusBadge status={item.document.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.load?.broker_name}
                      {item.load?.carrier_name ? ` · ${item.load.carrier_name}` : ""}
                      {item.load?.rate != null ? ` · ${money(item.load.rate)}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      {item.document.filename}
                      {delivery ? ` · delivered ${String(delivery).slice(0, 10)}` : ""}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => onView(item)}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      disabled={busyId === item.document.id}
                      onClick={() => onReject(item)}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={busyId === item.document.id || !item.load}
                      onClick={() => onApprove(item)}
                      className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-accentDeep disabled:opacity-50"
                    >
                      {busyId === item.document.id ? "Working…" : "Approve → Invoice"}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
