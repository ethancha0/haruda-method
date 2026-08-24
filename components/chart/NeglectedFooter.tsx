import { COLD_DAYS, type NeglectedSummary } from "@/lib/cadence";
import { formatDayGap } from "@/lib/dates";

export function NeglectedFooter({ neglected }: { neglected: NeglectedSummary }) {
  const { count, oldest } = neglected;

  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-line pt-4">
      <p className="flex flex-wrap items-baseline gap-2">
        <span className="eyebrow text-accent">Neglected</span>
        <span className="text-[13px] text-ink-soft">
          {count === 0 ? (
            <>Nothing has been left for {COLD_DAYS} days. Keep it there.</>
          ) : (
            <>
              {count} {count === 1 ? "action" : "actions"} past {COLD_DAYS} days
              {oldest && (
                <>
                  {" — oldest: "}
                  <span className="text-ink">{oldest.action.title}</span>
                  {" ("}
                  {oldest.daysSinceLast === null
                    ? formatDayGap(null)
                    : `${oldest.daysSinceLast}d`}
                  {`, ${oldest.theme.title})`}
                </>
              )}
            </>
          )}
        </span>
      </p>
      <p className="text-[12px] text-ink-faint">
        Dashed cell = untouched for {COLD_DAYS}+ days.
      </p>
    </div>
  );
}
