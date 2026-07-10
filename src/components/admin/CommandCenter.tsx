"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

import {
  getCommandCenter,
  getProfitability,
  runNotificationRules,
  markAllNotificationsRead,
  markNotificationRead,
  type CommandCenterSummary,
  type ProfitabilityReport,
} from "@/lib/api";
import { useEventStream } from "@/lib/useEventStream";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { RadialGauge } from "@/components/ui/radial-gauge";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const ACCENT = "#ef7f18";
const SUCCESS = "#12a150";
const GRID = "rgba(35,32,27,0.06)";
const TICK = "rgba(35,32,27,0.4)";

const SEVERITY_DOT: Record<string, string> = {
  info: "bg-info",
  warning: "bg-accent",
  critical: "bg-danger",
};

const money = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

// small inline icons for the KPI tiles
const icon = {
  truck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-4">
      <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" strokeLinejoin="round" />
      <circle cx="7" cy="17" r="1.3" /><circle cx="17" cy="17" r="1.3" />
    </svg>
  ),
  profit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-4">
      <path d="M4 15l4-4 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 8h4v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  invoice: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-4">
      <path d="M6 3h12v18l-3-1.5L12 21l-3-1.5L6 21z" /><path d="M9 8h6M9 12h6" strokeLinecap="round" />
    </svg>
  ),
  wallet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-4">
      <rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /><circle cx="17" cy="14" r="1" />
    </svg>
  ),
};

