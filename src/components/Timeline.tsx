import Reveal from "./Reveal";

const steps = [
  {
    step: "01",
    title: "Onboard & Connect",
    body: "Share your equipment, lanes, and goals. We set up your profile and plug your operation into our data workflow.",
  },
  {
    step: "02",
    title: "Optimize & Dispatch",
    body: "We source and match loads, score options on cost-per-mile and reliability, and dispatch the most profitable move.",
  },
  {
    step: "03",
    title: "Track & Improve",
    body: "On-time performance and cost trends are tracked continuously, feeding transparent reporting that sharpens every next load.",
  },
];

export default function Timeline() {
  return (
    <section id="how-it-works" className="bg-bandDark py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              How It Works
            </p>
            <h2 className="text-4xl font-bold tracking-tight text-offWhite sm:text-5xl">
              Three steps to a data-run dispatch
            </h2>
          </div>
        </Reveal>

        <div className="relative mt-20">
          {/* Gold connector line (horizontal on desktop) */}
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent md:block" />

          <div className="grid gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((s, i) => (
              <Reveal key={s.step} delay={i * 120}>
                <div className="relative flex flex-col items-center text-center md:items-start md:text-left">
                  <div className="relative z-10 mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-bandDarker text-sm font-bold text-gold">
                    {s.step}
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-offWhite">{s.title}</h3>
                  <p className="max-w-xs text-sm font-light leading-relaxed text-mutedGrey md:max-w-none">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
