import type { Metadata } from "next";
import AuthLayout from "@/components/portal/AuthLayout";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
  title: "Become a Carrier Partner — AddisDispatch",
  description: "Create your AddisDispatch carrier portal account.",
};

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set up your carrier profile. Accounts are activated after a quick authority review."
    >
      <SignupForm />
    </AuthLayout>
  );
}
