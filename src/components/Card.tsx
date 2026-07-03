import type { ReactNode } from "react";

type CardProps = {
  icon: ReactNode;
  title: string;
  children: ReactNode;
};

/**
 * Reusable feature card: orange icon, semibold subhead, light body copy.
 * Frosted-glass surface so the site-wide background shows through.
 */
export default function Card({ icon, title, children }: CardProps) {
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-line bg-surface/50 p-7 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-surface/70">
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent transition-colors group-hover:bg-accent/15">
        {icon}
      </div>
      <h3 className="mb-2.5 font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="text-sm font-light leading-relaxed text-inkMuted">{children}</p>

      {/* Hairline accent revealed on hover */}
      <span className="absolute inset-x-7 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-accent/60 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
    </div>
  );
}
