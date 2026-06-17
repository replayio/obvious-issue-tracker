import { useStore } from "@/store";
import { ViewHeader } from "./ViewHeader";
import { EmptyState } from "./EmptyState";

function formatRange(startDate: string, endDate: string): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  return `${fmt(startDate)} – ${fmt(endDate)}`;
}

export function CyclesView() {
  const { state } = useStore();
  const cycles = [...state.cycles].sort((a, b) => a.number - b.number);

  return (
    <section className="flex h-full flex-col">
      <ViewHeader title="Cycles" count={cycles.length} />
      <div className="flex-1 overflow-y-auto p-5">
        {cycles.length === 0 ? (
          <EmptyState
            title="No cycles"
            description="Cycles are time-boxed iterations that group active work."
          />
        ) : (
          <div className="space-y-2">
            {cycles.map((cycle) => {
              const count = state.issues.filter(
                (i) => i.cycleId === cycle.id,
              ).length;
              const done = state.issues.filter((i) => {
                if (i.cycleId !== cycle.id) return false;
                const wfState = state.states.find((s) => s.id === i.stateId);
                return wfState?.category === "completed";
              }).length;
              const pct = count === 0 ? 0 : Math.round((done / count) * 100);
              return (
                <article
                  key={cycle.id}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 text-card-foreground"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold">{cycle.name}</h2>
                      <span className="text-xs text-muted-foreground">
                        {formatRange(cycle.startDate, cycle.endDate)}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-xs text-muted-foreground">
                    <div className="font-medium text-foreground">{pct}%</div>
                    <div>
                      {done}/{count} done
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

