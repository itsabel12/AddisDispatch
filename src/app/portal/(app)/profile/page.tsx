import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getPortalContext } from "@/lib/portal/session";
import { EQUIPMENT_LABELS, type Equipment, type EquipmentType } from "@/lib/portal/types";
import PageHeader from "@/components/portal/PageHeader";
import { updateCompany, updateContact, addEquipment, removeEquipment } from "./actions";

export const metadata: Metadata = { title: "Profile — AddisDispatch Portal" };

const inputClass =
  "w-full rounded-xl border border-portalBorder bg-bgElevated px-4 py-2.5 text-sm text-textPrimary placeholder:text-textMuted/50 focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/40";
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wider text-textMuted";
const saveBtn =
  "rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_24px_-4px] hover:shadow-gold/50";

const EQUIP_TYPES = Object.keys(EQUIPMENT_LABELS) as EquipmentType[];

export default async function ProfilePage() {
  const { carrier, profile } = await getPortalContext();
  const supabase = await createClient();
  const { data } = await supabase.from("equipment").select("*").order("created_at");
  const equipment = (data ?? []) as Equipment[];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Profile" subtitle="Your company, contact details, and equipment." />

      <div className="space-y-6">
        {/* Company */}
        <form action={updateCompany} className="rounded-2xl border border-portalBorder bg-bgSurface p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-textMuted">Company</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="company_name" className={labelClass}>Company name</label>
              <input id="company_name" name="company_name" defaultValue={carrier.company_name} className={inputClass} />
            </div>
            <div>
              <label htmlFor="mc_number" className={labelClass}>MC number</label>
              <input id="mc_number" name="mc_number" defaultValue={carrier.mc_number ?? ""} className={inputClass} />
            </div>
            <div>
              <label htmlFor="dot_number" className={labelClass}>DOT number</label>
              <input id="dot_number" name="dot_number" defaultValue={carrier.dot_number ?? ""} className={inputClass} />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" className={saveBtn}>Save company</button>
          </div>
        </form>

        {/* Contact */}
        <form action={updateContact} className="rounded-2xl border border-portalBorder bg-bgSurface p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-textMuted">Contact</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="full_name" className={labelClass}>Full name</label>
              <input id="full_name" name="full_name" defaultValue={profile.full_name ?? ""} className={inputClass} />
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>Phone</label>
              <input id="phone" name="phone" defaultValue={profile.phone ?? ""} className={inputClass} />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" className={saveBtn}>Save contact</button>
          </div>
        </form>

        {/* Equipment */}
        <div className="rounded-2xl border border-portalBorder bg-bgSurface p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-textMuted">Equipment</h2>

          {equipment.length === 0 ? (
            <p className="text-sm font-light text-textMuted">No equipment added yet.</p>
          ) : (
            <ul className="divide-y divide-portalBorder">
              {equipment.map((e) => (
                <li key={e.id} className="flex items-center justify-between py-3">
                  <div>
                    <span className="text-sm font-medium text-textPrimary">
                      {EQUIPMENT_LABELS[e.type]}
                      {e.unit_number && <span className="text-textMuted"> · {e.unit_number}</span>}
                    </span>
                    {e.notes && <div className="text-xs font-light text-textMuted">{e.notes}</div>}
                  </div>
                  <form action={removeEquipment}>
                    <input type="hidden" name="id" value={e.id} />
                    <button
                      type="submit"
                      className="text-xs font-medium text-textMuted transition-colors hover:text-red-400"
                    >
                      Remove
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}

          {/* Add equipment */}
          <form action={addEquipment} className="mt-5 grid grid-cols-1 gap-3 border-t border-portalBorder pt-5 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <label htmlFor="type" className={labelClass}>Type</label>
              <select id="type" name="type" className={inputClass} defaultValue="dry_van">
                {EQUIP_TYPES.map((t) => (
                  <option key={t} value={t}>{EQUIPMENT_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="unit_number" className={labelClass}>Unit #</label>
              <input id="unit_number" name="unit_number" placeholder="UNIT-101" className={inputClass} />
            </div>
            <div className="flex items-end">
              <button type="submit" className={`${saveBtn} w-full sm:w-auto`}>Add unit</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
