import type { Chart } from "@/lib/types";

const STORAGE_KEY = "haruda:v1";
const STORAGE_VERSION = 1;

type PersistedState = {
  version: number;
  chart: Chart | null;
};

export function isChart(value: unknown): value is Chart {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<Chart>;
  return (
    typeof candidate.goal === "string" &&
    Array.isArray(candidate.themes) &&
    Array.isArray(candidate.actions) &&
    Array.isArray(candidate.logs)
  );
}

export function loadChart(): Chart | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (parsed.version !== STORAGE_VERSION || !isChart(parsed.chart)) {
      return null;
    }
    return { ...parsed.chart, weekNotes: parsed.chart.weekNotes ?? {} };
  } catch {
    return null;
  }
}

export function saveChart(chart: Chart | null): void {
  if (typeof window === "undefined") return;
  try {
    const state: PersistedState = { version: STORAGE_VERSION, chart };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: the session keeps working in memory.
  }
}

export function clearChart(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to recover from.
  }
}
