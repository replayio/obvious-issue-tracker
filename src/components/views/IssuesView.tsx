import { useMemo } from "react";
import { useStore } from "@/store";
import { ViewHeader } from "./ViewHeader";
import { IssueRow } from "./IssueRow";
import { EmptyState } from "./EmptyState";

export function IssuesView() {
  const { state } = useStore();

  const groups = useMemo(() => {
    const ordered = [...state.states].sort((a, b) => a.order - b.order);
    return ordered.map((wfState) => ({
      state: wfState,
      issues: state.issues
        .filter((i) => i.stateId === wfState.id)
        .sort((a, b) => a.order - b.order),
    }));
  }, [state.states, state.issues]);

  return (
    <section className="flex h-full flex-col">
      <ViewHeader title="Issues" count={state.issues.length} />
      <div className="flex-1 overflow-y-auto">
        {state.issues.length === 0 ? (
          <EmptyState
            title="No issues yet"
            description="Issues you create will show up here, grouped by workflow state."
          />
        ) : (
          groups.map(({ state: wfState, issues }) =>
            issues.length === 0 ? null : (
              <div key={wfState.id}>
                <div className="flex items-center gap-2 bg-muted/40 px-5 py-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: wfState.color }}
                  />
                  <span className="text-xs font-medium text-foreground">
                    {wfState.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {issues.length}
                  </span>
                </div>
                {issues.map((issue) => (
                  <IssueRow key={issue.id} issue={issue} />
                ))}
              </div>
            ),
          )
        )}
      </div>
    </section>
  );
}

