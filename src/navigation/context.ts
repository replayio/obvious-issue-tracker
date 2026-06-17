import { createContext } from "react";

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

export interface NavigationContextValue {
  view: ViewId;
  navigate: (view: ViewId) => void;
}

export const NavigationContext = createContext<NavigationContextValue | null>(
  null,
);

