import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface InlineTitleProps {
  value: string;
  onCommit: (title: string) => void;
  className?: string;
}

// Auto-growing textarea that commits a trimmed, non-empty title on blur or
// Enter, and reverts to the last saved value on Escape.
export function InlineTitle({ value, onCommit, className }: InlineTitleProps) {
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(resize, [draft]);

  const commit = () => {
    const next = draft.trim();
    if (!next || next === value) {
      setDraft(value);
      return;
    }
    onCommit(next);
  };

  return (
    <textarea
      ref={ref}
      rows={1}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        } else if (e.key === "Escape") {
          setDraft(value);
          e.currentTarget.blur();
        }
      }}
      aria-label="Issue title"
      placeholder="Issue title"
      className={cn(
        "w-full resize-none bg-transparent text-2xl font-semibold leading-snug text-foreground",
        "placeholder:text-muted-foreground focus:outline-none",
        className,
      )}
    />
  );
}

