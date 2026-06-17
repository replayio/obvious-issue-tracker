import { useStore } from "@/store";
import { ViewHeader } from "./ViewHeader";
import { IssueRow } from "./IssueRow";
import { EmptyState } from "./EmptyState";

export function MyIssuesView() {
  const { state } = useStore();
  const mine = state.issues
    .filter((i) => i.assigneeId === state.currentUserId)
    .sort((a, b) => a.order - b.order);

  return (
    <section className="flex h-full flex-col">
      <ViewHeader title="My Issues" count={mine.length} />
      <div className="flex-1 overflow-y-auto">
        {mine.length === 0 ? (
          <EmptyState
            title="Nothing assigned to you"
            description="Issues assigned to you across all projects will appear here."
          />
        ) : (
          mine.map((issue) => <IssueRow key={issue.id} issue={issue} />)
        )}
      </div>
    </section>
  );
}

