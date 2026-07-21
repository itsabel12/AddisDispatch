import Link from "next/link";
import Logo from "./Logo";

const company = [
  { label: "About Us", href: "/#about" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Calculator", href: "/#calculator" },
];

const services = [
  "Full-Service Dispatch",
  "Rate Negotiation",
  "Load Planning",
  "Paperwork Handling",
  "24/7 Support",
];

const legal = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Carrier Agreement", href: "/carrier-agreement" },
  { label: "Contact Us", href: "/contact" },
];

const linkClass =
  "text-sm font-light text-inkMuted transition-colors hover:text-accent";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface/40 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="max-w-sm">
            <Link href="/#top" aria-label="AddisDispatch home">
              <Logo />
            </Link>
            <p className="mt-4 text-sm font-light leading-relaxed text-inkMuted">
              Premium freight dispatch for owner-operators and small carriers across all
              48 U.S. states. We keep your truck loaded and your revenue growing.
            </p>
          </div>

          {/* Company */}
          <nav aria-label="Company" className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-inkMuted/60">
              Company
            </p>
            {company.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}
            <Link href="/carrier" className={linkClass}>
              Carrier Portal
            </Link>
          </nav>

          {/* Services */}
          <nav aria-label="Services" className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-inkMuted/60">
              Services
            </p>
            {services.map((label) => (
              <Link key={label} href="/#services" className={linkClass}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Legal */}
          <nav aria-label="Legal" className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-inkMuted/60">
              Legal
            </p>
            {legal.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 text-xs font-light text-inkMuted/60 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} AddisDispatch. All rights reserved. AddisDispatch
            is a dispatch service, not a licensed freight broker.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-accent">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-accent">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
