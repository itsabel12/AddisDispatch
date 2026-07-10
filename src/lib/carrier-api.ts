/**
 * Carrier portal API client. Every call targets the /carrier surface, which the
 * backend gates behind an APPROVED carrier and scopes to that carrier's own
 * rows. A carrier token can only ever read its own data here.
 */

import {
  API_BASE_URL,
  type ChatMessage,
  type ChatMessageInput,
  type Invoice,
  type Load,
  type PayrollItem,
} from "./api";

const CARRIER_BASE_URL = `${API_BASE_URL}/carrier`;

export type CarrierProfile = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  mc_number: string | null;
  dot_number: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
};

export type CarrierSummary = {
  total_loads: number;
  in_transit: number;
  delivered: number;
  paid_total: number;
  outstanding_total: number;
};

async function getJson<T>(path: string, token: string | null): Promise<T> {
  const res = await fetch(`${CARRIER_BASE_URL}${path}`, {
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${path} (HTTP ${res.status})`);
  }
  return (await res.json()) as T;
}

/** The signed-in carrier's own profile. */
export function getMyCarrier(token: string | null): Promise<CarrierProfile> {
  return getJson<CarrierProfile>("/me", token);
}

/** Update the carrier's own contact details (identity fields stay locked). */
export async function updateMyCarrier(
  token: string | null,
  input: { contact_email?: string | null; contact_phone?: string | null },
): Promise<CarrierProfile> {
  const res = await fetch(`${CARRIER_BASE_URL}/me`, {
    method: "PATCH",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Update failed (HTTP ${res.status})`);
  return (await res.json()) as CarrierProfile;
}

/** The carrier's own compliance documents (W-9 / COI / authority). */
export function getMyDocuments(token: string | null): Promise<CarrierDocument[]> {
  return getJson<CarrierDocument[]>("/documents", token);
}

/** Upload one of the carrier's own onboarding documents. */
export async function uploadMyDocument(
  token: string | null,
  file: File,
  docType: string,
): Promise<CarrierDocument> {
  const body = new FormData();
  body.append("file", file);
  body.append("doc_type", docType);
  const res = await fetch(`${CARRIER_BASE_URL}/documents`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const b = await res.json();
      if (b?.detail) detail = String(b.detail);
    } catch {
      // keep status
    }
    throw new Error(`Upload failed: ${detail}`);
  }
  return (await res.json()) as CarrierDocument;
}

/** Only the signed-in carrier's loads. */
export function getMyLoads(token: string | null): Promise<Load[]> {
  return getJson<Load[]>("/loads", token);
}

/** Only the signed-in carrier's invoices (settlements). */
export function getMyInvoices(token: string | null): Promise<Invoice[]> {
  return getJson<Invoice[]>("/invoices", token);
}

/** Dashboard totals for the signed-in carrier. */
export function getMySummary(token: string | null): Promise<CarrierSummary> {
  return getJson<CarrierSummary>("/summary", token);
}

/** The signed-in carrier's own pay statement (payroll items). */
export function getMyPay(token: string | null): Promise<PayrollItem[]> {
  return getJson<PayrollItem[]>("/pay", token);
}

/** A document the carrier uploaded (a load POD or a compliance document). */
export type CarrierDocument = {
  id: string;
  type: string;
  status: string;
  filename: string;
  created_at: string;
  expires_at: string | null;
};

/** Upload a proof-of-delivery for one of the carrier's own loads. */
export async function uploadPod(
  token: string | null,
  loadId: string,
  file: File,
): Promise<CarrierDocument> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(`${CARRIER_BASE_URL}/loads/${loadId}/pod`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const b = await res.json();
      if (b?.detail) detail = String(b.detail);
    } catch {
      // keep status
    }
    throw new Error(`POD upload failed: ${detail}`);
  }
  return (await res.json()) as CarrierDocument;
}

/** List documents (PODs) the carrier uploaded for a load. */
export function getLoadDocuments(
  token: string | null,
  loadId: string,
): Promise<CarrierDocument[]> {
  return getJson<CarrierDocument[]>(`/loads/${loadId}/documents`, token);
}

/** Carrier: read a load's chat thread (marks dispatcher messages read). */
export function getMyLoadMessages(
  token: string | null,
  loadId: string,
): Promise<ChatMessage[]> {
  return getJson<ChatMessage[]>(`/loads/${loadId}/messages`, token);
}

/** Carrier: post a message (text / location) to a load's thread. */
export async function postMyLoadMessage(
  token: string | null,
  loadId: string,
  input: ChatMessageInput,
): Promise<ChatMessage> {
  const res = await fetch(`${CARRIER_BASE_URL}/loads/${loadId}/messages`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Send failed (HTTP ${res.status})`);
  return (await res.json()) as ChatMessage;
}
