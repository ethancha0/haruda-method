export function CadenceBar({
  pct,
  tone = "warm",
}: {
  pct: number;
  tone?: "warm" | "ink";
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <span
      role="presentation"
      className="block h-2 w-full border border-line bg-surface"
    >
      <span
        className={`block h-full ${tone === "ink" ? "bg-ink/70" : "bg-cell-ahead"}`}
        style={{ width: `${clamped}%` }}
      />
    </span>
  );
}
