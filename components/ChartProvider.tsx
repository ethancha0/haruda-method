"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { addDaysToKey, currentWeekKey, todayKey } from "@/lib/dates";
import { createId } from "@/lib/id";
import { createSampleChart } from "@/lib/sampleChart";
import { clearChart, loadChart, saveChart } from "@/lib/storage";
import { ACTIONS_PER_THEME, type Chart } from "@/lib/types";

type ChartAction =
  | { type: "hydrate"; chart: Chart | null; weekKey: string }
  | { type: "shiftWeek"; delta: number }
  | { type: "goToCurrentWeek" }
  | { type: "init"; chart: Chart }
  | { type: "logRep"; actionId: string; date: string }
  | { type: "undoRep"; actionId: string; date: string }
  | { type: "addAction"; themeId: string; title: string; target: number }
  | {
      type: "updateAction";
      actionId: string;
      title?: string;
      target?: number;
    }
  | { type: "deleteAction"; actionId: string }
  | { type: "updateTheme"; themeId: string; title: string }
  | { type: "updateGoal"; goal: string; why?: string; deadline?: string }
  | { type: "setWeekNote"; weekKey: string; note: string }
  | { type: "reset" };

type State = {
  chart: Chart | null;
  hydrated: boolean;
  /** Monday of the week being read; empty until the client clock is known. */
  weekKey: string;
};

function reducer(state: State, action: ChartAction): State {
  const { chart } = state;

  switch (action.type) {
    case "hydrate":
      return { chart: action.chart, hydrated: true, weekKey: action.weekKey };

    case "shiftWeek":
      return state.weekKey
        ? { ...state, weekKey: addDaysToKey(state.weekKey, action.delta * 7) }
        : state;

    case "goToCurrentWeek":
      return { ...state, weekKey: currentWeekKey() };

    case "init":
      return { ...state, chart: action.chart };

    case "reset":
      return { ...state, chart: null };

    default:
      break;
  }

  if (!chart) return state;

  switch (action.type) {
    case "logRep":
      return {
        ...state,
        chart: {
          ...chart,
          logs: [
            ...chart.logs,
            { id: createId("log"), actionId: action.actionId, date: action.date },
          ],
        },
      };

    case "undoRep": {
      const candidates = chart.logs.filter(
        (log) => log.actionId === action.actionId,
      );
      if (candidates.length === 0) return state;
      const sameDay = candidates.filter((log) => log.date === action.date);
      const pool = sameDay.length > 0 ? sameDay : candidates;
      const doomed = pool.reduce((latest, log) =>
        log.date > latest.date ? log : latest,
      );
      return {
        ...state,
        chart: {
          ...chart,
          logs: chart.logs.filter((log) => log.id !== doomed.id),
        },
      };
    }

    case "addAction": {
      const themeActions = chart.actions.filter(
        (item) => item.themeId === action.themeId,
      );
      if (themeActions.length >= ACTIONS_PER_THEME) return state;
      return {
        ...state,
        chart: {
          ...chart,
          actions: [
            ...chart.actions,
            {
              id: createId("action"),
              themeId: action.themeId,
              title: action.title,
              target: action.target,
            },
          ],
        },
      };
    }

    case "updateAction":
      return {
        ...state,
        chart: {
          ...chart,
          actions: chart.actions.map((item) =>
            item.id === action.actionId
              ? {
                  ...item,
                  title: action.title ?? item.title,
                  target: action.target ?? item.target,
                }
              : item,
          ),
        },
      };

    case "deleteAction":
      return {
        ...state,
        chart: {
          ...chart,
          actions: chart.actions.filter((item) => item.id !== action.actionId),
          logs: chart.logs.filter((log) => log.actionId !== action.actionId),
        },
      };

    case "updateTheme":
      return {
        ...state,
        chart: {
          ...chart,
          themes: chart.themes.map((theme) =>
            theme.id === action.themeId
              ? { ...theme, title: action.title }
              : theme,
          ),
        },
      };

    case "updateGoal":
      return {
        ...state,
        chart: {
          ...chart,
          goal: action.goal,
          why: action.why,
          deadline: action.deadline,
        },
      };

    case "setWeekNote":
      return {
        ...state,
        chart: {
          ...chart,
          weekNotes: { ...chart.weekNotes, [action.weekKey]: action.note },
        },
      };

    default:
      return state;
  }
}

