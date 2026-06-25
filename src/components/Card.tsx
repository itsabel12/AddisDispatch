import type { ReactNode } from "react";

type CardProps = {
  icon: ReactNode;
  title: string;
  children: ReactNode;
};

/**
 * Reusable feature card: gold icon, semibold subhead, light body copy.
 * Restrained gold hover state (border + lift).
 */
export default function Card({ icon, title, children }: CardProps) {
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-white/5 bg-bandDark/60 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:bg-bandDark">
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-gold/20 bg-gold/5 text-gold transition-colors group-hover:bg-gold/10">
        {icon}
      </div>
      <h3 className="mb-2.5 text-lg font-semibold text-offWhite">{title}</h3>
      <p className="text-sm font-light leading-relaxed text-mutedGrey">{children}</p>

      {/* Hairline gold accent revealed on hover */}
      <span className="absolute inset-x-7 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-gold/60 to-transparent transition-transform duration-300 group-hover:scale-x-100" />
    </div>
  );
}
