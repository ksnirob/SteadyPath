"use client";

import { Info, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";

type InfoPopoverProps = {
  label: string;
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function InfoPopover({ label, title, children, className }: InfoPopoverProps) {
  const [open, setOpen] = useState(false);
  const dialogId = useId();

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <span className={cn("relative inline-flex", className)}>
      <button
        type="button"
        className="grid h-8 w-8 place-items-center rounded-md border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground"
        onClick={() => setOpen((value) => !value)}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? dialogId : undefined}
      >
        <Info className="h-4 w-4" aria-hidden />
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-background/20"
            aria-label="Close info"
            onClick={() => setOpen(false)}
          />
          <span
            id={dialogId}
            className="fixed left-1/2 top-[max(4.5rem,env(safe-area-inset-top))] z-50 max-h-[min(28rem,calc(100dvh-7rem))] w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 overflow-y-auto rounded-lg border bg-card p-3 text-left text-sm font-normal text-card-foreground shadow-lg sm:absolute sm:left-auto sm:right-0 sm:top-10 sm:max-h-[min(28rem,calc(100vh-8rem))] sm:w-80 sm:translate-x-0"
            role="dialog"
            aria-label={title}
          >
            <span className="mb-2 flex items-center justify-between gap-3">
              <span className="font-semibold">{title}</span>
              <button
                type="button"
                className="grid h-7 w-7 place-items-center rounded-md hover:bg-muted"
                onClick={() => setOpen(false)}
                aria-label="Close info"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </span>
            <span className="block text-muted-foreground">{children}</span>
          </span>
        </>
      ) : null}
    </span>
  );
}
