import type { WorkflowState } from "@/types";
import { StateIcon } from "@/components/issue/meta";

// Section / column header showing a workflow state's icon, name and issue count.
export function StateGroupHeader({
  state,
  count,
}: {
  state: WorkflowState;
  count: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <StateIcon state={state} />
      <span className="text-xs font-semibold text-foreground">
        {state.name}
      </span>
      <span className="text-xs text-muted-foreground">{count}</span>
    </div>
  );
}

