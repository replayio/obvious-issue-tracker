import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { Issue } from "@/types";
import { useStore } from "@/store";
import { useIssuesByState } from "@/components/issue/useIssuesByState";
import { BoardColumn } from "./BoardColumn";
import { BoardCardBody } from "./BoardCard";

// Reassigns dense sequential `order` values to a column's issues, persisting
// only the issues whose state or order actually changed.
function persistColumn(
  issues: Issue[],
  stateId: string,
  updateIssue: (id: string, patch: { stateId?: string; order?: number }) => void,
): void {
  issues.forEach((issue, index) => {
    const patch: { stateId?: string; order?: number } = {};
    if (issue.stateId !== stateId) patch.stateId = stateId;
    if (issue.order !== index) patch.order = index;
    if (patch.stateId !== undefined || patch.order !== undefined) {
      updateIssue(issue.id, patch);
    }
  });
}

export function IssueBoardView({
  onOpenIssue,
}: {
  onOpenIssue: (id: string) => void;
}) {
  const { state, updateIssue } = useStore();
  const groups = useIssuesByState();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeIssue = useMemo(
    () =>
      activeId
        ? (state.issues.find((issue) => issue.id === activeId) ?? null)
        : null,
    [activeId, state.issues],
  );

  const onDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) return;

      const activeIssueId = String(active.id);
      const overId = String(over.id);
      const moved = state.issues.find((issue) => issue.id === activeIssueId);
      if (!moved) return;

      // The drop target is either a column (empty area) or another card.
      const overColumn = groups.find((group) => group.state.id === overId);
      const overCardState = state.issues.find(
        (issue) => issue.id === overId,
      )?.stateId;
      const targetStateId = overColumn ? overColumn.state.id : overCardState;
      if (!targetStateId) return;

      const sourceStateId = moved.stateId;

      // Snapshot the live column orderings, then move `moved` into place.
      const columnIssues = (stateId: string): Issue[] =>
        groups.find((group) => group.state.id === stateId)?.issues ?? [];

      const target = columnIssues(targetStateId).filter(
        (issue) => issue.id !== activeIssueId,
      );
      const insertAt = overColumn
        ? target.length
        : Math.max(
            0,
            target.findIndex((issue) => issue.id === overId),
          );
      target.splice(insertAt, 0, moved);

      if (sourceStateId === targetStateId) {
        persistColumn(target, targetStateId, updateIssue);
        return;
      }

      const source = columnIssues(sourceStateId).filter(
        (issue) => issue.id !== activeIssueId,
      );
      persistColumn(source, sourceStateId, updateIssue);
      persistColumn(target, targetStateId, updateIssue);
    },
    [state.issues, groups, updateIssue],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex flex-1 gap-4 overflow-x-auto p-4">
        {groups.map(({ state: wfState, issues }) => (
          <BoardColumn
            key={wfState.id}
            state={wfState}
            issues={issues}
            onOpenIssue={onOpenIssue}
          />
        ))}
      </div>
      <DragOverlay>
        {activeIssue ? (
          <div className="w-72">
            <BoardCardBody issue={activeIssue} dragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

