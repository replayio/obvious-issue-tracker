import { createContext } from "react";
import type { IssueFilters, IssueViewSettings } from "./types";

export interface IssueViewContextValue {
  settings: IssueViewSettings;
  setFilters: (update: (prev: IssueFilters) => IssueFilters) => void;
  setSort: (sort: IssueViewSettings["sort"]) => void;
  setGroup: (group: IssueViewSettings["group"]) => void;
  resetFilters: () => void;
  applyPreset: (settings: IssueViewSettings) => void;
}

export const IssueViewContext = createContext<IssueViewContextValue | null>(
  null,
);

export const VIEW_SETTINGS_STORAGE_KEY = "issue-tracker:issues-view-settings";

