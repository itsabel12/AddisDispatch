"use client";

import { useMemo, useState } from "react";
import type { Load, LoadStatus } from "@/lib/portal/types";
import { LOAD_STATUS_LABELS } from "@/lib/portal/types";
import LoadsTable from "./LoadsTable";

type FilterKey = "all" | LoadStatus;

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "booked", label: LOAD_STATUS_LABELS.booked },
  { key: "in_transit", label: LOAD_STATUS_LABELS.in_transit },
  { key: "delivered", label: LOAD_STATUS_LABELS.delivered },
  { key: "cancelled", label: LOAD_STATUS_LABELS.cancelled },
];

export default function LoadsBrowser({ loads }: { loads: Load[] }) {
  const [status, setStatus] = useState<FilterKey>("all");
  const [sortDesc, setSortDesc] = useState(true);

  const visible = useMemo(() => {
    return loads
      .filter((l) => status === "all" || l.status === status)
      .sort((a, b) => {
        const av = a.pickup_date ?? "";
        const bv = b.pickup_date ?? "";
        return sortDesc ? bv.localeCompare(av) : av.localeCompare(bv);
      });
  }, [loads, status, sortDesc]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = status === f.key;
            const count =
              f.key === "all" ? loads.length : loads.filter((l) => l.status === f.key).length;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setStatus(f.key)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-gold/40 bg-gold/12 text-gold"
                    : "border-portalBorder text-textMuted hover:text-textPrimary"
                }`}
              >
                {f.label} <span className="opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setSortDesc((v) => !v)}
          className="flex items-center gap-1.5 rounded-full border border-portalBorder px-3.5 py-1.5 text-xs font-medium text-textMuted transition-colors hover:text-textPrimary"
        >
          Pickup date
          <span className="text-gold">{sortDesc ? "↓" : "↑"}</span>
        </button>
      </div>

      <LoadsTable loads={visible} />
    </div>
  );
}
