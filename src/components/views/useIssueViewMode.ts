import { useCallback, useState } from "react";
import type { IssueViewMode } from "./ViewSwitcher";

const STORAGE_KEY = "issue-tracker:issues-view-mode";

function readMode(): IssueViewMode {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === "board" ? "board" : "list";
  } catch {
    return "list";
  }
}

// View-mode state for the Issues surface, persisted so the chosen list/board
// toggle survives reloads (mirrors how the store persists its data).
export function useIssueViewMode(): [
  IssueViewMode,
  (mode: IssueViewMode) => void,
] {
  const [mode, setMode] = useState<IssueViewMode>(readMode);

  const update = useCallback((next: IssueViewMode) => {
    setMode(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore persistence failures (e.g. storage disabled); state still works.
    }
  }, []);

  return [mode, update];
}

