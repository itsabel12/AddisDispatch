import type {
  LoadStatus,
  DocStatus,
  SettlementStatus,
} from "@/lib/portal/types";
import { LOAD_STATUS_LABELS } from "@/lib/portal/types";

type Tone = "gold" | "green" | "red" | "muted";

const toneClass: Record<Tone, string> = {
  gold: "border-gold/30 bg-gold/12 text-gold",
  green: "border-leafGreen/40 bg-leafGreen/15 text-[#7DD166]",
  red: "border-red-500/30 bg-red-500/10 text-red-400",
  muted: "border-portalBorder bg-bgElevated text-textMuted",
};

export function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneClass[tone]}`}
    >
      {children}
    </span>
  );
}

const loadTone: Record<LoadStatus, Tone> = {
  booked: "gold",
  in_transit: "gold",
  delivered: "green",
  cancelled: "red",
};

export function LoadBadge({ status }: { status: LoadStatus }) {
  return <Badge tone={loadTone[status]}>{LOAD_STATUS_LABELS[status]}</Badge>;
}

const docTone: Record<DocStatus, Tone> = {
  pending: "muted",
  verified: "green",
  expired: "red",
};

export function DocBadge({ status }: { status: DocStatus }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return <Badge tone={docTone[status]}>{label}</Badge>;
}

export function SettlementBadge({ status }: { status: SettlementStatus }) {
  return <Badge tone={status === "paid" ? "green" : "gold"}>{status === "paid" ? "Paid" : "Pending"}</Badge>;
}
