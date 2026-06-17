import type { AppState } from "@/types";
import { EMPTY_FILTERS, type IssueViewSettings } from "./types";

export interface IssuePreset {
  id: string;
  label: string;
  // Built lazily from the live store so "Active"/"My Issues" reflect real ids.
  build: (state: AppState) => IssueViewSettings;
}

// "Active" = issues in any started/unstarted workflow state, sorted by priority.
function activeStateIds(state: AppState): string[] {
  return state.states
    .filter((s) => s.category === "started" || s.category === "unstarted")
    .map((s) => s.id);
}

export const ISSUE_PRESETS: IssuePreset[] = [
  {
    id: "all",
    label: "All issues",
    build: () => ({ filters: EMPTY_FILTERS, sort: "manual", group: "state" }),
  },
  {
    id: "active",
    label: "Active",
    build: (state) => ({
      filters: { ...EMPTY_FILTERS, stateIds: activeStateIds(state) },
      sort: "priority",
      group: "state",
    }),
  },
  {
    id: "my-issues",
    label: "My issues",
    build: (state) => ({
      filters: { ...EMPTY_FILTERS, assigneeIds: [state.currentUserId] },
      sort: "priority",
      group: "state",
    }),
  },
];

