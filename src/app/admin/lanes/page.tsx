/**
 * Lanes page. Auth-gated; shows per-lane analytics (average rpm, volume, avg
 * rate) so you can see which lanes pay best.
 */

import { RequireAdmin } from "@/components/require-admin";
import { LanesTable } from "@/components/lanes-table";
import { PageHeader } from "@/components/ui/page-header";

export default function LanesPage() {
  return (
    <main className="mx-auto w-full max-w-7xl p-5 lg:p-8">
      <RequireAdmin>
        <PageHeader
          title="Lane Intelligence"
          subtitle="Every origin → destination lane in your loads, best average rate-per-mile first."
        />
        <LanesTable />
      </RequireAdmin>
    </main>
  );
}
