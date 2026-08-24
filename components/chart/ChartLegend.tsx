import { LEGEND_ITEMS, STATUS_FILL } from "@/components/chart/cellStyles";

export function ChartLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {LEGEND_ITEMS.map((item) => (
        <li key={item.status} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`h-3.5 w-3.5 border border-line-strong/70 ${STATUS_FILL[item.status]}`}
          />
          <span className="text-[12px] text-ink-soft">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
