import { redirect } from "next/navigation";
import { getPortalContext } from "@/lib/portal/session";
import { createClient } from "@/lib/supabase/server";
import { DOC_LABELS, type DocType } from "@/lib/portal/types";
import DocumentUpload from "@/components/portal/DocumentUpload";
import { AGREEMENT_VERSION } from "@/lib/portal/constants";
import { signOut } from "../actions";
import { signAgreement } from "./actions";

const REQUIRED_DOCS: { type: DocType; note?: string }[] = [
  { type: "w9" },
  { type: "coi", note: "Must list AddisDispatch as the certificate holder." },
  { type: "mc_authority" },
];

export default async function OnboardingPage() {
  const { carrier, profile } = await getPortalContext();
  if (carrier.status === "active") redirect("/portal");
  if (carrier.status === "pending" || carrier.status === "suspended") redirect("/portal/pending");

  const supabase = await createClient();
  // If requirements are already met, activate and bounce into the portal.
  await supabase.rpc("maybe_activate_carrier");
  const { data: fresh } = await supabase.from("carriers").select("status").eq("id", carrier.id).single();
  if (fresh?.status === "active") redirect("/portal");

  const [{ data: agreement }, { data: docs }] = await Promise.all([
    supabase.from("agreements").select("signer_name, signed_at, version").eq("status", "signed").maybeSingle(),
    supabase.from("documents").select("type"),
  ]);
  const uploaded = new Set((docs ?? []).map((d) => d.type as DocType));
  const signed = !!agreement;
  const docsDone = REQUIRED_DOCS.every((d) => uploaded.has(d.type));
  const stepsDone = (signed ? 1 : 0) + REQUIRED_DOCS.filter((d) => uploaded.has(d.type)).length;
  const totalSteps = 1 + REQUIRED_DOCS.length;

  return (
    <main className="min-h-screen bg-bgBase px-5 py-10 text-textPrimary">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight text-gold">
            Addis<span className="text-textPrimary">Dispatch</span>
          </span>
          <form action={signOut}>
            <button type="submit" className="text-sm font-medium text-textMuted hover:text-gold">Sign out</button>
          </form>
        </div>

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Finish setting up {carrier.company_name}</h1>
        <p className="mt-2 text-sm font-light text-textMuted">
          Two steps to activate your account and start receiving loads.
        </p>

        {/* Progress */}
        <div className="mt-5 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-bgElevated">
            <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${(stepsDone / totalSteps) * 100}%` }} />
          </div>
          <span className="text-xs font-medium text-textMuted">{stepsDone}/{totalSteps}</span>
        </div>

        {/* Step 1 — sign agreement */}
        <section className={`mt-8 rounded-2xl border p-6 ${signed ? "border-leafGreen/40 bg-leafGreen/5" : "border-portalBorder bg-bgSurface"}`}>
          <div className="flex items-start gap-3">
            <StepDot done={signed} n={1} />
            <div className="flex-1">
              <h2 className="text-base font-semibold">Sign the dispatch service agreement</h2>
              {signed ? (
                <p className="mt-1 text-sm font-light text-textMuted">
                  Signed by {agreement?.signer_name} (v{agreement?.version}). ✓
                </p>
              ) : (
                <>
                  <p className="mt-1 text-sm font-light text-textMuted">
                    By signing you agree to the AddisDispatch Dispatch Service Agreement (v{AGREEMENT_VERSION}):
                    AddisDispatch acts as your dispatch agent, you authorize load booking on your behalf, and the
                    dispatch fee is deducted per settlement. Month-to-month; cancel anytime.
                  </p>
                  <form action={signAgreement} className="mt-4 space-y-3">
                    <div>
                      <label htmlFor="signer_name" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-textMuted">
                        Type your full legal name to sign
                      </label>
                      <input
                        id="signer_name"
                        name="signer_name"
                        defaultValue={profile.full_name ?? ""}
                        required
                        className="w-full rounded-xl border border-portalBorder bg-bgElevated px-4 py-2.5 text-sm text-textPrimary focus:border-gold/60 focus:outline-none"
                      />
                    </div>
                    <label className="flex items-start gap-2 text-sm font-light text-textMuted">
                      <input type="checkbox" name="intent" value="agree" required className="mt-1 accent-gold" />
                      I have read and agree to the Dispatch Service Agreement, and this is my electronic signature.
                    </label>
                    <button type="submit" className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_24px_-4px] hover:shadow-gold/50">
                      Sign agreement
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Step 2 — documents */}
        <section className={`mt-5 rounded-2xl border p-6 ${docsDone ? "border-leafGreen/40 bg-leafGreen/5" : "border-portalBorder bg-bgSurface"}`}>
          <div className="flex items-start gap-3">
            <StepDot done={docsDone} n={2} />
            <div className="flex-1">
              <h2 className="text-base font-semibold">Upload your documents</h2>
              <p className="mt-1 text-sm font-light text-textMuted">W-9, Certificate of Insurance, and MC Authority.</p>

              <ul className="mt-4 space-y-2">
                {REQUIRED_DOCS.map((d) => {
                  const done = uploaded.has(d.type);
                  return (
                    <li key={d.type} className="flex items-start gap-2.5 text-sm">
                      <span className={done ? "text-leafGreen" : "text-textMuted/50"}>{done ? "✓" : "○"}</span>
                      <span>
                        <span className={done ? "text-textPrimary" : "text-textMuted"}>{DOC_LABELS[d.type]}</span>
                        {d.note && <span className="block text-xs font-light text-gold/80">{d.note}</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {!docsDone && (
                <div className="mt-4">
                  <DocumentUpload carrierId={carrier.id} />
                </div>
              )}
            </div>
          </div>
        </section>

        <p className="mt-6 text-center text-xs font-light text-textMuted/70">
          Your account activates automatically once both steps are complete.
        </p>
      </div>
    </main>
  );
}

function StepDot({ done, n }: { done: boolean; n: number }) {
  return (
    <span
      className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-sm font-bold ${
        done ? "bg-leafGreen text-black" : "border border-gold/40 bg-bgElevated text-gold"
      }`}
    >
      {done ? "✓" : n}
    </span>
  );
}
