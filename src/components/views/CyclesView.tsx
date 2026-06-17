import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useStore } from "@/store";
import { useLookups } from "@/store";
import { computeProgress, cycleStatus, fmtDate } from "@/lib/progress";
import type { Cycle } from "@/types";
import { IssueRow } from "./IssueRow";
import { ViewHeader } from "./ViewHeader";
import { EmptyState } from "./EmptyState";
import { CycleForm } from "./CycleForm";

// ── Status badge ────────────────────────────────────────────────────────────

const CYCLE_STATUS_LABEL = {
  active: "Active",
  upcoming: "Upcoming",
  completed: "Completed",
} as const;

const CYCLE_STATUS_COLOR: Record<"active" | "upcoming" | "completed", string> = {
  active: "var(--state-started)",
  upcoming: "var(--state-unstarted)",
  completed: "var(--state-completed)",
};

function CycleStatusBadge({ status }: { status: "active" | "upcoming" | "completed" }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
      style={{
        backgroundColor: `${CYCLE_STATUS_COLOR[status]}22`,
        color: CYCLE_STATUS_COLOR[status],
      }}
    >
      {CYCLE_STATUS_LABEL[status]}
    </span>
  );
}

// ── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-accent transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Cycle row (list) ─────────────────────────────────────────────────────────

