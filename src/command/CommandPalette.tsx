import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Command, CommandGroup } from "./types";
import { fuzzyScore } from "./fuzzy";
import { useCommands } from "./useCommands";

const GROUP_ORDER: CommandGroup[] = [
  "Create",
  "Issue",
  "Navigation",
  "View",
  "General",
];

interface ScoredCommand {
  command: Command;
  score: number;
}

// Ranks commands by fuzzy match against the query. With no query, original
// order is preserved. Title and keywords both contribute to the match.
function rankCommands(commands: Command[], query: string): Command[] {
  if (!query.trim()) return commands;
  const scored: ScoredCommand[] = [];
  for (const command of commands) {
    const haystack = `${command.title} ${command.keywords ?? ""}`;
    const score = fuzzyScore(haystack, query.trim());
    if (score !== null) scored.push({ command, score });
  }
  return scored.sort((a, b) => b.score - a.score).map((s) => s.command);
}

// Groups an ordered command list into sections, preserving the ranked order
// within each section and the canonical section order.
function groupCommands(commands: Command[]): [CommandGroup, Command[]][] {
  const byGroup = new Map<CommandGroup, Command[]>();
  for (const command of commands) {
    const bucket = byGroup.get(command.group) ?? [];
    bucket.push(command);
    byGroup.set(command.group, bucket);
  }
  return GROUP_ORDER.filter((g) => byGroup.has(g)).map((g) => [
    g,
    byGroup.get(g) ?? [],
  ]);
}

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands = useCommands(onClose);
  const ranked = useMemo(() => rankCommands(commands, query), [commands, query]);
  const grouped = useMemo(() => groupCommands(ranked), [ranked]);
  // Clamp into range so a shrinking result set never leaves the highlight past
  // the end (e.g. when contextual commands disappear).
  const safeIndex = ranked.length ? Math.min(activeIndex, ranked.length - 1) : 0;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keep the highlighted row scrolled into view as the user arrows through.
  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${safeIndex}"]`,
    );
    node?.scrollIntoView({ block: "nearest" });
  }, [safeIndex]);

  const runActive = () => {
    const command = ranked[safeIndex];
    if (command) command.run();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (ranked.length ? (i + 1) % ranked.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) =>
        ranked.length ? (i - 1 + ranked.length) % ranked.length : 0,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      runActive();
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  };

  // Flat running index across groups, so arrow navigation maps to ranked[].
  let flatIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="flex max-h-[60vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            placeholder="Type a command or search…"
            aria-label="Command palette search"
            className="w-full bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto py-1">
          {ranked.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No commands found
            </p>
          ) : (
            grouped.map(([group, items]) => (
              <div key={group} className="px-1 py-1">
                <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {group}
                </p>
                {items.map((command) => {
                  flatIndex += 1;
                  const index = flatIndex;
                  const active = index === safeIndex;
                  return (
                    <button
                      key={command.id}
                      type="button"
                      role="option"
                      aria-selected={active}
                      data-index={index}
                      onMouseMove={() => setActiveIndex(index)}
                      onClick={() => command.run()}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm",
                        active
                          ? "bg-accent-muted text-foreground"
                          : "text-foreground",
                      )}
                    >
                      {command.icon && (
                        <span className="flex h-4 w-4 items-center justify-center text-muted-foreground">
                          {command.icon}
                        </span>
                      )}
                      <span className="flex-1 truncate">{command.title}</span>
                      {command.hint && (
                        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {command.hint}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

