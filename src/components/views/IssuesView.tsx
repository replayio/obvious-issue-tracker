import { useOpenIssue } from "@/components/issue/useOpenIssue";
import {
  FilterBar,
  IssueViewProvider,
  useIssueViewData,
} from "@/components/issue/filtering";
import { ViewHeader } from "./ViewHeader";
import { EmptyState } from "./EmptyState";
import { ViewSwitcher } from "./ViewSwitcher";
import { useIssueViewMode } from "./useIssueViewMode";
import { IssueListView } from "./IssueListView";
import { IssueBoardView } from "./board/IssueBoardView";

function IssuesViewInner() {
  const [mode, setMode] = useIssueViewMode();
  const openIssue = useOpenIssue();
  const { visible, total } = useIssueViewData();

  return (
    <section className="flex h-full flex-col">
      <ViewHeader
        title="Issues"
        count={visible}
        actions={<ViewSwitcher mode={mode} onChange={setMode} />}
      />
      {total === 0 ? (
        <EmptyState
          title="No issues yet"
          description="Issues you create will show up here, grouped by workflow state."
        />
      ) : (
        <>
          <FilterBar />
          {mode === "list" ? (
            <IssueListView onOpenIssue={openIssue} />
          ) : (
            <IssueBoardView onOpenIssue={openIssue} />
          )}
        </>
      )}
    </section>
  );
}

export function IssuesView() {
  return (
    <IssueViewProvider>
      <IssuesViewInner />
    </IssueViewProvider>
  );
}
