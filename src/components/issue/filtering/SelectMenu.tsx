import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectMenuProps<T extends string> {
  label: string;
  icon?: ReactNode;
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

// Single-select dropdown used for the sort and group-by controls. Selecting an
// option applies it and closes the menu.
export function SelectMenu<T extends string>({
  label,
  icon,
  options,
  value,
  onChange,
}: SelectMenuProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

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
        title={`${label}: ${current?.label ?? ""}`}
        className={cn(
          "flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors",
          "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        {icon}
        <span>
          {label}
          {current ? `: ${current.label}` : ""}
        </span>
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={label}
          className="absolute right-0 z-50 mt-1 w-48 overflow-hidden rounded-md border border-border bg-popover py-1 text-popover-foreground shadow-lg"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={option.value === value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-sm hover:bg-accent-muted"
            >
              <span className="flex h-4 w-4 items-center justify-center">
                {option.value === value && (
                  <Check className="h-3.5 w-3.5 text-accent" />
                )}
              </span>
              <span className="flex-1 truncate">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

