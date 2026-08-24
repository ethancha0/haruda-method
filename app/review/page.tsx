"use client";

import { useMemo, useState } from "react";
import { useChartStore } from "@/components/ChartProvider";
import { EmptyState, LoadingState } from "@/components/ChartStates";
import {
  ChartDialogs,
  type DialogTarget,
} from "@/components/dialogs/ChartDialogs";
import { WeekStepper } from "@/components/WeekStepper";
import { CadenceBar } from "@/components/ui/CadenceBar";
import { TextAreaField } from "@/components/ui/Field";
import { buildChartWeek } from "@/lib/cadence";
import {
  formatDayGap,
  formatWeekRange,
  formatWeekdayShort,
  weekDayKeys,
} from "@/lib/dates";

export default function ReviewPage() {
  const { status, chart, weekKey, setWeekNote, logRep } = useChartStore();
  const [target, setTarget] = useState<DialogTarget>(null);

  const week = useMemo(
    () => (chart && weekKey ? buildChartWeek(chart, weekKey) : null),
    [chart, weekKey],
  );

  const dailyReps = useMemo(() => {
    if (!chart || !weekKey) return [];
    const days = weekDayKeys(weekKey);
    const counts = new Map<string, number>();
    for (const log of chart.logs) {
      counts.set(log.date, (counts.get(log.date) ?? 0) + 1);
    }
    return days.map((day) => ({ day, count: counts.get(day) ?? 0 }));
  }, [chart, weekKey]);

  if (status === "loading") return <LoadingState />;
  if (!chart || !week) return <EmptyState />;

  const cold = week.themes
    .flatMap((theme) => theme.actions)
    .filter((item) => item.isCold)
    .sort(
      (a, b) =>
        (b.daysSinceLast ?? Number.POSITIVE_INFINITY) -
        (a.daysSinceLast ?? Number.POSITIVE_INFINITY),
    );

  const ranked = [...week.themes].sort((a, b) => b.cadencePct - a.cadencePct);
  const strongest = ranked[0];
  const weakest = ranked[ranked.length - 1];
  const peakDay = dailyReps.reduce(
    (best, item) => (item.count > best.count ? item : best),
    dailyReps[0] ?? { day: weekKey, count: 0 },
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="eyebrow text-accent">
          Weekly review · {formatWeekRange(weekKey)}
        </p>
        <WeekStepper />
      </div>

      <h1 className="mt-3 font-display text-[30px] leading-tight">
        You kept {week.cadencePct}% of the cadence you promised.
      </h1>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
        {strongest && weakest && strongest.theme.id !== weakest.theme.id ? (
          <>
            <span className="text-ink">{strongest.theme.title}</span> carried the
            week at {strongest.cadencePct}%, while{" "}
            <span className="text-ink">{weakest.theme.title}</span> slipped to{" "}
            {weakest.cadencePct}%.
          </>
        ) : (
          <>Log a few reps to see how the themes compare.</>
        )}
        {peakDay.count > 0 && (
          <> Busiest day was {formatWeekdayShort(peakDay.day)}.</>
        )}
      </p>

      <section className="mt-8 border border-line bg-surface p-5">
        <h2 className="eyebrow text-ink-soft">Cadence by theme</h2>
        <ul className="mt-4 space-y-3">
          {week.themes.map((theme) => (
            <li key={theme.theme.id}>
              <div className="flex items-baseline justify-between gap-3 text-[13px]">
                <span className="truncate">
                  {theme.theme.position}. {theme.theme.title}
                </span>
                <span className="tabular shrink-0 text-ink-faint">
                  {theme.cadencePct}%
                  {theme.coldCount > 0 && (
                    <span className="text-accent"> · {theme.coldCount} cold</span>
                  )}
                </span>
              </div>
              <div className="mt-1.5">
                <CadenceBar pct={theme.cadencePct} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 border border-line bg-surface p-5">
        <h2 className="eyebrow text-ink-soft">Reps by day</h2>
        <div className="mt-4 flex items-end gap-2">
          {dailyReps.map((item) => {
            const max = Math.max(...dailyReps.map((entry) => entry.count), 1);
            return (
              <div key={item.day} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="tabular text-[11px] text-ink-faint">
                  {item.count}
                </span>
                <span
                  className="w-full border border-accent-soft/50 bg-cell-met"
                  style={{ height: `${8 + (item.count / max) * 64}px` }}
                />
                <span className="text-[11px] text-ink-faint">
                  {formatWeekdayShort(item.day)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6 border border-line bg-surface p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="eyebrow text-ink-soft">Carry into next week</h2>
          <p className="text-[12px] text-ink-faint">
            {cold.length} cold {cold.length === 1 ? "action" : "actions"}
          </p>
        </div>

        {cold.length === 0 ? (
          <p className="mt-3 text-[14px] text-ink-soft">
            Nothing has been left untouched for a week. Pick the theme with the
            lowest bar above and give it one extra rep.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {cold.slice(0, 6).map((item) => (
              <li
                key={item.action.id}
                className="flex items-center gap-3 py-2.5"
              >
                <button
                  type="button"
                  onClick={() =>
                    setTarget({ kind: "action", actionId: item.action.id })
                  }
                  className="min-w-0 flex-1 text-left transition hover:text-accent"
                >
                  <span className="block truncate text-[14px]">
                    {item.action.title}
                  </span>
                  <span className="text-[12px] text-ink-faint">
                    {item.theme.title} · {formatDayGap(item.daysSinceLast)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => logRep(item.action.id)}
                  className="shrink-0 rounded-full border border-line px-3 py-1.5 text-[12px] text-ink-soft transition hover:border-ink hover:text-ink"
                >
                  Log one now
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 border border-line bg-surface p-5">
        <TextAreaField
          label="Notes for this week"
          rows={4}
          value={chart.weekNotes[weekKey] ?? ""}
          onChange={(note) => setWeekNote(weekKey, note)}
          placeholder="What got in the way, and the one change for next week."
        />
      </section>

      <ChartDialogs target={target} onChange={setTarget} />
    </div>
  );
}
