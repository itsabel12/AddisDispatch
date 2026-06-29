import type { Metadata } from "next";
import AuthLayout from "@/components/portal/AuthLayout";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Carrier Login — AddisDispatch",
  description: "Sign in to the AddisDispatch carrier portal.",
};

export default function LoginPage() {
  return (
    <AuthLayout title="Carrier Portal" subtitle="Sign in to manage your loads, documents, and settlements.">
      <LoginForm />
    </AuthLayout>
  );
}
