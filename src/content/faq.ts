/**
 * Frequently-asked questions — the single source shared by the on-page FAQ
 * component and the FAQPage JSON-LD structured data, so they never drift.
 */
export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
  {
    q: "What percentage do you charge?",
    a: "We charge 8–10% of the gross load rate depending on fleet size and plan. Solo operators pay 10% and Professional accounts (up to 3 trucks) pay 8%. No hidden fees, no minimums.",
  },
  {
    q: "Do you work with new carriers?",
    a: "Yes. We work with newly authorized carriers as long as your MC authority is active and you carry the required insurance. We guide you through setup and help build a strong broker packet from day one.",
  },
  {
    q: "What types of freight do you handle?",
    a: "We dispatch for dry van, flatbed, reefer, and hotshot carriers. Our dispatchers specialize by equipment type to ensure they understand your rates and lane opportunities.",
  },
  {
    q: "How quickly can I get started?",
    a: "Most carriers are fully onboarded within 24–48 hours. Once we verify your MC authority, insurance, and carrier packet, your dedicated dispatcher begins sourcing loads immediately.",
  },
  {
    q: "Do I need to sign a long-term contract?",
    a: "No long-term contracts required. We operate month-to-month because we believe our results should keep you around — not a contract.",
  },
];
