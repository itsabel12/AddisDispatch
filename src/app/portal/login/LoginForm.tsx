"use client";

import { useActionState } from "react";
import { login, type AuthState } from "./actions";

const inputClass =
  "w-full rounded-xl border border-portalBorder bg-bgElevated px-4 py-3 text-sm font-normal text-textPrimary placeholder:text-textMuted/50 focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/40";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(login, undefined);

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

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-textPrimary">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
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
        {pending ? "Signing in…" : "Sign In"}
      </button>

      <p className="text-center text-sm font-light text-textMuted">
        New carrier?{" "}
        <a href="/portal/signup" className="font-medium text-gold hover:underline">
          Create an account
        </a>
      </p>
    </form>
  );
}
