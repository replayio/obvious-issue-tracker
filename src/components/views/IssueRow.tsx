import type { Issue } from "@/types";
import {
  AssigneeMenu,
  LabelChips,
  PriorityMenu,
  ProjectBadge,
  StateMenu,
} from "@/components/issue/inline-editors";

interface IssueRowProps {
  issue: Issue;
  onOpenIssue?: (id: string) => void;
}

// Dense, Linear-style issue row. Priority / state / assignee are inline editors
// that mutate the store; clicking elsewhere on the row opens the issue.
export function IssueRow({ issue, onOpenIssue }: IssueRowProps) {
  return (
    <div
      role={onOpenIssue ? "button" : undefined}
      tabIndex={onOpenIssue ? 0 : undefined}
      onClick={onOpenIssue ? () => onOpenIssue(issue.id) : undefined}
      onKeyDown={
        onOpenIssue
          ? (event) => {
              if (event.key === "Enter") onOpenIssue(issue.id);
            }
          : undefined
      }
      className="group flex items-center gap-3 border-b border-border px-5 py-2 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
    >
      <PriorityMenu issue={issue} />
      <StateMenu issue={issue} />
      <span className="w-16 shrink-0 font-mono text-xs text-muted-foreground">
        {issue.key}
      </span>
      <span className="flex-1 truncate text-sm text-foreground">
        {issue.title}
      </span>
      <ProjectBadge projectId={issue.projectId} />
      <LabelChips labelIds={issue.labelIds} className="hidden sm:flex" />
      <AssigneeMenu issue={issue} />
    </div>
  );
}
