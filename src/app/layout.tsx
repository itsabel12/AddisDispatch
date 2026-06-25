import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
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
    <html lang="en" className={poppins.variable}>
      <body className="min-h-screen bg-seaGrey font-sans text-offWhite antialiased">
        {children}
      </body>
    </html>
  );
}
