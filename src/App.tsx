import { AppShell } from "@/components/AppShell";
import { NavigationProvider } from "@/navigation";
import { StoreProvider } from "@/store";
import { ThemeProvider } from "@/theme";

export default function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <NavigationProvider>
          <AppShell />
        </NavigationProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}