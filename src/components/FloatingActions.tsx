"use client";

import { useEffect, useState } from "react";
import { openBooking } from "@/lib/overlay";
import { SUPPORT_WHATSAPP_URL } from "@/lib/support";
import { ArrowUpIcon, MessageCircle } from "./icons";

export default function FloatingActions() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showTop = scrollY > 450;
  const showBar = scrollY > 300;

  return (
    <>
      {/* WhatsApp */}
      <a
        href={SUPPORT_WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="Chat on WhatsApp"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-success text-white shadow-lg transition-transform hover:scale-110"
      >
        <MessageCircle size={22} />
      </a>

      {/* Back to top */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={`fixed bottom-20 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface/80 text-accent shadow-lg backdrop-blur-md transition-all ${
          showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <ArrowUpIcon width={20} height={20} />
      </button>

      {/* Mobile CTA bar */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t border-line bg-surface/90 p-3 backdrop-blur-md transition-transform md:hidden ${
          showBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <a
          href="#contact"
          className="flex-1 rounded-full bg-accent px-5 py-3 text-center text-sm font-semibold text-black"
        >
          Get Started
        </a>
        <button
          type="button"
          onClick={openBooking}
          className="flex-1 rounded-full border border-line px-5 py-3 text-center text-sm font-light text-ink"
        >
          Free Consultation
        </button>
      </div>
    </>
  );
}
