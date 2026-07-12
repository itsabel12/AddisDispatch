"use client";

/**
 * Admin feedback primitives: toasts + a promise-based confirm dialog.
 *
 * One provider (`AdminFeedbackProvider`, mounted once in AdminShell) exposes two
 * hooks:
 *   const toast = useToast();      toast.success("Saved"); toast.error(msg);
 *   const confirm = useConfirm();  if (await confirm({...})) { ... }
 *
 * Replaces the old inline `setMsg` strings and `window.confirm` calls with a
 * consistent, theme-aware surface.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { CircleCheck, AlertTriangle, InfoCircle, X } from "@/components/icons";

// --- Toasts -----------------------------------------------------------------

type ToastVariant = "success" | "error" | "info";
type ToastItem = { id: number; message: string; variant: ToastVariant };

type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <AdminFeedbackProvider>");
  return ctx;
}

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-success/40 bg-success/10 text-success",
  error: "border-danger/40 bg-danger/10 text-danger",
  info: "border-border bg-card text-foreground",
};

const VARIANT_ICON: Record<ToastVariant, ReactNode> = {
  success: <CircleCheck size={18} />,
  error: <AlertTriangle size={18} />,
  info: <InfoCircle size={18} />,
};

// --- Confirm dialog ---------------------------------------------------------

type ConfirmOptions = {
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type ConfirmApi = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmApi | null>(null);

export function useConfirm(): ConfirmApi {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within <AdminFeedbackProvider>");
  return ctx;
}

// --- Provider ---------------------------------------------------------------

export function AdminFeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const push = useCallback((message: string, variant: ToastVariant) => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  }, []);

  const toastApi = useMemo<ToastApi>(
    () => ({
      success: (m) => push(m, "success"),
      error: (m) => push(m, "error"),
      info: (m) => push(m, "info"),
    }),
    [push],
  );

  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmApi>((options) => {
    setConfirmState(options);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = useCallback((ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setConfirmState(null);
  }, []);

  return (
    <ToastContext.Provider value={toastApi}>
      <ConfirmContext.Provider value={confirm}>
        {children}

        {/* Toast viewport */}
        <div className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-full max-w-sm flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-card backdrop-blur ${VARIANT_STYLES[t.variant]}`}
            >
              <span className="mt-0.5 shrink-0">{VARIANT_ICON[t.variant]}</span>
              <span className="flex-1">{t.message}</span>
              <button
                type="button"
                onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))}
                className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Confirm dialog */}
        {confirmState && (
          <div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4"
            onClick={() => settle(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              role="alertdialog"
              aria-modal="true"
            >
              <h2 className="font-heading text-lg font-semibold">{confirmState.title}</h2>
              {confirmState.body && (
                <p className="mt-2 text-sm text-muted-foreground">{confirmState.body}</p>
              )}
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => settle(false)}
                  className="rounded-lg border border-border px-3.5 py-2 text-sm font-medium hover:bg-muted"
                >
                  {confirmState.cancelLabel ?? "Cancel"}
                </button>
                <button
                  type="button"
                  autoFocus
                  onClick={() => settle(true)}
                  className={`rounded-lg px-3.5 py-2 text-sm font-semibold text-white shadow-soft transition-colors ${
                    confirmState.destructive
                      ? "bg-danger hover:bg-danger/90"
                      : "bg-accent text-black hover:bg-accentDeep"
                  }`}
                >
                  {confirmState.confirmLabel ?? "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </ConfirmContext.Provider>
    </ToastContext.Provider>
  );
}
