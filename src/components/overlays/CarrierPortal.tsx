"use client";

import { useState } from "react";
import { openBooking } from "@/lib/overlay";

const navItems = [
  "📊 Dashboard",
  "🚛 My Loads",
  "💵 Earnings",
  "📄 Documents",
  "👤 My Dispatcher",
  "⚙️ Settings",
];

const kpis = [
  { label: "Week Revenue", value: "$4,820", change: "↑ 14% vs last week", gold: true },
  { label: "Avg RPM", value: "$3.31", change: "↑ 8% vs last week", gold: true },
  { label: "Loads This Week", value: "3", change: "1 in transit · 1 upcoming", gold: false },
  { label: "Deadhead Miles", value: "7%", change: "↓ 41% vs 60 days ago", gold: false },
];

const portalLoads = [
  { eq: "Dry Van", route: "Dallas, TX → Atlanta, GA", det: "782 mi · Today 2:00 PM", rate: "$2,740", rpm: "$3.51/mi", badge: "In Transit", tone: "tra" },
  { eq: "Dry Van", route: "Atlanta, GA → Nashville, TN", det: "248 mi · Tomorrow 8:00 AM", rate: "$820", rpm: "$3.31/mi", badge: "Upcoming", tone: "pit" },
  { eq: "Dry Van", route: "Nashville, TN → Chicago, IL", det: "471 mi · Thu 6:00 AM", rate: "$1,510", rpm: "$3.21/mi", badge: "Upcoming", tone: "pit" },
];

const actions = [
  { ic: "👤", title: "Contact My Dispatcher", body: "Your dispatcher is on call 24/7." },
  { ic: "📄", title: "Upload Documents", body: "Submit PODs, BOLs, rate confirmations." },
  { ic: "💵", title: "View Invoices", body: "Download weekly dispatch fee invoices." },
  { ic: "📊", title: "Performance Report", body: "Full RPM, deadhead & earnings breakdown." },
];

const badgeTone: Record<string, string> = {
  tra: "border-gold/30 bg-gold/10 text-gold",
  pit: "border-white/15 bg-white/5 text-mutedGrey",
};

function Logo() {
  return (
    <span className="text-lg font-bold tracking-tight text-gold">
      Addis<span className="text-offWhite">Dispatch</span>
    </span>
  );
}

export default function CarrierPortal({ onClose }: { onClose: () => void }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [active, setActive] = useState(0);

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-seaGrey">
      {!loggedIn ? (
        <div className="flex min-h-screen items-center justify-center p-4">
          <button
            type="button"
            onClick={onClose}
            className="absolute left-4 top-4 text-sm font-medium text-mutedGrey hover:text-offWhite"
          >
            ← Back to Site
          </button>

          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-bandDark p-8 sm:p-10">
            <Logo />
            <h2 className="mt-5 text-2xl font-bold text-offWhite">Carrier Portal</h2>
            <p className="mt-1 text-sm font-light text-mutedGrey">
              Sign in to access your loads, earnings, and dispatcher.
            </p>

            <div className="mt-5 rounded-xl border border-gold/20 bg-gold/5 p-3 text-xs font-medium text-gold">
              🚛 Demo mode — click Login to preview the dashboard
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-offWhite">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue="marcus.j@email.com"
                  className="w-full rounded-xl border border-white/10 bg-bandDarker px-4 py-3 text-sm font-light text-offWhite focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/40"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-offWhite">Password</label>
                <input
                  type="password"
                  defaultValue="demopass"
                  className="w-full rounded-xl border border-white/10 bg-bandDarker px-4 py-3 text-sm font-light text-offWhite focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/40"
                />
              </div>
            </div>

            <button type="button" className="mt-3 text-sm font-medium text-gold hover:underline">
              Forgot password?
            </button>

            <button
              type="button"
              onClick={() => setLoggedIn(true)}
              className="mt-4 w-full rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-bandDarker transition-all hover:shadow-[0_0_24px_-4px] hover:shadow-gold/60"
            >
              Login to Portal →
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                openBooking();
              }}
              className="mt-4 w-full text-center text-sm font-medium text-mutedGrey hover:text-gold"
            >
              New carrier? Book a free consultation
            </button>
          </div>
        </div>
      ) : (
        <div className="min-h-screen">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-white/5 bg-bandDarker px-6 py-4">
            <div className="flex items-center gap-2">
              <Logo />
              <span className="ml-1 text-xs font-light text-mutedGrey/40">Carrier Portal</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-sm font-bold text-bandDarker">
                MJ
              </span>
              <span className="hidden text-sm font-medium text-offWhite sm:inline">
                Marcus Johnson
              </span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 px-4 py-1.5 text-sm font-medium text-mutedGrey hover:text-offWhite"
              >
                Logout
              </button>
            </div>
          </header>

          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:flex-row">
            {/* Sidebar */}
            <aside className="flex gap-2 overflow-x-auto lg:w-56 lg:flex-none lg:flex-col">
              {navItems.map((item, i) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                    active === i
                      ? "bg-gold/10 text-gold"
                      : "text-mutedGrey hover:bg-white/5 hover:text-offWhite"
                  }`}
                >
                  {item}
                </button>
              ))}
            </aside>

            {/* Main */}
            <main className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-offWhite">Good morning, Marcus 👋</h1>
              <p className="mt-1 text-sm font-light text-mutedGrey">
                Here&apos;s your performance summary for this week.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {kpis.map((k) => (
                  <div key={k.label} className="rounded-2xl border border-white/5 bg-bandDark/60 p-5">
                    <div className="text-xs font-medium uppercase tracking-wider text-mutedGrey/70">
                      {k.label}
                    </div>
                    <div className={`mt-1 text-2xl font-bold ${k.gold ? "text-gold" : "text-offWhite"}`}>
                      {k.value}
                    </div>
                    <div className="mt-1 text-xs font-light text-leafGreen">{k.change}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-offWhite">
                  Active &amp; Upcoming Loads
                </h2>
                <span className="text-sm font-medium text-gold">View All →</span>
              </div>
              <div className="mt-4 space-y-3">
                {portalLoads.map((l) => (
                  <div
                    key={l.route}
                    className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/5 bg-bandDark/60 p-4"
                  >
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-mutedGrey">
                      {l.eq}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-offWhite">{l.route}</div>
                      <div className="text-xs font-light text-mutedGrey/70">{l.det}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-offWhite">{l.rate}</div>
                      <div className="text-xs font-light text-leafGreen">{l.rpm}</div>
                    </div>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeTone[l.tone]}`}>
                      {l.badge}
                    </span>
                  </div>
                ))}
              </div>

              <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-offWhite">
                Quick Actions
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {actions.map((a) => (
                  <div key={a.title} className="rounded-2xl border border-white/5 bg-bandDark/60 p-5">
                    <div className="text-2xl">{a.ic}</div>
                    <h4 className="mt-2 text-sm font-semibold text-offWhite">{a.title}</h4>
                    <p className="mt-1 text-xs font-light leading-relaxed text-mutedGrey">{a.body}</p>
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
