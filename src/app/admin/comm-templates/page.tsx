import { RequireAdmin } from "@/components/require-admin";
import { CommTemplates } from "@/components/admin/CommTemplates";

export default function CommTemplatesPage() {
  return (
    <RequireAdmin>
      <CommTemplates />
    </RequireAdmin>
  );
}
