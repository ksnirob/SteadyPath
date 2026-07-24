"use client";

import { CheckCircle2, Info, Trash2, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "info" | "destructive";

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastContextValue = {
  showToast(input: ToastInput): void;
  success(title: string, description?: string): void;
  info(title: string, description?: string): void;
  destructive(title: string, description?: string): void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toastStyles = {
  success: "border-primary/40 bg-card text-card-foreground",
  info: "border-border bg-card text-card-foreground",
  destructive: "border-destructive/40 bg-card text-card-foreground"
};

const toastIcons = {
  success: CheckCircle2,
  info: Info,
  destructive: Trash2
};

function toastId() {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((items) => items.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, description, variant = "success" }: ToastInput) => {
      const toast: Toast = { id: toastId(), title, description, variant };
      setToasts((items) => [toast, ...items].slice(0, 4));
      window.setTimeout(() => removeToast(toast.id), 4200);
    },
    [removeToast]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      success: (title, description) => showToast({ title, description, variant: "success" }),
      info: (title, description) => showToast({ title, description, variant: "info" }),
      destructive: (title, description) => showToast({ title, description, variant: "destructive" })
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed inset-x-3 top-3 z-[80] grid gap-2 sm:left-auto sm:right-4 sm:top-4 sm:w-96"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => {
          const Icon = toastIcons[toast.variant];
          return (
            <div
              key={toast.id}
              className={cn("flex items-start gap-3 rounded-lg border p-3 shadow-lg backdrop-blur", toastStyles[toast.variant])}
              role="status"
            >
              <Icon
                className={cn("mt-0.5 h-5 w-5 shrink-0", toast.variant === "destructive" ? "text-destructive" : "text-primary")}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description ? <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{toast.description}</p> : null}
              </div>
              <button
                type="button"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
