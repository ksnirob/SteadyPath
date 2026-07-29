"use client";

import { Info, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type InfoPopoverProps = {
  label: string;
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function InfoPopover({ label, title, children, className }: InfoPopoverProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 16, top: 72 });
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLSpanElement | null>(null);
  const dialogId = useId();

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const button = buttonRef.current;
      const dialog = dialogRef.current;
      if (!button || !dialog) return;

      const gap = 8;
      const margin = 16;
      const buttonRect = button.getBoundingClientRect();
      const dialogRect = dialog.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const preferredLeft = buttonRect.left;
      const preferredTop = buttonRect.bottom + gap;
      const left = Math.min(Math.max(margin, preferredLeft), viewportWidth - dialogRect.width - margin);
      const fitsBelow = preferredTop + dialogRect.height <= viewportHeight - margin;
      const top = fitsBelow ? preferredTop : Math.max(margin, buttonRect.top - dialogRect.height - gap);

      setPosition({ left, top });
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    updatePosition();
    const frame = window.requestAnimationFrame(updatePosition);
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  return (
    <span className={cn("relative inline-flex", className)}>
      <button
        ref={buttonRef}
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
            ref={dialogRef}
            id={dialogId}
            className="fixed z-50 max-h-[min(28rem,calc(100dvh-7rem))] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-lg border bg-card p-3 text-left text-sm font-normal text-card-foreground shadow-lg sm:w-96"
            style={{ left: position.left, top: position.top }}
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
