import { RequireAdmin } from "@/components/require-admin";
import { PodReview } from "@/components/admin/PodReview";

export default function PodReviewPage() {
  return (
    <RequireAdmin>
      <PodReview />
    </RequireAdmin>
  );
}
