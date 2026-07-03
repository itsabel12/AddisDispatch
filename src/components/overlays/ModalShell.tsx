"use client";

import type { ReactNode } from "react";

type ModalShellProps = {
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

/** Dimmed backdrop + centered card. Clicking the backdrop closes. */
export default function ModalShell({ onClose, children, className = "" }: ModalShellProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`relative my-8 w-full max-w-lg rounded-2xl border border-line bg-surface/90 p-7 shadow-2xl backdrop-blur-md sm:p-9 ${className}`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-xl text-inkMuted transition-colors hover:bg-elevated hover:text-ink"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
