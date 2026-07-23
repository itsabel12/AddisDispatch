import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL } from "@/lib/support";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with AddisDispatch. Tell us about your lanes and equipment and request data-driven freight dispatch for your fleet.",
  alternates: { canonical: "https://addisdispatch.com/contact" },
};

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main
        id="main-content"
        tabIndex={-1}
        className="bg-aerial min-h-screen outline-none"
      >
        <section className="relative bg-grid py-24 pt-32 sm:py-32 lg:pt-36">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 lg:gap-12">
              <div>
                <p className="mb-4 text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-accent">
                  Contact Us
                </p>
                <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-balance text-ink sm:text-5xl">
                  Put your fleet on data
                </h1>
                <p className="mt-5 max-w-md text-base font-light leading-relaxed text-inkMuted">
                  Tell us about your lanes and equipment. We&apos;ll show you how a
                  data-run dispatch operation keeps your trucks moving and your
                  margins protected.
                </p>

                <dl className="mt-10 space-y-4 text-sm">
                  <div>
                    <dt className="font-medium text-ink">Phone</dt>
                    <dd className="font-light text-inkMuted">
                      <a href={`tel:${SUPPORT_PHONE_TEL}`} className="hover:text-accent">
                        {SUPPORT_PHONE_DISPLAY}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-ink">Email</dt>
                    <dd className="font-light text-inkMuted">
                      <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-accent">
                        {SUPPORT_EMAIL}
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl border border-line bg-surface/50 p-7 backdrop-blur-md sm:p-9">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
