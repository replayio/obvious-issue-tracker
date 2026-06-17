import { useEffect, useMemo, useReducer, type ReactNode } from "react";
import type { Cycle, Project } from "@/types";
import { StoreContext, type StoreContextValue } from "./context";
import {
  reducer,
  type CreateIssueInput,
  type IssuePatch,
} from "./reducer";
import { buildSeedState } from "./seed";
import { loadState, saveState } from "./persistence";

function initState() {
  return loadState() ?? buildSeedState();
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const value = useMemo<StoreContextValue>(
    () => ({
      state,
      createIssue: (input: CreateIssueInput) =>
        dispatch({ type: "createIssue", input }),
      updateIssue: (id: string, patch: IssuePatch) =>
        dispatch({ type: "updateIssue", id, patch }),
      deleteIssue: (id: string) => dispatch({ type: "deleteIssue", id }),
      addComment: (issueId: string, body: string, authorId?: string) =>
        dispatch({ type: "addComment", issueId, body, authorId }),
      createProject: (input: Omit<Project, "id">) =>
        dispatch({ type: "createProject", input }),
      updateProject: (id: string, patch: Partial<Omit<Project, "id">>) =>
        dispatch({ type: "updateProject", id, patch }),
      deleteProject: (id: string) => dispatch({ type: "deleteProject", id }),
      createCycle: (input: Omit<Cycle, "id">) =>
        dispatch({ type: "createCycle", input }),
      updateCycle: (id: string, patch: Partial<Omit<Cycle, "id">>) =>
        dispatch({ type: "updateCycle", id, patch }),
      deleteCycle: (id: string) => dispatch({ type: "deleteCycle", id }),
      resetSeed: () => dispatch({ type: "reset" }),
    }),
    [state],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

