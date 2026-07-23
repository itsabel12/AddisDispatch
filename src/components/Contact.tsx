import ContactForm from "./ContactForm";
import Reveal from "./Reveal";
import { SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL } from "@/lib/support";

export default function Contact() {
  return (
    <section id="contact" className="relative bg-grid py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-12">
          <Reveal>
            <div>
              <p className="mb-4 text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-accent">
                Request Dispatch
              </p>
              <h2 className="font-display text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-balance text-ink sm:text-5xl">
                Put your fleet on data
              </h2>
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
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-2xl border border-line bg-surface/50 p-7 backdrop-blur-md sm:p-9">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
