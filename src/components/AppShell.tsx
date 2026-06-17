import { Sidebar } from "./Sidebar";
import { ViewRouter } from "./views/ViewRouter";

export function AppShell() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <ViewRouter />
      </main>
    </div>
  );
}

