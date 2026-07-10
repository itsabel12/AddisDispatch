"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import { getMyPay } from "@/lib/carrier-api";
import type { PayrollItem } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { money, formatDate } from "@/components/carrier/format";

const STATUS_STYLE: Record<string, string> = {
  pending: "border-accent/40 bg-accent/10 text-accent",
  approved: "border-blue-400/40 bg-blue-400/10 text-blue-400",
  paid: "border-success/40 bg-success/10 text-success",
  needs_review: "border-border bg-muted text-muted-foreground",
};

export function CarrierPay() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<PayrollItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await getMyPay(await getToken()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load your pay.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const paidTotal = items
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + (i.net_pay ?? 0), 0);
  const pendingTotal = items
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + (i.net_pay ?? 0), 0);

  return (
    <main className="mx-auto w-full max-w-6xl p-8">
      <h1 className="mb-1 text-2xl font-semibold">Pay</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        What you&apos;ve earned per delivered load, net of deductions. (Separate
        from broker invoices under Settlements.)
      </p>

      {error && (
        <p className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Paid to date
          </div>
          <div className="mt-1 text-2xl font-semibold text-success">{money(paidTotal)}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Pending
          </div>
          <div className="mt-1 text-2xl font-semibold text-accent">{money(pendingTotal)}</div>
        </div>
      </div>

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lane</TableHead>
              <TableHead className="text-right">Gross</TableHead>
              <TableHead className="text-right">Net</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Paid</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  {loading ? "Loading…" : "No pay items yet."}
                </TableCell>
              </TableRow>
            ) : (
              items.map((i) => (
                <TableRow key={i.id}>
                  <TableCell>{i.lane ?? "—"}</TableCell>
                  <TableCell className="text-right">{money(i.gross_pay)}</TableCell>
                  <TableCell className="text-right font-semibold">{money(i.net_pay)}</TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${
                        STATUS_STYLE[i.status] ?? STATUS_STYLE.pending
                      }`}
                    >
                      {i.status.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(i.paid_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
