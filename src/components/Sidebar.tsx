import { useEffect } from "react";
import {
  CircleDot,
  FolderKanban,
  Inbox,
  Layers,
  Plus,
  User,
  type LucideIcon,
} from "lucide-react";
import { readableTextColor } from "@/lib/avatar-contrast";
import { cn } from "@/lib/utils";
import { identifyCurrentUser } from "@/lib/capture";
import { useNavigation, type ViewId } from "@/navigation";
import { useStore } from "@/store";
import { useIssueDialog } from "@/components/issue";
import { Button } from "./ui/Button";
import { ThemeToggle } from "./ThemeToggle";

interface NavItem {
  id: ViewId;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { id: "my-issues", label: "My Issues", icon: User },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "issues", label: "Issues", icon: CircleDot },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "cycles", label: "Cycles", icon: Layers },
];

export function Sidebar() {
  const { view, navigate } = useNavigation();
  const { state } = useStore();
  const { openCreate } = useIssueDialog();
  const currentUser = state.members.find((m) => m.id === state.currentUserId);

  useEffect(() => {
    if (currentUser) identifyCurrentUser(currentUser);
  }, [currentUser]);

  return (
    <aside className="flex h-full w-18 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:w-60">
      <div className="flex items-center justify-between px-2 py-3 md:px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-accent text-xs font-semibold text-accent-foreground">
            R
          </div>
          <span className="hidden text-sm font-semibold md:inline">Replay</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="px-2 pb-1 pt-1">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => openCreate()}
          aria-label="New issue"
          className="w-full justify-center md:justify-start"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline">New issue</span>
        </Button>
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.id)}
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
              className={cn(
                "flex w-full items-center justify-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors md:justify-start",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60",
              )}
            >
              <Icon className="h-4 w-4 shrink-0 text-sidebar-muted" />
              <span className="hidden md:inline">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {currentUser && (
        <div className="flex items-center justify-center gap-2 border-t border-sidebar-border px-2 py-3 md:justify-start md:px-4">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold"
            style={{
              backgroundColor: currentUser.avatarColor,
              color: readableTextColor(currentUser.avatarColor),
            }}
          >
            {currentUser.initials}
          </span>
          <span className="hidden truncate text-xs text-sidebar-muted md:inline">
            {currentUser.name}
          </span>
        </div>
      )}
    </aside>
  );
}

