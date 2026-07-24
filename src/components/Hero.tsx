import Image from "next/image";
import heroTruck from "../../public/images/hero-truck.png";

const sideStats = [
  { v: "$3.24", l: "Avg RPM" },
  { v: "96%", l: "Load Success" },
  { v: "34%", l: "Less Deadhead" },
];

export default function Hero() {
  return (
    <section id="top" className="relative isolate flex min-h-screen items-center overflow-hidden">
      {/* Full-bleed hero image */}
      <Image
        src={heroTruck}
        alt="A black freight truck moving along a highway at dusk"
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />

      {/* Dark-to-transparent overlay, weighted stronger on the RIGHT (bright sky)
          so the headline on the left stays readable. */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(8,8,10,0.92) 0%, rgba(8,8,10,0.80) 32%, rgba(8,8,10,0.64) 58%, rgba(8,8,10,0.82) 100%)",
        }}
      />
      {/* Bottom grounding fade into the page */}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-base to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-6 pt-28 pb-20 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="font-display text-[2.75rem] font-bold leading-[1.02] tracking-[-0.035em] text-ink text-balance sm:text-6xl lg:text-[5.25rem]">
            Dispatch,
            <br />
            <span className="text-accent">Engineered by Data</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg font-light leading-relaxed text-inkMuted text-pretty sm:text-xl">
            We run dispatch like a data operation. Route optimization, cost-per-mile
            intelligence, and on-time performance tracking keep your trucks earning —
            decisions driven by analytics, not guesswork.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href="#contact"
              className="rounded-xl bg-accent px-7 py-3.5 text-center text-sm font-semibold text-black transition-all hover:bg-accentDeep hover:shadow-[0_0_30px_-6px] hover:shadow-accent/70"
            >
              Request Dispatch
            </a>
            <a
              href="#data-edge"
              className="rounded-xl border border-line px-7 py-3.5 text-center text-sm font-medium text-ink transition-colors hover:border-accent/50 hover:text-accent"
            >
              See the Data Edge
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            {sideStats.map((s) => (
              <div key={s.l} className="rounded-xl border border-line bg-surface/60 px-5 py-3 backdrop-blur">
                <div className="font-display text-2xl font-bold tracking-tight tabular-nums text-ink">{s.v}</div>
                <div className="mt-0.5 text-xs font-medium tracking-wide text-inkMuted">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
