"use client";

import { useChartStore } from "@/components/ChartProvider";
import { formatDayGap } from "@/lib/dates";
import type { ActionSummary } from "@/lib/types";

/** One action as a list row: cadence dots, title, and inline logging. */
export function ActionRow({
  summary,
  onOpen,
}: {
  summary: ActionSummary;
  onOpen: () => void;
}) {
  const { logRep, undoRep } = useChartStore();
  const { action, reps, isCold, daysSinceLast } = summary;
  const dots = Math.min(action.target, 10);

  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className="flex w-[86px] shrink-0 gap-[3px]" aria-hidden="true">
        {Array.from({ length: dots }).map((_, index) => (
          <span
            key={index}
            className={`h-2.5 flex-1 border ${
              index < reps
                ? "border-accent-soft bg-cell-met"
                : "border-line bg-surface"
            }`}
          />
        ))}
      </span>

      <button
        type="button"
        onClick={onOpen}
        className="min-w-0 flex-1 text-left transition hover:text-accent"
      >
        <span className="block truncate text-[14px]">{action.title}</span>
        <span className="tabular text-[12px] text-ink-faint">
          {reps}/{action.target} this week · {formatDayGap(daysSinceLast)}
          {isCold && <span className="ml-1.5 text-accent">cold</span>}
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={() => undoRep(action.id)}
          disabled={reps === 0}
          aria-label={`Undo a rep of ${action.title}`}
          className="h-8 w-8 rounded-full border border-line text-ink-soft transition hover:border-line-strong hover:text-ink disabled:opacity-30"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => logRep(action.id)}
          aria-label={`Log a rep of ${action.title}`}
          className="h-8 w-8 rounded-full border border-ink bg-ink text-page transition hover:bg-ink/85"
        >
          +
        </button>
      </div>
    </li>
  );
}
