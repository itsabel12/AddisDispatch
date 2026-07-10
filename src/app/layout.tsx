import type { Metadata } from "next";
import { Space_Grotesk, Manrope, Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

// Marketing display — geometric, techy headings
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
  display: "swap",
});

// Marketing body / UI / numerals
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

// Dispatcher portal display — characterful grotesque for headings & big numbers
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

// Dispatcher portal body — warm, highly legible humanist sans for dense data
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AddisDispatch — Dispatch, Engineered by Data",
  description:
    "AddisDispatch runs freight dispatch like a data operation: route optimization, cost-per-mile intelligence, on-time performance tracking, and carrier scoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${manrope.variable} ${bricolage.variable} ${hanken.variable}`}
    >
      <body className="bg-aerial min-h-screen bg-base font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
