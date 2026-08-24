"use client";

import { useMemo, useState } from "react";
import {
  addDaysToKey,
  daysBetween,
  formatDayMonth,
  formatFullDate,
  todayKey,
} from "@/lib/dates";
import type { LogEntry } from "@/lib/types";

const HISTORY_DAYS = 14;

type RepHistoryStripProps = {
  actionId: string;
  logs: LogEntry[];
  logDate: string;
  chartCreatedAt: string;
};

function cellClass(count: number, selected: boolean): string {
  const base =
    count === 0
      ? "border-line bg-surface"
      : count === 1
        ? "border-accent-soft/60 bg-cell-met"
        : "border-accent-soft bg-cell-ahead";
  const ring = selected ? " ring-2 ring-accent ring-offset-1" : "";
  return `h-6 flex-1 border ${base}${ring}`;
}

export function RepHistoryStrip({
  actionId,
  logs,
  logDate,
  chartCreatedAt,
}: RepHistoryStripProps) {
  const [windowEndDay, setWindowEndDay] = useState(logDate);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const actionLogs = useMemo(
    () => logs.filter((log) => log.actionId === actionId),
    [logs, actionId],
  );

  const earliestDay = useMemo(() => {
    const firstLog = actionLogs.reduce<string | null>(
      (min, log) => (min === null || log.date < min ? log.date : min),
      null,
    );
    if (firstLog && firstLog < chartCreatedAt) return firstLog;
    return chartCreatedAt;
  }, [actionLogs, chartCreatedAt]);

  const windowStartDay = addDaysToKey(windowEndDay, -(HISTORY_DAYS - 1));
  const today = todayKey();

  const canGoNext = windowEndDay < today;
  const canGoPrev =
    daysBetween(earliestDay, addDaysToKey(windowEndDay, -7 - (HISTORY_DAYS - 1))) >=
    0;

  const days = useMemo(() => {
    const logsByDay = new Map<string, LogEntry[]>();
    for (const log of actionLogs) {
      const list = logsByDay.get(log.date);
      if (list) list.push(log);
      else logsByDay.set(log.date, [log]);
    }

    return Array.from({ length: HISTORY_DAYS }, (_, index) => {
      const day = addDaysToKey(windowStartDay, index);
      const dayLogs = logsByDay.get(day) ?? [];
      return { day, count: dayLogs.length, logs: dayLogs };
    });
  }, [actionLogs, windowStartDay]);

  const selectedLogs = selectedDay
    ? (days.find((entry) => entry.day === selectedDay)?.logs ?? [])
    : [];

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow text-ink-soft">Last {HISTORY_DAYS} days</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setWindowEndDay((current) => addDaysToKey(current, -7));
              setSelectedDay(null);
            }}
            disabled={!canGoPrev}
            aria-label="Previous week"
            className="h-6 w-6 rounded-full border border-line text-[13px] text-ink-soft transition hover:border-line-strong hover:text-ink disabled:opacity-35"
          >
            ‹
          </button>
          <span className="tabular text-[11px] text-ink-faint">
            {formatDayMonth(windowStartDay)} – {formatDayMonth(windowEndDay)}
          </span>
          <button
            type="button"
            onClick={() => {
              setWindowEndDay((current) => addDaysToKey(current, 7));
              setSelectedDay(null);
            }}
            disabled={!canGoNext}
            aria-label="Next week"
            className="h-6 w-6 rounded-full border border-line text-[13px] text-ink-soft transition hover:border-line-strong hover:text-ink disabled:opacity-35"
          >
            ›
          </button>
        </div>
      </div>

      <div className="mt-2 flex gap-1">
        {days.map((entry) => {
          if (entry.count === 0) {
            return (
              <span
                key={entry.day}
                aria-hidden="true"
                className={cellClass(0, false)}
              />
            );
          }

          const selected = selectedDay === entry.day;
          return (
            <button
              key={entry.day}
              type="button"
              aria-label={`${formatFullDate(entry.day)}: ${entry.count} rep${entry.count === 1 ? "" : "s"}`}
              aria-pressed={selected}
              onClick={() =>
                setSelectedDay(selected ? null : entry.day)
              }
              className={cellClass(entry.count, selected)}
            />
          );
        })}
      </div>

      {selectedDay && selectedLogs.length > 0 && (
        <div className="mt-3 border border-line bg-surface-sunk px-3 py-2.5">
          <p className="text-[12px] text-ink-soft">{formatFullDate(selectedDay)}</p>
          <ul className="mt-2 space-y-2">
            {selectedLogs.map((log, index) => (
              <li key={log.id} className="text-[13px]">
                <span className="text-ink-faint">Rep {index + 1}</span>
                <span className="mt-0.5 block text-ink">
                  {log.note?.trim() || "No description"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
