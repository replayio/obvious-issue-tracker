import { nanoid } from "nanoid";
import type {
  Activity,
  AppState,
  Comment,
  Cycle,
  Issue,
  Label,
  Member,
  Priority,
  Project,
  WorkflowState,
} from "@/types";

// Deterministic-ish timestamp helpers so seed data looks realistic.
const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 5, 17); // 2026-06-17

function daysAgo(n: number): string {
  return new Date(NOW - n * DAY).toISOString();
}

function daysAhead(n: number): string {
  return new Date(NOW + n * DAY).toISOString();
}

export const members: Member[] = [
  { id: "usr_brian", name: "Brian Hackett", email: "brian@replay.io", initials: "BH", avatarColor: "#6366f1" },
  { id: "usr_jason", name: "Jason Laster", email: "jason@replay.io", initials: "JL", avatarColor: "#ec4899" },
  { id: "usr_mira", name: "Mira Chen", email: "mira@replay.io", initials: "MC", avatarColor: "#14b8a6" },
  { id: "usr_dev", name: "Devon Park", email: "devon@replay.io", initials: "DP", avatarColor: "#f59e0b" },
  { id: "usr_sam", name: "Sam Rivera", email: "sam@replay.io", initials: "SR", avatarColor: "#8b5cf6" },
];

export const labels: Label[] = [
  { id: "lbl_bug", name: "Bug", color: "#eb5757" },
  { id: "lbl_feature", name: "Feature", color: "#5e6ad2" },
  { id: "lbl_improvement", name: "Improvement", color: "#26b5ce" },
  { id: "lbl_design", name: "Design", color: "#bb87fc" },
  { id: "lbl_perf", name: "Performance", color: "#f2c94c" },
  { id: "lbl_docs", name: "Documentation", color: "#4cb782" },
];

export const states: WorkflowState[] = [
  { id: "st_backlog", name: "Backlog", category: "backlog", color: "#bec2c8", order: 0 },
  { id: "st_todo", name: "Todo", category: "unstarted", color: "#e2e2e2", order: 1 },
  { id: "st_progress", name: "In Progress", category: "started", color: "#f2c94c", order: 2 },
  { id: "st_review", name: "In Review", category: "started", color: "#5e6ad2", order: 3 },
  { id: "st_done", name: "Done", category: "completed", color: "#5e6ad2", order: 4 },
  { id: "st_canceled", name: "Canceled", category: "canceled", color: "#95a2b3", order: 5 },
];

export const projects: Project[] = [
  {
    id: "prj_runtime",
    name: "Recording Runtime",
    key: "RT",
    description: "Deterministic recording and replay engine improvements.",
    status: "in_progress",
    leadId: "usr_brian",
    startDate: daysAgo(40),
    targetDate: daysAhead(20),
    color: "#6366f1",
    icon: "cpu",
  },
  {
    id: "prj_devtools",
    name: "DevTools UI",
    key: "DT",
    description: "The in-browser debugging surface and timeline.",
    status: "planned",
    leadId: "usr_jason",
    startDate: daysAgo(10),
    targetDate: daysAhead(45),
    color: "#ec4899",
    icon: "layout",
  },
  {
    id: "prj_cloud",
    name: "Cloud Platform",
    key: "CP",
    description: "Upload, processing, and storage of recordings.",
    status: "backlog",
    leadId: "usr_mira",
    targetDate: daysAhead(70),
    color: "#14b8a6",
    icon: "cloud",
  },
];

export const cycles: Cycle[] = [
  { id: "cyc_11", name: "Cycle 11", number: 11, startDate: daysAgo(28), endDate: daysAgo(14) },
  { id: "cyc_12", name: "Cycle 12", number: 12, startDate: daysAgo(14), endDate: daysAhead(0) },
  { id: "cyc_13", name: "Cycle 13", number: 13, startDate: daysAhead(0), endDate: daysAhead(14) },
];


// ---- Issues -----------------------------------------------------------------

const priorities: Priority[] = ["none", "urgent", "high", "medium", "low"];

