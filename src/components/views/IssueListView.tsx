import { useIssuesByState } from "@/components/issue/useIssuesByState";
import { StateGroupHeader } from "@/components/issue/StateGroupHeader";
import { IssueRow } from "./IssueRow";

// Grouped list surface: one section per workflow state, dense issue rows.
export function IssueListView({
  onOpenIssue,
}: {
  onOpenIssue: (id: string) => void;
}) {
  const groups = useIssuesByState();

  return (
    <div className="flex-1 overflow-y-auto">
      {groups.map(({ state, issues }) =>
        issues.length === 0 ? null : (
          <div key={state.id}>
            <div className="sticky top-0 z-10 border-b border-border bg-muted/60 px-5 py-1.5 backdrop-blur">
              <StateGroupHeader state={state} count={issues.length} />
            </div>
            {issues.map((issue) => (
              <IssueRow
                key={issue.id}
                issue={issue}
                onOpenIssue={onOpenIssue}
              />
            ))}
          </div>
        ),
      )}
    </div>
  );
}

