import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useStore } from "@/store";
import { useLookups } from "@/store";
import { computeProgress, fmtDate } from "@/lib/progress";
import type { Issue, Project, ProjectStatus, WorkflowState } from "@/types";
import { IssueRow } from "./IssueRow";
import { ViewHeader } from "./ViewHeader";
import { EmptyState } from "./EmptyState";
import { ProjectForm } from "./ProjectForm";

// ── Status labels & colors ──────────────────────────────────────────────────

const STATUS_LABEL: Record<ProjectStatus, string> = {
  backlog: "Backlog",
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed",
  canceled: "Canceled",
};

const STATUS_COLOR: Record<ProjectStatus, string> = {
  backlog: "var(--state-backlog)",
  planned: "var(--state-unstarted)",
  in_progress: "var(--state-started)",
  completed: "var(--state-completed)",
  canceled: "var(--state-canceled)",
};

// ── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ── Project card (list) ───────────────────────────────────────────────────────

interface ProjectCardProps {
  project: Project;
  issues: Issue[];
  statesById: Map<string, WorkflowState>;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ProjectCard({
  project,
  issues,
  statesById,
  onSelect,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const { state } = useStore();
  const lead = state.members.find((m) => m.id === project.leadId);
  const { done, total, pct } = computeProgress(issues, statesById);

  return (
    <article className="group rounded-lg border border-border bg-card p-4 text-card-foreground hover:border-accent/40 transition-colors">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 items-center gap-2 text-left focus-visible:outline-none"
        >
          <span
            className="mt-0.5 h-3 w-3 shrink-0 rounded-sm"
            style={{ backgroundColor: project.color }}
          />
          <span className="truncate text-sm font-semibold text-card-foreground">
            {project.name}
          </span>
          <span className="ml-1 shrink-0 font-mono text-[10px] text-muted-foreground">
            {project.key}
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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

      {/* Description */}
      {project.description && (
        <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
          {project.description}
        </p>
      )}

      {/* Progress bar */}
      <div className="mt-3">
        <ProgressBar pct={pct} color={project.color} />
      </div>

      {/* Meta row */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span style={{ color: STATUS_COLOR[project.status] }}>
          {STATUS_LABEL[project.status]}
        </span>
        <span>
          {done}/{total} issues
        </span>
        {project.targetDate && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {fmtDate(project.targetDate)}
          </span>
        )}
        {lead && (
          <span className="flex items-center gap-1.5 ml-auto">
            <span
              className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-semibold text-white"
              style={{ backgroundColor: lead.avatarColor }}
            >
              {lead.initials}
            </span>
            <span className="truncate max-w-[100px]">{lead.name}</span>
          </span>
        )}
      </div>
    </article>
  );
}

// ── Project detail ────────────────────────────────────────────────────────────

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ProjectDetail({ project, onBack, onEdit, onDelete }: ProjectDetailProps) {
  const { state } = useStore();
  const { statesById } = useLookups();
  const lead = project.leadId ? state.members.find((m) => m.id === project.leadId) : undefined;

  const issues = useMemo(
    () => state.issues.filter((i) => i.projectId === project.id),
    [state.issues, project.id],
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
          aria-label="Back to projects"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span
          className="h-3 w-3 shrink-0 rounded-sm"
          style={{ backgroundColor: project.color }}
        />
        <h1 className="text-sm font-semibold">{project.name}</h1>
        <span className="font-mono text-xs text-muted-foreground">{project.key}</span>
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
            <span style={{ color: STATUS_COLOR[project.status] }}>
              {STATUS_LABEL[project.status]}
            </span>
            {project.description && (
              <span className="text-foreground/70">{project.description}</span>
            )}
            {lead && (
              <span className="flex items-center gap-1">
                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-semibold text-white"
                  style={{ backgroundColor: lead.avatarColor }}
                >
                  {lead.initials}
                </span>
                {lead.name}
              </span>
            )}
            {project.startDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {fmtDate(project.startDate)}
              </span>
            )}
            {project.targetDate && (
              <span>&#8594; {fmtDate(project.targetDate)}</span>
            )}
          </div>
          {/* Progress */}
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1">
              <ProgressBar pct={pct} color={project.color} />
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
            description="Assign issues to this project to track progress here."
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

type ModalState =
  | { kind: "none" }
  | { kind: "create" }
  | { kind: "edit"; project: Project };

export function ProjectsView() {
  const { state, deleteProject } = useStore();
  const { statesById } = useLookups();
  const [selected, setSelected] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ kind: "none" });

  const selectedProject = selected
    ? state.projects.find((p) => p.id === selected)
    : undefined;

  function handleDelete(id: string) {
    if (!window.confirm("Delete this project? Issues will be unassigned.")) return;
    deleteProject(id);
    if (selected === id) setSelected(null);
  }

  // ── Detail view ──
  if (selectedProject) {
    return (
      <>
        <ProjectDetail
          project={selectedProject}
          onBack={() => setSelected(null)}
          onEdit={() => setModal({ kind: "edit", project: selectedProject })}
          onDelete={() => handleDelete(selectedProject.id)}
        />
        {modal.kind === "edit" && (
          <ProjectForm
            project={modal.project}
            onClose={() => setModal({ kind: "none" })}
          />
        )}
      </>
    );
  }

  // ── List view ──
  return (
    <section className="flex h-full flex-col">
      <ViewHeader
        title="Projects"
        count={state.projects.length}
        actions={
          <button
            type="button"
            onClick={() => setModal({ kind: "create" })}
            className="flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1.5 text-xs font-medium text-accent-foreground hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className="h-3.5 w-3.5" /> New project
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-5">
        {state.projects.length === 0 ? (
          <EmptyState
            title="No projects"
            description="Group related issues into projects to track larger efforts."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {state.projects.map((project) => {
              const projectIssues = state.issues.filter(
                (i) => i.projectId === project.id,
              );
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  issues={projectIssues}
                  statesById={statesById}
                  onSelect={() => setSelected(project.id)}
                  onEdit={() => setModal({ kind: "edit", project })}
                  onDelete={() => handleDelete(project.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      {modal.kind === "create" && (
        <ProjectForm onClose={() => setModal({ kind: "none" })} />
      )}
      {modal.kind === "edit" && (
        <ProjectForm
          project={modal.project}
          onClose={() => setModal({ kind: "none" })}
        />
      )}
    </section>
  );
}

