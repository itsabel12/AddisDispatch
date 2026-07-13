"use client";

import { getMyPay } from "@/lib/carrier-api";
import type { PayrollItem } from "@/lib/api";
import { useQuery } from "@/lib/useQuery";
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
import { Wallet, Clock } from "@/components/icons";
import { money, formatDate } from "@/components/carrier/format";

const paidIcon = <Wallet size={20} />;
const pendingIcon = <Clock size={20} />;

export function CarrierPay() {
  const { data, loading, error } = useQuery<PayrollItem[]>(getMyPay, {
    fallbackError: "Failed to load your pay.",
  });
  const items = data ?? [];

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
