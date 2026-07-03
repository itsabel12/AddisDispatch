import Reveal from "./Reveal";

const aboutVals = [
  {
    title: "Carrier-First",
    body: "Everything we do is optimized for your bottom line, not ours.",
  },
  {
    title: "Transparent",
    body: "Flat percentage fees. No hidden charges, no fine print surprises.",
  },
  {
    title: "Results-Driven",
    body: "We measure success in your RPM and revenue — not our call volume.",
  },
  {
    title: "Always On",
    body: "24/7 availability because freight doesn't stop at 5pm.",
  },
];

const stats = [
  { value: "$3.24", label: "Avg RPM", color: "text-accent" },
  { value: "96%", label: "Load Success", color: "text-success" },
  { value: "34%", label: "Less Deadhead", color: "text-accent" },
  { value: "24/7", label: "Support", color: "text-success" },
];

const team = [
  {
    emoji: "🎯",
    title: "Results-First",
    role: "Our Core Focus",
    body: "We measure our success by your RPM and revenue — not our own metrics.",
  },
  {
    emoji: "🤝",
    title: "Always Available",
    role: "24/7 Commitment",
    body: "Real support whenever you need it — day, night, weekends, or holidays.",
  },
  {
    emoji: "📈",
    title: "Constant Optimization",
    role: "Weekly Reviews",
    body: "We track your performance and make lane adjustments every week to grow your earnings.",
  },
];

export default function About() {
  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-12">
          {/* Left: narrative + values */}
          <Reveal>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
                About Us
              </p>
              <h2 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
                Your Dedicated Freight Dispatch Partner
              </h2>

              <div className="mt-6 space-y-4 text-base font-light leading-relaxed text-inkMuted">
                <p>
                  AddisDispatch is a dedicated freight dispatch service focused on one
                  thing: helping owner-operators and small fleets earn more, run
                  smarter, and stay consistently loaded across all 48 U.S. states.
                </p>
                <p>
                  We handle everything on the business side — sourcing high-paying
                  loads, negotiating with brokers, managing your paperwork, and
                  optimizing your routes — so you can focus on what you do best:
                  driving.
                </p>
                <p>
                  Our commitment is straightforward: maximize your revenue per mile on
                  every load, keep your deadhead low, and make sure you always have
                  freight lined up. We treat every carrier&apos;s freight like it&apos;s
                  our own livelihood on the line.
                </p>
              </div>

              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                {aboutVals.map((v) => (
                  <div key={v.title}>
                    <h4 className="font-display text-base font-semibold text-ink">{v.title}</h4>
                    <p className="mt-1 text-sm font-light leading-relaxed text-inkMuted">
                      {v.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Right: animated lane map + stats + drivers */}
          <Reveal delay={120}>
            <div>
              <div className="flex flex-col gap-3.5 rounded-2xl border border-line bg-gradient-to-br from-surface/70 to-elevated/60 p-5 backdrop-blur-md">
                <svg
                  viewBox="0 0 280 110"
                  width="100%"
                  className="min-h-[90px] flex-1"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M25 85 C70 62 110 55 150 44" stroke="rgba(242,137,31,0.30)" strokeWidth="1.5" fill="none" strokeDasharray="5 4" />
                  <path d="M150 44 C192 34 232 28 268 20" stroke="rgba(242,137,31,0.20)" strokeWidth="1.5" fill="none" strokeDasharray="5 4" />
                  <path d="M25 85 C68 100 125 104 178 101" stroke="rgba(78,209,124,0.28)" strokeWidth="1.5" fill="none" strokeDasharray="5 4" />
                  <path d="M150 44 C158 66 165 84 178 101" stroke="rgba(242,137,31,0.14)" strokeWidth="1" fill="none" strokeDasharray="4 4" />
                  <circle cx="25" cy="85" r="5" fill="rgba(242,137,31,0.72)" />
                  <circle cx="25" cy="85" r="5" fill="none" stroke="rgba(242,137,31,0.3)" strokeWidth="1.5">
                    <animate attributeName="r" values="5;14;5" dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values=".7;0;.7" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="150" cy="44" r="6" fill="rgba(242,137,31,0.75)" />
                  <circle cx="150" cy="44" r="6" fill="none" stroke="rgba(242,137,31,0.3)" strokeWidth="1.5">
                    <animate attributeName="r" values="6;17;6" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values=".7;0;.7" dur="3s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="268" cy="20" r="4" fill="rgba(78,209,124,0.75)" />
                  <circle cx="178" cy="101" r="4" fill="rgba(78,209,124,0.65)" />
                  <circle r="3" fill="#f2891f" opacity="0">
                    <animateMotion dur="4s" repeatCount="indefinite" path="M25 85 C70 62 110 55 150 44 C192 34 232 28 268 20" />
                    <animate attributeName="opacity" values="0;.9;.9;0" keyTimes="0;.08;.92;1" dur="4s" repeatCount="indefinite" />
                  </circle>
                  <text x="14" y="100" fill="rgba(244,244,246,0.28)" fontSize="7" fontWeight="700">L.A.</text>
                  <text x="142" y="40" fill="rgba(244,244,246,0.28)" fontSize="7" fontWeight="700">CHI</text>
                  <text x="258" y="17" fill="rgba(244,244,246,0.28)" fontSize="7" fontWeight="700">NYC</text>
                  <text x="167" y="112" fill="rgba(244,244,246,0.22)" fontSize="7" fontWeight="700">ATL</text>
                </svg>

                <div className="grid grid-cols-2 gap-2">
                  {stats.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-lg border border-line bg-elevated/50 p-2.5 text-center"
                    >
                      <div className={`font-display text-xl font-extrabold leading-none tracking-tight ${s.color}`}>
                        {s.value}
                      </div>
                      <div className="mt-1 text-[0.65rem] text-inkMuted/60">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="inline-block rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-center text-xs font-medium text-accent">
                  📍 Nationwide Coverage · All 48 States
                </div>
              </div>

              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-inkMuted/60">
                What Drives Us
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {team.map((t) => (
                  <div
                    key={t.title}
                    className="rounded-2xl border border-line bg-surface/50 p-5 text-center backdrop-blur-md"
                  >
                    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-2xl">
                      {t.emoji}
                    </div>
                    <h4 className="font-display text-sm font-semibold text-ink">{t.title}</h4>
                    <div className="mt-0.5 text-xs font-medium text-accent">{t.role}</div>
                    <p className="mt-2 text-xs font-light leading-relaxed text-inkMuted">
                      {t.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
