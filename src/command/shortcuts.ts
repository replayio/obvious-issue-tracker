import { useEffect, useRef } from "react";

// True when focus is inside a text field or rich-text editor, so global
// single-key shortcuts don't fire while the user is typing.
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable;
}

export interface KeyBinding {
  // A single key ("c", "/") or a space-separated sequence ("g i"). Matched
  // case-insensitively against event.key.
  combo: string;
  // Require the platform modifier (Cmd on macOS, Ctrl elsewhere).
  meta?: boolean;
  // Fire even while typing in a field (used for Cmd+K and Escape).
  allowInInput?: boolean;
  handler: (event: KeyboardEvent) => void;
}

const SEQUENCE_TIMEOUT_MS = 800;

function hasMeta(event: KeyboardEvent): boolean {
  return event.metaKey || event.ctrlKey;
}

// Global keyboard binding hook supporting platform-modifier combos (Cmd+K) and
// Linear-style key sequences ("g i"). Sequence progress resets after a short
// timeout or on any non-matching key. Bindings are re-read each event via a
// ref so callers can pass fresh closures without re-subscribing.
export function useKeyBindings(bindings: KeyBinding[]): void {
  const bindingsRef = useRef(bindings);
  useEffect(() => {
    bindingsRef.current = bindings;
  }, [bindings]);

  useEffect(() => {
    let sequence = "";
    let timer: ReturnType<typeof setTimeout> | null = null;

    const resetSequence = () => {
      sequence = "";
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey) return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const editable = isEditableTarget(event.target);

      // Modifier combos (e.g. Cmd+K) are matched first and ignore sequences.
      for (const binding of bindingsRef.current) {
        if (!binding.meta) continue;
        if (!hasMeta(event)) continue;
        if (binding.combo.toLowerCase() !== key) continue;
        event.preventDefault();
        binding.handler(event);
        resetSequence();
        return;
      }

      if (hasMeta(event)) return;

      // Single-key and sequence bindings. Skip those that aren't allowed while
      // typing; but "Escape" style allowInInput bindings still run.
      const candidate = sequence ? `${sequence} ${key}` : key;
      let matchedPrefix = false;

      for (const binding of bindingsRef.current) {
        if (binding.meta) continue;
        if (editable && !binding.allowInInput) continue;
        const combo = binding.combo.toLowerCase();
        if (combo === candidate) {
          event.preventDefault();
          binding.handler(event);
          resetSequence();
          return;
        }
        if (combo.startsWith(`${candidate} `)) matchedPrefix = true;
      }

      if (matchedPrefix) {
        sequence = candidate;
        if (timer) clearTimeout(timer);
        timer = setTimeout(resetSequence, SEQUENCE_TIMEOUT_MS);
      } else {
        resetSequence();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (timer) clearTimeout(timer);
    };
  }, []);
}

