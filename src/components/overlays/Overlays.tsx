"use client";

import { useEffect, useState } from "react";
import type { LegalModal } from "@/lib/overlay";
import BookingModal from "./BookingModal";
import CarrierPortal from "./CarrierPortal";
import LegalModalView from "./LegalModal";

/**
 * Single mount point for all the site's interactive overlays. Lives once at the
 * page root and opens in response to the `ad:*` custom events dispatched by the
 * trigger helpers in `@/lib/overlay`.
 */
export default function Overlays() {
  const [booking, setBooking] = useState(false);
  const [portal, setPortal] = useState(false);
  const [legal, setLegal] = useState<LegalModal | null>(null);

  useEffect(() => {
    const onBooking = () => setBooking(true);
    const onPortal = () => setPortal(true);
    const onLegal = (e: Event) =>
      setLegal((e as CustomEvent<LegalModal>).detail ?? "privacy");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setBooking(false);
        setPortal(false);
        setLegal(null);
      }
    };

    window.addEventListener("ad:open-booking", onBooking);
    window.addEventListener("ad:open-portal", onPortal);
    window.addEventListener("ad:open-legal", onLegal);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("ad:open-booking", onBooking);
      window.removeEventListener("ad:open-portal", onPortal);
      window.removeEventListener("ad:open-legal", onLegal);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Lock body scroll while any overlay is open.
  useEffect(() => {
    const anyOpen = booking || portal || legal !== null;
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [booking, portal, legal]);

  return (
    <>
      {booking && <BookingModal onClose={() => setBooking(false)} />}
      {portal && <CarrierPortal onClose={() => setPortal(false)} />}
      {legal && <LegalModalView modal={legal} onClose={() => setLegal(null)} />}
    </>
  );
}
