import type { ReactNode } from "react";
import { useLookups } from "@/store";
import type { Issue } from "@/types";
import { absoluteTime, relativeTime } from "@/lib/time";
import type { IssuePatch } from "@/store";
import {
  AssigneePicker,
  CyclePicker,
  LabelPicker,
  PriorityPicker,
  ProjectPicker,
  StatePicker,
} from "./pickers";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] items-start gap-2 py-1">
      <span className="pt-1.5 text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function MetadataSidebar({
  issue,
  onPatch,
}: {
  issue: Issue;
  onPatch: (patch: IssuePatch) => void;
}) {
  const { membersById } = useLookups();
  const creator = membersById.get(issue.activity[0]?.authorId ?? "");

  return (
    <aside className="flex w-full shrink-0 flex-col gap-1 border-border lg:w-72 lg:border-l lg:pl-5">
      <Field label="Status">
        <StatePicker
          value={issue.stateId}
          onChange={(stateId) => onPatch({ stateId })}
        />
      </Field>
      <Field label="Priority">
        <PriorityPicker
          value={issue.priority}
          onChange={(priority) => onPatch({ priority })}
        />
      </Field>
      <Field label="Assignee">
        <AssigneePicker
          value={issue.assigneeId}
          onChange={(assigneeId) => onPatch({ assigneeId })}
        />
      </Field>
      <Field label="Labels">
        <LabelPicker
          value={issue.labelIds}
          onChange={(labelIds) => onPatch({ labelIds })}
        />
      </Field>
      <Field label="Project">
        <ProjectPicker
          value={issue.projectId}
          onChange={(projectId) => onPatch({ projectId })}
        />
      </Field>
      <Field label="Cycle">
        <CyclePicker
          value={issue.cycleId}
          onChange={(cycleId) => onPatch({ cycleId })}
        />
      </Field>

      <div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        <p>
          {creator ? `Created by ${creator.name}` : "Created"}
          <span title={absoluteTime(issue.createdAt)}>
            {" · "}
            {relativeTime(issue.createdAt)}
          </span>
        </p>
        <p title={absoluteTime(issue.updatedAt)}>
          Updated {relativeTime(issue.updatedAt)}
        </p>
      </div>
    </aside>
  );
}

