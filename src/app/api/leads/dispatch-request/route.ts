import { type NextRequest } from "next/server";

import { handleLead } from "@/lib/leads";

// Contact / dispatch-request form -> dispatch_requests
export function POST(req: NextRequest) {
  return handleLead(req, {
    table: "dispatch_requests",
    allowed: ["name", "company", "mc_number", "email", "lane_details"],
    required: ["name", "email", "lane_details"],
  });
}
