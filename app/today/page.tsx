"use client";

import { useMemo, useState } from "react";
import { ActionRow } from "@/components/ActionRow";
import { useChartStore } from "@/components/ChartProvider";
import { EmptyState, LoadingState } from "@/components/ChartStates";
import {
  ChartDialogs,
  type DialogTarget,
} from "@/components/dialogs/ChartDialogs";
import { buildChartWeek } from "@/lib/cadence";
import { currentWeekKey, formatFullDate, todayKey } from "@/lib/dates";
import type { ActionSummary } from "@/lib/types";

type Filter = "due" | "cold" | "all";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "due", label: "Still owed this week" },
  { id: "cold", label: "Cold" },
  { id: "all", label: "Everything" },
];

export default function TodayPage() {
  const { status, chart } = useChartStore();
  const [filter, setFilter] = useState<Filter>("due");
  const [target, setTarget] = useState<DialogTarget>(null);

  // Today is always read against the live week, even if the chart view is parked in the past.
  const week = useMemo(
    () => (chart ? buildChartWeek(chart, currentWeekKey()) : null),
    [chart],
  );

  const repsToday = useMemo(() => {
    if (!chart) return 0;
    const today = todayKey();
    return chart.logs.filter((log) => log.date === today).length;
  }, [chart]);

  if (status === "loading") return <LoadingState />;
  if (!chart || !week) return <EmptyState />;

  const matches = (item: ActionSummary) => {
    if (filter === "cold") return item.isCold;
    if (filter === "due") return item.reps < item.action.target;
    return true;
  };

  const visibleThemes = week.themes
    .map((theme) => ({ ...theme, visible: theme.actions.filter(matches) }))
    .filter((theme) => theme.visible.length > 0);

  const owed = week.themes
    .flatMap((theme) => theme.actions)
    .filter((item) => item.reps < item.action.target).length;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8">
      <p className="eyebrow text-accent">{formatFullDate(todayKey())}</p>
      <h1 className="mt-2 font-display text-[30px] leading-tight">
        {repsToday === 0
          ? "Nothing logged yet today."
          : `${repsToday} ${repsToday === 1 ? "rep" : "reps"} logged today.`}
      </h1>
      <p className="mt-3 text-[14px] text-ink-soft">
        {owed === 0
          ? "Every action is at cadence for the week."
          : `${owed} of ${chart.actions.length} actions are still short of their weekly cadence.`}
      </p>

      <div className="mt-7 flex flex-wrap gap-1.5">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            aria-pressed={filter === item.id}
            className={`rounded-full border px-3 py-1.5 text-[13px] transition ${
              filter === item.id
                ? "border-ink bg-ink text-page"
                : "border-line text-ink-soft hover:border-line-strong hover:text-ink"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-5">
        {visibleThemes.map((theme) => (
          <section
            key={theme.theme.id}
            className="border border-line bg-surface px-4 py-3"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[14px]">
                {theme.theme.position}. {theme.theme.title}
              </h2>
              <p className="tabular text-[12px] text-ink-faint">
                {theme.cadencePct}% of cadence
              </p>
            </div>
            <ul className="mt-1 divide-y divide-line">
              {theme.visible.map((item) => (
                <ActionRow
                  key={item.action.id}
                  summary={item}
                  onOpen={() =>
                    setTarget({ kind: "action", actionId: item.action.id })
                  }
                />
              ))}
            </ul>
          </section>
        ))}

        {visibleThemes.length === 0 && (
          <p className="border border-dashed border-line bg-surface px-4 py-8 text-center text-[14px] text-ink-soft">
            {filter === "cold"
              ? "Nothing has gone cold. Every action has been touched inside a week."
              : "Nothing owed. The whole chart is at cadence for this week."}
          </p>
        )}
      </div>

      <ChartDialogs target={target} onChange={setTarget} />
    </div>
  );
}
