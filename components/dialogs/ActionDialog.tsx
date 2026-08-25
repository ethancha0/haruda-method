"use client";

import { useMemo, useState } from "react";
import { RepHistoryStrip } from "@/components/dialogs/RepHistoryStrip";
import { useChartStore } from "@/components/ChartProvider";
import { TargetStepper, inputClass } from "@/components/ui/Field";
import { Dialog } from "@/components/ui/Dialog";
import { actionStatus } from "@/lib/cadence";
import {
  addDaysToKey,
  daysBetween,
  formatDayGap,
  formatFullDate,
  isWithinWeek,
  todayKey,
} from "@/lib/dates";
import { STATUS_LABEL } from "@/components/chart/cellStyles";

type ActionDialogProps = {
  actionId?: string;
  /** Set instead of `actionId` to create a new action in that theme. */
  createInThemeId?: string;
  onClose: () => void;
};

export function ActionDialog({
  actionId,
  createInThemeId,
  onClose,
}: ActionDialogProps) {
  const store = useChartStore();
  const { chart, weekKey, isCurrentWeek } = store;

  const action = chart?.actions.find((item) => item.id === actionId);
  const theme = chart?.themes.find(
    (item) => item.id === (action?.themeId ?? createInThemeId),
  );

  const [draftTitle, setDraftTitle] = useState(action?.title ?? "");
  const [draftTarget, setDraftTarget] = useState(action?.target ?? 3);
  const [draftNote, setDraftNote] = useState("");

  const logDate = isCurrentWeek ? todayKey() : addDaysToKey(weekKey, 6);

  const { reps, daysSinceLast } = useMemo(() => {
    const logs = chart?.logs.filter((log) => log.actionId === actionId) ?? [];
    const days = logs.map((log) => log.date).sort();
    const lastDone = days.length > 0 ? days[days.length - 1] : null;

    return {
      reps: days.filter((day) => isWithinWeek(day, weekKey)).length,
      daysSinceLast:
        lastDone === null ? null : Math.max(0, daysBetween(lastDone, logDate)),
    };
  }, [chart?.logs, actionId, weekKey, logDate]);

  if (!chart || !theme) return null;

  const isCreate = !action;
  const status = action ? actionStatus(reps, action.target) : "not-started";

  const logRep = () => {
    if (!action) return;
    const note = draftNote.trim() || undefined;
    store.logRep(action.id, logDate, note);
    setDraftNote("");
  };

  return (
    <Dialog
      open
      onClose={onClose}
      eyebrow={`${theme.position}. ${theme.title}`}
      title={isCreate ? "Add an action" : action.title}
    >
      {isCreate ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!draftTitle.trim()) return;
            store.addAction(theme.id, draftTitle.trim(), draftTarget);
            onClose();
          }}
          className="space-y-5"
        >
          <input
            value={draftTitle}
            maxLength={48}
            autoFocus
            onChange={(event) => setDraftTitle(event.target.value)}
            placeholder="Something small you can repeat"
            aria-label="Action title"
            className={inputClass}
          />
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-ink-soft">Weekly cadence</span>
            <TargetStepper value={draftTarget} onChange={setDraftTarget} />
          </div>
          <button
            type="submit"
            disabled={!draftTitle.trim()}
            className="w-full rounded-full bg-ink px-5 py-2.5 text-[14px] text-page transition hover:bg-ink/85 disabled:opacity-35"
          >
            Add to chart
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex items-end justify-between gap-4 border border-line bg-surface-sunk px-4 py-3">
            <div>
              <p className="tabular font-display text-2xl leading-none">
                {reps}
                <span className="text-ink-faint">/{action.target}</span>
              </p>
              <p className="mt-1.5 text-[12px] text-ink-soft">
                {STATUS_LABEL[status]} · last done {formatDayGap(daysSinceLast)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => store.undoRep(action.id, logDate)}
                disabled={reps === 0}
                className="rounded-full border border-line-strong px-3 py-1.5 text-[13px] text-ink-soft transition hover:border-ink hover:text-ink disabled:opacity-35"
              >
                Undo
              </button>
              <button
                type="button"
                onClick={logRep}
                className="rounded-full bg-ink px-4 py-1.5 text-[13px] text-page transition hover:bg-ink/85"
              >
                Log a rep
              </button>
            </div>
          </div>

          <input
            value={draftNote}
            maxLength={120}
            onChange={(event) => setDraftNote(event.target.value)}
            placeholder="What did you do? (optional)"
            aria-label="Rep description"
            className={inputClass}
          />

          {!isCurrentWeek && (
            <p className="text-[12px] text-ink-faint">
              Reps land on {formatFullDate(logDate)} while you are reviewing an
              earlier week.
            </p>
          )}

          <RepHistoryStrip
            key={`${action.id}-${logDate}`}
            actionId={action.id}
            logs={chart.logs}
            logDate={logDate}
            chartCreatedAt={chart.createdAt}
          />

          <div className="space-y-4 border-t border-line pt-5">
            <input
              value={draftTitle}
              maxLength={48}
              onChange={(event) => setDraftTitle(event.target.value)}
              onBlur={() => {
                const title = draftTitle.trim();
                if (title && title !== action.title) {
                  store.updateAction(action.id, { title });
                } else if (!title) {
                  setDraftTitle(action.title);
                }
              }}
              aria-label="Action title"
              className={inputClass}
            />
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-ink-soft">Weekly cadence</span>
              <TargetStepper
                value={draftTarget}
                onChange={(target) => {
                  setDraftTarget(target);
                  store.updateAction(action.id, { target });
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                store.deleteAction(action.id);
                onClose();
              }}
              className="text-[13px] text-ink-faint underline underline-offset-4 transition hover:text-accent"
            >
              Remove this action and its history
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
