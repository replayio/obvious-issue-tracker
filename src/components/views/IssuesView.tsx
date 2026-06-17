import { useStore } from "@/store";
import { useOpenIssue } from "@/components/issue/useOpenIssue";
import { ViewHeader } from "./ViewHeader";
import { EmptyState } from "./EmptyState";
import { ViewSwitcher } from "./ViewSwitcher";
import { useIssueViewMode } from "./useIssueViewMode";
import { IssueListView } from "./IssueListView";
import { IssueBoardView } from "./board/IssueBoardView";

export function IssuesView() {
  const { state } = useStore();
  const [mode, setMode] = useIssueViewMode();
  const openIssue = useOpenIssue();

  return (
    <section className="flex h-full flex-col">
      <ViewHeader
        title="Issues"
        count={state.issues.length}
        actions={<ViewSwitcher mode={mode} onChange={setMode} />}
      />
      {state.issues.length === 0 ? (
        <EmptyState
          title="No issues yet"
          description="Issues you create will show up here, grouped by workflow state."
        />
      ) : mode === "list" ? (
        <IssueListView onOpenIssue={openIssue} />
      ) : (
        <IssueBoardView onOpenIssue={openIssue} />
      )}
    </section>
  );
}
