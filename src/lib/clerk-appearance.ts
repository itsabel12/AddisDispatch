/**
 * Shared Clerk appearance for the dispatcher portal's light theme, so the
 * embedded <SignIn/> widget matches the redesigned auth screens instead of
 * rendering Clerk's default card. Used by the login page and the RequireAdmin
 * gate.
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#ef7f18",
    colorText: "#23201b",
    colorTextSecondary: "#857b6c",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#23201b",
    colorDanger: "#dc2b2b",
    borderRadius: "0.75rem",
    fontSize: "0.9rem",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none border-0",
    card: "w-full shadow-none border-0 bg-transparent p-0",
    header: "hidden",
    footer: "bg-transparent",
    formButtonPrimary:
      "bg-[#ef7f18] hover:bg-[#d96f0c] text-[#1a1712] text-sm font-semibold normal-case shadow-none",
    formFieldInput: "rounded-xl border-[#e2d7c5]",
    socialButtonsBlockButton: "rounded-xl border-[#e2d7c5]",
  },
} as const;
