import { useStore } from "@/store";
import { ViewHeader } from "./ViewHeader";
import { EmptyState } from "./EmptyState";

const STATUS_LABEL: Record<string, string> = {
  backlog: "Backlog",
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed",
  canceled: "Canceled",
};

export function ProjectsView() {
  const { state } = useStore();

  return (
    <section className="flex h-full flex-col">
      <ViewHeader title="Projects" count={state.projects.length} />
      <div className="flex-1 overflow-y-auto p-5">
        {state.projects.length === 0 ? (
          <EmptyState
            title="No projects"
            description="Group related issues into projects to track larger efforts."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {state.projects.map((project) => {
              const count = state.issues.filter(
                (i) => i.projectId === project.id,
              ).length;
              const lead = project.leadId
                ? state.members.find((m) => m.id === project.leadId)
                : undefined;
              return (
                <article
                  key={project.id}
                  className="rounded-lg border border-border bg-card p-4 text-card-foreground"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-sm"
                      style={{ backgroundColor: project.color }}
                    />
                    <h2 className="text-sm font-semibold">{project.name}</h2>
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                      {project.key}
                    </span>
                  </div>
                  {project.description && (
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                      {project.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{STATUS_LABEL[project.status] ?? project.status}</span>
                    <span>{count} issues</span>
                  </div>
                  {lead && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span
                        className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-semibold text-white"
                        style={{ backgroundColor: lead.avatarColor }}
                      >
                        {lead.initials}
                      </span>
                      {lead.name}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

