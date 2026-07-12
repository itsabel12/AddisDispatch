"use client";

import { useState } from "react";
import Reveal from "./Reveal";
import { faqs } from "@/content/faq";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <Reveal>
          <div className="text-center">
            <p className="mb-4 text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-accent">
              Got Questions?
            </p>
            <h2 className="font-display text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-balance text-ink sm:text-5xl">
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
