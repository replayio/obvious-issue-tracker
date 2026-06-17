import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigation } from "@/navigation";
import { useIssueDialog } from "@/components/issue";
import {
  CommandPaletteContext,
  type CommandPaletteContextValue,
} from "./context";
import { CommandPalette } from "./CommandPalette";
import { useKeyBindings, type KeyBinding } from "./shortcuts";

// Owns command-palette open state, registers the global keyboard shortcuts, and
// renders the palette overlay. Mounted once near the app root, inside the
// navigation + issue-dialog providers it depends on.
export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { navigate } = useNavigation();
  const { openCreate } = useIssueDialog();

  const openPalette = useCallback(() => setOpen(true), []);
  const closePalette = useCallback(() => setOpen(false), []);
  const togglePalette = useCallback(() => setOpen((v) => !v), []);

  const bindings = useMemo<KeyBinding[]>(
    () => [
      // Cmd/Ctrl+K and "/" open the palette; both work even while typing for K.
      { combo: "k", meta: true, allowInInput: true, handler: togglePalette },
      { combo: "/", handler: openPalette },
      // Quick create.
      { combo: "c", handler: () => openCreate() },
      // Linear-style "g then x" navigation.
      { combo: "g i", handler: () => navigate("issues") },
      { combo: "g m", handler: () => navigate("my-issues") },
      { combo: "g n", handler: () => navigate("inbox") },
      { combo: "g p", handler: () => navigate("projects") },
      { combo: "g c", handler: () => navigate("cycles") },
    ],
    [togglePalette, openPalette, openCreate, navigate],
  );

  useKeyBindings(bindings);

  const value = useMemo<CommandPaletteContextValue>(
    () => ({ open, openPalette, closePalette, togglePalette }),
    [open, openPalette, closePalette, togglePalette],
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      {open && <CommandPalette onClose={closePalette} />}
    </CommandPaletteContext.Provider>
  );
}

