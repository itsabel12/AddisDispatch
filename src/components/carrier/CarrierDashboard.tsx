"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

import {
  getMyLoads,
  getMySummary,
  type CarrierSummary,
} from "@/lib/carrier-api";
import type { Load } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { money, lane, formatDate } from "@/components/carrier/format";

const KPIS: { key: keyof CarrierSummary; label: string; money?: boolean }[] = [
  { key: "total_loads", label: "Total Loads" },
  { key: "in_transit", label: "In Transit" },
  { key: "delivered", label: "Delivered" },
  { key: "paid_total", label: "Paid", money: true },
  { key: "outstanding_total", label: "Outstanding", money: true },
];

export function CarrierDashboard() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [summary, setSummary] = useState<CarrierSummary | null>(null);
  const [loads, setLoads] = useState<Load[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const [s, l] = await Promise.all([getMySummary(token), getMyLoads(token)]);
      setSummary(s);
      setLoads(l);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const recent = loads.slice(0, 8);

  return (
    <main className="mx-auto w-full max-w-6xl p-8">
      <h1 className="text-2xl font-semibold">
        Welcome{user?.firstName ? `, ${user.firstName}` : ""}
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Your loads and settlements at a glance.
      </p>

      {error && (
        <p className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {KPIS.map((kpi) => (
          <div key={kpi.key} className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {kpi.label}
            </div>
            <div className="mt-1 text-2xl font-semibold">
              {loading || !summary
                ? "—"
                : kpi.money
                  ? money(summary[kpi.key])
                  : summary[kpi.key]}
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Recent Loads
      </h2>
      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lane</TableHead>
              <TableHead>Pickup</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">RPM</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  {loading ? "Loading…" : "No loads assigned to you yet."}
                </TableCell>
              </TableRow>
            ) : (
              recent.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{lane(l)}</TableCell>
                  <TableCell>{formatDate(l.pickup_at)}</TableCell>
                  <TableCell className="capitalize">
                    {l.status.replace("_", " ")}
                  </TableCell>
                  <TableCell className="text-right">{money(l.rate)}</TableCell>
                  <TableCell className="text-right">{money(l.rpm)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
