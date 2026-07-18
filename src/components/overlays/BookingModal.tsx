"use client";

import { useState } from "react";
import ModalShell from "./ModalShell";
import TurnstileWidget, { turnstileConfigured } from "@/components/TurnstileWidget";
import { CircleCheck, Calendar, Phone } from "@/components/icons";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIMES = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];

const steps = ["1 · Date", "2 · Time", "3 · Confirm"];

export default function BookingModal({ onClose }: { onClose: () => void }) {
  const now = new Date();
  const [step, setStep] = useState(1);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: boolean; phone?: boolean }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
    setDay(null);
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
    setDay(null);
  }

  async function confirm() {
    const next = {
      name: !name.trim(),
      phone: phone.replace(/\D/g, "").length < 10,
    };
    setErrors(next);
    if (next.name || next.phone || day === null || !time) return;

    if (turnstileConfigured && !captchaToken) {
      setSubmitError("Please complete the verification below.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const scheduledDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const res = await fetch("/api/leads/consultation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        phone: phone.trim(),
        scheduled_date: scheduledDate,
        scheduled_time: time,
        turnstileToken: captchaToken,
      }),
    });

    setSubmitting(false);
    setCaptchaToken(null);
    setCaptchaReset((n) => n + 1);

    if (!res.ok) {
      setSubmitError("Couldn't confirm your booking. Please try again.");
      return;
    }

    setStep(4);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <ModalShell onClose={onClose}>
      <h2 className="pr-10 font-display text-2xl font-bold text-ink">Book a Free Consultation</h2>
      <p className="mt-2 text-sm font-light text-inkMuted">
        15-minute call with a dispatcher — no commitment required.
      </p>

      {/* Stepper */}
      {step < 4 && (
        <div className="mt-6 flex gap-2">
          {steps.map((label, i) => {
            const n = i + 1;
            const active = n === step;
            const done = n < step;
            return (
              <div
                key={label}
                className={`flex-1 rounded-lg border px-2 py-2 text-center text-xs font-medium transition-colors ${
                  active
                    ? "border-accent/50 bg-accent/10 text-accent"
                    : done
                      ? "border-success/40 bg-success/10 text-success"
                      : "border-line text-inkMuted/60"
                }`}
              >
                {label}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        {step === 1 && (
          <div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={prevMonth}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-inkMuted hover:text-ink"
              >
                ←
              </button>
              <span className="text-sm font-semibold text-ink">
                {MONTHS[month]} {year}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-inkMuted hover:text-ink"
              >
                →
              </button>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1 text-center">
              {DAYS.map((d) => (
                <div key={d} className="py-1 text-xs font-medium text-inkMuted/50">
                  {d}
                </div>
              ))}
              {Array.from({ length: firstWeekday }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d = i + 1;
                const dt = new Date(year, month, d);
                const weekend = dt.getDay() === 0 || dt.getDay() === 6;
                const disabled = dt < today || weekend;
                const selected = day === d;
                return (
                  <button
                    key={d}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setDay(d);
                      setStep(2);
                    }}
                    className={`aspect-square rounded-lg text-sm transition-colors ${
                      disabled
                        ? "cursor-not-allowed text-inkMuted/25"
                        : selected
                          ? "bg-accent font-semibold text-black"
                          : "text-ink hover:bg-accent/15 hover:text-accent"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-xs font-light text-inkMuted/60">Available Mon–Fri only</p>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-sm font-light text-inkMuted">
              Pick a time for{" "}
              <strong className="text-ink">
                {MONTHS[month]} {day}, {year}
              </strong>
              :
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TIMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTime(t);
                    setStep(3);
                  }}
                  className={`rounded-lg border px-2 py-2.5 text-sm transition-colors ${
                    time === t
                      ? "border-accent/50 bg-accent/10 text-accent"
                      : "border-line text-ink hover:border-accent/40 hover:text-accent"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm font-medium text-inkMuted hover:text-ink"
              >
                ← Back
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="space-y-1.5 rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm text-ink">
              <p className="flex items-center gap-2">
                <Calendar size={16} className="text-accentDeep" />
                {MONTHS[month]} {day}, {year} · {time}
              </p>
              <p className="flex items-center gap-2">
                <Phone size={16} className="text-accentDeep" />
                15-min phone consultation with a dispatcher
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="bk-name" className="mb-1.5 block text-sm font-medium text-ink">
                  Your Name <span className="text-accent">*</span>
                </label>
                <input
                  id="bk-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  className={`w-full rounded-xl border bg-elevated px-4 py-3 text-sm font-light text-ink placeholder:text-inkMuted/50 focus:outline-none focus:ring-1 focus:ring-accent/40 ${
                    errors.name ? "border-red-500" : "border-line focus:border-accent/60"
                  }`}
                />
              </div>
              <div>
                <label htmlFor="bk-phone" className="mb-1.5 block text-sm font-medium text-ink">
                  Phone Number <span className="text-accent">*</span>
                </label>
                <input
                  id="bk-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className={`w-full rounded-xl border bg-elevated px-4 py-3 text-sm font-light text-ink placeholder:text-inkMuted/50 focus:outline-none focus:ring-1 focus:ring-accent/40 ${
                    errors.phone ? "border-red-500" : "border-line focus:border-accent/60"
                  }`}
                />
              </div>
            </div>

            <div className="mt-4">
              <TurnstileWidget onVerify={setCaptchaToken} resetSignal={captchaReset} />
            </div>

            {submitError && (
              <p role="alert" className="mt-4 text-sm text-red-400">
                {submitError}
              </p>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-sm font-medium text-inkMuted hover:text-ink"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={submitting}
                className="flex-1 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-black transition-all hover:shadow-[0_0_24px_-4px] hover:shadow-accent/60 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Confirming…" : "Confirm Booking →"}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="py-4 text-center">
            <CircleCheck size={56} className="mx-auto text-success" />
            <h3 className="mt-4 font-display text-xl font-semibold text-ink">You&apos;re Booked!</h3>
            <p className="mt-3 text-sm font-light leading-relaxed text-inkMuted">
              Your consultation is confirmed for{" "}
              <strong className="text-ink">
                {MONTHS[month]} {day}, {year} at {time}
              </strong>
              .
              <br />
              <br />
              A dispatcher will call you at the number provided. Have your MC number and
              equipment details ready.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-black transition-all hover:shadow-[0_0_24px_-4px] hover:shadow-accent/60"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </ModalShell>
  );
}
