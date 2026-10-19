"use client";

import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const icons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  default: Info,
};

const tones = {
  success: "border-status-ready/40 bg-status-ready-bg text-status-ready-fg",
  warning: "border-status-waiting/40 bg-status-waiting-bg text-status-waiting-fg",
  error: "border-status-error/40 bg-status-error-bg text-status-error-fg",
  default: "border-border bg-card text-card-foreground",
};

export function Toaster() {
  const { toasts, dismissToast } = useStore();
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-[100] flex w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 flex-col gap-2 sm:left-auto sm:right-4 sm:translate-x-0"
    >
      {toasts.map((t) => {
        const Icon = icons[t.tone];
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              "animate-rise flex items-start gap-3 rounded-lg border p-3 shadow-lg",
              tones[t.tone]
            )}
          >
            <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-xs opacity-80">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              aria-label="Tutup notifikasi"
              className="rounded p-0.5 opacity-60 transition hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
