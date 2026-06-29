import type { Metadata } from "next";
import AuthLayout from "@/components/portal/AuthLayout";
import ForgotForm from "./ForgotForm";

export const metadata: Metadata = {
  title: "Reset Password — AddisDispatch",
  description: "Reset your AddisDispatch carrier portal password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a link to set a new password."
    >
      <ForgotForm />
    </AuthLayout>
  );
}
