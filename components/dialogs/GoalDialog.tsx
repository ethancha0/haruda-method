"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useChartStore } from "@/components/ChartProvider";
import { Dialog } from "@/components/ui/Dialog";
import { TextAreaField, TextField } from "@/components/ui/Field";

export function GoalDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { chart, updateGoal, resetChart } = useChartStore();
  const [confirmingReset, setConfirmingReset] = useState(false);

  if (!chart) return null;

  return (
    <Dialog open onClose={onClose} eyebrow="The centre of the chart" title="Your goal">
      <div className="space-y-5">
        <TextField
          label="Long-term goal"
          value={chart.goal}
          maxLength={120}
          onChange={(goal) =>
            updateGoal({ goal, why: chart.why, deadline: chart.deadline })
          }
        />
        <TextAreaField
          label="Why it matters"
          value={chart.why ?? ""}
          onChange={(why) =>
            updateGoal({ goal: chart.goal, why, deadline: chart.deadline })
          }
          placeholder="The reason you will still care about this in month five."
        />
        <TextField
          label="Target date"
          type="date"
          value={chart.deadline ?? ""}
          onChange={(deadline) =>
            updateGoal({ goal: chart.goal, why: chart.why, deadline })
          }
        />

        <div className="border-t border-line pt-5">
          {confirmingReset ? (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  resetChart();
                  router.push("/onboarding");
                }}
                className="rounded-full bg-ink px-4 py-2 text-[13px] text-page transition hover:bg-ink/85"
              >
                Delete everything and start over
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="text-[13px] text-ink-faint underline underline-offset-4 hover:text-ink"
              >
                Keep my chart
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              className="text-[13px] text-ink-faint underline underline-offset-4 transition hover:text-accent"
            >
              Start a new chart from scratch
            </button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
