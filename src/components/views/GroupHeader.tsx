import type { IssueGroup } from "@/components/issue/filtering";
import { StateIcon } from "@/components/issue/meta";

// Section / column header for a grouped issue bucket. Shows the state icon when
// grouping by workflow state, a colored dot for assignee groups, or just the
// label for priority / none. Count reflects the issues after filtering.
export function GroupHeader({ group }: { group: IssueGroup }) {
  return (
    <div className="flex items-center gap-2">
      {group.state ? (
        <StateIcon state={group.state} />
      ) : group.color ? (
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: group.color }}
          aria-hidden
        />
      ) : null}
      <span className="text-xs font-semibold text-foreground">
        {group.label}
      </span>
      <span className="text-xs text-muted-foreground">
        {group.issues.length}
      </span>
    </div>
  );
}

