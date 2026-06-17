import { useIssueViewData } from "@/components/issue/filtering";
import { GroupHeader } from "./GroupHeader";
import { EmptyState } from "./EmptyState";
import { IssueRow } from "./IssueRow";

// Grouped list surface: one section per active grouping bucket, dense rows.
// Honors the shared filter / sort / group view settings.
export function IssueListView({
  onOpenIssue,
}: {
  onOpenIssue: (id: string) => void;
}) {
  const { groups, visible } = useIssueViewData();

  if (visible === 0) {
    return (
      <EmptyState
        title="No matching issues"
        description="No issues match the current filters. Try clearing or adjusting them."
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {groups.map((group) =>
        group.issues.length === 0 ? null : (
          <div key={group.id}>
            <div className="sticky top-0 z-10 border-b border-border bg-muted/60 px-5 py-1.5 backdrop-blur">
              <GroupHeader group={group} />
            </div>
            {group.issues.map((issue) => (
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