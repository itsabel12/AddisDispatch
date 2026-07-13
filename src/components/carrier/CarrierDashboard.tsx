"use client";

import { useUser } from "@clerk/nextjs";

import {
  getMyLoads,
  getMySummary,
  type CarrierSummary,
} from "@/lib/carrier-api";
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
import { Package, Truck, CircleCheck, Wallet, Clock } from "@/components/icons";
import { money, lane, formatDate } from "@/components/carrier/format";

const KPIS: {
  key: keyof CarrierSummary;
  label: string;
  icon: React.ReactNode;
  money?: boolean;
}[] = [
  { key: "total_loads", label: "Total Loads", icon: <Package size={20} /> },
  { key: "in_transit", label: "In Transit", icon: <Truck size={20} /> },
  { key: "delivered", label: "Delivered", icon: <CircleCheck size={20} /> },
  { key: "paid_total", label: "Paid", icon: <Wallet size={20} />, money: true },
  { key: "outstanding_total", label: "Outstanding", icon: <Clock size={20} />, money: true },
];

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function CarrierDashboard() {
  const { user } = useUser();
  const { data, loading, error } = useQuery(
    async (token) => {
      const [summary, loads] = await Promise.all([getMySummary(token), getMyLoads(token)]);
      return { summary, loads };
    },
    { fallbackError: "Failed to load your dashboard." },
  );
  const summary: CarrierSummary | null = data?.summary ?? null;
  const loads = data?.loads ?? [];

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
              icon={<Package size={22} />}
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
