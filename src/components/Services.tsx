import Reveal from "./Reveal";
import { TruckIcon, LinkIcon, InvoiceIcon, ChartIcon } from "./icons";

const services = [
  {
    icon: <TruckIcon />,
    title: "Dispatch Management",
    body: "End-to-end coordination of loads, lanes, and schedules so drivers stay moving and downtime stays low.",
  },
  {
    icon: <LinkIcon />,
    title: "Load Matching",
    body: "Loads matched to equipment and lane preferences, ranked by rate and fit using our cost-per-mile model.",
  },
  {
    icon: <InvoiceIcon />,
    title: "Invoicing & Billing Support",
    body: "Paperwork, rate confirmations, and billing handled cleanly — built to shorten the gap between delivery and payment.",
  },
  {
    icon: <ChartIcon />,
    title: "Performance Analytics",
    body: "Operational reporting on utilization, on-time rate, and cost trends, turned into decisions you can act on.",
  },
];

export default function Services() {
  return (
    <section id="services" className="bg-seaGrey py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Services
            </p>
            <h2 className="text-4xl font-bold tracking-tight text-offWhite sm:text-5xl">
              Everything dispatch, run on data
            </h2>
            <p className="mt-5 text-base font-light leading-relaxed text-mutedGrey">
              A complete back office for carriers and owner-operators — each service
              instrumented so the numbers, not the noise, drive the call.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5 sm:grid-cols-2">
          {services.map((service, i) => (
            <Reveal key={service.title} delay={i * 80}>
              <div className="group h-full bg-bandDark p-8 transition-colors hover:bg-bandDarker">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-gold/20 bg-gold/5 text-gold">
                  {service.icon}
                </div>
                <h3 className="mb-2.5 text-lg font-semibold text-offWhite">
                  {service.title}
                </h3>
                <p className="text-sm font-light leading-relaxed text-mutedGrey">
                  {service.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
