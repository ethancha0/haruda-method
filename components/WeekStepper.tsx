"use client";

import { useChartStore } from "@/components/ChartProvider";
import { formatDayMonth, formatWeekRange } from "@/lib/dates";

export function WeekStepper({ compact = false }: { compact?: boolean }) {
  const { weekKey, isCurrentWeek, shiftWeek, goToCurrentWeek } = useChartStore();
  if (!weekKey) return null;

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => shiftWeek(-1)}
        className="h-7 w-7 rounded-full border border-line text-ink-soft transition hover:border-line-strong hover:text-ink"
        aria-label="Previous week"
      >
        ‹
      </button>
      <span
        className="eyebrow tabular min-w-32 text-center text-ink-soft"
        title={formatWeekRange(weekKey)}
      >
        {compact ? formatDayMonth(weekKey) : `Week of ${formatDayMonth(weekKey)}`}
      </span>
      <button
        type="button"
        onClick={() => shiftWeek(1)}
        disabled={isCurrentWeek}
        className="h-7 w-7 rounded-full border border-line text-ink-soft transition hover:border-line-strong hover:text-ink disabled:opacity-35 disabled:hover:border-line"
        aria-label="Next week"
      >
        ›
      </button>
      {!isCurrentWeek && (
        <button
          type="button"
          onClick={goToCurrentWeek}
          className="eyebrow ml-1 text-accent underline decoration-accent/40 underline-offset-4 transition hover:decoration-accent"
        >
          This week
        </button>
      )}
    </div>
  );
}
