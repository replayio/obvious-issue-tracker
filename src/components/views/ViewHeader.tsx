import type { ReactNode } from "react";

interface ViewHeaderProps {
  title: string;
  count?: number;
  actions?: ReactNode;
}

export function ViewHeader({ title, count, actions }: ViewHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-5">
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-semibold text-foreground">{title}</h1>
        {count !== undefined && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {count}
          </span>
        )}
      </div>
      {actions}
    </header>
  );
}

