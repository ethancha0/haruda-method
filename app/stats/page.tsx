"use client";

import { useMemo, useState } from "react";
import { useChartStore } from "@/components/ChartProvider";
import { EmptyState, LoadingState } from "@/components/ChartStates";
import { Sparkline } from "@/components/ui/Sparkline";
import {
  actionWeekHistory,
  buildChartWeek,
  dailyStreak,
  recordedWeekKeys,
} from "@/lib/cadence";
import { formatDayMonth } from "@/lib/dates";

const TREND_WEEKS = 12;
const HEAT_WEEKS = 8;

export default function StatsPage() {
  const { status, chart } = useChartStore();
  const [openTheme, setOpenTheme] = useState<string | null>(null);

  const data = useMemo(() => {
    if (!chart) return null;
    const weekKeys = recordedWeekKeys(chart, TREND_WEEKS);
    const weeks = weekKeys.map((key) => buildChartWeek(chart, key));
    const heatWeeks = weekKeys.slice(-HEAT_WEEKS);

    return {
      weekKeys,
      weeks,
      heatWeeks,
      overall: weeks.map((week) => week.cadencePct),
      streak: dailyStreak(chart),
      totalReps: chart.logs.length,
    };
  }, [chart]);

  if (status === "loading") return <LoadingState />;
  if (!chart || !data) return <EmptyState />;

  const latest = data.weeks[data.weeks.length - 1];
  const previous = data.weeks[data.weeks.length - 2];
  const delta = previous ? latest.cadencePct - previous.cadencePct : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8">
      <p className="eyebrow text-accent">Trends</p>
      <h1 className="mt-2 font-display text-[30px] leading-tight">
        {data.weekKeys.length === 1
          ? "One week of history so far."
          : `${data.weekKeys.length} weeks of history.`}
      </h1>

      <dl className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="This week" value={`${latest.cadencePct}%`} hint={
          delta === null
            ? "of cadence"
            : `${delta >= 0 ? "+" : ""}${delta} vs last week`
        } />
        <Stat
          label="Day streak"
          value={`${data.streak.current}`}
          hint={`longest ${data.streak.longest}`}
        />
        <Stat
          label="Days logged"
          value={`${data.streak.totalDaysLogged}`}
          hint="with at least one rep"
        />
        <Stat label="Total reps" value={`${data.totalReps}`} hint="all time" />
      </dl>

      <section className="mt-6 border border-line bg-surface p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="eyebrow text-ink-soft">Whole-chart cadence</h2>
          <p className="tabular text-[12px] text-ink-faint">
            {formatDayMonth(data.weekKeys[0])} –{" "}
            {formatDayMonth(data.weekKeys[data.weekKeys.length - 1])}
          </p>
        </div>
        <div className="mt-4">
          <Sparkline
            values={data.overall}
            label={`Weekly cadence: ${data.overall.join("%, ")}%`}
          />
        </div>
      </section>

      <section className="mt-6">
        <h2 className="eyebrow text-ink-soft">By theme</h2>
        <ul className="mt-3 space-y-2">
          {latest.themes.map((theme) => {
            const values = data.weeks.map(
              (week) =>
                week.themes.find((item) => item.theme.id === theme.theme.id)
                  ?.cadencePct ?? 0,
            );
            const isOpen = openTheme === theme.theme.id;

            return (
              <li key={theme.theme.id} className="border border-line bg-surface">
                <button
                  type="button"
                  onClick={() => setOpenTheme(isOpen ? null : theme.theme.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-surface-sunk"
                >
                  <span className="min-w-0 flex-1 truncate text-[14px]">
                    {theme.theme.position}. {theme.theme.title}
                  </span>
                  <span className="w-24 shrink-0">
                    <Sparkline
                      values={values}
                      label={`${theme.theme.title} weekly cadence trend`}
                    />
                  </span>
                  <span className="tabular w-12 shrink-0 text-right text-[13px] text-ink-faint">
                    {theme.cadencePct}%
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-line px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="eyebrow text-ink-faint">
                        Last {data.heatWeeks.length} weeks per action
                      </p>
                      <p className="tabular text-[11px] text-ink-faint">
                        {formatDayMonth(data.heatWeeks[0])} onward
                      </p>
                    </div>
                    <ul className="mt-3 space-y-1.5">
                      {theme.actions.map((item) => {
                        const history = actionWeekHistory(
                          chart,
                          item.action.id,
                          data.heatWeeks,
                        );
                        return (
                          <li
                            key={item.action.id}
                            className="flex items-center gap-3"
                          >
                            <span className="min-w-0 flex-1 truncate text-[13px] text-ink-soft">
                              {item.action.title}
                            </span>
                            <span className="flex shrink-0 gap-[3px]">
                              {history.map((ratio, index) => (
                                <span
                                  key={data.heatWeeks[index]}
                                  title={`Week of ${formatDayMonth(data.heatWeeks[index])}: ${Math.round(ratio * 100)}%`}
                                  className={`h-3.5 w-3.5 border ${
                                    ratio === 0
                                      ? "border-line bg-surface"
                                      : ratio < 0.5
                                        ? "border-accent-soft/40 bg-cell-part"
                                        : ratio < 1
                                          ? "border-accent-soft/70 bg-cell-met"
                                          : "border-accent-soft bg-cell-ahead"
                                  }`}
                                />
                              ))}
                            </span>
                          </li>
                        );
                      })}
                      {theme.actions.length === 0 && (
                        <li className="text-[13px] text-ink-faint">
                          No actions in this theme yet.
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="border border-line bg-surface px-4 py-3">
      <dt className="eyebrow text-ink-faint">{label}</dt>
      <dd className="tabular mt-1.5 font-display text-2xl leading-none">
        {value}
      </dd>
      <dd className="mt-1.5 text-[12px] text-ink-faint">{hint}</dd>
    </div>
  );
}
