"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import {
  deleteRemoteChart,
  loadRemoteChart,
  saveRemoteChart,
} from "@/lib/chartRepository";
import { addDaysToKey, currentWeekKey, todayKey } from "@/lib/dates";
import { createId } from "@/lib/id";
import { createSampleChart } from "@/lib/sampleChart";
import { clearChart, loadChart, saveChart } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import { ACTIONS_PER_THEME, type Chart } from "@/lib/types";

type ChartAction =
  | { type: "hydrate"; chart: Chart | null; weekKey: string }
  | { type: "shiftWeek"; delta: number }
  | { type: "goToCurrentWeek" }
  | { type: "init"; chart: Chart }
  | { type: "logRep"; actionId: string; date: string; note?: string }
  | { type: "undoRep"; actionId: string; date: string }
  | { type: "addAction"; themeId: string; title: string; target: number }
  | {
      type: "updateAction";
      actionId: string;
      title?: string;
      target?: number;
    }
  | { type: "deleteAction"; actionId: string }
  | { type: "moveAction"; actionId: string; toThemeId: string }
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
    case "logRep": {
      const entry = {
        id: createId("log"),
        actionId: action.actionId,
        date: action.date,
        ...(action.note ? { note: action.note } : {}),
      };
      return {
        ...state,
        chart: {
          ...chart,
          logs: [...chart.logs, entry],
        },
      };
    }

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

    case "moveAction": {
      const moving = chart.actions.find((item) => item.id === action.actionId);
      if (!moving || moving.themeId === action.toThemeId) return state;
      const targetCount = chart.actions.filter(
        (item) => item.themeId === action.toThemeId,
      ).length;
      if (targetCount >= ACTIONS_PER_THEME) return state;
      return {
        ...state,
        chart: {
          ...chart,
          actions: chart.actions.map((item) =>
            item.id === action.actionId
              ? { ...item, themeId: action.toThemeId }
              : item,
          ),
        },
      };
    }

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
  /** `loading` until auth and the chart have been read on the client. */
  status: "loading" | "signed-out" | "empty" | "ready";
  user: User | null;
  chart: Chart | null;
  /** Monday of the week every cadence view is currently reading. */
  weekKey: string;
  isCurrentWeek: boolean;
  shiftWeek: (delta: number) => void;
  goToCurrentWeek: () => void;
  initChart: (chart: Chart) => void;
  loadSampleChart: () => void;
  logRep: (actionId: string, date?: string, note?: string) => void;
  undoRep: (actionId: string, date?: string) => void;
  addAction: (themeId: string, title: string, target: number) => void;
  updateAction: (
    actionId: string,
    patch: { title?: string; target?: number },
  ) => void;
  deleteAction: (actionId: string) => void;
  moveAction: (actionId: string, toThemeId: string) => void;
  updateTheme: (themeId: string, title: string) => void;
  updateGoal: (patch: {
    goal: string;
    why?: string;
    deadline?: string;
  }) => void;
  setWeekNote: (weekKey: string, note: string) => void;
  resetChart: () => void;
  signOut: () => Promise<void>;
};

const ChartContext = createContext<ChartStore | null>(null);

export function ChartProvider({ children }: { children: React.ReactNode }) {
  // The week stays empty until mount so the server never renders from its own clock.
  const [state, dispatch] = useReducer(reducer, {
    chart: null,
    hydrated: false,
    weekKey: "",
  });
  const [user, setUser] = useState<User | null>(null);
  const skipSave = useRef(true);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const hydrate = async (nextUser: User | null) => {
      skipSave.current = true;
      setUser(nextUser);
      const weekKey = currentWeekKey();

      if (!nextUser) {
        if (!cancelled) {
          dispatch({ type: "hydrate", chart: null, weekKey });
        }
        return;
      }

      try {
        const remote = await loadRemoteChart(supabase);
        if (cancelled) return;
        if (remote) {
          saveChart(remote);
          dispatch({ type: "hydrate", chart: remote, weekKey });
          return;
        }

        const local = loadChart();
        if (local) {
          await saveRemoteChart(supabase, local);
          dispatch({ type: "hydrate", chart: local, weekKey });
          return;
        }

        dispatch({ type: "hydrate", chart: null, weekKey });
      } catch (error) {
        console.error("Failed to load chart from Supabase", error);
        if (!cancelled) {
          dispatch({ type: "hydrate", chart: loadChart(), weekKey });
        }
      }
    };

    void supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) void hydrate(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        void hydrate(session?.user ?? null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!state.hydrated || !user) return;
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }

    const supabase = createClient();
    const handle = window.setTimeout(() => {
      if (state.chart) {
        saveChart(state.chart);
        void saveRemoteChart(supabase, state.chart).catch((error) => {
          console.error("Failed to save chart to Supabase", error);
        });
      } else {
        clearChart();
        void deleteRemoteChart(supabase).catch((error) => {
          console.error("Failed to delete chart in Supabase", error);
        });
      }
    }, 350);

    return () => window.clearTimeout(handle);
  }, [state.chart, state.hydrated, user]);

  const weekKey = state.weekKey;

  const value = useMemo<ChartStore>(() => {
    const status = !state.hydrated
      ? ("loading" as const)
      : !user
        ? ("signed-out" as const)
        : state.chart
          ? ("ready" as const)
          : ("empty" as const);

    return {
      status,
      user,
      chart: state.chart,
      weekKey,
      isCurrentWeek: weekKey === currentWeekKey(),
      shiftWeek: (delta) => dispatch({ type: "shiftWeek", delta }),
      goToCurrentWeek: () => dispatch({ type: "goToCurrentWeek" }),
      initChart: (chart) => dispatch({ type: "init", chart }),
      loadSampleChart: () =>
        dispatch({ type: "init", chart: createSampleChart() }),
      logRep: (actionId, date, note) => {
        const trimmed = note?.trim();
        dispatch({
          type: "logRep",
          actionId,
          date: date ?? todayKey(),
          ...(trimmed ? { note: trimmed } : {}),
        });
      },
      undoRep: (actionId, date) =>
        dispatch({ type: "undoRep", actionId, date: date ?? todayKey() }),
      addAction: (themeId, title, target) =>
        dispatch({ type: "addAction", themeId, title, target }),
      updateAction: (actionId, patch) =>
        dispatch({ type: "updateAction", actionId, ...patch }),
      deleteAction: (actionId) => dispatch({ type: "deleteAction", actionId }),
      moveAction: (actionId, toThemeId) =>
        dispatch({ type: "moveAction", actionId, toThemeId }),
      updateTheme: (themeId, title) =>
        dispatch({ type: "updateTheme", themeId, title }),
      updateGoal: (patch) => dispatch({ type: "updateGoal", ...patch }),
      setWeekNote: (key, note) =>
        dispatch({ type: "setWeekNote", weekKey: key, note }),
      resetChart: () => dispatch({ type: "reset" }),
      signOut: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
      },
    };
  }, [state.chart, state.hydrated, user, weekKey]);

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
