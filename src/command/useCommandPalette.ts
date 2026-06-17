import { useContext } from "react";
import {
  CommandPaletteContext,
  type CommandPaletteContextValue,
} from "./context";

export function useCommandPalette(): CommandPaletteContextValue {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error(
      "useCommandPalette must be used within a CommandPaletteProvider",
    );
  }
  return ctx;
}

