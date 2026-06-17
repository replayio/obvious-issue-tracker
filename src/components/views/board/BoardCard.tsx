import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Issue } from "@/types";
import { cn } from "@/lib/utils";
import {
  AssigneeMenu,
  LabelChips,
  PriorityMenu,
  ProjectBadge,
} from "@/components/issue/inline-editors";

interface BoardCardProps {
  issue: Issue;
  onOpenIssue: (id: string) => void;
}

// Presentational card body, shared by the sortable card and the drag overlay.
export function BoardCardBody({
  issue,
  dragging = false,
}: {
  issue: Issue;
  dragging?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-card p-2.5 shadow-sm",
        dragging && "opacity-90 shadow-lg",
      )}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono text-[11px] text-muted-foreground">
          {issue.key}
        </span>
        <AssigneeMenu issue={issue} />
      </div>
      <p className="mb-2 line-clamp-2 text-sm text-card-foreground">
        {issue.title}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <PriorityMenu issue={issue} />
        <ProjectBadge projectId={issue.projectId} />
        <LabelChips labelIds={issue.labelIds} />
      </div>
    </div>
  );
}

// Draggable, reorderable board card.
export function BoardCard({ issue, onOpenIssue }: BoardCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      onClick={() => onOpenIssue(issue.id)}
      onKeyDown={(event) => {
        // Enter opens the issue, but only when the drag sensor isn't capturing
        // keyboard input (dnd-kit handles Space/Enter while a drag is active).
        if (event.key === "Enter") onOpenIssue(issue.id);
      }}
      className={cn(
        "cursor-grab touch-none outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isDragging && "opacity-40",
      )}
    >
      <BoardCardBody issue={issue} />
    </div>
  );
}

