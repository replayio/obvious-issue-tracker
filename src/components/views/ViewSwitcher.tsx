import { Columns3, LayoutList } from "lucide-react";
import { cn } from "@/lib/utils";

export type IssueViewMode = "list" | "board";

const OPTIONS: { mode: IssueViewMode; label: string; icon: typeof LayoutList }[] =
  [
    { mode: "list", label: "List", icon: LayoutList },
    { mode: "board", label: "Board", icon: Columns3 },
  ];

export function ViewSwitcher({
  mode,
  onChange,
}: {
  mode: IssueViewMode;
  onChange: (mode: IssueViewMode) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Issue view mode"
      className="flex items-center gap-0.5 rounded-md border border-border p-0.5"
    >
      {OPTIONS.map(({ mode: value, label, icon: Icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(value)}
            title={`${label} view`}
            className={cn(
              "flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

