import { addDaysToKey, currentWeekKey, daysBetween, todayKey } from "@/lib/dates";
import { createId } from "@/lib/id";
import type { Chart, LogEntry } from "@/lib/types";

type ActionSpec = {
  title: string;
  target: number;
  /** Reps already logged in the current week. */
  reps: number;
  /** Days since the most recent rep; null means never done. */
  lastDays: number | null;
};

type ThemeSpec = {
  title: string;
  actions: ActionSpec[];
};

/** The chart from the design mockup, in reading order per theme. */
const THEME_SPECS: ThemeSpec[] = [
  {
    title: "Algorithms",
    actions: [
      { title: "Two LeetCode mediums", target: 3, reps: 3, lastDays: 0 },
      { title: "Review weak-topic notes", target: 2, reps: 1, lastDays: 2 },
      { title: "Timed mock set", target: 1, reps: 1, lastDays: 4 },
      { title: "Pattern flashcards", target: 5, reps: 4, lastDays: 1 },
      { title: "Graph & tree drills", target: 2, reps: 0, lastDays: 12 },
      { title: "Explain a fix aloud", target: 2, reps: 2, lastDays: 1 },
      { title: "Sunday contest", target: 1, reps: 1, lastDays: 3 },
      { title: "Log every failure", target: 3, reps: 2, lastDays: 2 },
    ],
  },
  {
    title: "Projects",
    actions: [
      { title: "Ship a commit", target: 5, reps: 4, lastDays: 0 },
      { title: "Write the README", target: 1, reps: 1, lastDays: 6 },
      { title: "Deploy to prod", target: 1, reps: 0, lastDays: 9 },
      { title: "Add a test", target: 3, reps: 2, lastDays: 1 },
      { title: "Refactor one module", target: 2, reps: 1, lastDays: 3 },
      { title: "Record a demo clip", target: 1, reps: 0, lastDays: 14 },
      { title: "Ask for a code review", target: 1, reps: 1, lastDays: 5 },
      { title: "Write the build log", target: 1, reps: 6, lastDays: 0 },
    ],
  },
  {
    title: "Applications",
    actions: [
      { title: "Five applications", target: 5, reps: 5, lastDays: 0 },
      { title: "Sharpen a résumé bullet", target: 2, reps: 2, lastDays: 1 },
      { title: "Tailor the cover note", target: 3, reps: 3, lastDays: 0 },
      { title: "One referral DM", target: 3, reps: 1, lastDays: 4 },
      { title: "Track in the sheet", target: 5, reps: 5, lastDays: 0 },
      { title: "Follow up at 7 days", target: 2, reps: 0, lastDays: 10 },
      { title: "Alumni coffee chat", target: 1, reps: 1, lastDays: 6 },
      { title: "Career-fair prep", target: 1, reps: 0, lastDays: 18 },
    ],
  },
  {
    title: "Interview craft",
    actions: [
      { title: "Rehearse a STAR story", target: 3, reps: 2, lastDays: 1 },
      { title: "Mock with a friend", target: 1, reps: 1, lastDays: 5 },
      { title: "System-design reading", target: 2, reps: 1, lastDays: 3 },
      { title: "Talk-aloud practice", target: 3, reps: 2, lastDays: 2 },
      { title: "Recruiter-call prep", target: 1, reps: 0, lastDays: 11 },
      { title: "Grow the question bank", target: 2, reps: 2, lastDays: 1 },
      { title: "Write a post-mortem", target: 1, reps: 1, lastDays: 5 },
      { title: "Watch one teardown", target: 1, reps: 0, lastDays: 8 },
    ],
  },
  {
    title: "Technique",
    actions: [
      { title: "Metronome scales 15m", target: 5, reps: 5, lastDays: 0 },
      { title: "Right-hand muting", target: 4, reps: 3, lastDays: 1 },
      { title: "Slap & pop drill", target: 3, reps: 1, lastDays: 4 },
      { title: "Fretboard octaves", target: 4, reps: 4, lastDays: 0 },
      { title: "Sight-read a page", target: 3, reps: 2, lastDays: 2 },
      { title: "Finger warm-up", target: 6, reps: 6, lastDays: 0 },
      { title: "Slow clean run-through", target: 3, reps: 2, lastDays: 1 },
      { title: "Record & critique", target: 2, reps: 1, lastDays: 3 },
    ],
  },
  {
    title: "Ear & theory",
    actions: [
      { title: "Interval trainer 10m", target: 4, reps: 3, lastDays: 1 },
      { title: "Transcribe eight bars", target: 2, reps: 1, lastDays: 3 },
      { title: "Modes on one string", target: 3, reps: 0, lastDays: 13 },
      { title: "Chord tones over changes", target: 3, reps: 2, lastDays: 2 },
      { title: "Sing the root notes", target: 4, reps: 3, lastDays: 1 },
      { title: "Rhythm dictation", target: 2, reps: 1, lastDays: 5 },
      { title: "Nashville numbers", target: 1, reps: 0, lastDays: 16 },
      { title: "Key of the week", target: 1, reps: 1, lastDays: 4 },
    ],
  },
  {
    title: "Repertoire",
    actions: [
      { title: "Learn a new tune", target: 1, reps: 1, lastDays: 2 },
      { title: "Play with backing track", target: 4, reps: 3, lastDays: 0 },
      { title: "Loop the weak section", target: 4, reps: 2, lastDays: 2 },
      { title: "Jam night", target: 1, reps: 0, lastDays: 9 },
      { title: "Record a take", target: 2, reps: 1, lastDays: 3 },
      { title: "Setlist upkeep", target: 1, reps: 1, lastDays: 6 },
      { title: "Post a clip", target: 1, reps: 0, lastDays: 21 },
      { title: "Learn a request", target: 1, reps: 1, lastDays: 5 },
    ],
  },
  {
    title: "Body & mind",
    actions: [
      { title: "Sleep 7.5 hours", target: 7, reps: 6, lastDays: 0 },
      { title: "Walk 8k steps", target: 5, reps: 5, lastDays: 0 },
      { title: "Lift", target: 3, reps: 2, lastDays: 1 },
      { title: "No-screen hour", target: 5, reps: 3, lastDays: 2 },
      { title: "Journal five minutes", target: 5, reps: 4, lastDays: 1 },
      { title: "Drink 2L water", target: 7, reps: 6, lastDays: 0 },
      { title: "Phone down by ten", target: 5, reps: 2, lastDays: 3 },
      { title: "Sunday review", target: 1, reps: 1, lastDays: 6 },
    ],
  },
];

