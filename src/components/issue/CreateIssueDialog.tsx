import { useState } from "react";
import { useStore } from "@/store";
import type { CreateIssueInput } from "@/store";
import type { ID, Priority } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import type { CreateIssueDefaults } from "./dialogContext";
import {
  AssigneePicker,
  CyclePicker,
  LabelPicker,
  PriorityPicker,
  ProjectPicker,
  StatePicker,
} from "./pickers";

interface DraftIssue {
  title: string;
  description: string;
  stateId: ID;
  priority: Priority;
  assigneeId: ID | undefined;
  labelIds: ID[];
  projectId: ID | undefined;
  cycleId: ID | undefined;
}

function initialDraft(
  defaultStateId: ID,
  defaults: CreateIssueDefaults,
): DraftIssue {
  return {
    title: "",
    description: "",
    stateId: defaults.stateId ?? defaultStateId,
    priority: "none",
    assigneeId: defaults.assigneeId,
    labelIds: [],
    projectId: defaults.projectId,
    cycleId: defaults.cycleId,
  };
}

export function CreateIssueDialog({
  open,
  defaults,
  onClose,
}: {
  open: boolean;
  defaults: CreateIssueDefaults;
  onClose: () => void;
}) {
  const { state, createIssue } = useStore();
  const defaultStateId =
    [...state.states].sort((a, b) => a.order - b.order)[0]?.id ?? "";
  const [draft, setDraft] = useState<DraftIssue>(() =>
    initialDraft(defaultStateId, defaults),
  );

  const update = <K extends keyof DraftIssue>(key: K, value: DraftIssue[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const canSubmit = draft.title.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    const input: CreateIssueInput = {
      title: draft.title.trim(),
      description: draft.description,
      stateId: draft.stateId,
      priority: draft.priority,
      assigneeId: draft.assigneeId,
      labelIds: draft.labelIds,
      projectId: draft.projectId,
      cycleId: draft.cycleId,
    };
    createIssue(input);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="create-issue-title">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex flex-col"
      >
        <div className="flex flex-col gap-3 px-5 py-4">
          <h2 id="create-issue-title" className="sr-only">
            Create a new issue
          </h2>
          <input
            autoFocus
            value={draft.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Issue title"
            aria-label="Issue title"
            className="w-full bg-transparent text-lg font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <RichTextEditor
            value={draft.description}
            onChange={(html) => update("description", html)}
            placeholder="Add a description…"
            minHeight="5rem"
          />
          <div className="flex flex-wrap items-center gap-1">
            <StatePicker
              value={draft.stateId}
              onChange={(id) => update("stateId", id)}
            />
            <PriorityPicker
              value={draft.priority}
              onChange={(p) => update("priority", p)}
            />
            <AssigneePicker
              value={draft.assigneeId}
              onChange={(id) => update("assigneeId", id)}
            />
            <ProjectPicker
              value={draft.projectId}
              onChange={(id) => update("projectId", id)}
            />
            <CyclePicker
              value={draft.cycleId}
              onChange={(id) => update("cycleId", id)}
            />
            <LabelPicker
              value={draft.labelIds}
              onChange={(ids) => update("labelIds", ids)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!canSubmit}>
            Create issue
          </Button>
        </div>
      </form>
    </Modal>
  );
}

