import { createContext } from "react";
import type { AppState, Cycle, Project } from "@/types";
import type { CreateIssueInput, IssuePatch } from "./reducer";

export interface StoreContextValue {
  state: AppState;
  createIssue: (input: CreateIssueInput) => void;
  updateIssue: (id: string, patch: IssuePatch) => void;
  deleteIssue: (id: string) => void;
  addComment: (issueId: string, body: string, authorId?: string) => void;
  createProject: (input: Omit<Project, "id">) => void;
  updateProject: (id: string, patch: Partial<Omit<Project, "id">>) => void;
  deleteProject: (id: string) => void;
  createCycle: (input: Omit<Cycle, "id">) => void;
  updateCycle: (id: string, patch: Partial<Omit<Cycle, "id">>) => void;
  deleteCycle: (id: string) => void;
  resetSeed: () => void;
}

export const StoreContext = createContext<StoreContextValue | null>(null);

