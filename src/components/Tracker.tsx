"use client";

import { useState } from "react";
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
import Reveal from "./Reveal";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Filler,
);

const ACCENT = "#f2891f";
const SUCCESS = "#4ed17c";
const GRID = "rgba(255,255,255,0.06)";
const TICK = "rgba(244,244,246,0.4)";

const wkL = ["Wk1", "Wk2", "Wk3", "Wk4", "Wk5", "Wk6", "Wk7", "Wk8", "Wk9", "Wk10", "Wk11", "Wk12"];
const wkR = [2.61, 2.74, 2.88, 2.95, 3.02, 3.1, 3.08, 3.19, 3.21, 3.24, 3.18, 3.29];
const wkV = [14200, 15100, 16300, 17400, 16800, 18200, 17900, 19100, 18400, 19800, 18600, 20300];
const wkD = [22, 19, 17, 14, 15, 12, 13, 10, 9, 8, 9, 7];
const wkN = [9, 10, 11, 12, 11, 13, 12, 14, 13, 14, 13, 15];

type Period = 4 | 8 | 12;

const deltas: Record<Period, { rev: number; rpm: number; lds: number; dhd: number }> = {
  4: { rev: 18, rpm: 18, lds: 11, dhd: 34 },
  8: { rev: 22, rpm: 14, lds: 19, dhd: 41 },
  12: { rev: 31, rpm: 24, lds: 28, dhd: 52 },
};

type LoadStatus = "del" | "tra" | "pit";

const loads: {
  id: string;
  route: string;
  mi: number;
  rate: number;
  rpm: number;
  dh: number;
  eq: string;
  st: LoadStatus;
}[] = [
  { id: "LD-4821", route: "Dallas, TX → Atlanta, GA", mi: 782, rate: 2740, rpm: 3.51, dh: 42, eq: "Dry Van", st: "del" },
  { id: "LD-4820", route: "Atlanta, GA → Nashville, TN", mi: 248, rate: 820, rpm: 3.31, dh: 18, eq: "Dry Van", st: "del" },
  { id: "LD-4819", route: "Nashville, TN → Chicago, IL", mi: 471, rate: 1510, rpm: 3.21, dh: 31, eq: "Dry Van", st: "del" },
  { id: "LD-4818", route: "Houston, TX → Phoenix, AZ", mi: 1147, rate: 3440, rpm: 3.0, dh: 62, eq: "Reefer", st: "del" },
  { id: "LD-4817", route: "Los Angeles, CA → Denver, CO", mi: 1018, rate: 2950, rpm: 2.9, dh: 0, eq: "Flatbed", st: "del" },
  { id: "LD-4816", route: "Denver, CO → Kansas City, MO", mi: 602, rate: 1750, rpm: 2.91, dh: 24, eq: "Flatbed", st: "tra" },
  { id: "LD-4815", route: "Memphis, TN → Dallas, TX", mi: 443, rate: 1460, rpm: 3.3, dh: 15, eq: "Dry Van", st: "pit" },
];

const statusLabel: Record<LoadStatus, string> = {
  del: "Delivered",
  tra: "In Transit",
  pit: "At Pickup",
};

const statusClass: Record<LoadStatus, string> = {
  del: "border-success/30 bg-success/10 text-success",
  tra: "border-accent/30 bg-accent/10 text-accent",
  pit: "border-line bg-elevated/50 text-inkMuted",
};

const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

