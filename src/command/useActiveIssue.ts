import type { Issue } from "@/types";
import { useStore } from "@/store";
import { useNavigation } from "@/navigation";

// The issue currently open in the detail surface, or null on a list view. Lets
// the command palette offer contextual actions on the focused issue without
// coupling to the detail view's internals.
export function useActiveIssue(): Issue | null {
  const { state } = useStore();
  const { route } = useNavigation();

  if (route.kind !== "issue") return null;
  return state.issues.find((issue) => issue.id === route.issueId) ?? null;
}
