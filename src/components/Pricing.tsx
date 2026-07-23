"use client";

import Link from "next/link";
import Reveal from "./Reveal";
import { openBooking } from "@/lib/overlay";
import { Check, X, Star } from "@/components/icons";

type Feature = { label: string; included: boolean };

type Tier = {
  name: string;
  pct: string;
  desc: string;
  features: Feature[];
  popular?: boolean;
};

const tiers: Tier[] = [
  {
    name: "Solo Operator",
    pct: "8",
    desc: "For single-truck owner-operators who want full-service dispatch with a dedicated dispatcher.",
    features: [
      { label: "1 truck covered", included: true },
      { label: "Dedicated dispatcher", included: true },
      { label: "Load sourcing & negotiation", included: true },
      { label: "Rate confirmations & BOL", included: true },
      { label: "Email & phone support", included: true },
      { label: "Weekly performance report", included: true },
      { label: "Priority broker access", included: false },
      { label: "Full paperwork management", included: false },
    ],
  },
  {
    name: "Professional",
    pct: "10",
    desc: "For carriers ready to maximize every lane. Full-service dispatch with priority broker access.",
    popular: true,
    features: [
      { label: "Up to 3 trucks", included: true },
      { label: "Dedicated dispatcher", included: true },
      { label: "Load sourcing & negotiation", included: true },
      { label: "Full paperwork (BOL, POD, RC)", included: true },
      { label: "Priority broker relationships", included: true },
      { label: "Phone & WhatsApp support", included: true },
      { label: "Daily performance tracking", included: true },
      { label: "Custom lane strategy sessions", included: true },
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-accent">
              Simple Pricing
            </p>
            <h2 className="font-display text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-balance text-ink sm:text-5xl">
              Transparent Fees. No Surprises.
            </h2>
            <p className="mt-5 text-base font-light leading-relaxed text-pretty text-inkMuted">
              We charge a flat percentage of your gross load rate — no monthly fees, no
              minimums. You only pay when we earn for you.
            </p>
          </div>
        </Reveal>

        <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-2">
          {tiers.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 90}>
              <div
                className={`relative flex h-full flex-col rounded-2xl border p-8 backdrop-blur-md transition-colors ${
                  tier.popular
                    ? "border-accent/50 bg-surface/70"
                    : "border-line bg-surface/50 hover:border-accent/30"
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-accent px-4 py-1 text-xs font-semibold text-black">
                    <Star size={14} />
                    Most Popular
                  </span>
                )}

                <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-accent">
                  {tier.name}
                </h3>
                <div className="mt-4 flex items-end gap-1">
                  <span className="font-display text-5xl font-extrabold tracking-tight text-ink">
                    {tier.pct}
                  </span>
                  <span className="mb-1.5 text-sm font-light text-inkMuted">% per load</span>
                </div>
                <p className="mt-4 text-sm font-light leading-relaxed text-inkMuted">
                  {tier.desc}
                </p>

                <hr className="my-6 border-line" />

                <ul className="space-y-3">
                  {tier.features.map((f) => (
                    <li key={f.label} className="flex items-start gap-2.5 text-sm">
                      <span
                        className={`mt-0.5 flex-none ${
                          f.included ? "text-success" : "text-inkMuted/40"
                        }`}
                      >
                        {f.included ? <Check size={16} /> : <X size={16} />}
                      </span>
                      <span
                        className={
                          f.included
                            ? "font-light text-ink"
                            : "font-light text-inkMuted/50"
                        }
                      >
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={openBooking}
                  className={`mt-8 w-full rounded-full px-7 py-3.5 text-sm font-semibold transition-all ${
                    tier.popular
                      ? "bg-accent text-black hover:shadow-[0_0_30px_-4px] hover:shadow-accent/60"
                      : "border border-accent/40 text-accent hover:bg-accent/10"
                  }`}
                >
                  Get Started
                </button>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p className="mt-10 text-center text-sm font-light text-inkMuted">
            All plans are month-to-month — no contracts required.{" "}
            <Link
              href="/terms"
              className="font-medium text-accent hover:underline"
            >
              View full terms →
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
