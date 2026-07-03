"use client";

import Reveal from "./Reveal";
import { openBooking, openPortal } from "@/lib/overlay";

export default function Cta() {
  return (
    <section className="relative overflow-hidden bg-grid py-24 sm:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
        <Reveal>
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Stop Losing Money on Empty Miles.
            <br />
            Start Maximizing Every Load Today.
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <p className="mx-auto mt-5 max-w-xl text-base font-light leading-relaxed text-inkMuted">
            Join owner-operators and small fleets earning more, driving smarter, and
            running leaner with AddisDispatch.
          </p>
        </Reveal>
        <Reveal delay={140}>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#contact"
              className="rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_30px_-4px] hover:shadow-accent/60"
            >
              Become a Carrier Partner
            </a>
            <button
              type="button"
              onClick={openBooking}
              className="rounded-full border border-line px-7 py-3.5 text-sm font-light text-ink transition-colors hover:border-accent/50 hover:text-accent"
            >
              Talk to a Dispatcher
            </button>
          </div>
          <button
            type="button"
            onClick={openPortal}
            className="mt-6 text-sm font-medium text-accent/80 transition-colors hover:text-accent"
          >
            Already a carrier? Open the Carrier Portal →
          </button>
        </Reveal>
      </div>
    </section>
  );
}
