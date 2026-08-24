import {
  addDaysToKey,
  currentWeekKey,
  daysBetween,
  isWithinWeek,
  todayKey,
  weekKeyOf,
} from "@/lib/dates";
import type {
  Action,
  ActionStatus,
  ActionSummary,
  Chart,
  LogEntry,
  Theme,
} from "@/lib/types";

export const COLD_DAYS = 7;

export type ThemeSummary = {
  theme: Theme;
  actions: ActionSummary[];
  /** Reps delivered against reps promised, capped per action, 0-100. */
  cadencePct: number;
  reps: number;
  target: number;
  coldCount: number;
};

export type NeglectedSummary = {
  count: number;
  oldest: ActionSummary | null;
};

export type ChartWeek = {
  weekKey: string;
  /** The day cold streaks are measured from: today, or the week's end if in the past. */
  referenceDay: string;
  themes: ThemeSummary[];
  neglected: NeglectedSummary;
  cadencePct: number;
};

/** Most recent log day per action, `yyyy-mm-dd`. */
function lastLogIndex(logs: LogEntry[]): Map<string, string> {
  const index = new Map<string, string>();
  for (const log of logs) {
    const current = index.get(log.actionId);
    if (!current || log.date > current) index.set(log.actionId, log.date);
  }
  return index;
}

/** Rep counts per action within a single week. */
function weekRepIndex(logs: LogEntry[], weekKey: string): Map<string, number> {
  const index = new Map<string, number>();
  for (const log of logs) {
    if (!isWithinWeek(log.date, weekKey)) continue;
    index.set(log.actionId, (index.get(log.actionId) ?? 0) + 1);
  }
  return index;
}

export function actionStatus(reps: number, target: number): ActionStatus {
  if (reps <= 0) return "not-started";
  if (target > 0 && reps > target) return "ahead";
  if (target > 0 && reps >= target) return "met";
  return "part-way";
}

/** Cold streaks are read from today, unless a past week is being reviewed. */
export function referenceDayFor(weekKey: string): string {
  const today = todayKey();
  if (weekKey >= currentWeekKey()) return today;
  const weekEnd = addDaysToKey(weekKey, 6);
  return weekEnd < today ? weekEnd : today;
}

export function repsInWeek(
  chart: Chart,
  actionId: string,
  weekKey: string,
): number {
  return chart.logs.filter(
    (log) => log.actionId === actionId && isWithinWeek(log.date, weekKey),
  ).length;
}

export function actionLogDays(chart: Chart, actionId: string): string[] {
  return chart.logs
    .filter((log) => log.actionId === actionId)
    .map((log) => log.date)
    .sort();
}

/** Cadence math for one week, shared by every view so the numbers always agree. */
export function buildChartWeek(chart: Chart, weekKey: string): ChartWeek {
  const referenceDay = referenceDayFor(weekKey);
  const reps = weekRepIndex(chart.logs, weekKey);
  const lastLogs = lastLogIndex(chart.logs);
  const chartAge = daysBetween(chart.createdAt, referenceDay);

  const byTheme = new Map<string, Action[]>();
  for (const action of chart.actions) {
    const list = byTheme.get(action.themeId);
    if (list) list.push(action);
    else byTheme.set(action.themeId, [action]);
  }

  const themes = [...chart.themes]
    .sort((a, b) => a.position - b.position)
    .map((theme) => {
      const actions = (byTheme.get(theme.id) ?? []).map((action) => {
        const actionReps = reps.get(action.id) ?? 0;
        const lastLog = lastLogs.get(action.id);
        const daysSinceLast = lastLog
          ? Math.max(0, daysBetween(lastLog, referenceDay))
          : null;
        const isCold =
          daysSinceLast === null
            ? chartAge >= COLD_DAYS
            : daysSinceLast >= COLD_DAYS;

        return {
          action,
          theme,
          reps: actionReps,
          status: actionStatus(actionReps, action.target),
          daysSinceLast,
          isCold,
        } satisfies ActionSummary;
      });

      const target = actions.reduce((sum, item) => sum + item.action.target, 0);
      const delivered = actions.reduce(
        (sum, item) => sum + Math.min(item.reps, item.action.target),
        0,
      );

      return {
        theme,
        actions,
        cadencePct: target > 0 ? Math.round((delivered / target) * 100) : 0,
        reps: actions.reduce((sum, item) => sum + item.reps, 0),
        target,
        coldCount: actions.filter((item) => item.isCold).length,
      } satisfies ThemeSummary;
    });

  const cold = themes
    .flatMap((theme) => theme.actions)
    .filter((item) => item.isCold);

  const oldest = cold.reduce<ActionSummary | null>((worst, item) => {
    if (!worst) return item;
    const itemDays = item.daysSinceLast ?? Number.POSITIVE_INFINITY;
    const worstDays = worst.daysSinceLast ?? Number.POSITIVE_INFINITY;
    return itemDays > worstDays ? item : worst;
  }, null);

  const totalTarget = themes.reduce((sum, theme) => sum + theme.target, 0);
  const totalDelivered = themes.reduce(
    (sum, theme) =>
      sum +
      theme.actions.reduce(
        (inner, item) => inner + Math.min(item.reps, item.action.target),
        0,
      ),
    0,
  );

  return {
    weekKey,
    referenceDay,
    themes,
    neglected: { count: cold.length, oldest },
    cadencePct:
      totalTarget > 0 ? Math.round((totalDelivered / totalTarget) * 100) : 0,
  };
}

/** Weeks from the first log (or chart creation) through the current week, oldest first. */
export function recordedWeekKeys(chart: Chart, max = 12): string[] {
  const current = currentWeekKey();
  const earliestLog = chart.logs.reduce<string | null>(
    (min, log) => (min === null || log.date < min ? log.date : min),
    null,
  );
  const startKey = weekKeyOf(earliestLog ?? chart.createdAt);

  const keys: string[] = [];
  let cursor = startKey;
  while (cursor <= current && keys.length < 400) {
    keys.push(cursor);
    cursor = addDaysToKey(cursor, 7);
  }
  return keys.slice(-max);
}

export type DailyStreak = {
  current: number;
  longest: number;
  totalDaysLogged: number;
};

/** Consecutive days with at least one rep. Stays alive if the last rep was yesterday. */
export function dailyStreak(chart: Chart): DailyStreak {
  const days = [...new Set(chart.logs.map((log) => log.date))].sort();
  if (days.length === 0) return { current: 0, longest: 0, totalDaysLogged: 0 };

  let longest = 1;
  let run = 1;
  for (let index = 1; index < days.length; index += 1) {
    run = daysBetween(days[index - 1], days[index]) === 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  const today = todayKey();
  const gapFromToday = daysBetween(days[days.length - 1], today);
  let current = 0;
  if (gapFromToday <= 1) {
    current = 1;
    for (let index = days.length - 1; index > 0; index -= 1) {
      if (daysBetween(days[index - 1], days[index]) !== 1) break;
      current += 1;
    }
  }

  return { current, longest, totalDaysLogged: days.length };
}

/** Weekly met/target ratio for one action, oldest week first. */
export function actionWeekHistory(
  chart: Chart,
  actionId: string,
  weekKeys: string[],
): number[] {
  const action = chart.actions.find((item) => item.id === actionId);
  if (!action) return weekKeys.map(() => 0);
  return weekKeys.map((weekKey) => {
    const reps = repsInWeek(chart, actionId, weekKey);
    if (action.target <= 0) return reps > 0 ? 1 : 0;
    return Math.min(1, reps / action.target);
  });
}
