import {
  AlertTriangle,
  Circle,
  CircleDot,
  CheckCircle2,
  Minus,
  SignalHigh,
  SignalLow,
  SignalMedium,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { Priority, StateCategory, WorkflowState } from "@/types";
import { cn } from "@/lib/utils";

// ---- Priority ---------------------------------------------------------------

const PRIORITY_ICON: Record<Priority, LucideIcon> = {
  urgent: AlertTriangle,
  high: SignalHigh,
  medium: SignalMedium,
  low: SignalLow,
  none: Minus,
};

const PRIORITY_COLOR_VAR: Record<Priority, string> = {
  urgent: "var(--priority-urgent)",
  high: "var(--priority-high)",
  medium: "var(--priority-medium)",
  low: "var(--priority-low)",
  none: "var(--priority-none)",
};

export function PriorityIcon({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  const Icon = PRIORITY_ICON[priority];
  return (
    <Icon
      className={cn("h-3.5 w-3.5 shrink-0", className)}
      style={{ color: PRIORITY_COLOR_VAR[priority] }}
      aria-hidden
    />
  );
}

// ---- Workflow state ---------------------------------------------------------

const STATE_ICON: Record<StateCategory, LucideIcon> = {
  backlog: Circle,
  unstarted: Circle,
  started: CircleDot,
  completed: CheckCircle2,
  canceled: XCircle,
};

export function StateIcon({
  state,
  className,
}: {
  state: WorkflowState;
  className?: string;
}) {
  const Icon = STATE_ICON[state.category];
  return (
    <Icon
      className={cn("h-3.5 w-3.5 shrink-0", className)}
      style={{ color: state.color }}
      aria-hidden
    />
  );
}
