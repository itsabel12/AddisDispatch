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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile, EmptyState } from "@/components/carrier/ui";
import { money, formatDate } from "@/components/carrier/format";

const paidIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-5">
    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const pendingIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-5">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

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
    <main className="mx-auto w-full max-w-6xl p-5 lg:p-8">
      <PageHeader
        title="Pay"
        subtitle="What you've earned per delivered load, net of deductions. Separate from broker invoices under Settlements."
      />

      {error && (
        <p className="mb-6 rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <StatTile icon={paidIcon} label="Paid to date" value={money(paidTotal)} loading={loading} />
        <StatTile icon={pendingIcon} label="Pending" value={money(pendingTotal)} loading={loading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pay history</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {items.length === 0 ? (
            <EmptyState
              icon={pendingIcon}
              title={loading ? "Loading…" : "No pay items yet"}
              body={loading ? undefined : "Pay for your delivered loads will appear here."}
            />
          ) : (
            <div className="overflow-x-auto">
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
                  {items.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.lane ?? "—"}</TableCell>
                      <TableCell className="text-right">{money(i.gross_pay)}</TableCell>
                      <TableCell className="text-right font-semibold">{money(i.net_pay)}</TableCell>
                      <TableCell>
                        <StatusBadge status={i.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(i.paid_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
