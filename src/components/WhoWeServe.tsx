import Card from "./Card";
import Reveal from "./Reveal";
import {
  UserIcon,
  UsersIcon,
  BoxIcon,
  LayersIcon,
  SnowflakeIcon,
  ZapIcon,
} from "./icons";

const segments = [
  {
    icon: <UserIcon />,
    title: "Owner-Operators",
    body: "Solo drivers who want a dedicated dispatcher handling the business side.",
  },
  {
    icon: <UsersIcon />,
    title: "Small Fleets (1–10 Trucks)",
    body: "Growing carriers who need scalable dispatch support without the overhead.",
  },
  {
    icon: <BoxIcon />,
    title: "Dry Van Carriers",
    body: "Standard freight specialists looking for consistent lane coverage and broker access.",
  },
  {
    icon: <LayersIcon />,
    title: "Flatbed Operators",
    body: "Specialized carriers with dispatchers experienced in flatbed rates and requirements.",
  },
  {
    icon: <SnowflakeIcon />,
    title: "Reefer Carriers",
    body: "Temperature-controlled operators seeking premium food-grade and pharma loads.",
  },
  {
    icon: <ZapIcon />,
    title: "Hotshot Carriers",
    body: "Expedited carriers who need fast-moving load boards and rapid broker comms.",
  },
];

export default function WhoWeServe() {
  return (
    <section id="serve" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-accent">
              Who We Serve
            </p>
            <h2 className="font-display text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-balance text-ink sm:text-5xl">
              Built for Independent Carriers
            </h2>
            <p className="mt-5 text-base font-light leading-relaxed text-pretty text-inkMuted">
              Whether you&apos;re running solo or managing a small fleet, we have the
              expertise and bandwidth you need.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {segments.map((s, i) => (
            <Reveal key={s.title} delay={i * 70}>
              <Card icon={s.icon} title={s.title}>
                {s.body}
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