export type ChartStore = {
  /** `loading` until localStorage has been read on the client. */
  status: "loading" | "empty" | "ready";
  chart: Chart | null;
  /** Monday of the week every cadence view is currently reading. */
  weekKey: string;
  isCurrentWeek: boolean;
  shiftWeek: (delta: number) => void;
  goToCurrentWeek: () => void;
  initChart: (chart: Chart) => void;
  loadSampleChart: () => void;
  logRep: (actionId: string, date?: string) => void;
  undoRep: (actionId: string, date?: string) => void;
  addAction: (themeId: string, title: string, target: number) => void;
  updateAction: (
    actionId: string,
    patch: { title?: string; target?: number },
  ) => void;
  deleteAction: (actionId: string) => void;
  updateTheme: (themeId: string, title: string) => void;
  updateGoal: (patch: {
    goal: string;
    why?: string;
    deadline?: string;
  }) => void;
  setWeekNote: (weekKey: string, note: string) => void;
  resetChart: () => void;
};

const ChartContext = createContext<ChartStore | null>(null);

export function ChartProvider({ children }: { children: React.ReactNode }) {
  // The week stays empty until mount so the server never renders from its own clock.
  const [state, dispatch] = useReducer(reducer, {
    chart: null,
    hydrated: false,
    weekKey: "",
  });

  useEffect(() => {
    dispatch({
      type: "hydrate",
      chart: loadChart(),
      weekKey: currentWeekKey(),
    });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    if (state.chart) saveChart(state.chart);
    else clearChart();
  }, [state.chart, state.hydrated]);

  const weekKey = state.weekKey;

  const value = useMemo<ChartStore>(() => {
    const status = !state.hydrated
      ? ("loading" as const)
      : state.chart
        ? ("ready" as const)
        : ("empty" as const);

    return {
      status,
      chart: state.chart,
      weekKey,
      isCurrentWeek: weekKey === currentWeekKey(),
      shiftWeek: (delta) => dispatch({ type: "shiftWeek", delta }),
      goToCurrentWeek: () => dispatch({ type: "goToCurrentWeek" }),
      initChart: (chart) => dispatch({ type: "init", chart }),
      loadSampleChart: () =>
        dispatch({ type: "init", chart: createSampleChart() }),
      logRep: (actionId, date) =>
        dispatch({ type: "logRep", actionId, date: date ?? todayKey() }),
      undoRep: (actionId, date) =>
        dispatch({ type: "undoRep", actionId, date: date ?? todayKey() }),
      addAction: (themeId, title, target) =>
        dispatch({ type: "addAction", themeId, title, target }),
      updateAction: (actionId, patch) =>
        dispatch({ type: "updateAction", actionId, ...patch }),
      deleteAction: (actionId) => dispatch({ type: "deleteAction", actionId }),
      updateTheme: (themeId, title) =>
        dispatch({ type: "updateTheme", themeId, title }),
      updateGoal: (patch) => dispatch({ type: "updateGoal", ...patch }),
      setWeekNote: (key, note) =>
        dispatch({ type: "setWeekNote", weekKey: key, note }),
      resetChart: () => dispatch({ type: "reset" }),
    };
  }, [state.chart, state.hydrated, weekKey]);

  return (
    <ChartContext.Provider value={value}>{children}</ChartContext.Provider>
  );
}

export function useChartStore(): ChartStore {
  const store = useContext(ChartContext);
  if (!store) {
    throw new Error("useChartStore must be used inside a ChartProvider");
  }
  return store;
}
