import { type NextRequest } from "next/server";

import { handleLead } from "@/lib/leads";

// Booking modal -> consultations
export function POST(req: NextRequest) {
  return handleLead(req, {
    table: "consultations",
    allowed: ["name", "phone", "scheduled_date", "scheduled_time"],
    required: ["name", "phone", "scheduled_date", "scheduled_time"],
  });
}
