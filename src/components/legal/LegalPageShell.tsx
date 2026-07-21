/**
 * Shared chrome for the public legal document pages (Privacy, Terms, Carrier
 * Agreement). Renders the marketing site header/footer around a readable prose
 * column with a proper <h1>, an optional subheading, and a visible
 * "Last updated" date. Server component — the document content passed as
 * `children` is fully server-rendered.
 */
import type { ReactNode } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

type Props = {
  title: string;
  lastUpdated: string;
  subheading?: ReactNode;
  children: ReactNode;
};

export default function LegalPageShell({
  title,
  lastUpdated,
  subheading,
  children,
}: Props) {
  return (
    <>
      <Nav />
      <main id="main-content" tabIndex={-1} className="bg-aerial min-h-screen outline-none">
        <div className="mx-auto max-w-3xl px-6 pb-24 pt-32 lg:px-8 lg:pt-36">
          <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            {title}
          </h1>
          {subheading && (
            <p className="mt-3 text-xs font-medium uppercase tracking-wider text-accent">
              {subheading}
            </p>
          )}
          <p className="mt-4 text-sm font-light text-inkMuted/70">
            Last updated: {lastUpdated}
          </p>

          <div className="mt-10">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
