import type { ReactElement } from "react";
import { useNavigation, type ViewId } from "@/navigation";
import { IssueDetailView } from "@/components/issue";
import { MyIssuesView } from "./MyIssuesView";
import { InboxView } from "./InboxView";
import { IssuesView } from "./IssuesView";
import { ProjectsView } from "./ProjectsView";
import { CyclesView } from "./CyclesView";

const VIEWS: Record<ViewId, () => ReactElement> = {
  "my-issues": MyIssuesView,
  inbox: InboxView,
  issues: IssuesView,
  projects: ProjectsView,
  cycles: CyclesView,
};

export function ViewRouter() {
  const { route } = useNavigation();
  if (route.kind === "issue") {
    return <IssueDetailView issueId={route.issueId} />;
  }
  const View = VIEWS[route.view];
  return <View />;
}
