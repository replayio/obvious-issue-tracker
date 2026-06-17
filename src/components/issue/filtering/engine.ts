import type { Issue, Priority, WorkflowState } from "@/types";
import { PRIORITY_LABEL, PRIORITY_ORDER } from "@/components/issue/priority";
import {
  UNASSIGNED,
  type GroupKey,
  type IssueFilters,
  type IssueViewSettings,
  type SortKey,
} from "./types";

// ---- Filtering --------------------------------------------------------------

// A facet matches when no values are selected (no constraint) or the issue's
// value is among the selected set. Multi-select facets are OR within a facet
// and AND across facets, mirroring Linear's filter semantics.
function matchesFilters(issue: Issue, filters: IssueFilters): boolean {
  if (filters.stateIds.length && !filters.stateIds.includes(issue.stateId)) {
    return false;
  }
  if (
    filters.priorities.length &&
    !filters.priorities.includes(issue.priority)
  ) {
    return false;
  }
  if (filters.assigneeIds.length) {
    const key = issue.assigneeId ?? UNASSIGNED;
    if (!filters.assigneeIds.includes(key)) return false;
  }
  if (
    filters.labelIds.length &&
    !filters.labelIds.some((id) => issue.labelIds.includes(id))
  ) {
    return false;
  }
  if (filters.projectIds.length) {
    const key = issue.projectId ?? "";
    if (!filters.projectIds.includes(key)) return false;
  }
  if (filters.cycleIds.length) {
    const key = issue.cycleId ?? "";
    if (!filters.cycleIds.includes(key)) return false;
  }
  return true;
}

// ---- Sorting ----------------------------------------------------------------

const PRIORITY_RANK: Record<Priority, number> = PRIORITY_ORDER.reduce(
  (acc, priority, index) => {
    acc[priority] = index;
    return acc;
  },
  {} as Record<Priority, number>,
);

function compareIssues(a: Issue, b: Issue, sort: SortKey): number {
  switch (sort) {
    case "priority":
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    case "updated":
      return b.updatedAt.localeCompare(a.updatedAt);
    case "created":
      return b.createdAt.localeCompare(a.createdAt);
    case "manual":
      return a.order - b.order;
  }
}

export function sortIssues(issues: Issue[], sort: SortKey): Issue[] {
  // Stable secondary sort on manual order keeps ties deterministic.
  return [...issues].sort(
    (a, b) => compareIssues(a, b, sort) || a.order - b.order,
  );
}

export function filterIssues(
  issues: Issue[],
  filters: IssueFilters,
): Issue[] {
  return issues.filter((issue) => matchesFilters(issue, filters));
}

// ---- Grouping ---------------------------------------------------------------

export interface IssueGroup {
  id: string;
  label: string;
  color?: string;
  state?: WorkflowState; // present when grouping by state (board columns need it)
  issues: Issue[];
}

interface GroupSources {
  states: WorkflowState[];
  members: { id: string; name: string; avatarColor: string }[];
}

const UNASSIGNED_GROUP = "__unassigned_group__";

function groupByState(issues: Issue[], states: WorkflowState[]): IssueGroup[] {
  const ordered = [...states].sort((a, b) => a.order - b.order);
  const byState = new Map<string, Issue[]>(ordered.map((s) => [s.id, []]));
  for (const issue of issues) byState.get(issue.stateId)?.push(issue);
  return ordered.map((state) => ({
    id: state.id,
    label: state.name,
    color: state.color,
    state,
    issues: byState.get(state.id) ?? [],
  }));
}

function groupByPriority(issues: Issue[]): IssueGroup[] {
  const byPriority = new Map<Priority, Issue[]>(
    PRIORITY_ORDER.map((p) => [p, []]),
  );
  for (const issue of issues) byPriority.get(issue.priority)?.push(issue);
  return PRIORITY_ORDER.map((priority) => ({
    id: priority,
    label: PRIORITY_LABEL[priority],
    issues: byPriority.get(priority) ?? [],
  }));
}

function groupByAssignee(
  issues: Issue[],
  members: GroupSources["members"],
): IssueGroup[] {
  const groups: IssueGroup[] = members.map((member) => ({
    id: member.id,
    label: member.name,
    color: member.avatarColor,
    issues: [] as Issue[],
  }));
  const byId = new Map(groups.map((g) => [g.id, g]));
  const unassigned: IssueGroup = {
    id: UNASSIGNED_GROUP,
    label: "Unassigned",
    issues: [],
  };
  for (const issue of issues) {
    const target = issue.assigneeId ? byId.get(issue.assigneeId) : undefined;
    (target ?? unassigned).issues.push(issue);
  }
  return [...groups, unassigned];
}

// Applies filters + sort, then buckets the surviving issues into ordered
// groups. Empty groups are kept so board columns stay stable; the list view
// hides empties itself. Single-bucket grouping ("none") returns one group.
export function buildIssueGroups(
  issues: Issue[],
  settings: IssueViewSettings,
  sources: GroupSources,
): IssueGroup[] {
  const filtered = filterIssues(issues, settings.filters);
  const grouped = applyGrouping(filtered, settings.group, sources);
  return grouped.map((group) => ({
    ...group,
    issues: sortIssues(group.issues, settings.sort),
  }));
}

function applyGrouping(
  issues: Issue[],
  group: GroupKey,
  sources: GroupSources,
): IssueGroup[] {
  switch (group) {
    case "state":
      return groupByState(issues, sources.states);
    case "priority":
      return groupByPriority(issues);
    case "assignee":
      return groupByAssignee(issues, sources.members);
    case "none":
      return [{ id: "all", label: "All issues", issues }];
  }
}

