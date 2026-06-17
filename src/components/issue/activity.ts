import type { Activity, AppState, Member, Priority } from "@/types";
import { PRIORITY_LABEL } from "./priority";

interface ActivityLookups {
  statesById: Map<string, { name: string }>;
  projectsById: Map<string, { name: string }>;
  members: Member[];
  cycles: AppState["cycles"];
}

function stateName(id: string | undefined, l: ActivityLookups): string {
  return (id && l.statesById.get(id)?.name) || "Unknown";
}

function projectName(id: string | undefined, l: ActivityLookups): string {
  if (!id) return "no project";
  return l.projectsById.get(id)?.name ?? "a project";
}

function memberName(id: string | undefined, l: ActivityLookups): string {
  if (!id) return "unassigned";
  return l.members.find((m) => m.id === id)?.name ?? "someone";
}

function cycleName(id: string | undefined, l: ActivityLookups): string {
  if (!id) return "no cycle";
  return l.cycles.find((c) => c.id === id)?.name ?? "a cycle";
}

function priorityLabel(value: string | undefined): string {
  return value ? PRIORITY_LABEL[value as Priority] : "No priority";
}

// Renders an activity entry as a single human-readable sentence (subject
// rendered separately by the caller).
export function describeActivity(
  activity: Activity,
  lookups: ActivityLookups,
): string {
  switch (activity.kind) {
    case "created":
      return "created the issue";
    case "title":
      return "changed the title";
    case "description":
      return "updated the description";
    case "state":
      return `changed status from ${stateName(activity.from, lookups)} to ${stateName(activity.to, lookups)}`;
    case "priority":
      return `set priority to ${priorityLabel(activity.to)}`;
    case "assignee":
      return activity.to
        ? `assigned to ${memberName(activity.to, lookups)}`
        : "removed the assignee";
    case "label":
      return "updated labels";
    case "project":
      return `moved to ${projectName(activity.to, lookups)}`;
    case "cycle":
      return `set cycle to ${cycleName(activity.to, lookups)}`;
    case "comment":
      return "commented";
  }
}

