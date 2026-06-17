import { createContext } from "react";
import type { ID } from "@/types";

// In-app view identifiers. Feature PRs extend this union as they add surfaces.
export type ViewId =
  | "my-issues"
  | "inbox"
  | "issues"
  | "projects"
  | "cycles";

export const VIEW_IDS: ViewId[] = [
  "my-issues",
  "inbox",
  "issues",
  "projects",
  "cycles",
];

export function isViewId(value: string): value is ViewId {
  return (VIEW_IDS as string[]).includes(value);
}

// The active surface. A view is one of the sidebar destinations; an issue
// route opens the detail view for a single issue (`#/issue/:id`).
export type Route =
  | { kind: "view"; view: ViewId }
  | { kind: "issue"; issueId: ID };

export interface NavigationContextValue {
  route: Route;
  // The sidebar destination to highlight. Tracks the view an issue was opened
  // from so the sidebar stays anchored while the detail view is open.
  view: ViewId;
  navigate: (view: ViewId) => void;
  openIssue: (issueId: ID) => void;
  back: () => void;
}

export const NavigationContext = createContext<NavigationContextValue | null>(
  null,
);