interface CycleRowProps {
  cycle: Cycle;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function CycleRow({ cycle, onSelect, onEdit, onDelete }: CycleRowProps) {
  const { state } = useStore();
  const { statesById } = useLookups();
  const issues = state.issues.filter((i) => i.cycleId === cycle.id);
  const { done, total, pct } = computeProgress(issues, statesById);
  const status = cycleStatus(cycle.startDate, cycle.endDate);

  return (
    <article className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 text-card-foreground hover:border-accent/40 transition-colors">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSelect}
            className="text-sm font-semibold text-card-foreground hover:underline focus-visible:outline-none"
          >
            {cycle.name}
          </button>
          <CycleStatusBadge status={status} />
          <span className="text-xs text-muted-foreground">
            {fmtDate(cycle.startDate)} – {fmtDate(cycle.endDate)}
          </span>
        </div>
        <div className="mt-2">
          <ProgressBar pct={pct} />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <div className="text-right text-xs text-muted-foreground">
          <div className="font-medium text-foreground">{pct}%</div>
          <div>
            {done}/{total} done
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            title="Edit"
            className="rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title="Delete"
            className="rounded p-0.5 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}

// ── Cycle detail ──────────────────────────────────────────────────────────────

interface CycleDetailProps {
  cycle: Cycle;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function CycleDetail({ cycle, onBack, onEdit, onDelete }: CycleDetailProps) {
  const { state } = useStore();
  const { statesById } = useLookups();
  const status = cycleStatus(cycle.startDate, cycle.endDate);

  const issues = useMemo(
    () => state.issues.filter((i) => i.cycleId === cycle.id),
    [state.issues, cycle.id],
  );
  const { done, total, pct } = computeProgress(issues, statesById);

  // Group by workflow state
  const groups = useMemo(() => {
    const ordered = [...state.states].sort((a, b) => a.order - b.order);
    return ordered
      .map((s) => ({ wfState: s, issues: issues.filter((i) => i.stateId === s.id) }))
      .filter((g) => g.issues.length > 0);
  }, [state.states, issues]);

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const toggleGroup = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });

  return (
    <section className="flex h-full flex-col">
      {/* Header */}
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-5">
        <button
          type="button"
          onClick={onBack}
          className="rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Back to cycles"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-sm font-semibold">{cycle.name}</h1>
        <CycleStatusBadge status={status} />
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
          >
            <Pencil className="h-3 w-3" /> Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3 w-3" /> Delete
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Summary bar */}
        <div className="border-b border-border bg-muted/30 px-5 py-3">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
            <span>
              {fmtDate(cycle.startDate)} – {fmtDate(cycle.endDate)}
            </span>
            <span>{total} issues</span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1">
              <ProgressBar pct={pct} />
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {done}/{total} done &middot; {pct}%
            </span>
          </div>
        </div>

        {/* Issue groups */}
        {total === 0 ? (
          <EmptyState
            title="No issues"
            description="Assign issues to this cycle to track progress here."
          />
        ) : (
          <div>
            {groups.map(({ wfState, issues: groupIssues }) => (
              <div key={wfState.id}>
                <button
                  type="button"
                  onClick={() => toggleGroup(wfState.id)}
                  className="flex w-full items-center gap-2 border-b border-border px-5 py-2 hover:bg-muted/50"
                >
                  {collapsed.has(wfState.id) ? (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: wfState.color }}
                  />
                  <span className="text-xs font-medium text-muted-foreground">
                    {wfState.name}
                  </span>
                  <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {groupIssues.length}
                  </span>
                </button>
                {!collapsed.has(wfState.id) &&
                  groupIssues.map((issue) => (
                    <IssueRow key={issue.id} issue={issue} />
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

type CycleModalState =
  | { kind: "none" }
  | { kind: "create" }
  | { kind: "edit"; cycle: Cycle };

export function CyclesView() {
  const { state, deleteCycle } = useStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [modal, setModal] = useState<CycleModalState>({ kind: "none" });

  const cycles = useMemo(
    () => [...state.cycles].sort((a, b) => a.number - b.number),
    [state.cycles],
  );

  const selectedCycle = selected
    ? state.cycles.find((c) => c.id === selected)
    : undefined;

  function handleDelete(id: string) {
    if (!window.confirm("Delete this cycle? Issues will be unassigned.")) return;
    deleteCycle(id);
    if (selected === id) setSelected(null);
  }

  // ── Detail view ──
  if (selectedCycle) {
    return (
      <>
        <CycleDetail
          cycle={selectedCycle}
          onBack={() => setSelected(null)}
          onEdit={() => setModal({ kind: "edit", cycle: selectedCycle })}
          onDelete={() => handleDelete(selectedCycle.id)}
        />
        {modal.kind === "edit" && (
          <CycleForm
            cycle={modal.cycle}
            onClose={() => setModal({ kind: "none" })}
          />
        )}
      </>
    );
  }

  // ── Group active / upcoming / completed ──
  const active = cycles.filter((c) => cycleStatus(c.startDate, c.endDate) === "active");
  const upcoming = cycles.filter((c) => cycleStatus(c.startDate, c.endDate) === "upcoming");
  const completed = cycles.filter((c) => cycleStatus(c.startDate, c.endDate) === "completed");

  return (
    <section className="flex h-full flex-col">
      <ViewHeader
        title="Cycles"
        count={cycles.length}
        actions={
          <button
            type="button"
            onClick={() => setModal({ kind: "create" })}
            className="flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1.5 text-xs font-medium text-accent-foreground hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className="h-3.5 w-3.5" /> New cycle
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-5">
        {cycles.length === 0 ? (
          <EmptyState
            title="No cycles"
            description="Cycles are time-boxed iterations that group active work."
          />
        ) : (
          <div className="space-y-6">
            {active.length > 0 && (
              <CycleSection
                title="Active"
                cycles={active}
                onSelect={setSelected}
                onEdit={(c) => setModal({ kind: "edit", cycle: c })}
                onDelete={(id) => handleDelete(id)}
              />
            )}
            {upcoming.length > 0 && (
              <CycleSection
                title="Upcoming"
                cycles={upcoming}
                onSelect={setSelected}
                onEdit={(c) => setModal({ kind: "edit", cycle: c })}
                onDelete={(id) => handleDelete(id)}
              />
            )}
            {completed.length > 0 && (
              <CycleSection
                title="Completed"
                cycles={completed}
                onSelect={setSelected}
                onEdit={(c) => setModal({ kind: "edit", cycle: c })}
                onDelete={(id) => handleDelete(id)}
              />
            )}
          </div>
        )}
      </div>

      {modal.kind === "create" && (
        <CycleForm onClose={() => setModal({ kind: "none" })} />
      )}
      {modal.kind === "edit" && (
        <CycleForm
          cycle={modal.cycle}
          onClose={() => setModal({ kind: "none" })}
        />
      )}
    </section>
  );
}

// ── Section sub-component ─────────────────────────────────────────────────────────

function CycleSection({
  title,
  cycles,
  onSelect,
  onEdit,
  onDelete,
}: {
  title: string;
  cycles: Cycle[];
  onSelect: (id: string) => void;
  onEdit: (c: Cycle) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="space-y-2">
        {cycles.map((cycle) => (
          <CycleRow
            key={cycle.id}
            cycle={cycle}
            onSelect={() => onSelect(cycle.id)}
            onEdit={() => onEdit(cycle)}
            onDelete={() => onDelete(cycle.id)}
          />
        ))}
      </div>
    </div>
  );
}

