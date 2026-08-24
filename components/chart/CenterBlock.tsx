"use client";

import { useGridNav } from "@/components/chart/useGridNav";
import type { ThemeSummary } from "@/lib/cadence";

type CenterBlockProps = {
  goal: string;
  themes: ThemeSummary[];
  onOpenGoal: () => void;
  onOpenTheme: (themeId: string) => void;
};

export function CenterBlock({
  goal,
  themes,
  onOpenGoal,
  onOpenTheme,
}: CenterBlockProps) {
  const onKeyDown = useGridNav(3);
  const cells = [
    themes[0],
    themes[1],
    themes[2],
    themes[3],
    null,
    themes[4],
    themes[5],
    themes[6],
    themes[7],
  ];

  return (
    <section
      aria-label="Goal and theme summary"
      onKeyDown={onKeyDown}
      className="grid grid-cols-3 gap-px border border-line bg-line"
    >
      {cells.map((summary, index) => {
        if (!summary) {
          return (
            <button
              key="goal"
              type="button"
              data-cell
              onClick={onOpenGoal}
              className="flex aspect-[4/3] w-full items-center justify-center border border-ink/70 bg-surface p-2 text-center transition hover:bg-surface-sunk focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
            >
              <span className="font-display text-[12.5px] leading-[1.3] text-ink">
                {goal}
              </span>
            </button>
          );
        }

        return (
          <button
            key={summary.theme.id}
            type="button"
            data-cell
            onClick={() => onOpenTheme(summary.theme.id)}
            aria-label={`${summary.theme.title}: ${summary.cadencePct}% of cadence, ${summary.coldCount} cold actions.`}
            className="flex aspect-[4/3] w-full flex-col justify-between bg-cell-theme p-2 text-left transition hover:brightness-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
          >
            <span className="text-[11px] leading-[1.25] text-ink">
              {summary.theme.position}. {summary.theme.title}
            </span>
            <span className="tabular text-[10px] text-ink-faint">
              {summary.cadencePct}% of cadence
              {summary.coldCount > 0 && ` · ${summary.coldCount} cold`}
            </span>
          </button>
        );
      })}
    </section>
  );
}
