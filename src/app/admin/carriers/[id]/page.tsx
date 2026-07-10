import { RequireAdmin } from "@/components/require-admin";
import { CarrierCompliance } from "@/components/admin/CarrierCompliance";

// Next.js 16: dynamic route params are async.
export default async function CarrierCompliancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RequireAdmin>
      <CarrierCompliance carrierId={id} />
    </RequireAdmin>
  );
}
