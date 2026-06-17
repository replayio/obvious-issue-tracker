import { AppShell } from "@/components/AppShell";
import { IssueDialogProvider } from "@/components/issue";
import { CommandPaletteProvider } from "@/command";
import { NavigationProvider } from "@/navigation";
import { StoreProvider } from "@/store";
import { ThemeProvider } from "@/theme";

export default function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <NavigationProvider>
          <IssueDialogProvider>
            <CommandPaletteProvider>
              <AppShell />
            </CommandPaletteProvider>
          </IssueDialogProvider>
        </NavigationProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}