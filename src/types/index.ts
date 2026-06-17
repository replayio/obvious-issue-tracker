// Shared data-model contract for the issue tracker.
// Feature PRs import from here; never redefine these types.

export type ID = string; // nanoid

export type Priority = "none" | "urgent" | "high" | "medium" | "low";

// Workflow states have a category that drives grouping / board columns.
export type StateCategory =
  | "backlog"
  | "unstarted"
  | "started"
  | "completed"
  | "canceled";

export interface WorkflowState {
  id: ID;
  name: string;
  category: StateCategory;
  color: string;
  order: number;
}

export interface Member {
  id: ID;
  name: string;
  email: string;
  avatarColor: string;
  initials: string;
}

export interface Label {
  id: ID;
  name: string;
  color: string;
}

export type ProjectStatus =
  | "backlog"
  | "planned"
  | "in_progress"
  | "completed"
  | "canceled";

export interface Project {
  id: ID;
  name: string;
  key: string;
  description?: string;
  status: ProjectStatus;
  leadId?: ID;
  startDate?: string;
  targetDate?: string;
  color: string;
  icon?: string;
}

export interface Cycle {
  id: ID;
  name: string;
  number: number;
  startDate: string; // ISO
  endDate: string; // ISO
}

export interface Comment {
  id: ID;
  authorId: ID;
  body: string;
  createdAt: string;
}

export type ActivityKind =
  | "created"
  | "state"
  | "priority"
  | "assignee"
  | "label"
  | "project"
  | "cycle"
  | "comment"
  | "title"
  | "description";

export interface Activity {
  id: ID;
  kind: ActivityKind;
  authorId: ID;
  createdAt: string;
  from?: string;
  to?: string;
}

export interface Issue {
  id: ID;
  key: string; // e.g. "ENG-128"
  title: string;
  description: string; // Tiptap HTML/JSON string
  stateId: ID;
  priority: Priority;
  assigneeId?: ID;
  labelIds: ID[];
  projectId?: ID;
  cycleId?: ID;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  activity: Activity[];
  order: number; // sort order within a state/group
}

export interface AppState {
  issues: Issue[];
  projects: Project[];
  cycles: Cycle[];
  labels: Label[];
  members: Member[];
  states: WorkflowState[];
  currentUserId: ID;
}

