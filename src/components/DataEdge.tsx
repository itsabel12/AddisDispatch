import Card from "./Card";
import Reveal from "./Reveal";
import { RouteIcon, ClockIcon, GaugeIcon, ReportIcon } from "./icons";

const edges = [
  {
    icon: <RouteIcon />,
    title: "Route & Cost Optimization",
    body: "We model lanes against cost-per-mile, deadhead, and fuel to plan routing that protects margin. Designed to surface the most profitable move on every load.",
  },
  {
    icon: <ClockIcon />,
    title: "On-Time Performance Tracking",
    body: "Pickup and delivery windows tracked as measurable signals — built to flag risk early and keep service scores trending the right way.",
  },
  {
    icon: <GaugeIcon />,
    title: "Carrier / Driver Scoring",
    body: "A scoring methodology across reliability, acceptance, and transit consistency, so capacity decisions are grounded in evidence rather than gut feel.",
  },
  {
    icon: <ReportIcon />,
    title: "Transparent Reporting",
    body: "Clear dashboards on the metrics that matter. You see how the operation is run and where the data points next — no black boxes.",
  },
];

export default function DataEdge() {
  return (
    <section id="data-edge" className="relative bg-grid py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              The Data Edge
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              Intelligence is the advantage
            </h2>
            <p className="mt-5 text-base font-light leading-relaxed text-inkMuted">
              Our edge isn&apos;t tenure — it&apos;s analysis. Here&apos;s how we
              approach dispatch as a data operation, built to compound efficiency
              load over load.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {edges.map((edge, i) => (
            <Reveal key={edge.title} delay={i * 90}>
              <Card icon={edge.icon} title={edge.title}>
                {edge.body}
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p className="mx-auto mt-12 max-w-2xl text-center text-xs font-light text-inkMuted/70">
            Methodology shown reflects how we run dispatch. AddisDispatch is a new
            operation — any figures added later will be labeled as illustrative until
            backed by live results.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
