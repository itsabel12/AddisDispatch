"use client";

import { useState } from "react";
import ModalShell from "./ModalShell";

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

  function confirm() {
    const next = {
      name: !name.trim(),
      phone: phone.replace(/\D/g, "").length < 10,
    };
    setErrors(next);
    if (!next.name && !next.phone) setStep(4);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <ModalShell onClose={onClose}>
      <h2 className="pr-10 text-2xl font-bold text-offWhite">Book a Free Consultation</h2>
      <p className="mt-2 text-sm font-light text-mutedGrey">
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
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : done
                      ? "border-leafGreen/40 bg-leafGreen/10 text-leafGreen"
                      : "border-white/10 text-mutedGrey/60"
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
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-mutedGrey hover:text-offWhite"
              >
                ←
              </button>
              <span className="text-sm font-semibold text-offWhite">
                {MONTHS[month]} {year}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-mutedGrey hover:text-offWhite"
              >
                →
              </button>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1 text-center">
              {DAYS.map((d) => (
                <div key={d} className="py-1 text-xs font-medium text-mutedGrey/50">
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
                        ? "cursor-not-allowed text-mutedGrey/25"
                        : selected
                          ? "bg-gold font-semibold text-bandDarker"
                          : "text-offWhite hover:bg-gold/15 hover:text-gold"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-xs font-light text-mutedGrey/60">Available Mon–Fri only</p>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-sm font-light text-mutedGrey">
              Pick a time for{" "}
              <strong className="text-offWhite">
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
                      ? "border-gold/50 bg-gold/10 text-gold"
                      : "border-white/10 text-offWhite hover:border-gold/40 hover:text-gold"
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
                className="text-sm font-medium text-mutedGrey hover:text-offWhite"
              >
                ← Back
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 text-sm text-offWhite">
              📅 {MONTHS[month]} {day}, {year} · {time}
              <br />
              📞 15-min phone consultation with a dispatcher
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="bk-name" className="mb-1.5 block text-sm font-medium text-offWhite">
                  Your Name <span className="text-gold">*</span>
                </label>
                <input
                  id="bk-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  className={`w-full rounded-xl border bg-bandDarker px-4 py-3 text-sm font-light text-offWhite placeholder:text-mutedGrey/50 focus:outline-none focus:ring-1 focus:ring-gold/40 ${
                    errors.name ? "border-red-500" : "border-white/10 focus:border-gold/60"
                  }`}
                />
              </div>
              <div>
                <label htmlFor="bk-phone" className="mb-1.5 block text-sm font-medium text-offWhite">
                  Phone Number <span className="text-gold">*</span>
                </label>
                <input
                  id="bk-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className={`w-full rounded-xl border bg-bandDarker px-4 py-3 text-sm font-light text-offWhite placeholder:text-mutedGrey/50 focus:outline-none focus:ring-1 focus:ring-gold/40 ${
                    errors.phone ? "border-red-500" : "border-white/10 focus:border-gold/60"
                  }`}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-sm font-medium text-mutedGrey hover:text-offWhite"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={confirm}
                className="flex-1 rounded-full bg-gold px-7 py-3 text-sm font-semibold text-bandDarker transition-all hover:shadow-[0_0_24px_-4px] hover:shadow-gold/60"
              >
                Confirm Booking →
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="py-4 text-center">
            <div className="text-5xl">✅</div>
            <h3 className="mt-4 text-xl font-semibold text-offWhite">You&apos;re Booked!</h3>
            <p className="mt-3 text-sm font-light leading-relaxed text-mutedGrey">
              Your consultation is confirmed for{" "}
              <strong className="text-offWhite">
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
              className="mt-6 rounded-full bg-gold px-7 py-3 text-sm font-semibold text-bandDarker transition-all hover:shadow-[0_0_24px_-4px] hover:shadow-gold/60"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </ModalShell>
  );
}
