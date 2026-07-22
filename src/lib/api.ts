/**
 * Admin/dispatcher API client for the FastAPI backend.
 *
 * Every call targets the /admin surface, which the backend gates behind the
 * admin role. The carrier portal uses a separate client (lib/carrier-api.ts)
 * that targets /carrier. The base URL comes from NEXT_PUBLIC_API_BASE_URL so
 * it's never hardcoded; each request attaches the caller's Clerk token.
 */

import { recordIntuitTid } from "@/lib/diagnostics";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

/** All dispatcher endpoints live under /admin. */
const ADMIN_BASE_URL = `${API_BASE_URL}/admin`;

/**
 * Turn a failed Response into an Error message, preferring the backend's
 * ``{detail: "..."}`` body over a bare status code.
 */
async function errorMessage(res: Response, fallback?: string): Promise<string> {
  try {
    const body = await res.json();
    if (body?.detail) return String(body.detail);
  } catch {
    // no JSON body — fall through to the status-code message
  }
  return fallback ?? `HTTP ${res.status}`;
}

type RequestOptions = {
  method?: string;
  /** JSON-serialized and sent with a application/json content-type when present. */
  body?: unknown;
  token?: string | null;
  /** Error message prefix used when the response has no `detail` body. */
  errorFallback?: string;
};

/**
 * Shared admin request: attaches the Clerk token, disables caching, serializes a
 * JSON body, and raises a detail-aware Error on non-2xx. Returns the parsed JSON
 * (or `undefined` for 204/empty responses). Blob/CSV/FormData calls use their own
 * helpers below since they don't fit this JSON shape.
 */
async function adminRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const hasBody = opts.body !== undefined;
  const res = await fetch(`${ADMIN_BASE_URL}${path}`, {
    method: opts.method ?? "GET",
    cache: "no-store",
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    ...(hasBody ? { body: JSON.stringify(opts.body) } : {}),
  });
  // Best-effort: if the backend forwards Intuit's transaction id, cache it for
  // the support-page diagnostics. Header lookups are case-insensitive.
  recordIntuitTid(res.headers.get("intuit_tid") ?? res.headers.get("x-intuit-tid"));
  if (!res.ok) throw new Error(await errorMessage(res, opts.errorFallback));
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** A freight load, matching the backend's LoadRead schema (subset we use). */
export type Load = {
  id: string;
  source: string;
  broker_name: string;
  origin_city: string;
  origin_state: string;
  dest_city: string;
  dest_state: string;
  pickup_at: string | null;
  delivery_at: string | null;
  loaded_miles: number | null;
  deadhead_miles: number | null;
  weight_lbs: number | null;
  rate: number | null;
  status: string;
  rpm: number | null;
  score: number | null;
  recommendation: string | null;
  carrier_id: string | null;
  carrier_name: string | null;
};

/**
 * Fetch all loads from the backend. Throws if the request fails.
 *
 * @param token - The Clerk session JWT. Sent as `Authorization: Bearer <token>`
 *   so the backend can verify the caller is signed in.
 */
export async function getLoads(token: string | null): Promise<Load[]> {
  return adminRequest<Load[]>("/loads", { token, errorFallback: "Failed to fetch loads" });
}

/** Fields accepted when creating a load (matches the backend LoadCreate). */
export type LoadInput = {
  broker_name: string;
  origin_city: string;
  origin_state: string;
  dest_city: string;
  dest_state: string;
  pickup_at?: string | null;
  rate?: number | null;
  loaded_miles?: number | null;
  deadhead_miles?: number | null;
  weight_lbs?: number | null;
  status?: string;
  source?: string;
  carrier_id?: string | null;
};

/** Create a load. Returns the created (and server-scored) load. */
export async function createLoad(
  token: string | null,
  input: LoadInput,
): Promise<Load> {
  return adminRequest<Load>("/loads", {
    method: "POST",
    body: input,
    token,
    errorFallback: "Failed to create load",
  });
}

/** Update a load's editable fields. Returns the updated (re-scored) load. */
export async function updateLoad(
  token: string | null,
  id: string,
  input: LoadInput,
): Promise<Load> {
  return adminRequest<Load>(`/loads/${id}`, {
    method: "PUT",
    body: input,
    token,
    errorFallback: "Failed to update load",
  });
}

/** Delete a load by id. */
export async function deleteLoad(token: string | null, id: string): Promise<void> {
  await adminRequest<void>(`/loads/${id}`, {
    method: "DELETE",
    token,
    errorFallback: "Failed to delete load",
  });
}

/** Editable broker fields. */
export type BrokerInput = {
  name: string;
  mc_number: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
};

/** A broker as returned by the API (with its load count). */
export type Broker = BrokerInput & {
  id: string;
  created_at: string;
  updated_at: string;
  load_count: number;
};

/** Fetch all brokers with their load counts (busiest first). */
export async function getBrokers(token: string | null): Promise<Broker[]> {
  return adminRequest<Broker[]>("/brokers", { token, errorFallback: "Failed to fetch brokers" });
}

/** Update a broker's fields. */
export async function updateBroker(
  token: string | null,
  id: string,
  input: BrokerInput,
): Promise<void> {
  await adminRequest<void>(`/brokers/${id}`, {
    method: "PUT",
    body: input,
    token,
    errorFallback: "Failed to update broker",
  });
}

