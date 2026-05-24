"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/frontend/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface ToastRecord {
  id: string;
  variant: ToastVariant;
  title?: string;
  message: string;
  duration: number;
}

interface ToastOptions {
  title?: string;
  duration?: number;
}

interface ToastApi {
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastApi | null>(null);

const DEFAULT_DURATION = 4500;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastRecord[]>([]);
  const timersRef = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const push = React.useCallback(
    (variant: ToastVariant, message: string, options?: ToastOptions) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const duration = options?.duration ?? DEFAULT_DURATION;
      setToasts((prev) => [...prev, { id, variant, message, title: options?.title, duration }]);
      const timer = setTimeout(() => dismiss(id), duration);
      timersRef.current.set(id, timer);
      return id;
    },
    [dismiss]
  );

  const api = React.useMemo<ToastApi>(
    () => ({
      success: (message, options) => push("success", message, options),
      error: (message, options) => push("error", message, options),
      info: (message, options) => push("info", message, options),
      dismiss,
    }),
    [push, dismiss]
  );

  React.useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside a <ToastProvider>");
  }
  return ctx;
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastRecord[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-end gap-2 px-4 pb-4 sm:px-6 sm:pb-6"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} record={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({
  record,
  onDismiss,
}: {
  record: ToastRecord;
  onDismiss: () => void;
}) {
  const { variant, title, message } = record;
  const Icon = variant === "success" ? CheckCircle2 : variant === "error" ? AlertCircle : Info;
  const accent =
    variant === "success"
      ? "text-sage"
      : variant === "error"
        ? "text-clay"
        : "text-steel";
  const role = variant === "error" ? "alert" : "status";

  return (
    <div
      role={role}
      className={cn(
        "pointer-events-auto w-full max-w-sm",
        "flex items-start gap-3 rounded border border-rule bg-paper/97 px-4 py-3",
        "shadow-[var(--shadow-elevated)] backdrop-blur-sm",
        "toast-enter"
      )}
    >
      <Icon size={18} strokeWidth={1.75} className={cn("mt-0.5 shrink-0", accent)} />
      <div className="min-w-0 flex-1">
        {title && (
          <p className="text-[0.8125rem] font-semibold leading-tight text-ink">{title}</p>
        )}
        <p
          className={cn(
            "text-[0.8125rem] leading-snug text-graphite",
            title && "mt-0.5"
          )}
        >
          {message}
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="-mr-1 -mt-1 shrink-0 rounded p-1 text-muted hover:bg-paper2 hover:text-ink transition-colors"
      >
        <X size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
