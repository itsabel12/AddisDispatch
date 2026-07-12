import Reveal from "./Reveal";
import {
  DollarIcon,
  MapIcon,
  UserIcon,
  ShareIcon,
  TrendingUpIcon,
} from "./icons";

const values = [
  {
    icon: <DollarIcon />,
    title: "Higher-Paying Loads",
    body: "Real-time rate negotiation so you never leave money on the table on any load.",
  },
  {
    icon: <MapIcon />,
    title: "Reduced Deadhead Miles",
    body: "Strategic load planning that minimizes empty miles and maximizes lane utilization.",
  },
  {
    icon: <UserIcon />,
    title: "Dedicated Dispatcher",
    body: "Your own dispatcher who knows your truck, your lanes, and your goals.",
  },
  {
    icon: <ShareIcon />,
    title: "Broker Relationships",
    body: "Access to a vetted network of top freight brokers, giving you consistent load access and priority placement on high-paying lanes.",
  },
  {
    icon: <TrendingUpIcon />,
    title: "Route Optimization",
    body: "Data-driven lane analysis to find the most profitable corridors for your equipment.",
  },
];

export default function Value() {
  return (
    <section id="value" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-accent">
              Why Choose Us
            </p>
            <h2 className="font-display text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-balance text-ink sm:text-5xl">
              Built for Carriers Who Want More
            </h2>
            <p className="mt-5 text-base font-light leading-relaxed text-pretty text-inkMuted">
              Market intelligence, broker relationships, and dedicated support — all
              working to put more money in your pocket every week.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value, i) => (
            <Reveal key={value.title} delay={i * 80}>
              <div className="group h-full rounded-2xl border border-line bg-surface/60 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-surface">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
                  {value.icon}
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-ink">{value.title}</h3>
                <p className="text-sm font-light leading-relaxed text-inkMuted">{value.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
