"use client";

import { ActionDialog } from "@/components/dialogs/ActionDialog";
import { GoalDialog } from "@/components/dialogs/GoalDialog";
import { ThemeDialog } from "@/components/dialogs/ThemeDialog";

export type DialogTarget =
  | { kind: "action"; actionId: string }
  | { kind: "newAction"; themeId: string }
  | { kind: "theme"; themeId: string }
  | { kind: "goal" }
  | null;

export function ChartDialogs({
  target,
  onChange,
}: {
  target: DialogTarget;
  onChange: (next: DialogTarget) => void;
}) {
  if (!target) return null;
  const close = () => onChange(null);

  switch (target.kind) {
    case "action":
      return <ActionDialog actionId={target.actionId} onClose={close} />;
    case "newAction":
      return <ActionDialog createInThemeId={target.themeId} onClose={close} />;
    case "theme":
      return (
        <ThemeDialog
          themeId={target.themeId}
          onClose={close}
          onOpenAction={(actionId) => onChange({ kind: "action", actionId })}
        />
      );
    case "goal":
      return <GoalDialog onClose={close} />;
    default:
      return null;
  }
}
