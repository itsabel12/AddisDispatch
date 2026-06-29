type KpiCardProps = {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
};

export default function KpiCard({ label, value, sub, accent }: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-portalBorder bg-bgSurface p-5">
      <div className="text-xs font-medium uppercase tracking-wider text-textMuted">{label}</div>
      <div
        className={`mt-2 text-3xl font-bold tracking-tight ${accent ? "text-gold" : "text-textPrimary"}`}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-xs font-light text-textMuted">{sub}</div>}
    </div>
  );
}
