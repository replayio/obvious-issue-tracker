import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  IssueViewContext,
  VIEW_SETTINGS_STORAGE_KEY,
  type IssueViewContextValue,
} from "./context";
import {
  DEFAULT_SETTINGS,
  EMPTY_FILTERS,
  type IssueFilters,
  type IssueViewSettings,
} from "./types";

const SORT_KEYS = ["manual", "priority", "updated", "created"] as const;
const GROUP_KEYS = ["state", "priority", "assignee", "none"] as const;

// Defensive parse of persisted settings: localStorage is user-writable and may
// hold data from an older shape, so every facet falls back to a safe default.
function coerceStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v) => typeof v === "string") : [];
}

function parseSettings(raw: string | null): IssueViewSettings {
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<IssueViewSettings>;
    const f = (parsed.filters ?? {}) as Partial<IssueFilters>;
    const filters: IssueFilters = {
      stateIds: coerceStringArray(f.stateIds),
      priorities: coerceStringArray(f.priorities) as IssueFilters["priorities"],
      assigneeIds: coerceStringArray(f.assigneeIds),
      labelIds: coerceStringArray(f.labelIds),
      projectIds: coerceStringArray(f.projectIds),
      cycleIds: coerceStringArray(f.cycleIds),
    };
    return {
      filters,
      sort: SORT_KEYS.includes(parsed.sort as never)
        ? (parsed.sort as IssueViewSettings["sort"])
        : DEFAULT_SETTINGS.sort,
      group: GROUP_KEYS.includes(parsed.group as never)
        ? (parsed.group as IssueViewSettings["group"])
        : DEFAULT_SETTINGS.group,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function readSettings(): IssueViewSettings {
  try {
    return parseSettings(window.localStorage.getItem(VIEW_SETTINGS_STORAGE_KEY));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Holds the Issues surface's filter / sort / group state, persisted so the
// chosen view survives reloads. Lives above the list and board so both render
// from the same settings.
export function IssueViewProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<IssueViewSettings>(readSettings);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        VIEW_SETTINGS_STORAGE_KEY,
        JSON.stringify(settings),
      );
    } catch {
      // Persistence is best-effort; in-memory state still drives the views.
    }
  }, [settings]);

  const setFilters = useCallback(
    (update: (prev: IssueFilters) => IssueFilters) =>
      setSettings((prev) => ({ ...prev, filters: update(prev.filters) })),
    [],
  );

  const setSort = useCallback(
    (sort: IssueViewSettings["sort"]) =>
      setSettings((prev) => ({ ...prev, sort })),
    [],
  );

  const setGroup = useCallback(
    (group: IssueViewSettings["group"]) =>
      setSettings((prev) => ({ ...prev, group })),
    [],
  );

  const resetFilters = useCallback(
    () => setSettings((prev) => ({ ...prev, filters: EMPTY_FILTERS })),
    [],
  );

  const applyPreset = useCallback(
    (next: IssueViewSettings) => setSettings(next),
    [],
  );

  const value = useMemo<IssueViewContextValue>(
    () => ({
      settings,
      setFilters,
      setSort,
      setGroup,
      resetFilters,
      applyPreset,
    }),
    [settings, setFilters, setSort, setGroup, resetFilters, applyPreset],
  );

  return (
    <IssueViewContext.Provider value={value}>
      {children}
    </IssueViewContext.Provider>
  );
}