const titlePool: { title: string; labels: string[] }[] = [
  { title: "Timeline scrubber jumps to wrong frame on fast seek", labels: ["lbl_bug"] },
  { title: "Add print-statement logpoints to the source viewer", labels: ["lbl_feature"] },
  { title: "Reduce recording upload size with delta compression", labels: ["lbl_perf", "lbl_improvement"] },
  { title: "Console message grouping collapses unrelated logs", labels: ["lbl_bug"] },
  { title: "Dark theme contrast fails WCAG on secondary text", labels: ["lbl_design", "lbl_bug"] },
  { title: "Support stepping over async/await boundaries", labels: ["lbl_feature"] },
  { title: "Network panel: filter requests by initiator", labels: ["lbl_feature", "lbl_improvement"] },
  { title: "Memory leak when reopening the same recording", labels: ["lbl_bug", "lbl_perf"] },
  { title: "Document the recording protocol message format", labels: ["lbl_docs"] },
  { title: "Flaky test: replay-session reconnect under load", labels: ["lbl_bug"] },
  { title: "Keyboard shortcuts for frame navigation", labels: ["lbl_feature"] },
  { title: "Source map resolution misses inlined sources", labels: ["lbl_bug"] },
  { title: "Speed up initial paint of the source tree", labels: ["lbl_perf"] },
  { title: "Comment threads should support markdown", labels: ["lbl_feature", "lbl_improvement"] },
  { title: "Onboarding tour for first-time recorders", labels: ["lbl_design", "lbl_feature"] },
  { title: "Crash uploading recordings over 2GB", labels: ["lbl_bug"] },
  { title: "Add team-level usage dashboard", labels: ["lbl_feature"] },
  { title: "Breakpoint pane loses state on reload", labels: ["lbl_bug"] },
  { title: "Improve hover tooltips on the call tree", labels: ["lbl_improvement", "lbl_design"] },
  { title: "Investigate slow protocol response on large recordings", labels: ["lbl_perf"] },
  { title: "Add CLI flag to record headless Chromium", labels: ["lbl_feature"] },
  { title: "Search results don't highlight matched terms", labels: ["lbl_bug", "lbl_improvement"] },
  { title: "Write migration guide for protocol v2", labels: ["lbl_docs"] },
  { title: "Cycle burndown chart shows stale data", labels: ["lbl_bug"] },
  { title: "Allow reordering favorite recordings", labels: ["lbl_improvement"] },
  { title: "Token refresh fails silently on expired session", labels: ["lbl_bug"] },
  { title: "Prefetch adjacent frames while paused", labels: ["lbl_perf", "lbl_feature"] },
  { title: "Design empty states for the issues list", labels: ["lbl_design"] },
  { title: "Export recording metadata as JSON", labels: ["lbl_feature"] },
  { title: "Fix off-by-one in the frame counter", labels: ["lbl_bug"] },
  { title: "Add retry with backoff to upload pipeline", labels: ["lbl_improvement"] },
  { title: "Sidebar collapse state should persist", labels: ["lbl_improvement"] },
  { title: "Profile and trim the cold-start bundle", labels: ["lbl_perf"] },
  { title: "Support light theme for embedded viewer", labels: ["lbl_feature", "lbl_design"] },
  { title: "Audit logs missing for project changes", labels: ["lbl_bug"] },
  { title: "Inline AI explanation of stack frames", labels: ["lbl_feature"] },
  { title: "Tooltip overflows viewport near screen edge", labels: ["lbl_bug", "lbl_design"] },
  { title: "Batch protocol requests during stepping", labels: ["lbl_perf"] },
  { title: "Document keyboard-shortcut reference", labels: ["lbl_docs"] },
  { title: "Allow assigning multiple labels at once", labels: ["lbl_improvement", "lbl_feature"] },
];

const stateCycle = ["st_backlog", "st_todo", "st_progress", "st_review", "st_done", "st_canceled"];
const projectPool = [projects[0], projects[1], projects[2]];
const cyclePool: (string | undefined)[] = ["cyc_11", "cyc_12", "cyc_13", undefined];

const sampleComments = [
  "Took a first pass — pushing a branch shortly.",
  "Reproduced locally, looks like a race in the reconnect path.",
  "Can we scope this to the current cycle?",
  "Left a few notes on the design in Figma.",
  "This is blocked on the protocol v2 work.",
  "Nice, the numbers look much better after the change.",
];

function buildIssues(): Issue[] {
  return titlePool.map((seed, i) => {
    const project = projectPool[i % projectPool.length];
    const stateId = stateCycle[i % stateCycle.length];
    const priority = priorities[(i + 1) % priorities.length];
    const assigneeId = members[i % members.length].id;
    const cycleId = cyclePool[i % cyclePool.length];
    const ageDays = 2 + ((i * 3) % 40);
    const createdAt = daysAgo(ageDays);
    const updatedAt = daysAgo(Math.max(0, ageDays - (i % 5)));
    const key = `${project.key}-${100 + i}`;

    const activity: Activity[] = [
      { id: nanoid(), kind: "created", authorId: assigneeId, createdAt },
    ];

    const comments: Comment[] = [];
    if (i % 3 === 0) {
      const c = sampleComments[i % sampleComments.length];
      const author = members[(i + 2) % members.length].id;
      const commentAge = Math.max(0, ageDays - 1);
      comments.push({ id: nanoid(), authorId: author, body: c, createdAt: daysAgo(commentAge) });
      activity.push({ id: nanoid(), kind: "comment", authorId: author, createdAt: daysAgo(commentAge) });
    }

    return {
      id: nanoid(),
      key,
      title: seed.title,
      description: `<p>${seed.title}.</p>`,
      stateId,
      priority,
      assigneeId,
      labelIds: seed.labels,
      projectId: project.id,
      cycleId,
      createdAt,
      updatedAt,
      comments,
      activity,
      order: i,
    } satisfies Issue;
  });
}

export function buildSeedState(): AppState {
  return {
    issues: buildIssues(),
    projects,
    cycles,
    labels,
    members,
    states,
    currentUserId: "usr_brian",
  };
}

