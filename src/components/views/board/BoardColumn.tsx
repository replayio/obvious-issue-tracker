import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Issue, WorkflowState } from "@/types";
import { cn } from "@/lib/utils";
import { StateGroupHeader } from "@/components/issue/StateGroupHeader";
import { BoardCard } from "./BoardCard";

interface BoardColumnProps {
  state: WorkflowState;
  issues: Issue[];
  onOpenIssue: (id: string) => void;
}

// One Kanban column = one workflow state. Acts as a droppable target (so cards
// can be dropped into empty columns) and hosts a vertical sortable context.
export function BoardColumn({ state, issues, onOpenIssue }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: state.id,
    data: { type: "column", stateId: state.id },
  });

  return (
    <div className="flex h-full w-72 shrink-0 flex-col">
      <div className="flex items-center justify-between px-2 pb-2">
        <StateGroupHeader state={state} count={issues.length} />
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col gap-2 overflow-y-auto rounded-md bg-muted/40 p-2 transition-colors",
          isOver && "bg-accent-muted",
        )}
      >
        <SortableContext
          items={issues.map((issue) => issue.id)}
          strategy={verticalListSortingStrategy}
        >
          {issues.map((issue) => (
            <BoardCard key={issue.id} issue={issue} onOpenIssue={onOpenIssue} />
          ))}
        </SortableContext>
        {issues.length === 0 && (
          <p className="px-1 py-6 text-center text-xs text-muted-foreground">
            No issues
          </p>
        )}
      </div>
    </div>
  );
}

