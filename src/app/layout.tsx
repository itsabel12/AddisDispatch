import type { Metadata } from "next";
import Script from "next/script";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

// Canonical site origin (override per-environment). Used for metadataBase,
// OpenGraph/Twitter absolute URLs, sitemap, and robots.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://addisdispatch.com";
// Cookieless Plausible analytics — only loads when a domain is configured.
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

// Display — a distinctive editorial grotesque for headlines & big numbers,
// across both the marketing site and the dispatcher portal.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

// Body — warm, highly legible humanist sans for copy and dense data.
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hanken",
  display: "swap",
});

const TITLE = "AddisDispatch — Dispatch, Engineered by Data";
const DESCRIPTION =
  "AddisDispatch runs freight dispatch like a data operation: route optimization, cost-per-mile intelligence, on-time performance tracking, and carrier scoring.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — AddisDispatch",
  },
  description: DESCRIPTION,
  applicationName: "AddisDispatch",
  keywords: [
    "freight dispatch",
    "truck dispatch service",
    "owner operator dispatch",
    "carrier dispatching",
    "load board",
    "trucking back office",
  ],
  authors: [{ name: "AddisDispatch" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "AddisDispatch",
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${hanken.variable}`}
    >
      <body className="bg-aerial min-h-screen bg-base font-sans text-ink antialiased [text-rendering:optimizeLegibility]">
        {children}
        {PLAUSIBLE_DOMAIN && (
          <Script
            defer
            data-domain={PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
