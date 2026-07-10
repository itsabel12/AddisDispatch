import { RequireAdmin } from "@/components/require-admin";
import { DocumentIntake } from "@/components/admin/DocumentIntake";

export default function LoadIntakePage() {
  return (
    <RequireAdmin>
      <DocumentIntake />
    </RequireAdmin>
  );
}
