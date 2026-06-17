import type { Priority } from "@/types";

// Sentinel used by the assignee filter to represent "no assignee".
export const UNASSIGNED = "__unassigned__";

export type SortKey = "manual" | "priority" | "updated" | "created";
export type GroupKey = "state" | "priority" | "assignee" | "none";

// Multi-select filter facets. Empty array = no constraint on that facet.
export interface IssueFilters {
  stateIds: string[];
  priorities: Priority[];
  assigneeIds: string[]; // may contain UNASSIGNED
  labelIds: string[];
  projectIds: string[];
  cycleIds: string[];
}

export interface IssueViewSettings {
  filters: IssueFilters;
  sort: SortKey;
  group: GroupKey;
}

export const EMPTY_FILTERS: IssueFilters = {
  stateIds: [],
  priorities: [],
  assigneeIds: [],
  labelIds: [],
  projectIds: [],
  cycleIds: [],
};

export const DEFAULT_SETTINGS: IssueViewSettings = {
  filters: EMPTY_FILTERS,
  sort: "manual",
  group: "state",
};

export const SORT_LABELS: Record<SortKey, string> = {
  manual: "Manual",
  priority: "Priority",
  updated: "Last updated",
  created: "Created",
};

export const GROUP_LABELS: Record<GroupKey, string> = {
  state: "Status",
  priority: "Priority",
  assignee: "Assignee",
  none: "No grouping",
};

// The facets that contribute to the "active filter" badge / clear affordance.
export function countActiveFilters(filters: IssueFilters): number {
  return (
    filters.stateIds.length +
    filters.priorities.length +
    filters.assigneeIds.length +
    filters.labelIds.length +
    filters.projectIds.length +
    filters.cycleIds.length
  );
}

