import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export interface DropdownItem<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface DropdownMenuProps<T extends string> {
  items: DropdownItem<T>[];
  selected?: T;
  onSelect: (value: T) => void;
  // Trigger is rendered as a button; `open` lets it reflect active styling.
  renderTrigger: (open: boolean) => ReactNode;
  ariaLabel: string;
  align?: "start" | "end";
  triggerClassName?: string;
}

// Lightweight, dependency-free popover menu with click-outside + keyboard
// support (Escape to close, arrow keys to move, Enter/Space to choose). Used
// for the inline state / priority / assignee editors on rows and cards.
export function DropdownMenu<T extends string>({
  items,
  selected,
  onSelect,
  renderTrigger,
  ariaLabel,
  align = "start",
  triggerClassName,
}: DropdownMenuProps<T>) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const close = useCallback(() => setOpen(false), []);

  // Opens the menu with the active highlight on the currently-selected item.
  const openMenu = useCallback(() => {
    const current = selected
      ? items.findIndex((item) => item.value === selected)
      : -1;
    setActiveIndex(current >= 0 ? current : 0);
    setOpen(true);
  }, [selected, items]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, close]);

  const choose = useCallback(
    (value: T) => {
      onSelect(value);
      close();
    },
    [onSelect, close],
  );

  const onTriggerKeyDown = (event: React.KeyboardEvent) => {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      event.preventDefault();
      openMenu();
    }
  };

  const onListKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % items.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + items.length) % items.length);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const item = items[activeIndex];
      if (item) choose(item.value);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={(event) => {
          event.stopPropagation();
          if (open) close();
          else openMenu();
        }}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          "flex items-center rounded outline-none focus-visible:ring-2 focus-visible:ring-ring",
          triggerClassName,
        )}
      >
        {renderTrigger(open)}
      </button>
      {open && (
        <div
          id={listId}
          role="menu"
          aria-label={ariaLabel}
          tabIndex={-1}
          ref={(node) => node?.focus()}
          onKeyDown={onListKeyDown}
          onClick={(event) => event.stopPropagation()}
          className={cn(
            "absolute z-50 mt-1 min-w-44 overflow-hidden rounded-md border border-border bg-popover py-1 text-popover-foreground shadow-lg outline-none",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {items.map((item, index) => (
            <button
              key={item.value}
              type="button"
              role="menuitemradio"
              aria-checked={item.value === selected}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => choose(item.value)}
              className={cn(
                "flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-sm",
                index === activeIndex
                  ? "bg-accent-muted text-foreground"
                  : "text-foreground",
              )}
            >
              {item.icon && (
                <span className="flex h-4 w-4 items-center justify-center">
                  {item.icon}
                </span>
              )}
              <span className="flex-1 truncate">{item.label}</span>
              {item.value === selected && (
                <span className="text-accent" aria-hidden>
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

