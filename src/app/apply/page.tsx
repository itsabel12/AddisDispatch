import type { Metadata } from "next";
import Link from "next/link";

import Logo from "@/components/Logo";
import { Check } from "@/components/icons";
import CarrierApplicationForm from "@/components/CarrierApplicationForm";

export const metadata: Metadata = {
  title: "Apply as a Carrier — AddisDispatch",
  description:
    "Owner-operators and small fleets: apply to run with AddisDispatch. Data-driven dispatch, higher-paying loads, and a dedicated dispatcher.",
};

const BENEFITS = [
  {
    title: "Higher-paying loads",
    body: "Real-time rate negotiation and lane analytics so you never leave money on the table.",
  },
  {
    title: "A dedicated dispatcher",
    body: "One person who knows your truck, your lanes, and your goals — not a call center.",
  },
  {
    title: "Paperwork handled",
    body: "Rate cons, PODs, invoicing, and settlements managed for you. You drive; we run the back office.",
  },
  {
    title: "Fast onboarding",
    body: "Send your W-9, COI, and authority — most carriers are load-ready within a day.",
  },
];

export default function ApplyPage() {
  return (
    <div className="bg-aerial min-h-screen">
      <header className="border-b border-line bg-base/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" aria-label="AddisDispatch home">
            <Logo />
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-inkMuted transition-colors hover:text-ink"
          >
            ← Back to site
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              For carriers
            </p>
            <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              Run with a dispatch team that runs on data.
            </h1>
            <p className="mt-5 max-w-lg text-base font-light leading-relaxed text-inkMuted">
              Owner-operators and small fleets: tell us about your operation and
              we&apos;ll reach out within one business day to get you rolling.
            </p>

            <ul className="mt-10 space-y-6">
              {BENEFITS.map((b) => (
                <li key={b.title} className="flex gap-4">
                  <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <Check size={14} />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-ink">{b.title}</h3>
                    <p className="mt-1 text-sm font-light text-inkMuted">{b.body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-10 text-xs font-light text-inkMuted/60">
              Already onboarded?{" "}
              <Link href="/carrier/login" className="text-accent hover:underline">
                Carrier Login →
              </Link>
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface/50 p-6 backdrop-blur-md sm:p-8">
            <h2 className="mb-6 font-display text-lg font-semibold text-ink">
              Carrier application
            </h2>
            <CarrierApplicationForm />
          </div>
        </div>
      </main>
    </div>
  );
}
