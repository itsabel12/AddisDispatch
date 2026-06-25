import ContactForm from "./ContactForm";
import Reveal from "./Reveal";

export default function Contact() {
  return (
    <section id="contact" className="relative bg-bandDarker bg-grid py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-12">
          <Reveal>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                Request Dispatch
              </p>
              <h2 className="text-4xl font-bold tracking-tight text-offWhite sm:text-5xl">
                Put your fleet on data
              </h2>
              <p className="mt-5 max-w-md text-base font-light leading-relaxed text-mutedGrey">
                Tell us about your lanes and equipment. We&apos;ll show you how a
                data-run dispatch operation keeps your trucks moving and your
                margins protected.
              </p>

              {/* Contact details intentionally left blank — to be filled in later. */}
              <dl className="mt-10 space-y-4 text-sm">
                <div>
                  <dt className="font-medium text-offWhite">Phone</dt>
                  <dd className="font-light text-mutedGrey/60">— coming soon —</dd>
                </div>
                <div>
                  <dt className="font-medium text-offWhite">Email</dt>
                  <dd className="font-light text-mutedGrey/60">— coming soon —</dd>
                </div>
                <div>
                  <dt className="font-medium text-offWhite">Office</dt>
                  <dd className="font-light text-mutedGrey/60">— coming soon —</dd>
                </div>
              </dl>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-2xl border border-white/5 bg-bandDark/60 p-7 sm:p-9">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
