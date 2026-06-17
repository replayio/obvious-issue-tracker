// Compact relative-time formatter for activity timelines and comments.
const UNITS: { limit: number; div: number; unit: Intl.RelativeTimeFormatUnit }[] =
  [
    { limit: 60, div: 1, unit: "second" },
    { limit: 3600, div: 60, unit: "minute" },
    { limit: 86400, div: 3600, unit: "hour" },
    { limit: 604800, div: 86400, unit: "day" },
    { limit: 2629800, div: 604800, unit: "week" },
    { limit: 31557600, div: 2629800, unit: "month" },
    { limit: Infinity, div: 31557600, unit: "year" },
  ];

const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

export function relativeTime(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffSeconds = (then - now) / 1000;
  const abs = Math.abs(diffSeconds);
  if (abs < 5) return "just now";
  const { div, unit } = UNITS.find((u) => abs < u.limit) ?? UNITS[UNITS.length - 1];
  return rtf.format(Math.round(diffSeconds / div), unit);
}

export function absoluteTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

