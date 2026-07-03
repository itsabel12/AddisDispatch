"use client";

import { useState } from "react";
import Reveal from "./Reveal";

const faqs = [
  {
    q: "What percentage do you charge?",
    a: "We charge 6–8% of the gross load rate depending on fleet size and plan. Solo operators pay 8%, Professional (up to 3 trucks) 7%, and Fleet accounts (4–10 trucks) 6%. No hidden fees, no minimums.",
  },
  {
    q: "Do you work with new carriers?",
    a: "Yes. We work with newly authorized carriers as long as your MC authority is active and you carry the required insurance. We guide you through setup and help build a strong broker packet from day one.",
  },
  {
    q: "What types of freight do you handle?",
    a: "We dispatch for dry van, flatbed, reefer, and hotshot carriers. Our dispatchers specialize by equipment type to ensure they understand your rates and lane opportunities.",
  },
  {
    q: "How quickly can I get started?",
    a: "Most carriers are fully onboarded within 24–48 hours. Once we verify your MC authority, insurance, and carrier packet, your dedicated dispatcher begins sourcing loads immediately.",
  },
  {
    q: "Do I need to sign a long-term contract?",
    a: "No long-term contracts required. We operate month-to-month because we believe our results should keep you around — not a contract.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <Reveal>
          <div className="text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              Got Questions?
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              Frequently Asked Questions
            </h2>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-12 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface/40 backdrop-blur-md">
            {faqs.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={item.q}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="text-base font-medium text-ink">{item.q}</span>
                    <span
                      className={`flex-none text-xl font-light text-accent transition-transform duration-300 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 text-sm font-light leading-relaxed text-inkMuted">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
