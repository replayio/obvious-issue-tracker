import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";
import { useStore } from "@/store";
import { useLookups } from "@/store";
import { computeProgress, cycleStatus, fmtDate } from "@/lib/progress";
import { cn } from "@/lib/utils";
import type { Cycle } from "@/types";
import { DatePicker } from "@/components/issue/pickers";
import { IssueRow } from "./IssueRow";
import { ViewHeader } from "./ViewHeader";
import { EmptyState } from "./EmptyState";

type CyclePatch = Partial<Omit<Cycle, "id">>;

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

// ── Inline editors ────────────────────────────────────────────────────────────

// Click-to-edit text field that commits a trimmed, non-empty value on blur or
// Enter and reverts on Escape.
function InlineName({
  value,
  onCommit,
}: {
  value: string;
  onCommit: (next: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  const commit = () => {
    const next = draft.trim();
    if (!next || next === value) {
      setDraft(value);
      return;
    }
    onCommit(next);
  };

  return (
    <input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        else if (e.key === "Escape") {
          setDraft(value);
          e.currentTarget.blur();
        }
      }}
      aria-label="Cycle name"
      className={cn(
        "-mx-1.5 min-w-0 rounded bg-transparent px-1.5 py-0.5 text-sm font-semibold text-foreground",
        "hover:bg-muted focus:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    />
  );
}

function InlineNumber({
  value,
  onCommit,
}: {
  value: number;
  onCommit: (next: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);

  const commit = () => {
    const n = Math.floor(Number(draft));
    if (!Number.isFinite(n) || n < 1 || n === value) {
      setDraft(String(value));
      return;
    }
    onCommit(n);
  };

  return (
    <input
      type="number"
      min={1}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        else if (e.key === "Escape") {
          setDraft(String(value));
          e.currentTarget.blur();
        }
      }}
      aria-label="Cycle number"
      className={cn(
        "w-14 rounded bg-transparent px-1.5 py-0.5 text-sm text-foreground",
        "hover:bg-muted focus:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    />
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
  onDelete: () => void;
}

function CycleRow({ cycle, onSelect, onDelete }: CycleRowProps) {
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
  onPatch: (patch: CyclePatch) => void;
  onDelete: () => void;
}

function CycleDetail({ cycle, onBack, onPatch, onDelete }: CycleDetailProps) {
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
        <InlineName value={cycle.name} onCommit={(name) => onPatch({ name })} />
        <CycleStatusBadge status={status} />
        <div className="ml-auto flex items-center gap-1">
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
        {/* Editable summary bar */}
        <div className="border-b border-border bg-muted/30 px-5 py-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
            <label className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Cycle #</span>
              <InlineNumber
                value={cycle.number}
                onCommit={(number) => onPatch({ number })}
              />
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Start</span>
              <DatePicker
                value={cycle.startDate}
                onChange={(startDate) => onPatch({ startDate })}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">End</span>
              <DatePicker
                value={cycle.endDate}
                onChange={(endDate) => onPatch({ endDate })}
              />
            </div>
            <span className="text-muted-foreground">{total} issues</span>
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

export function CyclesView() {
  const { state, createCycle, updateCycle, deleteCycle } = useStore();
  const [selected, setSelected] = useState<string | null>(null);

  const cycles = useMemo(
    () => [...state.cycles].sort((a, b) => a.number - b.number),
    [state.cycles],
  );

  const selectedCycle = selected
    ? state.cycles.find((c) => c.id === selected)
    : undefined;

  function handleCreate() {
    const nextNumber = cycles.length
      ? Math.max(...cycles.map((c) => c.number)) + 1
      : 1;
    // Default to a two-week cycle starting today, anchored at noon UTC.
    const start = new Date();
    start.setUTCHours(12, 0, 0, 0);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 14);

    const id = createCycle({
      name: `Cycle ${nextNumber}`,
      number: nextNumber,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });
    // Open the new cycle so it can be edited inline via the pickers.
    setSelected(id);
  }

  function handleDelete(id: string) {
    if (!window.confirm("Delete this cycle? Issues will be unassigned.")) return;
    deleteCycle(id);
    if (selected === id) setSelected(null);
  }

  // ── Detail view ──
  if (selectedCycle) {
    return (
      <CycleDetail
        cycle={selectedCycle}
        onBack={() => setSelected(null)}
        onPatch={(patch) => updateCycle(selectedCycle.id, patch)}
        onDelete={() => handleDelete(selectedCycle.id)}
      />
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
            onClick={handleCreate}
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
                onDelete={(id) => handleDelete(id)}
              />
            )}
            {upcoming.length > 0 && (
              <CycleSection
                title="Upcoming"
                cycles={upcoming}
                onSelect={setSelected}
                onDelete={(id) => handleDelete(id)}
              />
            )}
            {completed.length > 0 && (
              <CycleSection
                title="Completed"
                cycles={completed}
                onSelect={setSelected}
                onDelete={(id) => handleDelete(id)}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Section sub-component ─────────────────────────────────────────────────────────

function CycleSection({
  title,
  cycles,
  onSelect,
  onDelete,
}: {
  title: string;
  cycles: Cycle[];
  onSelect: (id: string) => void;
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
            onDelete={() => onDelete(cycle.id)}
          />
        ))}
      </div>
    </div>
  );
}
