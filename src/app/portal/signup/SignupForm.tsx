"use client";

import { useActionState } from "react";
import { signup, type SignupState } from "./actions";

const inputClass =
  "w-full rounded-xl border border-portalBorder bg-bgElevated px-4 py-3 text-sm font-normal text-textPrimary placeholder:text-textMuted/50 focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/40";

export default function SignupForm() {
  const [state, formAction, pending] = useActionState<SignupState, FormData>(signup, undefined);

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-leafGreen/40 bg-leafGreen/10 p-6 text-center">
        <div className="text-3xl">✅</div>
        <h2 className="mt-3 text-lg font-semibold text-textPrimary">Application received</h2>
        <p className="mt-2 text-sm font-light leading-relaxed text-textMuted">
          Your carrier account is pending approval. We&apos;ll review your authority and
          activate your portal — you&apos;ll be able to sign in once approved. Check your
          email if a confirmation link was sent.
        </p>
        <a
          href="/portal/login"
          className="mt-5 inline-block rounded-full border border-portalBorder px-6 py-2.5 text-sm font-medium text-textPrimary hover:border-gold/50 hover:text-gold"
        >
          Back to sign in
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="company_name" className="mb-1.5 block text-sm font-medium text-textPrimary">
          Company name
        </label>
        <input id="company_name" name="company_name" required placeholder="Summit Freight LLC" className={inputClass} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="mc_number" className="mb-1.5 block text-sm font-medium text-textPrimary">
            MC number
          </label>
          <input id="mc_number" name="mc_number" placeholder="MC-123456" className={inputClass} />
        </div>
        <div>
          <label htmlFor="full_name" className="mb-1.5 block text-sm font-medium text-textPrimary">
            Contact name
          </label>
          <input id="full_name" name="full_name" required placeholder="Jane Smith" className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-textPrimary">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" className={inputClass} />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-textPrimary">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="new-password" required placeholder="At least 8 characters" className={inputClass} />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-red-400">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_30px_-4px] hover:shadow-gold/50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm font-light text-textMuted">
        Already a carrier?{" "}
        <a href="/portal/login" className="font-medium text-gold hover:underline">
          Sign in
        </a>
      </p>
    </form>
  );
}