/** Delete a broker (its loads keep their name but are unlinked). */
export async function deleteBroker(token: string | null, id: string): Promise<void> {
  await adminRequest<void>(`/brokers/${id}`, {
    method: "DELETE",
    token,
    errorFallback: "Failed to delete broker",
  });
}

/** An invoice as returned by the API. */
export type Invoice = {
  id: string;
  created_at: string;
  invoice_number: string;
  load_id: string;
  broker_id: string | null;
  amount: number | null;
  status: string; // draft | sent | viewed | paid | overdue
  issued_at: string;
  due_at: string | null;
  notes: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  pod_document_id: string | null;
  broker_name: string | null;
  lane: string | null;
};

/** Fields to create an invoice from a load. */
export type InvoiceCreateInput = {
  load_id: string;
  amount?: number | null;
  due_at?: string | null;
  notes?: string | null;
};

/** Editable invoice fields. */
export type InvoiceUpdateInput = {
  status: string;
  amount?: number | null;
  due_at?: string | null;
  notes?: string | null;
};

/** Fetch all invoices (newest first). */
export async function getInvoices(token: string | null): Promise<Invoice[]> {
  return adminRequest<Invoice[]>("/invoices", { token, errorFallback: "Failed to fetch invoices" });
}

/** Create an invoice from a load. */
export async function createInvoice(
  token: string | null,
  input: InvoiceCreateInput,
): Promise<void> {
  await adminRequest<void>("/invoices", {
    method: "POST",
    body: input,
    token,
    errorFallback: "Failed to create invoice",
  });
}

/** Update an invoice (e.g. mark paid). */
export async function updateInvoice(
  token: string | null,
  id: string,
  input: InvoiceUpdateInput,
): Promise<void> {
  await adminRequest<void>(`/invoices/${id}`, {
    method: "PUT",
    body: input,
    token,
    errorFallback: "Failed to update invoice",
  });
}

/** Delete an invoice. */
export async function deleteInvoice(token: string | null, id: string): Promise<void> {
  await adminRequest<void>(`/invoices/${id}`, {
    method: "DELETE",
    token,
    errorFallback: "Failed to delete invoice",
  });
}

/** Email an invoice to the broker and advance it to 'sent'. */
export async function sendInvoice(token: string | null, id: string): Promise<Invoice> {
  return adminRequest<Invoice>(`/invoices/${id}/send`, {
    method: "POST",
    token,
    errorFallback: "Send failed",
  });
}

/** Mark past-due sent/viewed invoices as overdue. Returns how many changed. */
export async function sweepOverdueInvoices(token: string | null): Promise<number> {
  const body = await adminRequest<{ marked_overdue: number }>("/invoices/sweep-overdue", {
    method: "POST",
    token,
    errorFallback: "Sweep failed",
  });
  return body.marked_overdue;
}

// --- Global record search (⌘K palette) -------------------------------------

/** One record match from the global search endpoint. */
export type SearchHit = {
  type: "load" | "carrier" | "broker" | "invoice";
  id: string;
  label: string;
  sublabel: string | null;
  href: string;
};

/** Search loads/carriers/brokers/invoices for a query string. */
export async function searchRecords(
  token: string | null,
  q: string,
): Promise<SearchHit[]> {
  if (q.trim().length < 2) return [];
  return adminRequest<SearchHit[]>(`/search?q=${encodeURIComponent(q)}`, {
    token,
    errorFallback: "Search failed",
  });
}

// --- Authenticated file downloads (PDFs, CSVs) -----------------------------

/** Fetch an auth-gated file as a blob (endpoints require the Bearer token). */
async function fetchAuthedBlob(token: string | null, path: string): Promise<Blob> {
  const res = await fetch(`${ADMIN_BASE_URL}${path}`, {
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const b = await res.json();
      if (b?.detail) detail = String(b.detail);
    } catch {
      // keep status
    }
    throw new Error(detail);
  }
  return res.blob();
}

