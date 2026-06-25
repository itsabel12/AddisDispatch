"use client";

import { openPortal, openLegal } from "@/lib/overlay";

const company = [
  { label: "About Us", href: "#about" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Calculator", href: "#calculator" },
];

const services = [
  "Full-Service Dispatch",
  "Rate Negotiation",
  "Load Planning",
  "Paperwork Handling",
  "24/7 Support",
];

const linkClass =
  "text-sm font-light text-mutedGrey transition-colors hover:text-gold";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-bandDarker">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="max-w-sm">
            <a href="#top" className="flex items-center gap-2" aria-label="AddisDispatch home">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-gold" />
              <span className="text-lg font-bold tracking-tight text-gold">
                Addis<span className="text-offWhite">Dispatch</span>
              </span>
            </a>
            <p className="mt-4 text-sm font-light leading-relaxed text-mutedGrey">
              Premium freight dispatch for owner-operators and small carriers across all
              48 U.S. states. We keep your truck loaded and your revenue growing.
            </p>
          </div>

          {/* Company */}
          <nav aria-label="Company" className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mutedGrey/60">
              Company
            </p>
            {company.map((link) => (
              <a key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </a>
            ))}
            <button type="button" onClick={openPortal} className={`text-left ${linkClass}`}>
              Carrier Portal
            </button>
          </nav>

          {/* Services */}
          <nav aria-label="Services" className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mutedGrey/60">
              Services
            </p>
            {services.map((label) => (
              <a key={label} href="#services" className={linkClass}>
                {label}
              </a>
            ))}
          </nav>

          {/* Legal */}
          <nav aria-label="Legal" className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mutedGrey/60">
              Legal
            </p>
            <button type="button" onClick={() => openLegal("privacy")} className={`text-left ${linkClass}`}>
              Privacy Policy
            </button>
            <button type="button" onClick={() => openLegal("terms")} className={`text-left ${linkClass}`}>
              Terms of Service
            </button>
            <button type="button" onClick={() => openLegal("terms")} className={`text-left ${linkClass}`}>
              Carrier Agreement
            </button>
            <a href="#contact" className={linkClass}>
              Contact Us
            </a>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/5 pt-6 text-xs font-light text-mutedGrey/60 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} AddisDispatch. All rights reserved. AddisDispatch
            is a dispatch service, not a licensed freight broker.
          </p>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => openLegal("privacy")} className="hover:text-gold">
              Privacy Policy
            </button>
            <button type="button" onClick={() => openLegal("terms")} className="hover:text-gold">
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
