"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import { getMyInvoices } from "@/lib/carrier-api";
import type { Invoice } from "@/lib/api";
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
import { EmptyState } from "@/components/carrier/ui";
import { money, formatDate } from "@/components/carrier/format";

const receiptIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-5">
    <path d="M6 3h12v18l-3-1.5L12 21l-3-1.5L6 21z" /><path d="M9 8h6M9 12h6" />
  </svg>
);

export function CarrierSettlements() {
  const { getToken } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setInvoices(await getMyInvoices(await getToken()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load your settlements.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <main className="mx-auto w-full max-w-6xl p-5 lg:p-8">
      <PageHeader
        title="Settlements"
        subtitle="Invoices for your loads and their payment status."
      />

      {error && (
        <p className="mb-6 rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {invoices.length === 0 ? (
            <EmptyState
              icon={receiptIcon}
              title={loading ? "Loading…" : "No settlements yet"}
              body={loading ? undefined : "Invoices raised for your delivered loads will appear here."}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Lane</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                      <TableCell>{inv.lane ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(inv.issued_at)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(inv.due_at)}</TableCell>
                      <TableCell>
                        <StatusBadge status={inv.status} />
                      </TableCell>
                      <TableCell className="text-right font-semibold">{money(inv.amount)}</TableCell>
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