/** Open an auth-gated PDF in a new browser tab (invoice, packet, settlement). */
export async function openAuthedPdf(token: string | null, path: string): Promise<void> {
  const blob = await fetchAuthedBlob(token, path);
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener");
  // Give the new tab time to load before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Download an auth-gated file (CSV export) with a filename. */
export async function downloadAuthedFile(
  token: string | null,
  path: string,
  filename: string,
): Promise<void> {
  const blob = await fetchAuthedBlob(token, path);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Open an invoice's PDF. */
export const openInvoicePdf = (token: string | null, id: string) =>
  openAuthedPdf(token, `/invoices/${id}/pdf`);

/** Open an invoice's factoring packet (invoice + rate con + POD). */
export const openFactoringPacket = (token: string | null, id: string) =>
  openAuthedPdf(token, `/invoices/${id}/factoring-packet`);

/** Download the invoices CSV export. */
export const exportInvoicesCsv = (token: string | null) =>
  downloadAuthedFile(token, `/invoices/export.csv`, "invoices.csv");

/** Download a QuickBooks Online-importable invoice CSV. */
export const exportInvoicesQuickbooks = (token: string | null) =>
  downloadAuthedFile(token, `/invoices/export.quickbooks.csv`, "invoices-quickbooks.csv");

/** Connection status for the linked QuickBooks Online company. */
export type QuickBooksStatus = {
  connected: boolean;
  realm_id?: string;
  company_name?: string | null;
  connected_at?: string;
  access_token_expires_at?: string;
};

/**
 * Read whether a QuickBooks company is connected (and its realm id). The
 * endpoint returns `{connected: false}` when nothing is linked; callers should
 * treat a thrown error (integration not enabled / not migrated) the same way.
 */
export async function getQuickBooksStatus(token: string | null): Promise<QuickBooksStatus> {
  return adminRequest<QuickBooksStatus>("/quickbooks/status", { token });
}

/** Email the broker a payment reminder (invoice attached). */
export async function remindInvoice(token: string | null, id: string): Promise<Invoice> {
  return adminRequest<Invoice>(`/invoices/${id}/remind`, { method: "POST", token });
}

// --- POD review queue (dispatcher) -----------------------------------------

/** Load context shown alongside a POD in the review queue. */
export type PodLoadContext = {
  id: string;
  lane: string;
  broker_name: string;
  carrier_name: string | null;
  rate: number | null;
  status: string;
};

/** One POD awaiting dispatcher review. */
export type PodReviewItem = {
  document: IntakeDocument;
  load: PodLoadContext | null;
};

/** List PODs awaiting review. */
export async function getPodQueue(token: string | null): Promise<PodReviewItem[]> {
  return adminRequest<PodReviewItem[]>("/pod-review", {
    token,
    errorFallback: "Failed to load POD queue",
  });
}

/** Approve a POD: marks the load delivered and auto-generates its invoice. */
export async function approvePod(token: string | null, documentId: string): Promise<Invoice> {
  return adminRequest<Invoice>(`/pod-review/${documentId}/approve`, {
    method: "POST",
    token,
    errorFallback: "Approve failed",
  });
}

/** Reject a POD. */
export async function rejectPod(token: string | null, documentId: string): Promise<void> {
  await adminRequest<void>(`/pod-review/${documentId}/reject`, {
    method: "POST",
    token,
    errorFallback: "Reject failed",
  });
}

// --- Command Center, notifications & AI assistant --------------------------

/** A dispatcher notification. */
export type AdminNotification = {
  id: string;
  created_at: string;
  severity: string; // info | warning | critical
  type: string;
  title: string;
  body: string | null;
  entity_type: string | null;
  entity_id: string | null;
  read_at: string | null;
};

/** The Command Center operational snapshot. */
export type CommandCenterSummary = {
  loads: { today: number; active: number; by_status: Record<string, number> };
  ai_tasks: { processing: number };
  review_queues: { intake_pending: number; pod_pending: number };
  messages: { unread: number };
  invoices: { by_status: Record<string, number>; outstanding: number };
  payroll: { pending: number; unpaid_total: number };
  email: { active: number };
  comms: Record<string, number>;
  profitability_today: {
    revenue: number;
    gross_profit: number;
    margin: number | null;
    load_count: number;
  };
  recent_automations: {
    action: string;
    entity_type: string;
    entity_id: string | null;
    actor: string;
    created_at: string | null;
  }[];
  notifications: {
    id: string;
    severity: string;
    type: string;
    title: string;
    body: string | null;
    created_at: string | null;
  }[];
};

/** Fetch the Command Center dashboard snapshot. */
export async function getCommandCenter(
  token: string | null,
): Promise<CommandCenterSummary> {
  return adminRequest<CommandCenterSummary>("/command-center", {
    token,
    errorFallback: "Failed to load Command Center",
  });
}

/** Ask the read-only AI assistant a question. */
export async function askAssistant(token: string | null, message: string): Promise<string> {
  const body = await adminRequest<{ answer: string }>("/assistant", {
    method: "POST",
    body: { message },
    token,
    errorFallback: "Assistant failed",
  });
  return body.answer;
}

/** List notifications (optionally unread only). */
export async function getNotifications(
  token: string | null,
  unreadOnly = false,
): Promise<AdminNotification[]> {
  return adminRequest<AdminNotification[]>(
    `/notifications${unreadOnly ? "?unread_only=true" : ""}`,
    { token, errorFallback: "Failed to load notifications" },
  );
}

/** Mark one notification read. */
export async function markNotificationRead(token: string | null, id: string): Promise<void> {
  await adminRequest<void>(`/notifications/${id}/read`, {
    method: "POST",
    token,
    errorFallback: "Failed to mark read",
  });
}

/** Mark all notifications read. */
export async function markAllNotificationsRead(token: string | null): Promise<void> {
  await adminRequest<void>("/notifications/read-all", {
    method: "POST",
    token,
    errorFallback: "Failed to mark all read",
  });
}

/** Run the notification rules engine now (returns how many were created). */
export async function runNotificationRules(token: string | null): Promise<number> {
  const body = await adminRequest<{ created: number }>("/notifications/run-rules", {
    method: "POST",
    token,
    errorFallback: "Run rules failed",
  });
  return body.created;
}

// --- Payroll ----------------------------------------------------------------

/** A payroll item (money owed to a carrier for a delivered load). */
export type PayrollItem = {
  id: string;
  created_at: string;
  load_id: string;
  carrier_id: string;
  gross_pay: number | null;
  detention: number;
  layover: number;
  bonus: number;
  lumper: number;
  fuel_advance: number;
  other_deductions: number;
  dispatcher_commission: number;
  net_pay: number | null;
  status: string; // pending | approved | paid | needs_review
  approved_at: string | null;
  paid_at: string | null;
  carrier_name: string | null;
  lane: string | null;
};

/** Editable payroll components. */
export type PayrollItemUpdate = {
  gross_pay?: number | null;
  detention?: number | null;
  layover?: number | null;
  bonus?: number | null;
  lumper?: number | null;
  fuel_advance?: number | null;
  other_deductions?: number | null;
  dispatcher_commission?: number | null;
};

/** List the payroll queue (unpaid by default; or a specific status). */
export async function getPayrollQueue(
  token: string | null,
  status?: string,
): Promise<PayrollItem[]> {
  return adminRequest<PayrollItem[]>(`/payroll${status ? `?status=${status}` : ""}`, {
    token,
    errorFallback: "Failed to load payroll",
  });
}

/** Paid payroll history. */
export async function getPayrollHistory(token: string | null): Promise<PayrollItem[]> {
  return adminRequest<PayrollItem[]>("/payroll/history", {
    token,
    errorFallback: "Failed to load history",
  });
}

/** Adjust a payroll item's components (net recomputed server-side). */
export async function updatePayrollItem(
  token: string | null,
  id: string,
  input: PayrollItemUpdate,
): Promise<PayrollItem> {
  return adminRequest<PayrollItem>(`/payroll/${id}`, {
    method: "PUT",
    body: input,
    token,
    errorFallback: "Save failed",
  });
}

async function payrollAction(
  token: string | null,
  action: "approve" | "pay",
  itemIds: string[],
): Promise<number> {
  const body = await adminRequest<Record<string, number>>(`/payroll/${action}`, {
    method: "POST",
    body: { item_ids: itemIds },
    token,
    errorFallback: `${action} failed`,
  });
  return body[action === "approve" ? "approved" : "paid"] ?? 0;
}

export const approvePayroll = (token: string | null, ids: string[]) =>
  payrollAction(token, "approve", ids);
export const payPayroll = (token: string | null, ids: string[]) =>
  payrollAction(token, "pay", ids);

// --- Settlements (carrier pay-period statements) ---------------------------

/** A settlement batch bundling payroll items for one carrier. */
export type Settlement = {
  id: string;
  created_at: string;
  carrier_id: string;
  period_start: string | null;
  period_end: string | null;
  total: number | null;
  carrier_name: string | null;
  item_count: number;
};

/** List settlement batches, newest first (optionally by carrier). */
export async function getSettlements(
  token: string | null,
  carrierId?: string,
): Promise<Settlement[]> {
  return adminRequest<Settlement[]>(
    `/payroll/settlements${carrierId ? `?carrier_id=${carrierId}` : ""}`,
    { token, errorFallback: "Failed to load settlements" },
  );
}

/** Bundle approved payroll items into a settlement statement. */
export async function createSettlement(
  token: string | null,
  itemIds: string[],
): Promise<Settlement> {
  return adminRequest<Settlement>("/payroll/settlements", {
    method: "POST",
    body: { item_ids: itemIds },
    token,
  });
}

/** Open a settlement statement PDF. */
export const openSettlementPdf = (token: string | null, batchId: string) =>
  openAuthedPdf(token, `/payroll/settlements/${batchId}/pdf`);

/** Download the payroll CSV export (optionally filtered by status). */
export const exportPayrollCsv = (token: string | null, status?: string) =>
  downloadAuthedFile(
    token,
    `/payroll/export.csv${status ? `?status=${status}` : ""}`,
    "payroll.csv",
  );

// --- Communication: inbox, templates, chat ---------------------------------

/** An AI-triaged inbound email. */
export type InboundEmail = {
  id: string;
  created_at: string;
  from_address: string;
  to_address: string | null;
  subject: string | null;
  body_text: string | null;
  classification: string;
  suggested_actions: { action: string; label: string }[] | null;
  summary: string | null;
  status: string;
  load_id: string | null;
};

/** List inbound emails (archived hidden by default). */
export async function getInbox(
  token: string | null,
  includeArchived = false,
): Promise<InboundEmail[]> {
  return adminRequest<InboundEmail[]>(
    `/inbox${includeArchived ? "?include_archived=true" : ""}`,
    { token, errorFallback: "Failed to load inbox" },
  );
}

/** Documents that arrived as attachments on an email (for the intake deep-link). */
export async function getEmailDocuments(
  token: string | null,
  emailId: string,
): Promise<IntakeDocument[]> {
  return adminRequest<IntakeDocument[]>(`/inbox/${emailId}/documents`, {
    token,
    errorFallback: "Failed to load email documents",
  });
}

async function inboxAction(
  token: string | null,
  id: string,
  action: "archive" | "handled",
): Promise<void> {
  await adminRequest<void>(`/inbox/${id}/${action}`, {
    method: "POST",
    token,
    errorFallback: "Action failed",
  });
}

export const archiveEmail = (token: string | null, id: string) =>
  inboxAction(token, id, "archive");
export const markEmailHandled = (token: string | null, id: string) =>
  inboxAction(token, id, "handled");

/** Reply to an inbound email (sends and marks handled). */
export async function replyEmail(
  token: string | null,
  id: string,
  input: { subject: string; body: string },
): Promise<void> {
  await adminRequest<void>(`/inbox/${id}/reply`, {
    method: "POST",
    body: input,
    token,
    errorFallback: "Reply failed",
  });
}

/** A customer-communication milestone template. */
export type CommTemplate = {
  id: string;
  key: string;
  subject: string;
  body: string;
  enabled: boolean;
  updated_at: string;
};

/** List milestone email templates. */
export async function getCommTemplates(token: string | null): Promise<CommTemplate[]> {
  return adminRequest<CommTemplate[]>("/comm-templates", {
    token,
    errorFallback: "Failed to load templates",
  });
}

/** Update a milestone template. */
export async function updateCommTemplate(
  token: string | null,
  key: string,
  input: { subject: string; body: string; enabled: boolean },
): Promise<CommTemplate> {
  return adminRequest<CommTemplate>(`/comm-templates/${key}`, {
    method: "PUT",
    body: input,
    token,
    errorFallback: "Save failed",
  });
}

/** A driver/dispatcher chat message. */
export type ChatMessage = {
  id: string;
  created_at: string;
  load_id: string;
  sender_role: string;
  sender_id: string;
  body: string | null;
  latitude: number | null;
  longitude: number | null;
  attachment_document_id: string | null;
  attachment_filename: string | null;
  attachment_content_type: string | null;
};

export type ChatMessageInput = {
  body?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  attachment_document_id?: string | null;
};

/** Dispatcher: list a load's chat thread (marks carrier messages read). */
export async function getLoadMessages(
  token: string | null,
  loadId: string,
): Promise<ChatMessage[]> {
  return adminRequest<ChatMessage[]>(`/loads/${loadId}/messages`, {
    token,
    errorFallback: "Failed to load messages",
  });
}

/** Dispatcher: post a message to a load's thread. */
export async function postLoadMessage(
  token: string | null,
  loadId: string,
  input: ChatMessageInput,
): Promise<ChatMessage> {
  return adminRequest<ChatMessage>(`/loads/${loadId}/messages`, {
    method: "POST",
    body: input,
    token,
    errorFallback: "Send failed",
  });
}

/** Dispatcher: upload a chat attachment; returns the stored document. */
export async function uploadAdminChatAttachment(
  token: string | null,
  loadId: string,
  file: File,
): Promise<IntakeDocument> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(`${ADMIN_BASE_URL}/loads/${loadId}/chat-attachment`, {
    method: "POST",
    cache: "no-store",
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
    throw new Error(detail);
  }
  return (await res.json()) as IntakeDocument;
}

/** Dispatcher: open a chat attachment (fetches with auth, opens in a new tab). */
export async function openAdminAttachment(
  token: string | null,
  documentId: string,
): Promise<void> {
  await openAuthedPdf(token, `/documents/${documentId}/content`);
}

/** Dispatcher: fetch a chat attachment as an object URL (for inline image previews). */
export async function fetchAdminAttachmentUrl(
  token: string | null,
  documentId: string,
): Promise<string> {
  const blob = await fetchAuthedBlob(token, `/documents/${documentId}/content`);
  return URL.createObjectURL(blob);
}

/** Dispatcher: total unread carrier messages (for the Command Center badge). */
export async function getUnreadMessageCount(token: string | null): Promise<number> {
  const body = await adminRequest<{ unread: number }>("/messages/unread-count", {
    token,
    errorFallback: "Failed to load unread count",
  });
  return body.unread;
}

/** Dispatcher: AI-summarize a load's thread. */
export async function summarizeThread(token: string | null, loadId: string): Promise<string> {
  const body = await adminRequest<{ summary: string }>(
    `/loads/${loadId}/messages/summarize`,
    { method: "POST", token, errorFallback: "Summarize failed" },
  );
  return body.summary;
}

// --- Document intake & AI load automation ----------------------------------

/** Fields the AI extracts from a document (all optional / best-effort). */
export type ExtractedFields = {
  broker_name?: string | null;
  customer?: string | null;
  origin_city?: string | null;
  origin_state?: string | null;
  dest_city?: string | null;
  dest_state?: string | null;
  pickup_at?: string | null;
  delivery_at?: string | null;
  commodity?: string | null;
  weight_lbs?: number | null;
  rate?: number | null;
  loaded_miles?: number | null;
  reference_numbers?: string | null;
  equipment?: string | null;
  driver?: string | null;
  carrier?: string | null;
  notes?: string | null;
};

/** A freight document in the AI intake pipeline (matches backend DocumentRead). */
export type IntakeDocument = {
  id: string;
  created_at: string;
  updated_at: string;
  type: string; // rate_confirmation | load_tender | bol | pod | ...
  status: string; // uploaded | processing | extracted | failed | approved | rejected
  filename: string;
  content_type: string;
  extraction:
    | { document_type?: string; confidence?: number; fields?: ExtractedFields }
    | null;
  extraction_error: string | null;
  load_id: string | null;
  carrier_id: string | null;
  expires_at: string | null;
  content_url: string;
};

/** List documents, optionally filtered by status. */
export async function getDocuments(
  token: string | null,
  status?: string,
): Promise<IntakeDocument[]> {
  return adminRequest<IntakeDocument[]>(`/documents${status ? `?status=${status}` : ""}`, {
    token,
    errorFallback: "Failed to fetch documents",
  });
}

/** Documents linked to a specific load (rate con, POD, receipts…). */
export async function getLoadDocuments(
  token: string | null,
  loadId: string,
): Promise<IntakeDocument[]> {
  return adminRequest<IntakeDocument[]>(`/documents?load_id=${loadId}`, {
    token,
    errorFallback: "Failed to fetch documents",
  });
}

/** Upload a document for AI classification + extraction. */
export async function uploadDocument(
  token: string | null,
  file: File,
): Promise<IntakeDocument> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(`${ADMIN_BASE_URL}/documents`, {
    method: "POST",
    // Don't set Content-Type — the browser adds the multipart boundary.
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
  return (await res.json()) as IntakeDocument;
}

/** Fetch a document by id (poll while it's processing). */
export async function getDocument(token: string | null, id: string): Promise<IntakeDocument> {
  return adminRequest<IntakeDocument>(`/documents/${id}`, {
    token,
    errorFallback: "Failed to fetch document",
  });
}

/** Fetch a document's file bytes as an object URL for in-app preview. */
export async function fetchDocumentPreview(
  token: string | null,
  doc: IntakeDocument,
): Promise<string> {
  const res = await fetch(`${API_BASE_URL}${doc.content_url}`, {
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Failed to load preview (HTTP ${res.status})`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

/** Approve a document into a load (reviewed/edited fields). Returns the load. */
export async function approveDocument(
  token: string | null,
  id: string,
  input: LoadInput,
): Promise<Load> {
  return adminRequest<Load>(`/documents/${id}/approve`, {
    method: "POST",
    body: input,
    token,
    errorFallback: "Approve failed",
  });
}

/** Reject (discard) a document. */
export async function rejectDocument(token: string | null, id: string): Promise<void> {
  await adminRequest<void>(`/documents/${id}/reject`, {
    method: "POST",
    token,
    errorFallback: "Reject failed",
  });
}

/** Delete a document and its stored file. */
export async function deleteDocument(token: string | null, id: string): Promise<void> {
  await adminRequest<void>(`/documents/${id}`, {
    method: "DELETE",
    token,
    errorFallback: "Delete failed",
  });
}

// --- Profitability intelligence --------------------------------------------

/** Period totals for the profitability dashboard. */
export type ProfitTotals = {
  revenue: number;
  cost: number;
  gross_profit: number;
  margin: number | null;
  load_count: number;
  revenue_per_mile: number | null;
  profit_per_mile: number | null;
  operating_expenses: number;
  net_profit: number;
  net_margin: number | null;
};

/** One operating-expense category's total, for the P&L breakdown. */
export type ExpenseGroup = { category: string; amount: number };

/** One day of the revenue/profit trend series. */
export type TrendPoint = { date: string; revenue: number; profit: number };

/** Profit rollup for one customer (broker) or lane. */
export type GroupProfit = {
  label: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number | null;
  load_count: number;
};

/** The full profitability report from GET /admin/profitability. */
export type ProfitabilityReport = {
  period: string;
  start: string;
  end: string;
  totals: ProfitTotals;
  trend: TrendPoint[];
  top_customers: GroupProfit[];
  least_profitable_customers: GroupProfit[];
  best_lanes: GroupProfit[];
  worst_lanes: GroupProfit[];
  expenses_by_category: ExpenseGroup[];
};

export type ProfitabilityPeriod = "today" | "week" | "month";

/** Fetch the profitability report for a period (today | week | month). */
export async function getProfitability(
  token: string | null,
  period: ProfitabilityPeriod = "week",
): Promise<ProfitabilityReport> {
  return adminRequest<ProfitabilityReport>(`/profitability?period=${period}`, {
    token,
    errorFallback: "Failed to fetch profitability",
  });
}

// --- Operating expenses (P&L overhead) -------------------------------------

/** Operating-expense categories (mirror of the backend enum). */
export const EXPENSE_CATEGORIES = [
  "insurance",
  "software",
  "factoring",
  "office",
  "phone",
  "marketing",
  "professional",
  "wages",
  "fuel",
  "maintenance",
  "other",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

/** An operating expense (overhead not tied to a load). */
export type Expense = {
  id: string;
  incurred_on: string; // ISO date (YYYY-MM-DD)
  category: ExpenseCategory;
  description: string;
  amount: number;
  vendor: string | null;
  recurring: boolean;
  notes: string | null;
  created_at: string;
};

/** Create/update payload for an expense. */
export type ExpenseInput = {
  incurred_on: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  vendor?: string | null;
  recurring?: boolean;
  notes?: string | null;
};

/** List operating expenses, most recently incurred first. */
export async function getExpenses(token: string | null): Promise<Expense[]> {
  return adminRequest<Expense[]>("/expenses", {
    token,
    errorFallback: "Failed to load expenses",
  });
}

/** Record a new operating expense. */
export async function createExpense(
  token: string | null,
  input: ExpenseInput,
): Promise<Expense> {
  return adminRequest<Expense>("/expenses", {
    method: "POST",
    body: input,
    token,
    errorFallback: "Could not save the expense",
  });
}

/** Update an operating expense. */
export async function updateExpense(
  token: string | null,
  id: string,
  input: ExpenseInput,
): Promise<Expense> {
  return adminRequest<Expense>(`/expenses/${id}`, {
    method: "PUT",
    body: input,
    token,
    errorFallback: "Could not update the expense",
  });
}

/** Delete an operating expense. */
export async function deleteExpense(token: string | null, id: string): Promise<void> {
  await adminRequest<void>(`/expenses/${id}`, {
    method: "DELETE",
    token,
    errorFallback: "Could not delete the expense",
  });
}

/** Aggregated stats for one origin -> destination lane. */
export type LaneStat = {
  origin: string;
  destination: string;
  load_count: number;
  avg_rpm: number | null;
  avg_rate: number | null;
};

/** Fetch per-lane analytics (best average rpm first). */
export async function getLanes(token: string | null): Promise<LaneStat[]> {
  return adminRequest<LaneStat[]>("/lanes", { token, errorFallback: "Failed to fetch lanes" });
}

/** A predictive pricing recommendation for a state-to-state lane. */
export type LanePricing = {
  origin_state: string;
  dest_state: string;
  sample_count: number;
  avg_rate: number | null;
  median_rate: number | null;
  p25_rate: number | null;
  p75_rate: number | null;
  min_rate: number | null;
  max_rate: number | null;
  avg_rpm: number | null;
  suggested_rate: number | null;
  band_low: number | null;
  band_high: number | null;
  confidence: "high" | "medium" | "low" | "none";
};

/** Suggested rate for a lane, learned from historical loads (state-to-state). */
export async function getLanePricing(
  token: string | null,
  originState: string,
  destState: string,
): Promise<LanePricing> {
  return adminRequest<LanePricing>(
    `/lanes/pricing?origin_state=${originState}&dest_state=${destState}`,
    { token, errorFallback: "Failed to fetch pricing" },
  );
}

/** Full pricing board — every state-lane with rate history. */
export async function getLanePricingBoard(token: string | null): Promise<LanePricing[]> {
  return adminRequest<LanePricing[]>("/lanes/pricing/board", {
    token,
    errorFallback: "Failed to fetch pricing board",
  });
}

/** Editable carrier fields. */
export type CarrierInput = {
  name: string;
  mc_number: string | null;
  dot_number: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  // Pay profile (drives payroll).
  pay_type?: string; // percentage | flat_per_mile | flat_per_load
  pay_rate?: number | null;
  dispatcher_commission_pct?: number | null;
};

/** FMCSA/SAFER verification snapshot stored on a carrier. */
export type SaferData = {
  status: string;
  legal_name: string | null;
  dba_name: string | null;
  dot_number: string | null;
  mc_number: string | null;
  allowed_to_operate: boolean | null;
  operating_status: string | null;
  bipd_insurance_on_file: boolean | null;
  bipd_insurance_required: boolean | null;
  safety_rating: string | null;
  detail: string | null;
};

/** A carrier as returned by the API (with its assigned-load count). */
export type Carrier = CarrierInput & {
  id: string;
  created_at: string;
  updated_at: string;
  load_count: number;
  pay_type: string;
  pay_rate: number | null;
  dispatcher_commission_pct: number | null;
  docs_requested_at: string | null;
  safer_status: string | null;
  safer_checked_at: string | null;
  safer_data: SaferData | null;
};

/** Re-run the FMCSA/SAFER authority + insurance check for a carrier. */
export async function verifyCarrierSafer(
  token: string | null,
  carrierId: string,
): Promise<Carrier> {
  return adminRequest<Carrier>(`/carriers/${carrierId}/verify-safer`, {
    method: "POST",
    token,
  });
}

// --- Carrier applications (marketing-site leads) ----------------------------

/** A carrier application submitted on the public site. */
export type CarrierApplication = {
  id: string;
  created_at: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  mc_number: string | null;
  dot_number: string | null;
  equipment_type: string | null;
  truck_count: number | null;
  preferred_lanes: string | null;
  notes: string | null;
  status: string; // new | contacted | onboarded | declined
};

/** List applications (newest first), optionally by triage status. */
export async function getCarrierApplications(
  token: string | null,
  status?: string,
): Promise<CarrierApplication[]> {
  return adminRequest<CarrierApplication[]>(
    `/carrier-applications${status ? `?status=${status}` : ""}`,
    { token },
  );
}

/** Set an application's triage status (contacted / declined / …). */
export async function setApplicationStatus(
  token: string | null,
  id: string,
  status: string,
): Promise<void> {
  await adminRequest<void>(`/carrier-applications/${id}/status`, {
    method: "POST",
    body: { status },
    token,
    errorFallback: "Update failed",
  });
}

/** Onboard an applicant: creates the Carrier + auto-sends the doc packet. */
export async function onboardApplication(
  token: string | null,
  id: string,
): Promise<Carrier> {
  return adminRequest<Carrier>(`/carrier-applications/${id}/onboard`, {
    method: "POST",
    token,
    errorFallback: "Onboard failed",
  });
}

// --- Carrier compliance vault (Phase 1) -------------------------------------

/** Compliance checklist entry for one required document type. */
export type ComplianceItem = {
  present: boolean;
  document_id: string | null;
  expires_at: string | null;
  expired: boolean;
  expiring_soon: boolean;
};

/** A carrier's compliance summary (W-9 / COI / authority + overall flag). */
export type ComplianceSummary = {
  w9: ComplianceItem;
  certificate_of_insurance: ComplianceItem;
  authority_letter: ComplianceItem;
  complete: boolean;
};

/** The three compliance document types. */
export const COMPLIANCE_DOC_TYPES = [
  { value: "w9", label: "W-9" },
  { value: "certificate_of_insurance", label: "Certificate of Insurance" },
  { value: "authority_letter", label: "Authority Letter" },
] as const;

/** Fetch a carrier's compliance checklist. */
export async function getCarrierCompliance(
  token: string | null,
  carrierId: string,
): Promise<ComplianceSummary> {
  return adminRequest<ComplianceSummary>(`/carriers/${carrierId}/compliance`, {
    token,
    errorFallback: "Failed to load compliance",
  });
}

/** List a carrier's vault documents. */
export async function getCarrierDocuments(
  token: string | null,
  carrierId: string,
): Promise<IntakeDocument[]> {
  return adminRequest<IntakeDocument[]>(`/carriers/${carrierId}/documents`, {
    token,
    errorFallback: "Failed to load documents",
  });
}

/** Upload a compliance document into a carrier's vault. */
export async function uploadCarrierDocument(
  token: string | null,
  carrierId: string,
  file: File,
  docType: string,
): Promise<IntakeDocument> {
  const body = new FormData();
  body.append("file", file);
  body.append("doc_type", docType);
  const res = await fetch(`${ADMIN_BASE_URL}/carriers/${carrierId}/documents`, {
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
  return (await res.json()) as IntakeDocument;
}

/** Email the onboarding document packet to a carrier. */
export async function requestCarrierDocuments(
  token: string | null,
  carrierId: string,
): Promise<Carrier> {
  return adminRequest<Carrier>(`/carriers/${carrierId}/request-documents`, {
    method: "POST",
    token,
    errorFallback: "Request failed",
  });
}

/** Update a document's type and/or expiry (dispatcher override). */
export async function updateDocumentMeta(
  token: string | null,
  documentId: string,
  input: { type: string; expires_at?: string | null },
): Promise<IntakeDocument> {
  return adminRequest<IntakeDocument>(`/documents/${documentId}/type`, {
    method: "PATCH",
    body: input,
    token,
    errorFallback: "Update failed",
  });
}

/** Fetch all carriers with their load counts. */
export async function getCarriers(token: string | null): Promise<Carrier[]> {
  return adminRequest<Carrier[]>("/carriers", { token, errorFallback: "Failed to fetch carriers" });
}

/** Create a carrier. */
export async function createCarrier(token: string | null, input: CarrierInput): Promise<void> {
  await adminRequest<void>("/carriers", {
    method: "POST",
    body: input,
    token,
    errorFallback: "Failed to create carrier",
  });
}

/** Update a carrier. */
export async function updateCarrier(
  token: string | null,
  id: string,
  input: CarrierInput,
): Promise<void> {
  await adminRequest<void>(`/carriers/${id}`, {
    method: "PUT",
    body: input,
    token,
    errorFallback: "Failed to update carrier",
  });
}

/** Delete a carrier (its loads are unassigned). */
export async function deleteCarrier(token: string | null, id: string): Promise<void> {
  await adminRequest<void>(`/carriers/${id}`, {
    method: "DELETE",
    token,
    errorFallback: "Failed to delete carrier",
  });
}

/** Result of importing a Truckstop CSV. */
export type ImportResult = {
  imported: number;
  skipped: number;
  duplicates: number;
};

/** Upload a Truckstop CSV file to be parsed, scored, and stored. */
export async function importTruckstopCsv(
  token: string | null,
  file: File,
): Promise<ImportResult> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(`${ADMIN_BASE_URL}/loads/import`, {
    method: "POST",
    // NOTE: do NOT set Content-Type — the browser adds the multipart boundary.
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  });
  if (!res.ok) {
    throw new Error(`Import failed (HTTP ${res.status})`);
  }
  return (await res.json()) as ImportResult;
}

/** Result of re-scoring all loads. */
export type RescoreResult = {
  scored: number;
  by_recommendation: Record<string, number>;
};

/** Re-run the scoring engine over every load. */
export async function rescoreLoads(token: string | null): Promise<RescoreResult> {
  return adminRequest<RescoreResult>("/loads/rescore", {
    method: "POST",
    token,
    errorFallback: "Re-score failed",
  });
}

// --- Carrier accounts (admin: review & approve carrier sign-ups) -----------

/** A carrier login as seen by an admin reviewing sign-ups. */
export type CarrierAccount = {
  user_id: string;
  email: string | null;
  name: string | null;
  created_at: number | null;
  status: string; // "pending" | "approved" | "rejected"
  carrier_id: string | null;
  carrier_name: string | null;
};

/** Approve a carrier: link an existing carrier_id, or create one from a name. */
export type ApproveCarrierInput = {
  carrier_id?: string | null;
  new_carrier_name?: string | null;
  mc_number?: string | null;
  dot_number?: string | null;
};

/** List all carrier sign-ups (pending + approved), newest first. */
export async function getCarrierAccounts(token: string | null): Promise<CarrierAccount[]> {
  return adminRequest<CarrierAccount[]>("/carrier-accounts", {
    token,
    errorFallback: "Failed to load carrier accounts",
  });
}

/** Approve a carrier sign-up and link it to a carrier record. */
export async function approveCarrierAccount(
  token: string | null,
  userId: string,
  input: ApproveCarrierInput,
): Promise<CarrierAccount> {
  return adminRequest<CarrierAccount>(`/carrier-accounts/${userId}/approve`, {
    method: "POST",
    body: input,
    token,
    errorFallback: "Approve failed",
  });
}

/** Reject / deactivate a carrier sign-up. */
export async function rejectCarrierAccount(
  token: string | null,
  userId: string,
): Promise<CarrierAccount> {
  return adminRequest<CarrierAccount>(`/carrier-accounts/${userId}/reject`, {
    method: "POST",
    token,
    errorFallback: "Reject failed",
  });
}
