import { useContext, useMemo } from "react";
import type { WorkflowState } from "@/types";
import { useStore } from "@/store";
import { IssueViewContext, type IssueViewContextValue } from "./context";
import { buildIssueGroups, filterIssues, type IssueGroup } from "./engine";

export function useIssueView(): IssueViewContextValue {
  const ctx = useContext(IssueViewContext);
  if (!ctx) {
    throw new Error("useIssueView must be used within an IssueViewProvider");
  }
  return ctx;
}

export interface IssueViewData {
  groups: IssueGroup[];
  total: number; // issues in the store
  visible: number; // issues surviving the active filters
}

// Derives the grouped/sorted/filtered issues for the Issues surface from the
// live store and the current view settings. Shared by the list and board so
// they always agree on what's shown.
export function useIssueViewData(): IssueViewData {
  const { state } = useStore();
  const { settings } = useIssueView();

  return useMemo(() => {
    const groups = buildIssueGroups(state.issues, settings, {
      states: state.states,
      members: state.members,
    });
    const visible = filterIssues(state.issues, settings.filters).length;
    return { groups, total: state.issues.length, visible };
  }, [state.issues, state.states, state.members, settings]);
}

export interface BoardColumnData {
  state: WorkflowState;
  issues: IssueGroup["issues"];
}

// The Kanban board's columns are always workflow states (drag = change state),
// so it ignores the group-by setting but still honors filters and sort.
export function useBoardColumns(): BoardColumnData[] {
  const { state } = useStore();
  const { settings } = useIssueView();

  return useMemo(() => {
    const groups = buildIssueGroups(
      state.issues,
      { ...settings, group: "state" },
      { states: state.states, members: state.members },
    );
    return groups
      .filter((group): group is IssueGroup & { state: WorkflowState } =>
        Boolean(group.state),
      )
      .map((group) => ({ state: group.state, issues: group.issues }));
  }, [state.issues, state.states, state.members, settings]);
}

