import { useEffect } from "react";
import { useStore } from "@/store";
import { useNavigation } from "./useNavigation";
import { pageTitleForRoute } from "./page-title";

// The static shell ships one <title> for every URL (the app is hash-routed
// behind a Netlify redirect), so every route presented the same title to
// crawlers (bug-mvpp2o3h-9nwq). Keep the document title in sync with the
// active route instead.
export function useDocumentTitle() {
  const { route } = useNavigation();
  const { state } = useStore();

  let detailName: string | undefined;
  if (route.kind === "issue") {
    detailName = state.issues.find((i) => i.id === route.issueId)?.title;
  } else if (route.kind === "project") {
    detailName = state.projects.find((p) => p.id === route.projectId)?.name;
  } else if (route.kind === "cycle") {
    detailName = state.cycles.find((c) => c.id === route.cycleId)?.name;
  }

  useEffect(() => {
    document.title = pageTitleForRoute(route, detailName);
  }, [route, detailName]);
}
