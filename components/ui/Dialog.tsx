"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
};

export function Dialog({ open, onClose, title, eyebrow, children }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const onCloseRef = useRef(onClose);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus once when the dialog opens — not on every parent re-render.
    // Prefer a text field so we never steal focus onto the header close button.
    if (!wasOpenRef.current) {
      wasOpenRef.current = true;
      const panel = panelRef.current;
      const firstField =
        panel?.querySelector<HTMLElement>("input, textarea, select") ??
        panel?.querySelector<HTMLElement>("button:not([aria-label='Close'])");
      firstField?.focus();
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/25 backdrop-blur-[2px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="relative max-h-[92vh] w-full max-w-md overflow-y-auto border border-line bg-surface p-6 shadow-[0_24px_60px_-30px_rgba(46,42,37,0.45)] sm:rounded-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {eyebrow && <p className="eyebrow text-accent">{eyebrow}</p>}
            <h2 id={headingId} className="mt-1 font-display text-xl leading-snug">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 h-8 w-8 shrink-0 rounded-full text-ink-faint transition hover:bg-surface-sunk hover:text-ink"
          >
            ×
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
