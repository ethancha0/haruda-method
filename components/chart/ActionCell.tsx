"use client";

import { STATUS_FILL, STATUS_LABEL } from "@/components/chart/cellStyles";
import { formatDayGap } from "@/lib/dates";
import type { ActionSummary } from "@/lib/types";

type ActionCellProps = {
  summary: ActionSummary;
  onOpen: () => void;
  onQuickLog?: () => void;
  draggable?: boolean;
  isDragging?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
};

export function ActionCell({
  summary,
  onOpen,
  onQuickLog,
  draggable,
  isDragging,
  onDragStart,
  onDragEnd,
}: ActionCellProps) {
  const { action, reps, status, daysSinceLast, isCold } = summary;
  const gapLabel =
    isCold && daysSinceLast !== null
      ? `${daysSinceLast}d`
      : formatDayGap(daysSinceLast);

  return (
    <div
      className={`group relative ${draggable ? "cursor-grab active:cursor-grabbing" : ""} ${
        isDragging ? "opacity-40" : ""
      }`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <button
        type="button"
        data-cell
        onClick={onOpen}
        aria-label={`${action.title}. ${reps} of ${action.target} this week, ${STATUS_LABEL[status]}, last done ${formatDayGap(daysSinceLast)}.`}
        className={`flex aspect-[4/3] w-full flex-col justify-between p-2 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 ${
          STATUS_FILL[status]
        } ${
          isCold
            ? "border border-dashed border-line-strong"
            : "border border-transparent"
        } hover:brightness-[0.985]`}
      >
        <span
          className={`text-[11px] leading-[1.25] text-ink ${
            status === "ahead" ? "underline decoration-ink/40 underline-offset-2" : ""
          }`}
        >
          {action.title}
        </span>
        <span className="flex flex-wrap items-center gap-1">
          <span className="tabular text-[10px] text-ink-faint">
            {reps}/{action.target} · {gapLabel}
          </span>
          {isCold && (
            <span className="eyebrow rounded-[2px] border border-line-strong px-1 py-px text-[8px] text-ink-soft">
              cold
            </span>
          )}
        </span>
      </button>

      {onQuickLog && (
        <button
          type="button"
          tabIndex={-1}
          onClick={onQuickLog}
          aria-hidden="true"
          title={`Log one ${action.title}`}
          className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full border border-line-strong bg-surface text-[11px] leading-none text-ink-soft opacity-0 transition group-hover:flex group-hover:opacity-100 hover:bg-ink hover:text-page"
        >
          +
        </button>
      )}
    </div>
  );
}

export function EmptyCell({ onOpen, label }: { onOpen: () => void; label: string }) {
  return (
    <button
      type="button"
      data-cell
      onClick={onOpen}
      aria-label={label}
      className="flex aspect-[4/3] w-full items-center justify-center border border-dashed border-line bg-cell-empty text-[16px] text-line-strong transition hover:border-line-strong hover:text-ink-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
    >
      +
    </button>
  );
}
