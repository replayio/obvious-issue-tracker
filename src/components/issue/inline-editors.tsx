import { useCallback } from "react";
import { useLookups, useStore } from "@/store";
import type { Issue, Priority } from "@/types";
import { cn } from "@/lib/utils";
import { DropdownMenu, type DropdownItem } from "./DropdownMenu";
import { PRIORITY_LABEL, PRIORITY_ORDER } from "./priority";
import { PriorityIcon, StateIcon } from "./meta";

// Stops a row/card click handler from firing when interacting with a menu.
const stop = (event: React.MouseEvent) => event.stopPropagation();

// ---- Priority editor --------------------------------------------------------

export function PriorityMenu({ issue }: { issue: Issue }) {
  const { updateIssue } = useStore();
  const onSelect = useCallback(
    (priority: Priority) => updateIssue(issue.id, { priority }),
    [updateIssue, issue.id],
  );

  const items: DropdownItem<Priority>[] = PRIORITY_ORDER.map((priority) => ({
    value: priority,
    label: PRIORITY_LABEL[priority],
    icon: <PriorityIcon priority={priority} />,
  }));

  return (
    <DropdownMenu
      items={items}
      selected={issue.priority}
      onSelect={onSelect}
      ariaLabel="Change priority"
      triggerClassName="p-0.5 hover:bg-muted"
      renderTrigger={() => <PriorityIcon priority={issue.priority} />}
    />
  );
}

// ---- State editor -----------------------------------------------------------

export function StateMenu({
  issue,
  withLabel = false,
}: {
  issue: Issue;
  withLabel?: boolean;
}) {
  const { updateIssue, state } = useStore();
  const { statesById } = useLookups();
  const current = statesById.get(issue.stateId);

  const onSelect = useCallback(
    (stateId: string) => updateIssue(issue.id, { stateId }),
    [updateIssue, issue.id],
  );

  const ordered = [...state.states].sort((a, b) => a.order - b.order);
  const items: DropdownItem<string>[] = ordered.map((wfState) => ({
    value: wfState.id,
    label: wfState.name,
    icon: <StateIcon state={wfState} />,
  }));

  return (
    <DropdownMenu
      items={items}
      selected={issue.stateId}
      onSelect={onSelect}
      ariaLabel="Change status"
      triggerClassName="gap-1.5 p-0.5 hover:bg-muted"
      renderTrigger={() =>
        current ? (
          <span className="flex items-center gap-1.5">
            <StateIcon state={current} />
            {withLabel && (
              <span className="text-xs text-muted-foreground">
                {current.name}
              </span>
            )}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">No status</span>
        )
      }
    />
  );
}

// ---- Assignee editor --------------------------------------------------------

const UNASSIGNED = "__unassigned__";

function Avatar({
  initials,
  color,
  title,
}: {
  initials: string;
  color: string;
  title: string;
}) {
  return (
    <span
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white"
      style={{ backgroundColor: color }}
      title={title}
    >
      {initials}
    </span>
  );
}

function UnassignedAvatar() {
  return (
    <span
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground"
      title="Unassigned"
    >
      <span className="text-[9px]">?</span>
    </span>
  );
}

export function AssigneeMenu({ issue }: { issue: Issue }) {
  const { updateIssue, state } = useStore();
  const { membersById } = useLookups();
  const assignee = issue.assigneeId
    ? membersById.get(issue.assigneeId)
    : undefined;

  const onSelect = useCallback(
    (value: string) =>
      updateIssue(issue.id, {
        assigneeId: value === UNASSIGNED ? undefined : value,
      }),
    [updateIssue, issue.id],
  );

  const items: DropdownItem<string>[] = [
    { value: UNASSIGNED, label: "Unassigned", icon: <UnassignedAvatar /> },
    ...state.members.map((member) => ({
      value: member.id,
      label: member.name,
      icon: (
        <Avatar
          initials={member.initials}
          color={member.avatarColor}
          title={member.name}
        />
      ),
    })),
  ];

  return (
    <DropdownMenu
      items={items}
      selected={issue.assigneeId ?? UNASSIGNED}
      onSelect={onSelect}
      ariaLabel="Change assignee"
      align="end"
      triggerClassName="p-0.5 hover:bg-muted"
      renderTrigger={() =>
        assignee ? (
          <Avatar
            initials={assignee.initials}
            color={assignee.avatarColor}
            title={assignee.name}
          />
        ) : (
          <UnassignedAvatar />
        )
      }
    />
  );
}

// ---- Read-only metadata bits ------------------------------------------------

export function LabelChips({
  labelIds,
  className,
}: {
  labelIds: string[];
  className?: string;
}) {
  const { labelsById } = useLookups();
  if (labelIds.length === 0) return null;
  return (
    <div className={cn("flex items-center gap-1", className)} onClick={stop}>
      {labelIds.map((id) => {
        const label = labelsById.get(id);
        if (!label) return null;
        return (
          <span
            key={id}
            className="inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: label.color }}
            />
            {label.name}
          </span>
        );
      })}
    </div>
  );
}

export function ProjectBadge({ projectId }: { projectId?: string }) {
  const { projectsById } = useLookups();
  const project = projectId ? projectsById.get(projectId) : undefined;
  if (!project) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground">
      <span
        className="h-2 w-2 rounded-sm"
        style={{ backgroundColor: project.color }}
      />
      {project.name}
    </span>
  );
}

