/**
 * JSON-LD structured data for the marketing homepage (server component).
 *
 * Emits Organization, WebSite, Service, and FAQPage schema so search engines can
 * render rich results (org knowledge panel, FAQ accordions) and understand what
 * AddisDispatch offers. Kept in sync with the on-page content via shared data
 * (see content/faq.ts).
 */
import { faqs } from "@/content/faq";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://addisdispatch.com";

export default function StructuredData() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "AddisDispatch",
        url: SITE_URL,
        logo: `${SITE_URL}/opengraph-image`,
        description:
          "AddisDispatch runs freight dispatch like a data operation: route optimization, cost-per-mile intelligence, on-time performance tracking, and carrier scoring for owner-operators and small fleets.",
        areaServed: { "@type": "Country", name: "United States" },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "AddisDispatch",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "Service",
        "@id": `${SITE_URL}/#service`,
        name: "Truck Dispatching Service",
        serviceType: "Freight dispatching",
        provider: { "@id": `${SITE_URL}/#organization` },
        areaServed: { "@type": "Country", name: "United States" },
        audience: {
          "@type": "Audience",
          audienceType: "Owner-operators and small trucking fleets",
        },
        offers: [
          { "@type": "Offer", name: "Solo", description: "Owner-operator dispatching", price: "8", priceCurrency: "USD", unitText: "percent of gross" },
          { "@type": "Offer", name: "Professional", description: "Up to 3 trucks", price: "10", priceCurrency: "USD", unitText: "percent of gross" },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inline; no user input is interpolated.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
