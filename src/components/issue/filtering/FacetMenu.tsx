import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FacetOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface FacetMenuProps {
  label: string;
  icon?: ReactNode;
  options: FacetOption[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
}

// Multi-select dropdown for one filter facet (state / priority / assignee /…).
// Click-outside + Escape close it; each option toggles independently so the
// menu stays open while building up a selection (matching Linear).
export function FacetMenu({
  label,
  icon,
  options,
  selected,
  onToggle,
  onClear,
}: FacetMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const count = selected.length;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          count > 0
            ? "bg-accent-muted text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {icon}
        <span>{label}</span>
        {count > 0 && (
          <span className="rounded bg-accent px-1 text-[10px] font-medium text-accent-foreground">
            {count}
          </span>
        )}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={`Filter by ${label}`}
          className="absolute left-0 z-50 mt-1 max-h-72 w-56 overflow-y-auto rounded-md border border-border bg-popover py-1 text-popover-foreground shadow-lg"
        >
          {options.length === 0 ? (
            <p className="px-2.5 py-1.5 text-xs text-muted-foreground">
              No options
            </p>
          ) : (
            options.map((option) => {
              const active = selected.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={active}
                  onClick={() => onToggle(option.value)}
                  className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-sm hover:bg-accent-muted"
                >
                  <span className="flex h-4 w-4 items-center justify-center">
                    {active ? (
                      <Check className="h-3.5 w-3.5 text-accent" />
                    ) : (
                      option.icon
                    )}
                  </span>
                  <span className="flex-1 truncate">{option.label}</span>
                </button>
              );
            })
          )}
          {count > 0 && (
            <div className="mt-1 border-t border-border pt-1">
              <button
                type="button"
                onClick={onClear}
                className="w-full px-2.5 py-1.5 text-left text-xs text-muted-foreground hover:text-foreground"
              >
                Clear {label.toLowerCase()}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

