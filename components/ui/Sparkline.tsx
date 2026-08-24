const WIDTH = 100;
const HEIGHT = 28;

/** Weekly cadence percentages, oldest first. */
export function Sparkline({
  values,
  label,
}: {
  values: number[];
  label: string;
}) {
  if (values.length === 0) return null;

  const points = values.map((value, index) => {
    const x =
      values.length === 1 ? WIDTH / 2 : (index / (values.length - 1)) * WIDTH;
    const y = HEIGHT - (Math.max(0, Math.min(100, value)) / 100) * HEIGHT;
    return [x, y] as const;
  });

  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `0,${HEIGHT} ${line} ${WIDTH},${HEIGHT}`;
  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
      className="h-8 w-full overflow-visible"
    >
      <polygon points={area} className="fill-cell-part" />
      <polyline
        points={line}
        className="fill-none stroke-accent-soft"
        strokeWidth={1.4}
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={last[0]} cy={last[1]} r={2} className="fill-accent" />
    </svg>
  );
}
