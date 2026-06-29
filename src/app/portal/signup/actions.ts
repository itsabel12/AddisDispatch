"use server";

import { createClient } from "@/lib/supabase/server";

export type SignupState = { error?: string; success?: boolean } | undefined;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signup(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const company_name = String(formData.get("company_name") || "").trim();
  const mc_number = String(formData.get("mc_number") || "").trim();
  const full_name = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!company_name || !full_name || !email) {
    return { error: "Company, contact name, and email are all required." };
  }
  if (!emailPattern.test(email)) {
    return { error: "Enter a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  // The carrier (pending) + profile are provisioned by the on_auth_user_created
  // trigger from this metadata; status is forced server-side, never trusted here.
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { company_name, mc_number, full_name } },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
