"use client";

import { useCallback } from "react";

const ARROWS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

/** Arrow-key movement between `[data-cell]` elements inside one block. */
export function useGridNav(columns = 3) {
  return useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (!ARROWS.has(event.key)) return;

      const cells = Array.from(
        event.currentTarget.querySelectorAll<HTMLElement>("[data-cell]"),
      );
      const index = cells.indexOf(document.activeElement as HTMLElement);
      if (index < 0) return;

      const row = Math.floor(index / columns);
      const column = index % columns;
      const rows = Math.ceil(cells.length / columns);

      let nextRow = row;
      let nextColumn = column;
      if (event.key === "ArrowUp") nextRow = Math.max(0, row - 1);
      if (event.key === "ArrowDown") nextRow = Math.min(rows - 1, row + 1);
      if (event.key === "ArrowLeft") nextColumn = Math.max(0, column - 1);
      if (event.key === "ArrowRight")
        nextColumn = Math.min(columns - 1, column + 1);

      const nextIndex = nextRow * columns + nextColumn;
      const target = cells[nextIndex];
      if (!target || target === cells[index]) return;

      event.preventDefault();
      target.focus();
    },
    [columns],
  );
}
