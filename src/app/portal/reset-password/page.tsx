import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthLayout from "@/components/portal/AuthLayout";
import ResetForm from "./ResetForm";

export const metadata: Metadata = {
  title: "Set New Password — AddisDispatch",
};

export default async function ResetPasswordPage() {
  // Reached via the recovery callback, which establishes a session. Without one,
  // there's nothing to reset.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a new password for your carrier account.">
      <ResetForm />
    </AuthLayout>
  );
}
