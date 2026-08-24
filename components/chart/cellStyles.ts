import type { ActionStatus } from "@/lib/types";

export const STATUS_FILL: Record<ActionStatus, string> = {
  "not-started": "bg-surface",
  "part-way": "bg-cell-part",
  met: "bg-cell-met",
  ahead: "bg-cell-ahead",
};

export const STATUS_LABEL: Record<ActionStatus, string> = {
  "not-started": "not started",
  "part-way": "part way",
  met: "cadence met",
  ahead: "ahead of cadence",
};

export const LEGEND_ITEMS: { status: ActionStatus; label: string }[] = [
  { status: "not-started", label: "not started" },
  { status: "part-way", label: "part way" },
  { status: "met", label: "cadence met" },
];
