"use client";

import { useId } from "react";

const inputClass =
  "w-full rounded-sm border border-line bg-surface px-3 py-2 text-[15px] text-ink outline-none transition placeholder:text-ink-faint focus:border-accent-soft focus:ring-2 focus:ring-accent-soft/30";

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  type?: "text" | "date";
  autoFocus?: boolean;
  maxLength?: number;
};

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
  autoFocus,
  maxLength,
}: TextFieldProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="eyebrow block text-ink-soft">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoFocus={autoFocus}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-2 ${inputClass}`}
      />
      {hint && <p className="mt-1.5 text-[13px] text-ink-faint">{hint}</p>}
    </div>
  );
}

type TextAreaFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
};

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: TextAreaFieldProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="eyebrow block text-ink-soft">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-2 resize-none ${inputClass}`}
      />
    </div>
  );
}

/** Reps per week for one action. */
export function TargetStepper({
  value,
  onChange,
  label = "Weekly target",
}: {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}) {
  const clamp = (next: number) => Math.min(14, Math.max(1, next));

  return (
    <div className="flex items-center gap-2">
      <span className="sr-only">{label}</span>
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= 1}
        aria-label={`Decrease ${label.toLowerCase()}`}
        className="h-7 w-7 rounded-full border border-line text-ink-soft transition hover:border-line-strong hover:text-ink disabled:opacity-35"
      >
        −
      </button>
      <span className="tabular w-14 text-center text-[13px] text-ink-soft">
        {value}×/wk
      </span>
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= 14}
        aria-label={`Increase ${label.toLowerCase()}`}
        className="h-7 w-7 rounded-full border border-line text-ink-soft transition hover:border-line-strong hover:text-ink disabled:opacity-35"
      >
        +
      </button>
    </div>
  );
}

export { inputClass };
