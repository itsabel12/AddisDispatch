"use client";

import { useState } from "react";
import Reveal from "./Reveal";
import { openBooking } from "@/lib/overlay";

const MILES_MIN = 500;
const MILES_MAX = 8000;
const RPM_MIN = 1.5;
const RPM_MAX = 5.0;

const money = (n: number) => "$" + Math.round(n).toLocaleString();

export default function Calculator() {
  const [miles, setMiles] = useState(2500);
  const [rpm, setRpm] = useState(2.4);

  const current = miles * rpm;
  // Avg 18% RPM improvement + 10% more loaded miles, after 7% (Professional) fee.
  const withAtlas = miles * 1.1 * rpm * 1.18 * 0.93;
  const annualGain = (withAtlas - current) * 52;
  const barWidth = Math.min(Math.round((withAtlas / Math.max(current, 1)) * 100), 100);

  return (
    <section id="calculator" className="relative bg-bandDarker bg-grid py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Revenue Calculator
            </p>
            <h2 className="text-4xl font-bold tracking-tight text-offWhite sm:text-5xl">
              See How Much More You Could Earn
            </h2>
            <p className="mt-5 text-base font-light leading-relaxed text-mutedGrey">
              Enter your current numbers and see your projected earnings with
              AddisDispatch — before you commit to anything.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* Inputs */}
          <Reveal>
            <div className="flex h-full flex-col gap-8 rounded-2xl border border-white/5 bg-bandDark/60 p-7 sm:p-9">
              <div>
                <label htmlFor="calc-miles" className="block text-sm font-medium text-offWhite">
                  Weekly Miles Driven
                </label>
                <div className="mt-2 flex items-center rounded-xl border border-white/10 bg-bandDarker px-4 py-3">
                  <span className="mr-2 text-sm text-mutedGrey/60">mi</span>
                  <input
                    id="calc-miles"
                    type="number"
                    min={MILES_MIN}
                    max={MILES_MAX}
                    value={miles}
                    onChange={(e) => setMiles(Number(e.target.value) || 0)}
                    className="w-full bg-transparent text-sm font-light text-offWhite focus:outline-none"
                  />
                </div>
                <input
                  type="range"
                  min={MILES_MIN}
                  max={MILES_MAX}
                  step={100}
                  value={miles}
                  onChange={(e) => setMiles(Number(e.target.value))}
                  className="mt-3 w-full accent-gold"
                />
                <p className="mt-2 text-xs font-light text-mutedGrey/60">
                  Average owner-operator runs 2,000–3,000 mi/week
                </p>
              </div>

              <div>
                <label htmlFor="calc-rpm" className="block text-sm font-medium text-offWhite">
                  Current Rate Per Mile
                </label>
                <div className="mt-2 flex items-center rounded-xl border border-white/10 bg-bandDarker px-4 py-3">
                  <span className="mr-2 text-sm text-mutedGrey/60">$</span>
                  <input
                    id="calc-rpm"
                    type="number"
                    min={RPM_MIN}
                    max={RPM_MAX}
                    step={0.05}
                    value={rpm}
                    onChange={(e) => setRpm(Number(e.target.value) || 0)}
                    className="w-full bg-transparent text-sm font-light text-offWhite focus:outline-none"
                  />
                </div>
                <input
                  type="range"
                  min={RPM_MIN * 100}
                  max={RPM_MAX * 100}
                  step={5}
                  value={Math.round(rpm * 100)}
                  onChange={(e) => setRpm(Number(e.target.value) / 100)}
                  className="mt-3 w-full accent-gold"
                />
                <p className="mt-2 text-xs font-light text-mutedGrey/60">
                  Industry average is $2.20–$2.80/mi for solo operators
                </p>
              </div>
            </div>
          </Reveal>

          {/* Results */}
          <Reveal delay={120}>
            <div className="flex h-full flex-col gap-4">
              <div className="rounded-2xl border border-white/5 bg-bandDark/60 p-6">
                <div className="text-xs font-medium uppercase tracking-wider text-mutedGrey/70">
                  Your Current Weekly Revenue
                </div>
                <div className="mt-1 text-3xl font-bold tracking-tight text-offWhite">
                  {money(current)}
                </div>
                <div className="mt-1 text-xs font-light text-mutedGrey/60">
                  Based on your current rate × weekly miles
                </div>
              </div>

              <div className="rounded-2xl border border-gold/30 bg-gold/5 p-6">
                <div className="text-xs font-medium uppercase tracking-wider text-gold/80">
                  With AddisDispatch (after 7% fee)
                </div>
                <div className="mt-1 text-3xl font-bold tracking-tight text-gold">
                  {money(withAtlas)}
                </div>
                <div className="mt-1 text-xs font-light text-mutedGrey/70">
                  Avg 18% RPM improvement + 10% more loaded miles
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-bandDarker">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold/60 to-gold transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-leafGreen/30 bg-leafGreen/10 p-6">
                <div className="text-xs font-medium uppercase tracking-wider text-mutedGrey/70">
                  Your Projected Annual Gain
                </div>
                <div className="mt-1 text-3xl font-bold tracking-tight text-leafGreen">
                  +{money(annualGain)}
                </div>
                <div className="mt-1 text-xs font-light text-mutedGrey/60">
                  Extra earnings you could put back in your pocket
                </div>
              </div>

              <div className="mt-1 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#contact"
                  className="flex-1 rounded-full bg-gold px-7 py-3.5 text-center text-sm font-semibold text-bandDarker transition-all hover:shadow-[0_0_30px_-4px] hover:shadow-gold/60"
                >
                  Claim My Earnings →
                </a>
                <button
                  type="button"
                  onClick={openBooking}
                  className="flex-1 rounded-full border border-white/15 px-7 py-3.5 text-center text-sm font-light text-offWhite transition-colors hover:border-gold/50 hover:text-gold"
                >
                  Book a Call
                </button>
              </div>

              <p className="text-xs font-light leading-relaxed text-mutedGrey/50">
                * Projections based on avg carrier results. Individual results vary. Fee
                of 7% (Professional plan) applied to AddisDispatch revenue.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
