"use client";

import { useState, type FormEvent } from "react";
import { CheckIcon } from "./icons";
import { createClient } from "@/lib/supabase/client";

type Fields = {
  name: string;
  company: string;
  mc: string;
  email: string;
  lane: string;
};

type Errors = Partial<Record<keyof Fields, string>>;

const empty: Fields = { name: "", company: "", mc: "", email: "", lane: "" };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm() {
  const [fields, setFields] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function validate(values: Fields): Errors {
    const next: Errors = {};
    if (!values.name.trim()) next.name = "Please enter your name.";
    if (!values.email.trim()) {
      next.email = "Please enter your email.";
    } else if (!emailPattern.test(values.email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (!values.lane.trim()) next.lane = "Tell us a bit about your lanes.";
    return next;
  }

  function update<K extends keyof Fields>(key: K, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);

    const supabase = createClient();
    const { error } = await supabase.from("dispatch_requests").insert({
      name: fields.name.trim(),
      company: fields.company.trim() || null,
      mc_number: fields.mc.trim() || null,
      email: fields.email.trim(),
      lane_details: fields.lane.trim(),
    });

    setSubmitting(false);

    if (error) {
      setSubmitError("Something went wrong submitting your request. Please try again.");
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
        <h3 className="font-display text-xl font-semibold text-ink">Request received</h3>
        <p className="mt-2 max-w-sm text-sm font-light text-inkMuted">
          Thanks — your dispatch request is in. We&apos;ll be in touch shortly.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm font-medium text-accent hover:underline"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="name"
          label="Name"
          required
          value={fields.name}
          error={errors.name}
          onChange={(v) => update("name", v)}
        />
        <Field
          id="company"
          label="Company"
          value={fields.company}
          onChange={(v) => update("company", v)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="mc"
          label="MC #"
          value={fields.mc}
          onChange={(v) => update("mc", v)}
        />
        <Field
          id="email"
          label="Email"
          type="email"
          required
          value={fields.email}
          error={errors.email}
          onChange={(v) => update("email", v)}
        />
      </div>

      <div>
        <label htmlFor="lane" className="mb-1.5 block text-sm font-medium text-ink">
          Lane details <span className="text-accent">*</span>
        </label>
        <textarea
          id="lane"
          rows={4}
          value={fields.lane}
          onChange={(e) => update("lane", e.target.value)}
          aria-invalid={!!errors.lane}
          aria-describedby={errors.lane ? "lane-error" : undefined}
          placeholder="Origin, destination, equipment, typical frequency…"
          className="w-full resize-none rounded-xl border border-line bg-elevated/70 px-4 py-3 text-sm font-light text-ink placeholder:text-inkMuted/50 focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40"
        />
        {errors.lane && (
          <p id="lane-error" className="mt-1.5 text-xs text-accent">
            {errors.lane}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_30px_-4px] hover:shadow-accent/60 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {submitting ? "Submitting…" : "Request Dispatch"}
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
        className="w-full rounded-xl border border-line bg-elevated/70 px-4 py-3 text-sm font-light text-ink placeholder:text-inkMuted/50 focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40"
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-accent">
          {error}
        </p>
      )}
    </div>
  );
}
