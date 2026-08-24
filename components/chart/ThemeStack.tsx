"use client";

import { ActionCell, EmptyCell } from "@/components/chart/ActionCell";
import type { ChartWeek } from "@/lib/cadence";
import { ACTIONS_PER_THEME, type Chart } from "@/lib/types";

type ThemeStackProps = {
  chart: Chart;
  week: ChartWeek;
  onOpenGoal: () => void;
  onOpenAction: (actionId: string) => void;
  onOpenEmptySlot: (themeId: string) => void;
  onQuickLog: (actionId: string) => void;
};

/** Narrow-screen reading of the same chart: one theme per band, two cells wide. */
export function ThemeStack({
  chart,
  week,
  onOpenGoal,
  onOpenAction,
  onOpenEmptySlot,
  onQuickLog,
}: ThemeStackProps) {
  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onOpenGoal}
        className="w-full border border-ink/70 bg-surface p-4 text-left transition hover:bg-surface-sunk"
      >
        <span className="eyebrow text-accent">The goal</span>
        <span className="mt-1.5 block font-display text-lg leading-snug">
          {chart.goal}
        </span>
        <span className="tabular mt-2 block text-[12px] text-ink-faint">
          {week.cadencePct}% of this week&apos;s cadence
        </span>
      </button>

      {week.themes.map((summary) => {
        const emptySlots = Math.max(
          0,
          ACTIONS_PER_THEME - summary.actions.length,
        );

        return (
          <section key={summary.theme.id}>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[14px]">
                {summary.theme.position}. {summary.theme.title}
              </h2>
              <p className="tabular text-[12px] text-ink-faint">
                {summary.cadencePct}%
                {summary.coldCount > 0 && ` · ${summary.coldCount} cold`}
              </p>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-px border border-line bg-line">
              {summary.actions.map((item) => (
                <ActionCell
                  key={item.action.id}
                  summary={item}
                  onOpen={() => onOpenAction(item.action.id)}
                  onQuickLog={() => onQuickLog(item.action.id)}
                />
              ))}
              {Array.from({ length: emptySlots }).map((_, index) => (
                <EmptyCell
                  key={`empty-${index}`}
                  label={`Add an action to ${summary.theme.title}`}
                  onOpen={() => onOpenEmptySlot(summary.theme.id)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
