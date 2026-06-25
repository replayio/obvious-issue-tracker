import { nanoid } from "nanoid";
import type {
  Activity,
  ActivityKind,
  AppState,
  Comment,
  Cycle,
  Issue,
  Priority,
  Project,
} from "@/types";
import { buildSeedState } from "./seed";

// ---- Action contract --------------------------------------------------------

export interface CreateIssueInput {
  title: string;
  description?: string;
  stateId?: string;
  priority?: Priority;
  assigneeId?: string;
  labelIds?: string[];
  projectId?: string;
  cycleId?: string;
}

export type IssuePatch = Partial<
  Pick<
    Issue,
    | "title"
    | "description"
    | "stateId"
    | "priority"
    | "assigneeId"
    | "labelIds"
    | "projectId"
    | "cycleId"
    | "order"
  >
>;

export type StoreAction =
  | { type: "createIssue"; input: CreateIssueInput }
  | { type: "updateIssue"; id: string; patch: IssuePatch }
  | { type: "deleteIssue"; id: string }
  | { type: "addComment"; issueId: string; body: string; authorId?: string }
  | { type: "createProject"; input: Omit<Project, "id"> }
  | { type: "updateProject"; id: string; patch: Partial<Omit<Project, "id">> }
  | { type: "deleteProject"; id: string }
  | { type: "createCycle"; input: Cycle }
  | { type: "updateCycle"; id: string; patch: Partial<Omit<Cycle, "id">> }
  | { type: "deleteCycle"; id: string }
  | { type: "reset" }
  | { type: "replace"; state: AppState };

// ---- Helpers ----------------------------------------------------------------

function now(): string {
  return new Date().toISOString();
}

function makeActivity(
  kind: ActivityKind,
  authorId: string,
  from?: string,
  to?: string,
): Activity {
  return { id: nanoid(), kind, authorId, createdAt: now(), from, to };
}

// Default state for a brand-new issue when fields are omitted.
function firstUnstartedStateId(state: AppState): string {
  const ordered = [...state.states].sort((a, b) => a.order - b.order);
  const todo = ordered.find((s) => s.category === "unstarted");
  return (todo ?? ordered[0]).id;
}

// Next sequential key within a project (e.g. RT-128), or ISS-### with no project.
function nextIssueKey(state: AppState, projectId?: string): string {
  const project = projectId
    ? state.projects.find((p) => p.id === projectId)
    : undefined;
  const prefix = project ? project.key : "ISS";
  const existing = state.issues
    .filter((i) => i.key.startsWith(`${prefix}-`))
    .map((i) => Number.parseInt(i.key.slice(prefix.length + 1), 10))
    .filter((n) => Number.isFinite(n));
  const max = existing.length ? Math.max(...existing) : 99;
  return `${prefix}-${max + 1}`;
}

// Builds the activity entries implied by an issue patch.
function diffActivities(
  prev: Issue,
  patch: IssuePatch,
  authorId: string,
): Activity[] {
  const acts: Activity[] = [];
  const track = (
    kind: ActivityKind,
    before?: string,
    after?: string,
  ): void => {
    if (after !== undefined && after !== before) {
      acts.push(makeActivity(kind, authorId, before, after));
    }
  };
  if (patch.title !== undefined) track("title", prev.title, patch.title);
  if (patch.description !== undefined && patch.description !== prev.description) {
    acts.push(makeActivity("description", authorId));
  }
  track("state", prev.stateId, patch.stateId);
  track("priority", prev.priority, patch.priority);
  track("assignee", prev.assigneeId, patch.assigneeId);
  track("project", prev.projectId, patch.projectId);
  track("cycle", prev.cycleId, patch.cycleId);
  if (patch.labelIds && patch.labelIds.join(",") !== prev.labelIds.join(",")) {
    acts.push(makeActivity("label", authorId));
  }
  return acts;
}

// ---- Reducer ----------------------------------------------------------------

export function reducer(state: AppState, action: StoreAction): AppState {
  switch (action.type) {
    case "createIssue": {
      const author = state.currentUserId;
      const ts = now();
      const projectId = action.input.projectId;
      const stateId = action.input.stateId ?? firstUnstartedStateId(state);
      const order =
        state.issues.reduce((max, i) => Math.max(max, i.order), -1) + 1;
      const issue: Issue = {
        id: nanoid(),
        key: nextIssueKey(state, projectId),
        title: action.input.title.trim() || "Untitled issue",
        description: action.input.description ?? "",
        stateId,
        priority: action.input.priority ?? "none",
        assigneeId: action.input.assigneeId,
        labelIds: action.input.labelIds ?? [],
        projectId,
        cycleId: action.input.cycleId,
        createdAt: ts,
        updatedAt: ts,
        comments: [],
        activity: [makeActivity("created", author)],
        order,
      };
      return { ...state, issues: [issue, ...state.issues] };
    }

    case "updateIssue": {
      const author = state.currentUserId;
      return {
        ...state,
        issues: state.issues.map((issue) => {
          if (issue.id !== action.id) return issue;
          const acts = diffActivities(issue, action.patch, author);
          if (acts.length === 0) return { ...issue, ...action.patch };
          return {
            ...issue,
            ...action.patch,
            updatedAt: now(),
            activity: [...issue.activity, ...acts],
          };
        }),
      };
    }

    case "deleteIssue":
      return {
        ...state,
        issues: state.issues.filter((i) => i.id !== action.id),
      };

    case "addComment": {
      const author = action.authorId ?? state.currentUserId;
      const ts = now();
      const comment: Comment = {
        id: nanoid(),
        authorId: author,
        body: action.body,
        createdAt: ts,
      };
      return {
        ...state,
        issues: state.issues.map((issue) =>
          issue.id === action.issueId
            ? {
                ...issue,
                updatedAt: ts,
                comments: [...issue.comments, comment],
                activity: [...issue.activity, makeActivity("comment", author)],
              }
            : issue,
        ),
      };
    }

    case "createProject":
      return {
        ...state,
        projects: [...state.projects, { ...action.input, id: nanoid() }],
      };

    case "updateProject":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.id ? { ...p, ...action.patch } : p,
        ),
      };

    case "deleteProject":
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.id),
        issues: state.issues.map((i) =>
          i.projectId === action.id ? { ...i, projectId: undefined } : i,
        ),
      };

    case "createCycle":
      return {
        ...state,
        cycles: [...state.cycles, action.input],
      };

    case "updateCycle":
      return {
        ...state,
        cycles: state.cycles.map((c) =>
          c.id === action.id ? { ...c, ...action.patch } : c,
        ),
      };

    case "deleteCycle":
      return {
        ...state,
        cycles: state.cycles.filter((c) => c.id !== action.id),
        issues: state.issues.map((i) =>
          i.cycleId === action.id ? { ...i, cycleId: undefined } : i,
        ),
      };

    case "reset":
      return buildSeedState();

    case "replace":
      return action.state;
  }
}

