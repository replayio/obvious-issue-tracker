import type { ReactNode } from "react";

export type CommandGroup =
  | "Navigation"
  | "Issue"
  | "Create"
  | "View"
  | "General";

export interface Command {
  id: string;
  title: string;
  group: CommandGroup;
  icon?: ReactNode;
  hint?: string; // shortcut hint shown on the right (e.g. "C", "G then I")
  keywords?: string; // extra text folded into fuzzy matching
  run: () => void;
}

