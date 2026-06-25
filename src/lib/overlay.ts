/**
 * Lightweight, context-free triggers for the site's interactive overlays.
 *
 * Buttons live in many independent client components; rather than thread a
 * context provider through all of them, they dispatch DOM custom events that
 * the single <Overlays /> client component listens for. Call these only from
 * client-side event handlers (they touch `window`).
 */

export type LegalModal = "privacy" | "terms";

export function openBooking() {
  window.dispatchEvent(new CustomEvent("ad:open-booking"));
}

export function openPortal() {
  window.dispatchEvent(new CustomEvent("ad:open-portal"));
}

export function openLegal(modal: LegalModal) {
  window.dispatchEvent(new CustomEvent<LegalModal>("ad:open-legal", { detail: modal }));
}
