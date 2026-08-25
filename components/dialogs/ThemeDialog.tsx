"use client";

import { useState } from "react";
import { useChartStore } from "@/components/ChartProvider";
import { Dialog } from "@/components/ui/Dialog";
import { inputClass } from "@/components/ui/Field";
import { buildChartWeek } from "@/lib/cadence";
import { formatDayGap } from "@/lib/dates";

type ThemeDialogProps = {
  themeId: string;
  onClose: () => void;
  onOpenAction: (actionId: string) => void;
};

export function ThemeDialog({
  themeId,
  onClose,
  onOpenAction,
}: ThemeDialogProps) {
  const store = useChartStore();
  const { chart, weekKey } = store;
  const summary = chart
    ? buildChartWeek(chart, weekKey).themes.find(
        (item) => item.theme.id === themeId,
      )
    : undefined;

  const [draftTitle, setDraftTitle] = useState(summary?.theme.title ?? "");

  if (!chart || !summary) return null;

  return (
    <Dialog
      open
      onClose={onClose}
      eyebrow={`Theme ${summary.theme.position}`}
      title={`${summary.cadencePct}% of cadence this week`}
    >
      <div className="space-y-5">
        <input
          value={draftTitle}
          maxLength={40}
          onChange={(event) => setDraftTitle(event.target.value)}
          onBlur={() => {
            const title = draftTitle.trim();
            if (title && title !== summary.theme.title) {
              store.updateTheme(summary.theme.id, title);
            } else if (!title) {
              setDraftTitle(summary.theme.title);
            }
          }}
          aria-label="Theme name"
          className={inputClass}
        />

        <div className="flex items-center gap-4 text-[13px] text-ink-soft">
          <span className="tabular">
            {summary.reps} of {summary.target} reps
          </span>
          {summary.coldCount > 0 && (
            <span className="text-accent">{summary.coldCount} cold</span>
          )}
        </div>

        <ul className="divide-y divide-line border-t border-line">
          {summary.actions.map((item) => (
            <li key={item.action.id} className="flex items-center gap-3 py-2.5">
              <button
                type="button"
                onClick={() => onOpenAction(item.action.id)}
                className="min-w-0 flex-1 text-left text-[14px] transition hover:text-accent"
              >
                <span className="block truncate">{item.action.title}</span>
                <span className="tabular text-[12px] text-ink-faint">
                  {item.reps}/{item.action.target} ·{" "}
                  {formatDayGap(item.daysSinceLast)}
                </span>
              </button>
              <button
                type="button"
                onClick={() => store.logRep(item.action.id)}
                aria-label={`Log one ${item.action.title}`}
                className="h-7 w-7 shrink-0 rounded-full border border-line text-ink-soft transition hover:border-ink hover:text-ink"
              >
                +
              </button>
            </li>
          ))}
          {summary.actions.length === 0 && (
            <li className="py-3 text-[13px] text-ink-faint">
              No actions here yet. Fill a dashed cell in this block.
            </li>
          )}
        </ul>
      </div>
    </Dialog>
  );
}
