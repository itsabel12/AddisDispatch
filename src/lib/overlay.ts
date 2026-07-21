/**
 * Lightweight, context-free triggers for the site's interactive overlays.
 *
 * Buttons live in many independent client components; rather than thread a
 * context provider through all of them, they dispatch DOM custom events that
 * the single <Overlays /> client component listens for. Call these only from
 * client-side event handlers (they touch `window`).
 */

export function openBooking() {
  window.dispatchEvent(new CustomEvent("ad:open-booking"));
}

export function openPortal() {
  // The carrier portal is a real, separate app section (/carrier) backed by
  // Clerk + FastAPI, not an in-page overlay. Navigate there.
  window.location.href = "/carrier";
}

// Legal documents (Privacy, Terms, Carrier Agreement) are no longer overlays —
// they live at stable public routes (/privacy, /terms, /carrier-agreement).
// Link to them with next/link instead of opening a modal.
