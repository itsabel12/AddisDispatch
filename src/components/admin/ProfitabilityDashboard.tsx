"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Filler,
  type ChartOptions,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

import {
  getProfitability,
  type ProfitabilityReport,
  type ProfitabilityPeriod,
  type GroupProfit,
} from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Filler,
);

const ACCENT = "#ef7f18";
const SUCCESS = "#12a150";
const GRID = "rgba(35,32,27,0.06)";
const TICK = "rgba(35,32,27,0.4)";

const PERIODS: { key: ProfitabilityPeriod; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
];

const money = (n: number | null | undefined) =>
  n == null
    ? "—"
    : n.toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      });

const pct = (n: number | null | undefined) =>
  n == null ? "—" : `${(n * 100).toFixed(1)}%`;

const perMile = (n: number | null | undefined) =>
  n == null ? "—" : `$${n.toFixed(2)}`;

export function ProfitabilityDashboard() {
  const { getToken } = useAuth();
  const [period, setPeriod] = useState<ProfitabilityPeriod>("week");
  const [report, setReport] = useState<ProfitabilityReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReport(await getProfitability(await getToken(), period));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load profitability.");
    } finally {
      setLoading(false);
    }
  }, [getToken, period]);

  useEffect(() => {
    void load();
  }, [load]);

  const t = report?.totals;
  const kpis = [
    { label: "Revenue", value: money(t?.revenue), accent: false },
    { label: "Gross Profit", value: money(t?.gross_profit), accent: true },
    { label: "Margin", value: pct(t?.margin), accent: true },
    { label: "Profit / Mile", value: perMile(t?.profit_per_mile), accent: false },
    { label: "Loads", value: t ? String(t.load_count) : "—", accent: false },
  ];

  const axis = {
    grid: { color: GRID },
    ticks: { color: TICK, font: { size: 11 } },
  };

  const trendOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: true, labels: { color: TICK, boxWidth: 12, font: { size: 11 } } },
      tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${money(Number(c.parsed.y))}` } },
    },
    scales: {
      x: axis,
      y: {
        ...axis,
        ticks: { ...axis.ticks, callback: (v) => "$" + (Number(v) / 1000).toFixed(1) + "k" },
      },
    },
  };

  const barOptions = (): ChartOptions<"bar"> => ({
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (c) => " " + money(Number(c.parsed.x)) } },
    },
    scales: {
      x: { ...axis, ticks: { ...axis.ticks, callback: (v) => "$" + (Number(v) / 1000).toFixed(1) + "k" } },
      y: axis,
    },
  });

  const trend = report?.trend ?? [];

  return (
    <main className="mx-auto w-full max-w-7xl p-5 lg:p-8">
      <PageHeader
        title="Profitability"
        subtitle={
          <>
            Revenue, cost, and margin across your loads.{" "}
            {report && (
              <span className="text-muted-foreground/70">
                {report.start} → {report.end}
              </span>
            )}
          </>
        }
        actions={
          <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPeriod(p.key)}
                className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  period === p.key
                    ? "bg-accent text-black shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      {error && (
        <p className="mb-6 rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {k.label}
            </div>
            <div
              className={`mt-1 text-2xl font-semibold ${k.accent ? "text-accent" : "text-foreground"}`}
            >
              {loading ? "—" : k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Trend */}
      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold">Revenue &amp; Profit Trend</h2>
        <div className="h-64">
          <Line
            data={{
              labels: trend.map((p) => p.date.slice(5)),
              datasets: [
                {
                  label: "Revenue",
                  data: trend.map((p) => p.revenue),
                  borderColor: ACCENT,
                  backgroundColor: "rgba(242,137,31,0.10)",
                  borderWidth: 2.5,
                  pointRadius: 3,
                  fill: true,
                  tension: 0.35,
                },
                {
                  label: "Profit",
                  data: trend.map((p) => p.profit),
                  borderColor: SUCCESS,
                  backgroundColor: "rgba(78,209,124,0.08)",
                  borderWidth: 2.5,
                  pointRadius: 3,
                  fill: true,
                  tension: 0.35,
                },
              ],
            }}
            options={trendOptions}
          />
        </div>
      </div>

      {/* Customer + lane rankings */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <RankBars
          title="Most Profitable Customers"
          groups={report?.top_customers ?? []}
          color={SUCCESS}
          options={barOptions()}
          loading={loading}
        />
        <RankBars
          title="Best Lanes by Profit"
          groups={report?.best_lanes ?? []}
          color={ACCENT}
          options={barOptions()}
          loading={loading}
        />
        <RankTable
          title="Least Profitable Customers"
          groups={report?.least_profitable_customers ?? []}
          loading={loading}
        />
        <RankTable
          title="Worst Lanes by Profit"
          groups={report?.worst_lanes ?? []}
          loading={loading}
        />
      </div>

      <p className="mt-6 text-xs text-muted-foreground/60">
        &quot;Customer&quot; is the broker billed on each load. Profit = rate minus
        recorded costs (carrier, fuel, detention, lumper, accessorial, estimated).
      </p>
    </main>
  );
}

function RankBars({
  title,
  groups,
  color,
  options,
  loading,
}: {
  title: string;
  groups: GroupProfit[];
  color: string;
  options: ChartOptions<"bar">;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      <div className="h-56">
        {loading || groups.length === 0 ? (
          <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {loading ? "Loading…" : "No data yet."}
          </p>
        ) : (
          <Bar
            data={{
              labels: groups.map((g) => g.label),
              datasets: [
                {
                  data: groups.map((g) => g.profit),
                  backgroundColor: `${color}80`,
                  borderColor: color,
                  borderWidth: 1.5,
                  borderRadius: 5,
                },
              ],
            }}
            options={options}
          />
        )}
      </div>
    </div>
  );
}

function RankTable({
  title,
  groups,
  loading,
}: {
  title: string;
  groups: GroupProfit[];
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      {loading || groups.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {loading ? "Loading…" : "No data yet."}
        </p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 text-right font-medium">Profit</th>
              <th className="py-2 text-right font-medium">Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {groups.map((g) => (
              <tr key={g.label}>
                <td className="py-2 pr-4">{g.label}</td>
                <td
                  className={`py-2 pr-4 text-right font-medium ${
                    g.profit < 0 ? "text-destructive" : "text-foreground"
                  }`}
                >
                  {money(g.profit)}
                </td>
                <td className="py-2 text-right text-muted-foreground">{pct(g.margin)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
