import { useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigation } from "@/navigation";
import { useStore } from "@/store";
import type { IssuePatch } from "@/store";
import type { Issue } from "@/types";
import { Button } from "@/components/ui/Button";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { EmptyState } from "@/components/views/EmptyState";
import { InlineTitle } from "./InlineTitle";
import { MetadataSidebar } from "./MetadataSidebar";
import { ActivityFeed } from "./ActivityFeed";

export function IssueDetailView({ issueId }: { issueId: string }) {
  const { state } = useStore();
  const { back } = useNavigation();
  const issue = state.issues.find((i) => i.id === issueId);

  if (!issue) {
    return (
      <section className="flex h-full flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-5">
          <BackButton onClick={back} />
        </header>
        <EmptyState
          title="Issue not found"
          description="This issue may have been deleted. Head back to your issues to continue."
        />
        <div className="flex justify-center pb-16">
          <Button variant="secondary" onClick={back}>
            Back to issues
          </Button>
        </div>
      </section>
    );
  }

  // Key by id so switching issues remounts the editor with fresh local state
  // instead of syncing prop -> state in an effect.
  return <IssueDetail key={issue.id} issue={issue} onBack={back} />;
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick} aria-label="Back">
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
}

function IssueDetail({ issue, onBack }: { issue: Issue; onBack: () => void }) {
  const { updateIssue, deleteIssue } = useStore();
  const [description, setDescription] = useState(issue.description);

  const patch = (next: IssuePatch) => updateIssue(issue.id, next);

  const persistDescription = (html: string) => {
    if (html !== issue.description) updateIssue(issue.id, { description: html });
  };

  const remove = () => {
    if (window.confirm(`Delete ${issue.key}? This cannot be undone.`)) {
      deleteIssue(issue.id);
      onBack();
    }
  };

  return (
    <section className="flex h-full flex-col">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-3">
        <div className="flex items-center gap-2">
          <BackButton onClick={onBack} />
          <span className="font-mono text-xs text-muted-foreground">
            {issue.key}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={remove}
          aria-label="Delete issue"
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div
          className={cn(
            "mx-auto flex max-w-5xl flex-col gap-6 px-5 py-6",
            "lg:flex-row lg:gap-8",
          )}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <InlineTitle
              value={issue.title}
              onCommit={(title) => patch({ title })}
            />
            <RichTextEditor
              value={description}
              onChange={setDescription}
              onBlur={persistDescription}
              placeholder="Add a description…"
              minHeight="8rem"
            />
            <div className="border-t border-border pt-5">
              <ActivityFeed issue={issue} />
            </div>
          </div>

          <MetadataSidebar issue={issue} onPatch={patch} />
        </div>
      </div>
    </section>
  );
}

