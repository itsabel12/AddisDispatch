import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { fmtDateTime } from "@/lib/portal/format";
import { AVAILABILITY_LABELS, type AvailabilityStatus, type CarrierPreferences } from "@/lib/portal/types";
import PageHeader from "@/components/portal/PageHeader";
import { saveAvailability } from "./actions";

export const metadata: Metadata = { title: "Availability — AddisDispatch Portal" };

const inputClass =
  "w-full rounded-xl border border-portalBorder bg-bgElevated px-4 py-2.5 text-sm text-textPrimary placeholder:text-textMuted/50 focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/40";
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wider text-textMuted";
const STATUSES = Object.keys(AVAILABILITY_LABELS) as AvailabilityStatus[];

export default async function AvailabilityPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("carrier_preferences").select("*").maybeSingle<CarrierPreferences>();
  const prefs = data;
  const lanes = (prefs?.preferred_lanes ?? []).join(", ");

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Availability"
        subtitle="Tell dispatch where you are and what you want to run. This is what gets you booked."
      />

      <form action={saveAvailability} className="space-y-5 rounded-2xl border border-portalBorder bg-bgSurface p-6">
        <div>
          <label className={labelClass}>Availability</label>
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <label
                key={s}
                className="flex-1 cursor-pointer rounded-xl border border-portalBorder bg-bgElevated px-3 py-2.5 text-center text-sm font-medium text-textMuted transition-colors has-[:checked]:border-gold/50 has-[:checked]:bg-gold/12 has-[:checked]:text-gold"
              >
                <input
                  type="radio"
                  name="availability_status"
                  value={s}
                  defaultChecked={(prefs?.availability_status ?? "available") === s}
                  className="sr-only"
                />
                {AVAILABILITY_LABELS[s]}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="current_location" className={labelClass}>Current location (where you&apos;re empty)</label>
            <input id="current_location" name="current_location" defaultValue={prefs?.current_location ?? ""} placeholder="Dallas, TX" className={inputClass} />
          </div>
          <div>
            <label htmlFor="home_base" className={labelClass}>Home base</label>
            <input id="home_base" name="home_base" defaultValue={prefs?.home_base ?? ""} placeholder="Dallas, TX" className={inputClass} />
          </div>
        </div>

        <div>
          <label htmlFor="preferred_lanes" className={labelClass}>Preferred lanes (comma or line separated)</label>
          <textarea id="preferred_lanes" name="preferred_lanes" rows={3} defaultValue={lanes} placeholder="TX → GA, TX → FL, Southeast regional" className={`${inputClass} resize-none`} />
        </div>

        <div>
          <label htmlFor="desired_home_time" className={labelClass}>Desired home time</label>
          <input id="desired_home_time" name="desired_home_time" defaultValue={prefs?.desired_home_time ?? ""} placeholder="Home weekends" className={inputClass} />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-light text-textMuted">
            {prefs?.updated_at ? `Last updated ${fmtDateTime(prefs.updated_at)}` : "Not set yet"}
          </span>
          <button type="submit" className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_24px_-4px] hover:shadow-gold/50">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
