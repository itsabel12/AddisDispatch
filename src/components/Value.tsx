import Card from "./Card";
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
    <section id="value" className="bg-seaGrey py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Why Choose Us
            </p>
            <h2 className="text-4xl font-bold tracking-tight text-offWhite sm:text-5xl">
              Built for Carriers Who Want More
            </h2>
            <p className="mt-5 text-base font-light leading-relaxed text-mutedGrey">
              Market intelligence, broker relationships, and dedicated support — all
              working to put more money in your pocket every week.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value, i) => (
            <Reveal key={value.title} delay={i * 80}>
              <Card icon={value.icon} title={value.title}>
                {value.body}
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
