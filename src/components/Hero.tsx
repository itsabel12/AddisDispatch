import Image from "next/image";
import heroTruck from "../../public/images/hero-truck.png";

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
          so the gold headline on the left stays readable. */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(31,31,31,0.92) 0%, rgba(31,31,31,0.78) 32%, rgba(31,31,31,0.62) 58%, rgba(31,31,31,0.80) 100%)",
        }}
      />
      {/* Bottom grounding fade into the page */}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-seaGrey to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-6 pt-28 pb-20 lg:px-8">
        <div className="max-w-2xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-bandDarker/40 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-leafGreen" />
            Data-Driven Freight Dispatch
          </p>

          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-offWhite sm:text-6xl lg:text-7xl">
            Dispatch,
            <br />
            <span className="text-gold">Engineered by Data</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg font-light leading-relaxed text-mutedGrey sm:text-xl">
            We run dispatch like a data operation. Route optimization, cost-per-mile
            intelligence, and on-time performance tracking keep your trucks earning —
            decisions driven by analytics, not guesswork.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href="#contact"
              className="rounded-full bg-gold px-7 py-3.5 text-center text-sm font-semibold text-bandDarker transition-all hover:shadow-[0_0_30px_-4px] hover:shadow-gold/60"
            >
              Request Dispatch
            </a>
            <a
              href="#data-edge"
              className="rounded-full border border-white/15 px-7 py-3.5 text-center text-sm font-light text-offWhite transition-colors hover:border-gold/50 hover:text-gold"
            >
              See the Data Edge
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
