"use client";

import { useState } from "react";
import { ActionCell, EmptyCell } from "@/components/chart/ActionCell";
import { useGridNav } from "@/components/chart/useGridNav";
import type { ThemeSummary } from "@/lib/cadence";
import { ACTIONS_PER_THEME, type ActionSummary } from "@/lib/types";

type ThemeBlockProps = {
  summary: ThemeSummary;
  canLog: boolean;
  onOpenAction: (actionId: string) => void;
  onQuickLog: (actionId: string) => void;
  onOpenEmptySlot: (themeId: string) => void;
  onOpenTheme: (themeId: string) => void;
  onMoveAction: (actionId: string, toThemeId: string) => void;
};

/** Set while an action cell is mid-drag so themes can tell "somewhere else" from "here". */
let draggedFromThemeId: string | null = null;

/** The eight actions sit in reading order around the theme label. */
function arrangeAroundCentre(
  actions: ActionSummary[],
): (ActionSummary | null | "centre")[] {
  const padded: (ActionSummary | null)[] = Array.from(
    { length: ACTIONS_PER_THEME },
    (_, index) => actions[index] ?? null,
  );
  return [
    padded[0],
    padded[1],
    padded[2],
    padded[3],
    "centre",
    padded[4],
    padded[5],
    padded[6],
    padded[7],
  ];
}

export function ThemeBlock({
  summary,
  canLog,
  onOpenAction,
  onQuickLog,
  onOpenEmptySlot,
  onOpenTheme,
  onMoveAction,
}: ThemeBlockProps) {
  const onKeyDown = useGridNav(3);
  const { theme } = summary;
  const cells = arrangeAroundCentre(summary.actions);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isDropTarget, setIsDropTarget] = useState(false);

  const isFull = summary.actions.length >= ACTIONS_PER_THEME;

  return (
    <section
      aria-label={`Theme ${theme.position}: ${theme.title}`}
      onKeyDown={onKeyDown}
      onDragOver={(event) => {
        if (draggedFromThemeId === null || draggedFromThemeId === theme.id) {
          return;
        }
        event.preventDefault();
        event.dataTransfer.dropEffect = isFull ? "none" : "move";
        if (!isFull) setIsDropTarget(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsDropTarget(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDropTarget(false);
        const actionId = event.dataTransfer.getData("text/plain");
        if (actionId && !isFull) onMoveAction(actionId, theme.id);
      }}
      className={`grid grid-cols-3 gap-px border bg-line transition ${
        isDropTarget
          ? "border-accent ring-2 ring-accent ring-offset-1"
          : "border-line"
      }`}
    >
      {cells.map((cell, index) => {
        if (cell === "centre") {
          return (
            <button
              key="centre"
              type="button"
              data-cell
              onClick={() => onOpenTheme(theme.id)}
              className="flex aspect-[4/3] w-full items-center bg-cell-theme p-2 text-left transition hover:brightness-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
            >
              <span className="text-[12px] leading-tight text-ink">
                {theme.position}. {theme.title}
              </span>
            </button>
          );
        }

        if (cell === null) {
          return (
            <EmptyCell
              key={`empty-${index}`}
              label={`Add an action to ${theme.title}`}
              onOpen={() => onOpenEmptySlot(theme.id)}
            />
          );
        }

        return (
          <ActionCell
            key={cell.action.id}
            summary={cell}
            draggable
            isDragging={draggingId === cell.action.id}
            onDragStart={(event) => {
              event.dataTransfer.setData("text/plain", cell.action.id);
              event.dataTransfer.effectAllowed = "move";
              draggedFromThemeId = theme.id;
              setDraggingId(cell.action.id);
            }}
            onDragEnd={() => {
              draggedFromThemeId = null;
              setDraggingId(null);
            }}
            onOpen={() => onOpenAction(cell.action.id)}
            onQuickLog={canLog ? () => onQuickLog(cell.action.id) : undefined}
          />
        );
      })}
    </section>
  );
}
