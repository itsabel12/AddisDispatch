import { createClient } from "@/lib/supabase/server";
import { buildStatementPdf } from "@/lib/portal/statement";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("carrier_id").eq("id", user.id).single();
  if (!profile?.carrier_id) return new Response("Forbidden", { status: 403 });
  const { data: carrier } = await supabase
    .from("carriers")
    .select("company_name, mc_number, status")
    .eq("id", profile.carrier_id)
    .single();
  if (!carrier || carrier.status !== "active") return new Response("Forbidden", { status: 403 });

  // RLS guarantees this settlement belongs to the carrier.
  const { data: s } = await supabase
    .from("settlements")
    .select("*, loads(ref_number)")
    .eq("id", id)
    .maybeSingle<{
      gross: number; dispatch_fee: number; net: number; status: string; paid_at: string | null;
      loads: { ref_number: string | null } | null;
    }>();
  if (!s) return new Response("Not found", { status: 404 });

  const ref = s.loads?.ref_number ?? "Load";
  const pdf = await buildStatementPdf({
    company: carrier.company_name,
    mc: carrier.mc_number,
    title: `Per-load statement — ${ref}`,
    subtitle: `Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
    rows: [
      {
        load: ref,
        gross: Number(s.gross ?? 0),
        fee: Number(s.dispatch_fee ?? 0),
        net: Number(s.net ?? 0),
        status: s.status === "paid" ? "Paid" : "Pending",
        paid: s.paid_at ?? "",
      },
    ],
  });

  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="statement-${ref}.pdf"`,
    },
  });
}
