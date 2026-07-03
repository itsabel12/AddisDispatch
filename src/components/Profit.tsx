import Reveal from "./Reveal";
import { TrendingUpIcon, RepeatIcon, DollarIcon, StarIcon } from "./icons";

const points = [
  {
    icon: <TrendingUpIcon />,
    title: "Revenue Per Mile Focus",
    body: "We track RPM continuously and adjust load selection to maximize every mile.",
  },
  {
    icon: <RepeatIcon />,
    title: "Backhaul Planning",
    body: "Strategic return load planning to eliminate empty repositioning entirely.",
  },
  {
    icon: <DollarIcon />,
    title: "Real-Time Rate Negotiation",
    body: "We monitor live spot rates and negotiate when the market is in your favor.",
  },
  {
    icon: <StarIcon />,
    title: "Lane Profitability Scoring",
    body: "Every lane is scored on RPM, demand consistency, and broker reliability.",
  },
];

const metrics = [
  { big: "$3.20", label: "Average RPM achieved for our carriers" },
  { big: "34%", label: "Average deadhead reduction in first 60 days" },
  { big: "$18K+", label: "Average monthly gross revenue per truck" },
  { big: "96%", label: "Load booking success rate" },
];

export default function Profit() {
  return (
    <section id="profit" className="relative bg-grid py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              Profit Optimization
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              Data-Driven Revenue Strategy
            </h2>
            <p className="mt-5 text-base font-light leading-relaxed text-inkMuted">
              Every decision we make is backed by real market data. We don&apos;t
              guess — we optimize.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <ul className="space-y-6">
            {points.map((p, i) => (
              <Reveal key={p.title} delay={i * 80}>
                <li className="flex gap-4">
                  <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                    {p.icon}
                  </span>
                  <div>
                    <h4 className="font-display text-base font-semibold text-ink">{p.title}</h4>
                    <p className="mt-1 text-sm font-light leading-relaxed text-inkMuted">
                      {p.body}
                    </p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>

          <div className="grid grid-cols-2 gap-5">
            {metrics.map((m, i) => (
              <Reveal key={m.label} delay={i * 80}>
                <div className="flex h-full flex-col rounded-2xl border border-line bg-surface/50 p-6 backdrop-blur-md">
                  <span className="font-display text-3xl font-bold tracking-tight text-accent sm:text-4xl">
                    {m.big}
                  </span>
                  <span className="mt-2 text-sm font-light leading-relaxed text-inkMuted">
                    {m.label}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
