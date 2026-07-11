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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile, EmptyState } from "@/components/carrier/ui";
import { money, lane, formatDate } from "@/components/carrier/format";

const icons = {
  loads: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-5">
      <path d="M3 6h11v9H3z" /><path d="M14 9h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" />
    </svg>
  ),
  transit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-5">
      <path d="M2 12h13M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  delivered: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-5">
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  paid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-5">
      <rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /><circle cx="17" cy="14" r="1" />
    </svg>
  ),
  outstanding: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-5">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const KPIS: {
  key: keyof CarrierSummary;
  label: string;
  icon: React.ReactNode;
  money?: boolean;
}[] = [
  { key: "total_loads", label: "Total Loads", icon: icons.loads },
  { key: "in_transit", label: "In Transit", icon: icons.transit },
  { key: "delivered", label: "Delivered", icon: icons.delivered },
  { key: "paid_total", label: "Paid", icon: icons.paid, money: true },
  { key: "outstanding_total", label: "Outstanding", icon: icons.outstanding, money: true },
];

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

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
    <main className="mx-auto w-full max-w-6xl p-5 lg:p-8">
      <PageHeader
        title={`Welcome${user?.firstName ? `, ${user.firstName}` : ""}`}
        subtitle={today}
      />

      {error && (
        <p className="mb-6 rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {KPIS.map((kpi) => (
          <StatTile
            key={kpi.key}
            icon={kpi.icon}
            label={kpi.label}
            loading={loading || !summary}
            value={
              summary
                ? kpi.money
                  ? money(summary[kpi.key])
                  : summary[kpi.key]
                : "—"
            }
          />
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Loads</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {recent.length === 0 ? (
            <EmptyState
              icon={icons.loads}
              title={loading ? "Loading…" : "No loads assigned yet"}
              body={loading ? undefined : "Loads your dispatcher assigns to you will appear here."}
            />
          ) : (
            <div className="overflow-x-auto">
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
                  {recent.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{lane(l)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(l.pickup_at)}</TableCell>
                      <TableCell>
                        <StatusBadge status={l.status} />
                      </TableCell>
                      <TableCell className="text-right">{money(l.rate)}</TableCell>
                      <TableCell className="text-right">{money(l.rpm)}</TableCell>
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
