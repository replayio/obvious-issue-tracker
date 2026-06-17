import type { Issue, WorkflowState } from "@/types";

/** Returns { done, total, pct } for a set of issues relative to the provided workflow states. */
export function computeProgress(
  issues: Issue[],
  statesById: Map<string, WorkflowState>,
): { done: number; total: number; pct: number } {
  const total = issues.length;
  const done = issues.filter((i) => {
    const s = statesById.get(i.stateId);
    return s?.category === "completed";
  }).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, pct };
}

/** Formats an ISO date string as "Jan 5". */
export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/** Returns "active" | "upcoming" | "completed" for a cycle based on today. */
export function cycleStatus(
  startDate: string,
  endDate: string,
): "active" | "upcoming" | "completed" {
  const now = Date.now();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (now < start) return "upcoming";
  if (now > end) return "completed";
  return "active";
}

