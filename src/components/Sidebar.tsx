import {
  CircleDot,
  FolderKanban,
  Inbox,
  Layers,
  User,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigation, type ViewId } from "@/navigation";
import { useStore } from "@/store";
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
  const currentUser = state.members.find((m) => m.id === state.currentUserId);

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-accent text-xs font-semibold text-accent-foreground">
            R
          </div>
          <span className="text-sm font-semibold">Replay</span>
        </div>
        <ThemeToggle />
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
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60",
              )}
            >
              <Icon className="h-4 w-4 shrink-0 text-sidebar-muted" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {currentUser && (
        <div className="flex items-center gap-2 border-t border-sidebar-border px-4 py-3">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
            style={{ backgroundColor: currentUser.avatarColor }}
          >
            {currentUser.initials}
          </span>
          <span className="truncate text-xs text-sidebar-muted">
            {currentUser.name}
          </span>
        </div>
      )}
    </aside>
  );
}

