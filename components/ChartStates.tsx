"use client";

import Link from "next/link";
import { useChartStore } from "@/components/ChartProvider";

export function LoadingState() {
  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 py-16">
      <div className="h-3 w-40 animate-pulse rounded-full bg-line" />
      <div className="mt-4 h-8 w-80 animate-pulse rounded-full bg-line/70" />
      <div className="mt-10 grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-sm bg-surface/80"
          />
        ))}
      </div>
    </div>
  );
}

export function EmptyState() {
  const { status, loadSampleChart } = useChartStore();

  if (status === "signed-out") {
    return (
      <div className="mx-auto w-full max-w-xl px-5 py-20">
        <p className="eyebrow text-accent">Haruda Method</p>
        <h1 className="mt-3 font-display text-4xl leading-tight">
          One goal, eight themes, sixty-four actions.
        </h1>
        <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
          Sign in with Google and the chart follows you — goal, weekly cadence,
          and the log of every rep.
        </p>
        <Link
          href="/login"
          className="mt-9 inline-flex rounded-full bg-ink px-5 py-2.5 text-[14px] text-page transition hover:bg-ink/85"
        >
          Continue with Google
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl px-5 py-20">
      <p className="eyebrow text-accent">Haruda Method</p>
      <h1 className="mt-3 font-display text-4xl leading-tight">
        One goal, eight themes, sixty-four actions.
      </h1>
      <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
        Name the long-term goal at the centre of the chart, break it into the
        eight areas it depends on, then give each area the small weekly actions
        that actually move it. Every view here reads from that one chart.
      </p>

      <div className="mt-9 flex flex-wrap items-center gap-3">
        <Link
          href="/onboarding"
          className="rounded-full bg-ink px-5 py-2.5 text-[14px] text-page transition hover:bg-ink/85"
        >
          Build my chart
        </Link>
        <button
          type="button"
          onClick={loadSampleChart}
          className="rounded-full border border-line-strong px-5 py-2.5 text-[14px] text-ink-soft transition hover:border-ink hover:text-ink"
        >
          Load the example chart
        </button>
      </div>

      <p className="mt-4 text-[13px] text-ink-faint">
        Saved to your account. A new device with the same Google login will see
        the same chart.
      </p>
    </div>
  );
}