/** Deterministic jitter so the demo history looks lived-in but never shifts between renders. */
function pseudoRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export function createSampleChart(): Chart {
  const today = todayKey();
  const weekStart = currentWeekKey();
  const elapsedDays = Math.max(0, daysBetween(weekStart, today));
  const logs: LogEntry[] = [];

  const themes = THEME_SPECS.map((spec, themeIndex) => ({
    id: createId("theme"),
    position: themeIndex + 1,
    title: spec.title,
  }));

  const actions = THEME_SPECS.flatMap((spec, themeIndex) =>
    spec.actions.map((actionSpec, actionIndex) => {
      const action = {
        id: createId("action"),
        themeId: themes[themeIndex].id,
        title: actionSpec.title,
        target: actionSpec.target,
      };

      const seed = themeIndex * 8 + actionIndex + 1;
      const lastDayKey =
        actionSpec.lastDays === null
          ? null
          : addDaysToKey(today, -actionSpec.lastDays);

      // Current week: the most recent rep sits on its stated day, the rest fan out behind it.
      for (let rep = 0; rep < actionSpec.reps; rep += 1) {
        const offset = Math.min(
          elapsedDays,
          (actionSpec.lastDays ?? 0) + Math.floor(rep / 2),
        );
        logs.push({
          id: createId("log"),
          actionId: action.id,
          date: addDaysToKey(today, -offset),
        });
      }

      if (actionSpec.reps === 0 && lastDayKey) {
        logs.push({ id: createId("log"), actionId: action.id, date: lastDayKey });
      }

      // Prior weeks, only on days older than the stated last rep so the "cold" gaps stay true.
      const weeklyFactor = [0.85, 0.65, 0.45];
      weeklyFactor.forEach((factor, weekBack) => {
        const priorWeekStart = addDaysToKey(weekStart, -7 * (weekBack + 1));
        const jitter = pseudoRandom(seed + weekBack * 31);
        const count = Math.round(action.target * factor * (0.6 + jitter * 0.8));
        for (let rep = 0; rep < count; rep += 1) {
          const dayKey = addDaysToKey(priorWeekStart, (rep * 2 + weekBack) % 7);
          if (lastDayKey && dayKey >= lastDayKey) continue;
          if (dayKey >= weekStart) continue;
          logs.push({ id: createId("log"), actionId: action.id, date: dayKey });
        }
      });

      return action;
    }),
  );

  return {
    id: createId("chart"),
    goal: "Land a 2027 SWE internship — and play bass at gig level",
    why: "Two things I actually care about, tracked side by side so neither one quietly dies.",
    themes,
    actions,
    logs,
    weekNotes: {},
    createdAt: addDaysToKey(weekStart, -28),
  };
}
