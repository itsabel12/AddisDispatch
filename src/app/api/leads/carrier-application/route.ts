import { type NextRequest } from "next/server";

import { handleLead } from "@/lib/leads";

// Carrier application form -> carrier_applications
export function POST(req: NextRequest) {
  return handleLead(req, {
    table: "carrier_applications",
    allowed: [
      "company_name",
      "contact_name",
      "email",
      "phone",
      "mc_number",
      "dot_number",
      "equipment_type",
      "truck_count",
      "preferred_lanes",
      "notes",
    ],
    required: ["company_name", "contact_name", "email"],
  });
}
