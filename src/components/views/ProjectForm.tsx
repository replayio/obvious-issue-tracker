import { useState } from "react";
import type { Project, ProjectStatus } from "@/types";
import { useStore } from "@/store";
import { Modal } from "@/components/Modal";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "canceled", label: "Canceled" },
];

const COLOR_SWATCHES = [
  "#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#8b5cf6",
  "#10b981", "#ef4444", "#3b82f6", "#f97316", "#06b6d4",
];

interface ProjectFormProps {
  /** When provided, the form is in edit mode for that project. */
  project?: Project;
  onClose: () => void;
}

export function ProjectForm({ project, onClose }: ProjectFormProps) {
  const { state, createProject, updateProject } = useStore();

  const [name, setName] = useState(project?.name ?? "");
  const [key, setKey] = useState(project?.key ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "planned");
  const [leadId, setLeadId] = useState(project?.leadId ?? "");
  const [startDate, setStartDate] = useState(
    project?.startDate ? project.startDate.slice(0, 10) : "",
  );
  const [targetDate, setTargetDate] = useState(
    project?.targetDate ? project.targetDate.slice(0, 10) : "",
  );
  const [color, setColor] = useState(project?.color ?? "#6366f1");

  const isEdit = project !== undefined;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedKey = key.trim().toUpperCase();
    if (!trimmedName || !trimmedKey) return;

    const payload: Omit<Project, "id"> = {
      name: trimmedName,
      key: trimmedKey,
      description: description.trim() || undefined,
      status,
      leadId: leadId || undefined,
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
      color,
    };

    if (isEdit) {
      updateProject(project.id, payload);
    } else {
      createProject(payload);
    }
    onClose();
  }

  return (
    <Modal
      title={isEdit ? `Edit ${project.name}` : "New Project"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Name */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={cn(
              "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground",
              "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
            placeholder="Project name"
            required
            autoFocus
          />
        </div>

        {/* Key */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Key <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
            className={cn(
              "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm font-mono text-foreground uppercase",
              "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
            placeholder="RT"
            maxLength={6}
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={cn(
              "w-full resize-none rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground",
              "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
            placeholder="Short description"
          />
        </div>

        {/* Status + Lead row */}
        <div className="flex gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className={cn(
                "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Lead</label>
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className={cn(
                "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <option value="">Unassigned</option>
              {state.members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="flex gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={cn(
                "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Target date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className={cn(
                "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            />
          </div>
        </div>

        {/* Color swatches */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Color</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  "h-5 w-5 rounded-full transition-transform hover:scale-110",
                  color === c && "ring-2 ring-ring ring-offset-1 ring-offset-popover",
                )}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent/90"
          >
            {isEdit ? "Save" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

