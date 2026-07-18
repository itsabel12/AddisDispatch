"use client";

import { useState, type FormEvent } from "react";
import { CheckIcon } from "./icons";
import TurnstileWidget, { turnstileConfigured } from "./TurnstileWidget";

type Fields = {
  company: string;
  contact: string;
  email: string;
  phone: string;
  mc: string;
  dot: string;
  equipment: string;
  trucks: string;
  lanes: string;
  notes: string;
};

type Errors = Partial<Record<keyof Fields, string>>;

const empty: Fields = {
  company: "",
  contact: "",
  email: "",
  phone: "",
  mc: "",
  dot: "",
  equipment: "",
  trucks: "",
  lanes: "",
  notes: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EQUIPMENT_OPTIONS = [
  { value: "", label: "Select equipment…" },
  { value: "dry_van", label: "Dry Van" },
  { value: "reefer", label: "Reefer" },
  { value: "flatbed", label: "Flatbed" },
  { value: "step_deck", label: "Step Deck" },
  { value: "power_only", label: "Power Only" },
  { value: "box_truck", label: "Box Truck" },
  { value: "other", label: "Other" },
];

const inputClass =
  "w-full rounded-xl border border-line bg-elevated/70 px-4 py-3 text-sm font-light text-ink placeholder:text-inkMuted/50 focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40";

export default function CarrierApplicationForm() {
  const [fields, setFields] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);

  function validate(values: Fields): Errors {
    const next: Errors = {};
    if (!values.company.trim()) next.company = "Enter your company name.";
    if (!values.contact.trim()) next.contact = "Enter a contact name.";
    if (!values.email.trim()) {
      next.email = "Enter your email.";
    } else if (!emailPattern.test(values.email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (!values.equipment) next.equipment = "Select your equipment type.";
    if (values.trucks && (!/^\d+$/.test(values.trucks) || Number(values.trucks) < 1)) {
      next.trucks = "Enter a number of trucks (1 or more).";
    }
    return next;
  }

  function update<K extends keyof Fields>(key: K, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    if (turnstileConfigured && !captchaToken) {
      setSubmitError("Please complete the verification below.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const res = await fetch("/api/leads/carrier-application", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_name: fields.company.trim(),
        contact_name: fields.contact.trim(),
        email: fields.email.trim(),
        phone: fields.phone.trim() || null,
        mc_number: fields.mc.trim() || null,
        dot_number: fields.dot.trim() || null,
        equipment_type: fields.equipment || null,
        truck_count: fields.trucks ? Number(fields.trucks) : null,
        preferred_lanes: fields.lanes.trim() || null,
        notes: fields.notes.trim() || null,
        turnstileToken: captchaToken,
      }),
    });

    setSubmitting(false);
    setCaptchaToken(null);
    setCaptchaReset((n) => n + 1);

    if (!res.ok) {
      setSubmitError("Something went wrong submitting your application. Please try again.");
      return;
    }

    setSubmitted(true);
    setFields(empty);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-success/40 bg-surface/60 p-12 text-center backdrop-blur-md">
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckIcon />
        </span>
        <h3 className="font-display text-xl font-semibold text-ink">Application received</h3>
        <p className="mt-2 max-w-sm text-sm font-light text-inkMuted">
          Thanks — we&apos;ll review your details and reach out within one business
          day to get you onboarded.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm font-medium text-accent hover:underline"
        >
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="company" label="Company name" required value={fields.company} error={errors.company} onChange={(v) => update("company", v)} />
        <Field id="contact" label="Contact name" required value={fields.contact} error={errors.contact} onChange={(v) => update("contact", v)} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="email" label="Email" type="email" required value={fields.email} error={errors.email} onChange={(v) => update("email", v)} />
        <Field id="phone" label="Phone" type="tel" value={fields.phone} onChange={(v) => update("phone", v)} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="mc" label="MC #" value={fields.mc} onChange={(v) => update("mc", v)} />
        <Field id="dot" label="DOT #" value={fields.dot} onChange={(v) => update("dot", v)} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="equipment" className="mb-1.5 block text-sm font-medium text-ink">
            Equipment type <span className="text-accent">*</span>
          </label>
          <select
            id="equipment"
            value={fields.equipment}
            onChange={(e) => update("equipment", e.target.value)}
            aria-invalid={!!errors.equipment}
            aria-describedby={errors.equipment ? "equipment-error" : undefined}
            className={inputClass}
          >
            {EQUIPMENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-surface text-ink">
                {o.label}
              </option>
            ))}
          </select>
          {errors.equipment && (
            <p id="equipment-error" className="mt-1.5 text-xs text-accent">
              {errors.equipment}
            </p>
          )}
        </div>
        <Field
          id="trucks"
          label="Number of trucks"
          type="number"
          value={fields.trucks}
          error={errors.trucks}
          onChange={(v) => update("trucks", v)}
        />
      </div>

      <div>
        <label htmlFor="lanes" className="mb-1.5 block text-sm font-medium text-ink">
          Preferred lanes
        </label>
        <input
          id="lanes"
          value={fields.lanes}
          onChange={(e) => update("lanes", e.target.value)}
          placeholder="e.g. TX → Southeast, Midwest regional…"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-ink">
          Anything else we should know?
        </label>
        <textarea
          id="notes"
          rows={3}
          value={fields.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Current situation, goals, questions…"
          className={`${inputClass} resize-none`}
        />
      </div>

      <TurnstileWidget onVerify={setCaptchaToken} resetSignal={captchaReset} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_30px_-4px] hover:shadow-accent/60 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {submitting ? "Submitting…" : "Apply to Ride With Us"}
        </button>
        {submitError && (
          <p role="alert" className="text-sm text-danger">
            {submitError}
          </p>
        )}
      </div>
    </form>
  );
}

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  error?: string;
};

function Field({ id, label, value, onChange, type = "text", required, error }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputClass}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-accent">
          {error}
        </p>
      )}
    </div>
  );
}
