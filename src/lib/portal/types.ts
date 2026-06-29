export type CarrierStatus = "pending" | "onboarding" | "active" | "suspended";
export type LoadStatus = "booked" | "in_transit" | "delivered" | "cancelled";
export type DocType = "mc_authority" | "coi" | "w9" | "rate_con" | "bol" | "pod";
export type DocStatus = "pending" | "verified" | "expired";
export type SettlementStatus = "pending" | "paid";
export type EquipmentType = "dry_van" | "reefer" | "flatbed" | "power_only";

export type Carrier = {
  id: string;
  company_name: string;
  mc_number: string | null;
  dot_number: string | null;
  status: CarrierStatus;
  created_at: string;
};

export type Profile = {
  id: string;
  carrier_id: string;
  full_name: string | null;
  phone: string | null;
  role: "owner" | "driver";
};

export type Equipment = {
  id: string;
  carrier_id: string;
  type: EquipmentType;
  unit_number: string | null;
  notes: string | null;
};

export type Load = {
  id: string;
  carrier_id: string;
  ref_number: string | null;
  broker_name: string | null;
  origin_city: string | null;
  origin_state: string | null;
  dest_city: string | null;
  dest_state: string | null;
  pickup_date: string | null;
  delivery_date: string | null;
  rate: number | null;
  miles: number | null;
  status: LoadStatus;
  picked_up_at: string | null;
  delivered_at: string | null;
  ready_to_invoice: boolean;
  created_at: string;
};

export type DocumentRow = {
  id: string;
  carrier_id: string;
  type: DocType;
  load_id: string | null;
  file_path: string | null;
  status: DocStatus;
  expires_at: string | null;
  uploaded_at: string;
};

export type Settlement = {
  id: string;
  carrier_id: string;
  load_id: string | null;
  gross: number | null;
  dispatch_fee: number | null;
  net: number | null;
  status: SettlementStatus;
  paid_at: string | null;
};

export const DOC_LABELS: Record<DocType, string> = {
  mc_authority: "MC Authority",
  coi: "Certificate of Insurance",
  w9: "W-9",
  rate_con: "Rate Confirmation",
  bol: "Bill of Lading",
  pod: "Proof of Delivery",
};

export const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
  dry_van: "Dry Van",
  reefer: "Reefer",
  flatbed: "Flatbed",
  power_only: "Power Only",
};

export const LOAD_STATUS_LABELS: Record<LoadStatus, string> = {
  booked: "Booked",
  in_transit: "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// ---- v2 additions ----

export type AuditLog = {
  id: string;
  carrier_id: string;
  actor_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type NotificationRow = {
  id: string;
  carrier_id: string;
  type: string;
  title: string;
  body: string | null;
  entity_type: string | null;
  entity_id: string | null;
  read: boolean;
  created_at: string;
};

export type ComplianceType =
  | "cdl"
  | "medical_card"
  | "annual_inspection"
  | "ifta"
  | "insurance"
  | "registration";
export type ComplianceStatus = "valid" | "expiring" | "expired";

export type ComplianceItem = {
  id: string;
  carrier_id: string;
  type: ComplianceType;
  holder: "driver" | "truck";
  reference_id: string | null;
  expires_at: string | null;
  status: ComplianceStatus;
  document_id: string | null;
};

export type AvailabilityStatus = "available" | "booked" | "off";

export type CarrierPreferences = {
  carrier_id: string;
  availability_status: AvailabilityStatus;
  current_location: string | null;
  home_base: string | null;
  preferred_lanes: string[];
  desired_home_time: string | null;
  updated_at: string;
};

export type Agreement = {
  id: string;
  carrier_id: string;
  type: "dispatch_service";
  version: string;
  status: "pending" | "signed";
  signer_name: string | null;
  signed_at: string | null;
  ip_address: string | null;
  pandadoc_doc_id: string | null;
  file_path: string | null;
};

export const COMPLIANCE_LABELS: Record<ComplianceType, string> = {
  cdl: "CDL",
  medical_card: "Medical Card",
  annual_inspection: "Annual Inspection",
  ifta: "IFTA",
  insurance: "Insurance",
  registration: "Registration",
};

export const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  available: "Available",
  booked: "Booked",
  off: "Off",
};

/** Human-readable labels for audit_log.action values. */
export const AUDIT_ACTION_LABELS: Record<string, string> = {
  load_booked: "Load booked",
  load_status_changed: "Load status changed",
  pod_uploaded: "POD uploaded",
  document_uploaded: "Document uploaded",
  settlement_paid: "Settlement paid",
  agreement_signed: "Agreement signed",
  carrier_activated: "Account activated",
  profile_updated: "Profile updated",
  preferences_updated: "Preferences updated",
  compliance_updated: "Compliance updated",
};
