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
import { money, formatDate } from "@/components/carrier/format";

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
    <main className="mx-auto w-full max-w-6xl p-8">
      <h1 className="mb-1 text-2xl font-semibold">Settlements</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Invoices for your loads and their payment status.
      </p>

      {error && (
        <p className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="rounded-xl border border-border">
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
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  {loading ? "Loading…" : "No settlements yet."}
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                  <TableCell>{inv.lane ?? "—"}</TableCell>
                  <TableCell>{formatDate(inv.issued_at)}</TableCell>
                  <TableCell>{formatDate(inv.due_at)}</TableCell>
                  <TableCell className="capitalize">{inv.status}</TableCell>
                  <TableCell className="text-right">{money(inv.amount)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
