"use client";

import { ChartBoard } from "@/components/chart/ChartBoard";
import { useChartStore } from "@/components/ChartProvider";
import { EmptyState, LoadingState } from "@/components/ChartStates";

export default function ChartPage() {
  const { status, chart } = useChartStore();

  if (status === "loading") return <LoadingState />;
  if (!chart) return <EmptyState />;

  return (
    <div className="mx-auto w-full max-w-[1180px] px-3 py-6 sm:px-5 sm:py-8">
      <ChartBoard chart={chart} />
    </div>
  );
}
