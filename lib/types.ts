export const THEME_COUNT = 8;
export const ACTIONS_PER_THEME = 8;

/** A single completed rep of an action on a given day. */
export type LogEntry = {
  id: string;
  actionId: string;
  /** Local calendar day, `yyyy-mm-dd`. */
  date: string;
  note?: string;
};

export type Action = {
  id: string;
  themeId: string;
  title: string;
  /** Reps per week that count as keeping cadence. */
  target: number;
};

export type Theme = {
  id: string;
  /** 1-8, fixed position in the chart. */
  position: number;
  title: string;
};

export type Chart = {
  id: string;
  goal: string;
  why?: string;
  /** Local calendar day, `yyyy-mm-dd`. */
  deadline?: string;
  themes: Theme[];
  actions: Action[];
  logs: LogEntry[];
  /** Keyed by the Monday of the week, `yyyy-mm-dd`. */
  weekNotes: Record<string, string>;
  createdAt: string;
};

export type ActionStatus = "not-started" | "part-way" | "met" | "ahead";

export type ActionSummary = {
  action: Action;
  theme: Theme;
  reps: number;
  status: ActionStatus;
  /** Days since the most recent log, or null if never logged. */
  daysSinceLast: number | null;
  isCold: boolean;
};
