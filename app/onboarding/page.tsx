"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useChartStore } from "@/components/ChartProvider";
import { EmptyState, LoadingState } from "@/components/ChartStates";
import { TargetStepper, TextAreaField, TextField, inputClass } from "@/components/ui/Field";
import { todayKey } from "@/lib/dates";
import { createId } from "@/lib/id";
import { ACTIONS_PER_THEME, THEME_COUNT, type Chart } from "@/lib/types";

type ActionDraft = { title: string; target: number };

const THEME_PLACEHOLDERS = [
  "Algorithms",
  "Projects",
  "Applications",
  "Interview craft",
  "Technique",
  "Ear & theory",
  "Repertoire",
  "Body & mind",
];

const STEPS = ["Goal", "Themes", "Actions"] as const;

function emptyActionRows(count: number): ActionDraft[] {
  return Array.from({ length: count }, () => ({ title: "", target: 3 }));
}

export default function OnboardingPage() {
  const router = useRouter();
  const { status, chart, initChart, loadSampleChart } = useChartStore();

  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("");
  const [why, setWhy] = useState("");
  const [deadline, setDeadline] = useState("");
  const [themeTitles, setThemeTitles] = useState<string[]>(
    Array.from({ length: THEME_COUNT }, () => ""),
  );
  const [actionDrafts, setActionDrafts] = useState<ActionDraft[][]>(
    Array.from({ length: THEME_COUNT }, () => emptyActionRows(3)),
  );
  const [activeTheme, setActiveTheme] = useState(0);

  const namedThemes = themeTitles.filter((title) => title.trim()).length;
  const filledActions = useMemo(
    () =>
      actionDrafts.map(
        (rows) => rows.filter((row) => row.title.trim()).length,
      ),
    [actionDrafts],
  );
  const totalActions = filledActions.reduce((sum, count) => sum + count, 0);

  const canLeaveGoal = goal.trim().length > 0;
  const canLeaveThemes = namedThemes === THEME_COUNT;
  const canFinish = totalActions > 0;

  const updateTheme = (index: number, value: string) => {
    setThemeTitles((current) =>
      current.map((title, position) => (position === index ? value : title)),
    );
  };

  const updateAction = (
    themeIndex: number,
    rowIndex: number,
    patch: Partial<ActionDraft>,
  ) => {
    setActionDrafts((current) =>
      current.map((rows, position) =>
        position === themeIndex
          ? rows.map((row, index) =>
              index === rowIndex ? { ...row, ...patch } : row,
            )
          : rows,
      ),
    );
  };

  const addRow = (themeIndex: number) => {
    setActionDrafts((current) =>
      current.map((rows, position) =>
        position === themeIndex && rows.length < ACTIONS_PER_THEME
          ? [...rows, { title: "", target: 3 }]
          : rows,
      ),
    );
  };

  const removeRow = (themeIndex: number, rowIndex: number) => {
    setActionDrafts((current) =>
      current.map((rows, position) =>
        position === themeIndex
          ? rows.filter((_, index) => index !== rowIndex)
          : rows,
      ),
    );
  };

  const finish = () => {
    const themes = themeTitles.map((title, index) => ({
      id: createId("theme"),
      position: index + 1,
      title: title.trim() || THEME_PLACEHOLDERS[index],
    }));

    const actions = actionDrafts.flatMap((rows, themeIndex) =>
      rows
        .filter((row) => row.title.trim())
        .slice(0, ACTIONS_PER_THEME)
        .map((row) => ({
          id: createId("action"),
          themeId: themes[themeIndex].id,
          title: row.title.trim(),
          target: row.target,
        })),
    );

    const nextChart: Chart = {
      id: createId("chart"),
      goal: goal.trim(),
      why: why.trim() || undefined,
      deadline: deadline || undefined,
      themes,
      actions,
      logs: [],
      weekNotes: {},
      createdAt: todayKey(),
    };

    initChart(nextChart);
    router.push("/");
  };

  if (status === "loading") return <LoadingState />;
  if (status === "signed-out") return <EmptyState />;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-14">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="eyebrow text-accent">Build your chart</p>
        {chart && (
          <Link href="/" className="text-[13px] text-ink-faint underline underline-offset-4 hover:text-ink">
            Keep my current chart
          </Link>
        )}
      </div>

      <ol className="mt-6 flex items-center gap-2">
        {STEPS.map((label, index) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => index <= step && setStep(index)}
              disabled={index > step}
              className={`eyebrow flex items-center gap-2 transition ${
                index === step
                  ? "text-ink"
                  : index < step
                    ? "text-ink-soft hover:text-ink"
                    : "text-ink-faint"
              }`}
            >
              <span
                className={`tabular flex h-6 w-6 items-center justify-center rounded-full border text-[11px] ${
                  index <= step
                    ? "border-accent-soft bg-cell-met text-ink"
                    : "border-line text-ink-faint"
                }`}
              >
                {index + 1}
              </span>
              {label}
            </button>
            {index < STEPS.length - 1 && (
              <span className="h-px flex-1 bg-line" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>

      {chart && (
        <p className="mt-6 border border-line bg-cell-part px-4 py-3 text-[13px] text-ink-soft">
          You already have a chart. Finishing this wizard replaces it, including
          its logged history.
        </p>
      )}

      {step === 0 && (
        <section className="mt-9">
          <h1 className="font-display text-3xl leading-tight">
            What is the one thing this chart is for?
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            Write it the way you would say it out loud, with a finish line in it.
            This sits at the centre of the chart and everything else hangs off it.
          </p>

          <div className="mt-8 space-y-6">
            <TextField
              label="Long-term goal"
              value={goal}
              onChange={setGoal}
              autoFocus
              maxLength={120}
              placeholder="Land a 2027 SWE internship — and play bass at gig level"
            />
            <TextAreaField
              label="Why it matters (optional)"
              value={why}
              onChange={setWhy}
              placeholder="The reason you will still care about this in month five."
            />
            <TextField
              label="Target date (optional)"
              type="date"
              value={deadline}
              onChange={setDeadline}
            />
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={!canLeaveGoal}
              className="rounded-full bg-ink px-5 py-2.5 text-[14px] text-page transition hover:bg-ink/85 disabled:opacity-35"
            >
              Next: eight themes
            </button>
            {!chart && (
              <button
                type="button"
                onClick={() => {
                  loadSampleChart();
                  router.push("/");
                }}
                className="text-[13px] text-ink-faint underline underline-offset-4 transition hover:text-ink"
              >
                Or load the example chart
              </button>
            )}
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="mt-9">
          <h1 className="font-display text-3xl leading-tight">
            The eight areas the goal depends on.
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            Not tasks — areas. If one of these went quiet for a month, the goal
            would visibly suffer.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {themeTitles.map((title, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="tabular w-5 shrink-0 text-right text-[13px] text-ink-faint">
                  {index + 1}
                </span>
                <input
                  value={title}
                  autoFocus={index === 0}
                  maxLength={40}
                  onChange={(event) => updateTheme(index, event.target.value)}
                  placeholder={THEME_PLACEHOLDERS[index]}
                  aria-label={`Theme ${index + 1}`}
                  className={inputClass}
                />
              </div>
            ))}
          </div>

          <ThemePreview goal={goal} themes={themeTitles} />

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="rounded-full border border-line-strong px-5 py-2.5 text-[14px] text-ink-soft transition hover:border-ink hover:text-ink"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!canLeaveThemes}
              className="rounded-full bg-ink px-5 py-2.5 text-[14px] text-page transition hover:bg-ink/85 disabled:opacity-35"
            >
              Next: weekly actions
            </button>
            {!canLeaveThemes && (
              <span className="text-[13px] text-ink-faint">
                {THEME_COUNT - namedThemes} still to name
              </span>
            )}
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="mt-9">
          <h1 className="font-display text-3xl leading-tight">
            Small actions, on a weekly cadence.
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            Up to eight per theme. The number is how many times a week you mean
            to do it — that is the cadence the chart holds you to.
          </p>

          <div className="mt-8 flex flex-wrap gap-1.5">
            {themeTitles.map((title, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveTheme(index)}
                className={`rounded-full border px-3 py-1.5 text-[13px] transition ${
                  index === activeTheme
                    ? "border-ink bg-ink text-page"
                    : "border-line text-ink-soft hover:border-line-strong hover:text-ink"
                }`}
              >
                <span className="tabular mr-1.5 text-[11px] opacity-60">
                  {filledActions[index]}
                </span>
                {title.trim() || THEME_PLACEHOLDERS[index]}
              </button>
            ))}
          </div>

          <div className="mt-6 border border-line bg-surface p-5">
            <p className="eyebrow text-accent">
              {themeTitles[activeTheme].trim() || THEME_PLACEHOLDERS[activeTheme]}
            </p>

            <div className="mt-4 space-y-2.5">
              {actionDrafts[activeTheme].map((row, rowIndex) => (
                <div key={rowIndex} className="flex flex-wrap items-center gap-3">
                  <input
                    value={row.title}
                    maxLength={48}
                    onChange={(event) =>
                      updateAction(activeTheme, rowIndex, {
                        title: event.target.value,
                      })
                    }
                    placeholder={`Action ${rowIndex + 1}`}
                    aria-label={`Action ${rowIndex + 1} title`}
                    className={`${inputClass} flex-1 min-w-52`}
                  />
                  <TargetStepper
                    value={row.target}
                    onChange={(target) =>
                      updateAction(activeTheme, rowIndex, { target })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(activeTheme, rowIndex)}
                    aria-label={`Remove action ${rowIndex + 1}`}
                    className="h-7 w-7 rounded-full text-ink-faint transition hover:bg-surface-sunk hover:text-ink"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {actionDrafts[activeTheme].length < ACTIONS_PER_THEME && (
              <button
                type="button"
                onClick={() => addRow(activeTheme)}
                className="mt-4 text-[13px] text-accent underline decoration-accent/40 underline-offset-4 transition hover:decoration-accent"
              >
                Add another action
              </button>
            )}

            {activeTheme < THEME_COUNT - 1 && (
              <button
                type="button"
                onClick={() => setActiveTheme(activeTheme + 1)}
                className="mt-4 ml-4 text-[13px] text-ink-faint underline underline-offset-4 transition hover:text-ink"
              >
                Next theme →
              </button>
            )}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-full border border-line-strong px-5 py-2.5 text-[14px] text-ink-soft transition hover:border-ink hover:text-ink"
            >
              Back
            </button>
            <button
              type="button"
              onClick={finish}
              disabled={!canFinish}
              className="rounded-full bg-ink px-5 py-2.5 text-[14px] text-page transition hover:bg-ink/85 disabled:opacity-35"
            >
              Open my chart
            </button>
            <span className="tabular text-[13px] text-ink-faint">
              {totalActions} of 64 slots filled — you can add the rest from the
              chart later.
            </span>
          </div>
        </section>
      )}
    </div>
  );
}

function ThemePreview({ goal, themes }: { goal: string; themes: string[] }) {
  const cells = [
    themes[0],
    themes[1],
    themes[2],
    themes[3],
    null,
    themes[4],
    themes[5],
    themes[6],
    themes[7],
  ];

  return (
    <div className="mt-8">
      <p className="eyebrow text-ink-faint">Chart preview</p>
      <div className="mt-3 grid max-w-md grid-cols-3 gap-1">
        {cells.map((cell, index) => {
          if (cell === null) {
            return (
              <div
                key="goal"
                className="flex aspect-square items-center justify-center border border-ink/60 bg-surface p-2 text-center font-display text-[11px] leading-tight"
              >
                {goal.trim() || "Your goal"}
              </div>
            );
          }
          const themeNumber = index < 4 ? index + 1 : index;
          return (
            <div
              key={index}
              className="flex aspect-square items-center justify-center bg-cell-theme p-2 text-center text-[11px] leading-tight text-ink-soft"
            >
              {cell.trim() ? `${themeNumber}. ${cell.trim()}` : "—"}
            </div>
          );
        })}
      </div>
    </div>
  );
}
