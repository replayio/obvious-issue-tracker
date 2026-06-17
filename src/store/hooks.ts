import { useContext, useMemo } from "react";
import type { Issue, Label, Member, Project, WorkflowState } from "@/types";
import { StoreContext, type StoreContextValue } from "./context";

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return ctx;
}

// Lookup maps memoized off the live state for O(1) entity access in views.
export function useLookups() {
  const { state } = useStore();
  return useMemo(() => {
    const membersById = new Map<string, Member>(
      state.members.map((m) => [m.id, m]),
    );
    const labelsById = new Map<string, Label>(
      state.labels.map((l) => [l.id, l]),
    );
    const statesById = new Map<string, WorkflowState>(
      state.states.map((s) => [s.id, s]),
    );
    const projectsById = new Map<string, Project>(
      state.projects.map((p) => [p.id, p]),
    );
    return { membersById, labelsById, statesById, projectsById };
  }, [state.members, state.labels, state.states, state.projects]);
}

export function useIssuesForUser(userId: string): Issue[] {
  const { state } = useStore();
  return useMemo(
    () => state.issues.filter((i) => i.assigneeId === userId),
    [state.issues, userId],
  );
}

