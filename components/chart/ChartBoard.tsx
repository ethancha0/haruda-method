"use client";

import { useMemo, useState } from "react";
import { CenterBlock } from "@/components/chart/CenterBlock";
import { ChartLegend } from "@/components/chart/ChartLegend";
import { NeglectedFooter } from "@/components/chart/NeglectedFooter";
import { ThemeBlock } from "@/components/chart/ThemeBlock";
import { ThemeStack } from "@/components/chart/ThemeStack";
import { useChartStore } from "@/components/ChartProvider";
import {
  ChartDialogs,
  type DialogTarget,
} from "@/components/dialogs/ChartDialogs";
import { buildChartWeek } from "@/lib/cadence";
import { formatDayMonth } from "@/lib/dates";
import type { Chart } from "@/lib/types";

export function ChartBoard({ chart }: { chart: Chart }) {
  const { weekKey, isCurrentWeek, logRep } = useChartStore();
  const [target, setTarget] = useState<DialogTarget>(null);

  const week = useMemo(() => buildChartWeek(chart, weekKey), [chart, weekKey]);
  const themes = week.themes;

  const blockProps = {
    canLog: true,
    onOpenAction: (actionId: string) => setTarget({ kind: "action", actionId }),
    onQuickLog: (actionId: string) => logRep(actionId),
    onOpenEmptySlot: (themeId: string) =>
      setTarget({ kind: "newAction", themeId }),
    onOpenTheme: (themeId: string) => setTarget({ kind: "theme", themeId }),
  };

  const order = [0, 1, 2, 3, -1, 4, 5, 6, 7];

  return (
    <>
      <div className="border border-line bg-surface p-4 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
          <div>
            <p className="eyebrow text-accent">
              Cadence heat · Week of {formatDayMonth(weekKey)}
            </p>
            <h1 className="mt-2 font-display text-[26px] leading-tight sm:text-[32px]">
              {isCurrentWeek
                ? "Where the week is actually going"
                : "Where that week actually went"}
            </h1>
          </div>
          <div className="border border-line bg-surface-sunk px-3 py-2">
            <ChartLegend />
          </div>
        </div>

        <div className="mt-7 hidden grid-cols-3 gap-2 md:grid">
          {order.map((themeIndex) =>
            themeIndex === -1 ? (
              <CenterBlock
                key="centre"
                goal={chart.goal}
                themes={themes}
                onOpenGoal={() => setTarget({ kind: "goal" })}
                onOpenTheme={blockProps.onOpenTheme}
              />
            ) : (
              themes[themeIndex] && (
                <ThemeBlock
                  key={themes[themeIndex].theme.id}
                  summary={themes[themeIndex]}
                  {...blockProps}
                />
              )
            ),
          )}
        </div>

        <div className="mt-6 md:hidden">
          <ThemeStack
            chart={chart}
            week={week}
            onOpenGoal={() => setTarget({ kind: "goal" })}
            onOpenAction={blockProps.onOpenAction}
            onOpenEmptySlot={blockProps.onOpenEmptySlot}
            onQuickLog={blockProps.onQuickLog}
          />
        </div>

        <div className="mt-6">
          <NeglectedFooter neglected={week.neglected} />
        </div>
      </div>

      <ChartDialogs target={target} onChange={setTarget} />
    </>
  );
}