export function CommandCenter() {
  const { getToken } = useAuth();
  const [data, setData] = useState<CommandCenterSummary | null>(null);
  const [trend, setTrend] = useState<ProfitabilityReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    try {
      const token = await getToken();
      const [summary, prof] = await Promise.all([
        getCommandCenter(token),
        getProfitability(token, "week").catch(() => null),
      ]);
      setData(summary);
      if (prof) setTrend(prof);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load the Command Center.");
    }
  }, [getToken]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const refresh = useCallback(() => void reload(), [reload]);
  useEventStream({
    notification: refresh,
    document_processed: refresh,
    load_updated: refresh,
    invoice_created: refresh,
    payroll_created: refresh,
    chat_message: refresh,
    email_received: refresh,
  });

  async function onRunRules() {
    setBusy(true);
    try {
      await runNotificationRules(await getToken());
      await reload();
    } finally {
      setBusy(false);
    }
  }
  async function onDismiss(id: string) {
    await markNotificationRead(await getToken(), id);
    await reload();
  }
  async function onClearAll() {
    await markAllNotificationsRead(await getToken());
    await reload();
  }

  // Load performance donuts (derived from loads by_status).
  const byStatus = data?.loads.by_status ?? {};
  const totalLoads = Object.values(byStatus).reduce((s, n) => s + n, 0);
  const pct = (n: number) => (totalLoads ? (n / totalLoads) * 100 : 0);

  const trendPoints = trend?.trend ?? [];
  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: true, labels: { color: TICK, boxWidth: 10, font: { size: 11 }, usePointStyle: true } },
      tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${money(Number(c.parsed.y))}` } },
    },
    scales: {
      x: { grid: { color: GRID }, ticks: { color: TICK, font: { size: 10 }, maxRotation: 0 } },
      y: {
        grid: { color: GRID },
        ticks: { color: TICK, font: { size: 10 }, callback: (v) => "$" + (Number(v) / 1000).toFixed(1) + "k" },
      },
    },
  };

  return (
    <main className="mx-auto w-full max-w-7xl p-5 lg:p-8">
      <PageHeader
        title="Command Center"
        subtitle={
          <>
            Live operations overview · press{" "}
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[11px]">⌘K</kbd> to jump anywhere
          </>
        }
      />

      {error && (
        <p className="mb-6 rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Loads"
          value={data ? data.loads.active : "—"}
          hint={data ? `${data.loads.today} created today` : undefined}
          icon={icon.truck}
          href="/admin"
        />
        <StatCard
          label="Today's Profit"
          value={data ? money(data.profitability_today.gross_profit) : "—"}
          delta={
            data?.profitability_today.margin != null
              ? { value: `${(data.profitability_today.margin * 100).toFixed(0)}% margin`, direction: "up" }
              : undefined
          }
          icon={icon.profit}
          href="/admin/profitability"
          accent
        />
        <StatCard
          label="Outstanding"
          value={data ? money(data.invoices.outstanding) : "—"}
          hint={data ? `${data.invoices.by_status.overdue ?? 0} overdue` : undefined}
          icon={icon.invoice}
          href="/admin/invoices"
        />
        <StatCard
          label="Payroll Due"
          value={data ? money(data.payroll.unpaid_total) : "—"}
          hint={data ? `${data.payroll.pending} pending` : undefined}
          icon={icon.wallet}
          href="/admin/payroll"
        />
      </div>

      {/* Trend + performance */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue &amp; Profit</CardTitle>
            <span className="text-xs text-muted-foreground">This week</span>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64">
              {trendPoints.length > 0 ? (
                <Line
                  data={{
                    labels: trendPoints.map((p) => p.date.slice(5)),
                    datasets: [
                      {
                        label: "Revenue",
                        data: trendPoints.map((p) => p.revenue),
                        borderColor: ACCENT,
                        backgroundColor: "rgba(239,127,24,0.10)",
                        borderWidth: 2.5,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        fill: true,
                        tension: 0.4,
                      },
                      {
                        label: "Profit",
                        data: trendPoints.map((p) => p.profit),
                        borderColor: SUCCESS,
                        backgroundColor: "rgba(18,161,80,0.08)",
                        borderWidth: 2.5,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        fill: true,
                        tension: 0.4,
                      },
                    ],
                  }}
                  options={chartOptions}
                />
              ) : (
                <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No profit data this week yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Load Performance</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-around pt-2">
            <RadialGauge value={pct(byStatus.delivered ?? 0)} label="Delivered" color={SUCCESS} />
            <RadialGauge value={pct(byStatus.in_transit ?? 0)} label="In Transit" color={ACCENT} />
            <RadialGauge value={pct(byStatus.issue ?? 0)} label="Issues" color="#dc2b2b" />
          </CardContent>
        </Card>
      </div>

      {/* Alerts + automations */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <div className="flex gap-3">
              <button type="button" onClick={onRunRules} disabled={busy} className="text-xs font-medium text-accentDeep hover:underline disabled:opacity-50">
                Run checks
              </button>
              <button type="button" onClick={onClearAll} className="text-xs text-muted-foreground hover:underline">
                Clear all
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {!data || data.notifications.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No open alerts. You&apos;re all caught up.</p>
            ) : (
              <ul className="space-y-2">
                {data.notifications.map((n) => (
                  <li key={n.id} className="flex items-start gap-3 rounded-xl border border-border p-3">
                    <span className={`mt-1.5 size-2 shrink-0 rounded-full ${SEVERITY_DOT[n.severity] ?? SEVERITY_DOT.info}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{n.title}</p>
                      {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
                    </div>
                    <button type="button" onClick={() => onDismiss(n.id)} className="text-xs text-muted-foreground hover:text-foreground">
                      Dismiss
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent AI Automations</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {!data || data.recent_automations.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nothing yet. Approvals and auto-invoicing show up here.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {data.recent_automations.map((a, i) => (
                  <li key={i} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="flex items-center gap-2 capitalize text-foreground">
                      <span className="size-1.5 rounded-full bg-accent" />
                      {a.action.replace(/[._]/g, " ")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {a.created_at
                        ? new Date(a.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                        : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoice status + queues */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>
            <Link href="/admin/invoices" className="text-xs text-accentDeep hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3 pt-2 sm:grid-cols-5">
            {data &&
              Object.entries(data.invoices.by_status).map(([status, count]) => (
                <div key={status} className="rounded-xl border border-border bg-muted/40 p-3 text-center">
                  <div className="font-heading text-lg font-semibold tabular-nums">{count}</div>
                  <div className="text-xs capitalize text-muted-foreground">{status}</div>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Needs Attention</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
            <QueueStat label="Intake" value={data?.review_queues.intake_pending ?? 0} href="/admin/loads/intake" />
            <QueueStat label="POD Review" value={data?.review_queues.pod_pending ?? 0} href="/admin/pod-review" />
            <QueueStat label="Inbox" value={data?.email.active ?? 0} href="/admin/inbox" />
            <QueueStat label="Messages" value={data?.messages.unread ?? 0} href="/admin/messages" />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function QueueStat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border bg-muted/40 p-3 text-center transition-colors hover:border-accent/40 hover:bg-accent/5"
    >
      <div className={`font-heading text-lg font-semibold tabular-nums ${value > 0 ? "text-accentDeep" : ""}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </Link>
  );
}
