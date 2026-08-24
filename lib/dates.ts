const MS_PER_DAY = 86_400_000;

/** `yyyy-mm-dd` in the user's local time, never UTC. */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Local-midnight Date for a `yyyy-mm-dd` key. `new Date(key)` would parse as UTC. */
export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addDaysToKey(key: string, days: number): string {
  return toDateKey(addDays(fromDateKey(key), days));
}

/** Monday-anchored week start. */
export function startOfWeek(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const weekday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - weekday);
  return start;
}

export function weekKeyOf(key: string): string {
  return toDateKey(startOfWeek(fromDateKey(key)));
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function currentWeekKey(): string {
  return toDateKey(startOfWeek(new Date()));
}

/** Whole days from `from` to `to`; negative when `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  const diff = fromDateKey(to).getTime() - fromDateKey(from).getTime();
  return Math.round(diff / MS_PER_DAY);
}

export function isWithinWeek(dateKey: string, weekKey: string): boolean {
  const offset = daysBetween(weekKey, dateKey);
  return offset >= 0 && offset < 7;
}

export function weekDayKeys(weekKey: string): string[] {
  return Array.from({ length: 7 }, (_, index) => addDaysToKey(weekKey, index));
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function formatDayMonth(key: string): string {
  const date = fromDateKey(key);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function formatWeekRange(weekKey: string): string {
  const endKey = addDaysToKey(weekKey, 6);
  return `${formatDayMonth(weekKey)} – ${formatDayMonth(endKey)}`;
}

export function formatWeekdayShort(key: string): string {
  return WEEKDAYS[(fromDateKey(key).getDay() + 6) % 7];
}

export function formatFullDate(key: string): string {
  const date = fromDateKey(key);
  return `${formatWeekdayShort(key)} ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** "today", "yesterday", "4d ago", or "never" for a null gap. */
export function formatDayGap(days: number | null): string {
  if (days === null) return "never";
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}
