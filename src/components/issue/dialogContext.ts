import { createContext } from "react";
import type { ID } from "@/types";

// Defaults applied when the create dialog is opened from a scoped surface
// (e.g. a project page pre-selecting its project).
export interface CreateIssueDefaults {
  stateId?: ID;
  projectId?: ID;
  cycleId?: ID;
  assigneeId?: ID;
}

export interface IssueDialogContextValue {
  openCreate: (defaults?: CreateIssueDefaults) => void;
}

export const IssueDialogContext =
  createContext<IssueDialogContextValue | null>(null);

