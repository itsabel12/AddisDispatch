"use client";

import { useActionState } from "react";
import { updatePassword, type ResetState } from "./actions";

const inputClass =
  "w-full rounded-xl border border-portalBorder bg-bgElevated px-4 py-3 text-sm font-normal text-textPrimary placeholder:text-textMuted/50 focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/40";

export default function ResetForm() {
  const [state, formAction, pending] = useActionState<ResetState, FormData>(updatePassword, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-textPrimary">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="At least 8 characters"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-textPrimary">
          Confirm new password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Re-enter your password"
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
        {pending ? "Updating…" : "Set new password"}
      </button>
    </form>
  );
}
