import type { ReactElement } from "react";
import { useNavigation, type ViewId } from "@/navigation";
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
  const { view } = useNavigation();
  const View = VIEWS[view];
  return <View />;
}

