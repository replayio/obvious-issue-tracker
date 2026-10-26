import type { Route, ViewId } from "./context";

// Sidebar destination labels (src/components/Sidebar.tsx) name the list views.
const VIEW_LABELS: Record<ViewId, string> = {
  "my-issues": "My Issues",
  inbox: "Inbox",
  issues: "Issues",
  projects: "Projects",
  cycles: "Cycles",
};

// Detail route whose entity is unknown (e.g. a stale hash link): still name
// the route kind so the title distinguishes it from the list views.
const DETAIL_FALLBACK: Record<"issue" | "project" | "cycle", string> = {
  issue: "Issue",
  project: "Project",
  cycle: "Cycle",
};

export function pageTitleForRoute(
  route: Route,
  detailName: string | undefined,
): string {
  const label =
    route.kind === "view"
      ? VIEW_LABELS[route.view]
      : (detailName ?? DETAIL_FALLBACK[route.kind]);
  return `${label} — Issue Tracker`;
}
