import { createClient } from "@/lib/supabase/server";
import { buildStatementPdf, type StatementRow } from "@/lib/portal/statement";

export async function GET() {
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

  const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
  // RLS scopes settlements to this carrier.
  const { data } = await supabase
    .from("settlements")
    .select("*, loads(ref_number)")
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  const rows: StatementRow[] = (data ?? []).map((s) => ({
    load: (s.loads as { ref_number: string | null } | null)?.ref_number ?? "—",
    gross: Number(s.gross ?? 0),
    fee: Number(s.dispatch_fee ?? 0),
    net: Number(s.net ?? 0),
    status: s.status === "paid" ? "Paid" : "Pending",
    paid: s.paid_at ?? "",
  }));

  const today = new Date();
  const weekAgo = new Date(Date.now() - 7 * 86_400_000);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const pdf = await buildStatementPdf({
    company: carrier.company_name,
    mc: carrier.mc_number,
    title: "Weekly settlement summary",
    subtitle: `${fmt(weekAgo)} – ${fmt(today)}, ${today.getFullYear()}`,
    rows,
  });

  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="weekly-statement.pdf"`,
    },
  });
}
