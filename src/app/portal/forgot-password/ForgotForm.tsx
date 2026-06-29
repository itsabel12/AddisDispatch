"use client";

import { useActionState } from "react";
import { requestReset, type ForgotState } from "./actions";

const inputClass =
  "w-full rounded-xl border border-portalBorder bg-bgElevated px-4 py-3 text-sm font-normal text-textPrimary placeholder:text-textMuted/50 focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/40";

export default function ForgotForm() {
  const [state, formAction, pending] = useActionState<ForgotState, FormData>(requestReset, undefined);

  if (state?.sent) {
    return (
      <div className="rounded-2xl border border-leafGreen/40 bg-leafGreen/10 p-6 text-center">
        <div className="text-3xl">📧</div>
        <h2 className="mt-3 text-lg font-semibold text-textPrimary">Check your email</h2>
        <p className="mt-2 text-sm font-light leading-relaxed text-textMuted">
          If an account exists for that address, we&apos;ve sent a link to reset your
          password. The link expires shortly for security.
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
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-textPrimary">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
          className={inputClass}
        />
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
        {pending ? "Sending…" : "Send reset link"}
      </button>

      <p className="text-center text-sm font-light text-textMuted">
        Remembered it?{" "}
        <a href="/portal/login" className="font-medium text-gold hover:underline">
          Sign in
        </a>
      </p>
    </form>
  );
}
