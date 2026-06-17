import { useMemo } from "react";
import type { Issue, WorkflowState } from "@/types";
import { useStore } from "@/store";

export interface StateGroup {
  state: WorkflowState;
  issues: Issue[];
}

// Groups issues into one bucket per workflow state, ordered by `state.order`,
// with issues inside each bucket sorted by their `order` field. Shared by the
// grouped list view and the Kanban board so both stay consistent.
export function useIssuesByState(): StateGroup[] {
  const { state } = useStore();
  return useMemo(() => {
    const ordered = [...state.states].sort((a, b) => a.order - b.order);
    const byState = new Map<string, Issue[]>(
      ordered.map((wfState) => [wfState.id, []]),
    );
    for (const issue of state.issues) {
      byState.get(issue.stateId)?.push(issue);
    }
    return ordered.map((wfState) => ({
      state: wfState,
      issues: (byState.get(wfState.id) ?? []).sort((a, b) => a.order - b.order),
    }));
  }, [state.states, state.issues]);
}

