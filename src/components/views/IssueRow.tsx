import type { Priority } from "@/types";
import { useLookups } from "@/store";
import type { Issue } from "@/types";

const PRIORITY_VAR: Record<Priority, string> = {
  urgent: "var(--priority-urgent)",
  high: "var(--priority-high)",
  medium: "var(--priority-medium)",
  low: "var(--priority-low)",
  none: "var(--priority-none)",
};

export function IssueRow({ issue }: { issue: Issue }) {
  const { statesById, membersById, labelsById } = useLookups();
  const state = statesById.get(issue.stateId);
  const assignee = issue.assigneeId
    ? membersById.get(issue.assigneeId)
    : undefined;

  return (
    <div className="flex items-center gap-3 border-b border-border px-5 py-2 hover:bg-muted/50">
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: PRIORITY_VAR[issue.priority] }}
        title={`Priority: ${issue.priority}`}
      />
      {state && (
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full border"
          style={{ borderColor: state.color }}
          title={state.name}
        />
      )}
      <span className="w-16 shrink-0 font-mono text-xs text-muted-foreground">
        {issue.key}
      </span>
      <span className="flex-1 truncate text-sm text-foreground">
        {issue.title}
      </span>
      <div className="hidden shrink-0 items-center gap-1 sm:flex">
        {issue.labelIds.map((id) => {
          const label = labelsById.get(id);
          if (!label) return null;
          return (
            <span
              key={id}
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: `${label.color}22`, color: label.color }}
            >
              {label.name}
            </span>
          );
        })}
      </div>
      {assignee && (
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white"
          style={{ backgroundColor: assignee.avatarColor }}
          title={assignee.name}
        >
          {assignee.initials}
        </span>
      )}
    </div>
  );
}

