import { useMemo } from "react";
import {
  CircleDot,
  FolderKanban,
  Inbox,
  Layers,
  Plus,
  User,
} from "lucide-react";
import { useStore } from "@/store";
import { useNavigation, type ViewId } from "@/navigation";
import { useIssueDialog } from "@/components/issue";
import { PriorityIcon, StateIcon } from "@/components/issue/meta";
import { PRIORITY_LABEL, PRIORITY_ORDER } from "@/components/issue/priority";
import type { Command } from "./types";
import { useActiveIssue } from "./useActiveIssue";

const NAV_TARGETS: { view: ViewId; title: string; hint: string; icon: Command["icon"] }[] =
  [
    { view: "my-issues", title: "Go to My Issues", hint: "G then M", icon: <User className="h-4 w-4" /> },
    { view: "inbox", title: "Go to Inbox", hint: "G then N", icon: <Inbox className="h-4 w-4" /> },
    { view: "issues", title: "Go to Issues", hint: "G then I", icon: <CircleDot className="h-4 w-4" /> },
    { view: "projects", title: "Go to Projects", hint: "G then P", icon: <FolderKanban className="h-4 w-4" /> },
    { view: "cycles", title: "Go to Cycles", hint: "G then C", icon: <Layers className="h-4 w-4" /> },
  ];

// Assembles the full command list from the live store, navigation, the create
// dialog, and the focused issue. Contextual issue actions (state / priority /
// assignee) are appended only when an issue detail route is active.
export function useCommands(onRun: () => void): Command[] {
  const { state, updateIssue } = useStore();
  const { navigate } = useNavigation();
  const { openCreate } = useIssueDialog();
  const activeIssue = useActiveIssue();

  return useMemo(() => {
    // Wraps a command's effect so the palette closes after it runs.
    const act = (run: () => void) => () => {
      run();
      onRun();
    };

    const commands: Command[] = [];

    commands.push({
      id: "create-issue",
      title: "Create new issue",
      group: "Create",
      icon: <Plus className="h-4 w-4" />,
      hint: "C",
      keywords: "new add",
      run: act(() => openCreate()),
    });

    for (const target of NAV_TARGETS) {
      commands.push({
        id: `nav-${target.view}`,
        title: target.title,
        group: "Navigation",
        icon: target.icon,
        hint: target.hint,
        run: act(() => navigate(target.view)),
      });
    }

    if (activeIssue) {
      const ordered = [...state.states].sort((a, b) => a.order - b.order);
      for (const wfState of ordered) {
        commands.push({
          id: `set-state-${wfState.id}`,
          title: `Set status: ${wfState.name}`,
          group: "Issue",
          icon: <StateIcon state={wfState} />,
          keywords: `${activeIssue.key} status workflow`,
          run: act(() => updateIssue(activeIssue.id, { stateId: wfState.id })),
        });
      }
      for (const priority of PRIORITY_ORDER) {
        commands.push({
          id: `set-priority-${priority}`,
          title: `Set priority: ${PRIORITY_LABEL[priority]}`,
          group: "Issue",
          icon: <PriorityIcon priority={priority} />,
          keywords: `${activeIssue.key} priority`,
          run: act(() => updateIssue(activeIssue.id, { priority })),
        });
      }
      commands.push({
        id: "assign-unassigned",
        title: "Assign: Unassigned",
        group: "Issue",
        keywords: `${activeIssue.key} assignee`,
        run: act(() =>
          updateIssue(activeIssue.id, { assigneeId: undefined }),
        ),
      });
      for (const member of state.members) {
        commands.push({
          id: `assign-${member.id}`,
          title: `Assign to ${member.name}`,
          group: "Issue",
          keywords: `${activeIssue.key} assignee ${member.email}`,
          run: act(() =>
            updateIssue(activeIssue.id, { assigneeId: member.id }),
          ),
        });
      }
    }

    return commands;
  }, [state.states, state.members, navigate, openCreate, updateIssue, activeIssue, onRun]);
}

