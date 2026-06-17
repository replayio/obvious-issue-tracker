import { createContext } from "react";

export interface CommandPaletteContextValue {
  open: boolean;
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;
}

export const CommandPaletteContext =
  createContext<CommandPaletteContextValue | null>(null);