export default function Tracker() {
  const [period, setPeriod] = useState<Period>(4);

  const labels = wkL.slice(-period);
  const rpm = wkR.slice(-period);
  const rev = wkV.slice(-period);
  const dead = wkD.slice(-period);
  const lds = wkN.slice(-period);

  const totalRev = sum(rev);
  const avgRpm = (sum(rpm) / period).toFixed(2);
  const totalLds = sum(lds);
  const avgDhd = Math.round(sum(dead) / period);
  const d = deltas[period];

  const kpis = [
    { label: "Total Revenue", value: "$" + totalRev.toLocaleString(), delta: `↑ ${d.rev}% vs prior period`, accent: true },
    { label: "Avg RPM", value: "$" + avgRpm, delta: `↑ ${d.rpm}% vs prior period`, accent: true },
    { label: "Loads Completed", value: `${totalLds} loads`, delta: `↑ ${d.lds}% vs prior period`, accent: false },
    { label: "Avg Deadhead %", value: `${avgDhd}%`, delta: `↓ ${d.dhd}% vs prior period`, accent: false },
  ];

  const axis = {
    grid: { color: GRID },
    ticks: { color: TICK, font: { size: 11 } },
  };

  const rpmOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (c) => " $" + Number(c.parsed.y).toFixed(2) + "/mi" },
      },
    },
    scales: {
      x: axis,
      y: {
        ...axis,
        ticks: { ...axis.ticks, callback: (v) => "$" + Number(v).toFixed(2) },
        suggestedMin: 2.4,
        suggestedMax: 3.5,
      },
    },
  };

  const revOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (c) => " $" + Number(c.parsed.y).toLocaleString() },
      },
    },
    scales: {
      x: axis,
      y: {
        ...axis,
        ticks: { ...axis.ticks, callback: (v) => "$" + (Number(v) / 1000).toFixed(0) + "k" },
      },
    },
  };

  return (
    <section id="tracker" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              Performance Dashboard
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              Load Performance Tracker
            </h2>
            <p className="mt-5 text-base font-light leading-relaxed text-inkMuted">
              Monitor your revenue per mile, weekly loads, deadhead trends, and gross
              earnings — all in one place.
            </p>
          </div>
        </Reveal>

        {/* Period tabs */}
        <Reveal>
          <div className="mt-12 flex justify-center gap-2">
            {([4, 8, 12] as Period[]).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPeriod(n)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  period === n
                    ? "bg-accent text-black"
                    : "border border-line text-inkMuted hover:text-ink"
                }`}
              >
                {n} Weeks
              </button>
            ))}
          </div>
        </Reveal>

        {/* KPIs */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k, i) => (
            <Reveal key={k.label} delay={i * 70}>
              <div className="rounded-2xl border border-line bg-surface/50 p-6 backdrop-blur-md">
                <div className="text-xs font-medium uppercase tracking-wider text-inkMuted/70">
                  {k.label}
                </div>
                <div className={`mt-1 font-display text-2xl font-bold tracking-tight ${k.accent ? "text-accent" : "text-ink"}`}>
                  {k.value}
                </div>
                <div className="mt-1 text-xs font-light text-success">{k.delta}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Charts */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="rounded-2xl border border-line bg-surface/50 p-6 backdrop-blur-md">
              <h4 className="mb-4 font-display text-sm font-semibold text-ink">
                📈 Revenue Per Mile — Weekly Trend
              </h4>
              <div className="h-60">
                <Line
                  data={{
                    labels,
                    datasets: [
                      {
                        data: rpm,
                        borderColor: ACCENT,
                        backgroundColor: "rgba(242,137,31,0.12)",
                        borderWidth: 2.5,
                        pointBackgroundColor: ACCENT,
                        pointBorderColor: "#0e0e12",
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        fill: true,
                        tension: 0.42,
                      },
                    ],
                  }}
                  options={rpmOptions}
                />
              </div>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <div className="rounded-2xl border border-line bg-surface/50 p-6 backdrop-blur-md">
              <h4 className="mb-4 font-display text-sm font-semibold text-ink">
                💵 Weekly Gross Revenue
              </h4>
              <div className="h-60">
                <Bar
                  data={{
                    labels,
                    datasets: [
                      {
                        data: rev,
                        backgroundColor: "rgba(78,209,124,0.5)",
                        borderColor: SUCCESS,
                        borderWidth: 1.5,
                        borderRadius: 6,
                        borderSkipped: false,
                      },
                    ],
                  }}
                  options={revOptions}
                />
              </div>
            </div>
          </Reveal>
        </div>

        {/* Load history */}
        <Reveal delay={120}>
          <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface/50 p-6 backdrop-blur-md">
            <h4 className="mb-4 font-display text-sm font-semibold text-ink">🚛 Recent Load History</h4>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wider text-inkMuted/60">
                    <th className="py-3 pr-4 font-medium">Load #</th>
                    <th className="py-3 pr-4 font-medium">Route</th>
                    <th className="py-3 pr-4 font-medium">Miles</th>
                    <th className="py-3 pr-4 font-medium">Rate</th>
                    <th className="py-3 pr-4 font-medium">RPM</th>
                    <th className="py-3 pr-4 font-medium">Deadhead</th>
                    <th className="py-3 pr-4 font-medium">Equipment</th>
                    <th className="py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line font-light text-inkMuted">
                  {loads.map((l) => (
                    <tr key={l.id}>
                      <td className="py-3 pr-4 font-semibold text-ink">{l.id}</td>
                      <td className="py-3 pr-4">{l.route}</td>
                      <td className="py-3 pr-4">{l.mi.toLocaleString()}</td>
                      <td className="py-3 pr-4 font-semibold text-ink">
                        ${l.rate.toLocaleString()}
                      </td>
                      <td className={`py-3 pr-4 font-medium ${l.rpm >= 3 ? "text-success" : "text-accent"}`}>
                        ${l.rpm.toFixed(2)}
                      </td>
                      <td className="py-3 pr-4">
                        {l.dh === 0 ? (
                          <span className="font-medium text-success">0 mi ✓</span>
                        ) : (
                          `${l.dh} mi`
                        )}
                      </td>
                      <td className="py-3 pr-4">{l.eq}</td>
                      <td className="py-3">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClass[l.st]}`}
                        >
                          {statusLabel[l.st]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs font-light text-inkMuted/50">
              * Sample data. Live data available via Carrier Portal.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
