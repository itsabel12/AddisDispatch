import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Load } from "@/lib/portal/types";
import PageHeader from "@/components/portal/PageHeader";
import LoadsBrowser from "@/components/portal/LoadsBrowser";

export const metadata: Metadata = { title: "Loads — AddisDispatch Portal" };

export default async function LoadsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("loads").select("*");
  const loads = (data ?? []) as Load[];

  return (
    <div>
      <PageHeader title="Loads" subtitle="Every load we've booked for you." />
      <LoadsBrowser loads={loads} />
    </div>
  );
}
