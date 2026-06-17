import { useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLookups, useStore } from "@/store";
import { Button } from "@/components/ui/Button";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { relativeTime, absoluteTime } from "@/lib/time";
import type { Activity, Comment, Issue, Member } from "@/types";
import { describeActivity } from "./activity";

type TimelineEntry =
  | { kind: "comment"; at: string; comment: Comment }
  | { kind: "activity"; at: string; activity: Activity };

function buildTimeline(issue: Issue): TimelineEntry[] {
  // Comments carry their own surface; activity "comment" entries are redundant.
  const activityEntries: TimelineEntry[] = issue.activity
    .filter((a) => a.kind !== "comment")
    .map((activity) => ({ kind: "activity", at: activity.createdAt, activity }));
  const commentEntries: TimelineEntry[] = issue.comments.map((comment) => ({
    kind: "comment",
    at: comment.createdAt,
    comment,
  }));
  return [...activityEntries, ...commentEntries].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );
}

function MemberAvatar({ member }: { member: Member | undefined }) {
  if (!member) {
    return <span className="h-6 w-6 shrink-0 rounded-full bg-muted" />;
  }
  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
      style={{ backgroundColor: member.avatarColor }}
      title={member.name}
    >
      {member.initials}
    </span>
  );
}

export function ActivityFeed({ issue }: { issue: Issue }) {
  const { state } = useStore();
  const { membersById, statesById, projectsById } = useLookups();
  const timeline = useMemo(() => buildTimeline(issue), [issue]);
  const activityLookups = useMemo(
    () => ({
      statesById,
      projectsById,
      members: state.members,
      cycles: state.cycles,
    }),
    [statesById, projectsById, state.members, state.cycles],
  );

  return (
    <div className="flex flex-col gap-4">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        Activity
      </h2>

      {timeline.length === 0 ? (
        <p className="text-xs text-muted-foreground">No activity yet.</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {timeline.map((entry) =>
            entry.kind === "comment" ? (
              <CommentItem
                key={entry.comment.id}
                comment={entry.comment}
                author={membersById.get(entry.comment.authorId)}
              />
            ) : (
              <ActivityItem
                key={entry.activity.id}
                activity={entry.activity}
                author={membersById.get(entry.activity.authorId)}
                description={describeActivity(entry.activity, activityLookups)}
              />
            ),
          )}
        </ol>
      )}

      <CommentComposer issueId={issue.id} />
    </div>
  );
}

function ActivityItem({
  activity,
  author,
  description,
}: {
  activity: Activity;
  author: Member | undefined;
  description: string;
}) {
  return (
    <li className="flex items-center gap-2.5 text-xs text-muted-foreground">
      <MemberAvatar member={author} />
      <span>
        <span className="font-medium text-foreground">
          {author?.name ?? "Someone"}
        </span>{" "}
        {description}
        <span title={absoluteTime(activity.createdAt)}>
          {" · "}
          {relativeTime(activity.createdAt)}
        </span>
      </span>
    </li>
  );
}

function CommentItem({
  comment,
  author,
}: {
  comment: Comment;
  author: Member | undefined;
}) {
  return (
    <li className="flex gap-2.5">
      <MemberAvatar member={author} />
      <div className="min-w-0 flex-1 rounded-md border border-border bg-card px-3 py-2">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-foreground">
            {author?.name ?? "Someone"}
          </span>
          <span
            className="text-xs text-muted-foreground"
            title={absoluteTime(comment.createdAt)}
          >
            {relativeTime(comment.createdAt)}
          </span>
        </div>
        <div
          className="prose-editor mt-1 text-sm text-foreground"
          dangerouslySetInnerHTML={{ __html: comment.body }}
        />
      </div>
    </li>
  );
}

function isEmptyHtml(html: string): boolean {
  return html.replace(/<[^>]*>/g, "").trim().length === 0;
}

function CommentComposer({ issueId }: { issueId: string }) {
  const { addComment } = useStore();
  const [draft, setDraft] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const empty = isEmptyHtml(draft);

  const submit = () => {
    if (empty) return;
    addComment(issueId, draft);
    setDraft("");
    setResetKey((k) => k + 1);
  };

  return (
    <div className="flex flex-col gap-2">
      <RichTextEditor
        key={resetKey}
        value=""
        onChange={setDraft}
        placeholder="Leave a comment…"
        minHeight="3.5rem"
      />
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="sm"
          disabled={empty}
          onClick={submit}
          className={cn(empty && "cursor-not-allowed")}
        >
          Comment
        </Button>
      </div>
    </div>
  );
}

