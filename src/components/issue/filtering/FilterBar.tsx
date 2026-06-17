import { useMemo } from "react";
import { ArrowUpDown, Group, ListFilter, X } from "lucide-react";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";
import { PriorityIcon, StateIcon } from "@/components/issue/meta";
import { PRIORITY_LABEL, PRIORITY_ORDER } from "@/components/issue/priority";
import { FacetMenu, type FacetOption } from "./FacetMenu";
import { SelectMenu } from "./SelectMenu";
import { useIssueView } from "./useIssueView";
import { ISSUE_PRESETS } from "./presets";
import {
  GROUP_LABELS,
  SORT_LABELS,
  UNASSIGNED,
  countActiveFilters,
  type GroupKey,
  type IssueFilters,
  type SortKey,
} from "./types";

const NO_PROJECT = "";
const NO_CYCLE = "";

const SORT_OPTIONS = (Object.keys(SORT_LABELS) as SortKey[]).map((value) => ({
  value,
  label: SORT_LABELS[value],
}));

const GROUP_OPTIONS = (Object.keys(GROUP_LABELS) as GroupKey[]).map((value) => ({
  value,
  label: GROUP_LABELS[value],
}));

// Small colored swatch reused for label / project / cycle facet options.
function Swatch({ color }: { color: string }) {
  return (
    <span
      className="h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

// Filter / sort / group toolbar for the Issues surface. Reads and writes the
// shared IssueView settings, so both the list and board react instantly. Facet
// options are derived from the live store.
export function FilterBar() {
  const { state } = useStore();
  const { settings, setFilters, setSort, setGroup, resetFilters, applyPreset } =
    useIssueView();
  const { filters } = settings;
  const activeCount = countActiveFilters(filters);

  const options = useMemo(() => {
    const ordered = [...state.states].sort((a, b) => a.order - b.order);
    return {
      states: ordered.map<FacetOption>((s) => ({
        value: s.id,
        label: s.name,
        icon: <StateIcon state={s} />,
      })),
      priorities: PRIORITY_ORDER.map<FacetOption>((p) => ({
        value: p,
        label: PRIORITY_LABEL[p],
        icon: <PriorityIcon priority={p} />,
      })),
      assignees: [
        { value: UNASSIGNED, label: "Unassigned" } satisfies FacetOption,
        ...state.members.map<FacetOption>((m) => ({
          value: m.id,
          label: m.name,
          icon: <Swatch color={m.avatarColor} />,
        })),
      ],
      labels: state.labels.map<FacetOption>((l) => ({
        value: l.id,
        label: l.name,
        icon: <Swatch color={l.color} />,
      })),
      projects: [
        { value: NO_PROJECT, label: "No project" } satisfies FacetOption,
        ...state.projects.map<FacetOption>((p) => ({
          value: p.id,
          label: p.name,
          icon: <Swatch color={p.color} />,
        })),
      ],
      cycles: [
        { value: NO_CYCLE, label: "No cycle" } satisfies FacetOption,
        ...state.cycles.map<FacetOption>((c) => ({
          value: c.id,
          label: c.name,
        })),
      ],
    };
  }, [state.states, state.members, state.labels, state.projects, state.cycles]);

  // Toggles a value in/out of one filter facet without touching the others.
  const toggle = <K extends keyof IssueFilters>(facet: K, value: string) =>
    setFilters((prev) => {
      const current = prev[facet] as string[];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [facet]: next };
    });

  const clear = <K extends keyof IssueFilters>(facet: K) =>
    setFilters((prev) => ({ ...prev, [facet]: [] }));

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-2">
      <div className="flex items-center gap-1">
        {ISSUE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => applyPreset(preset.build(state))}
            className={cn(
              "rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors",
              "hover:bg-muted hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <span className="h-4 w-px bg-border" aria-hidden />

      <ListFilter className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      <FacetMenu
        label="Status"
        options={options.states}
        selected={filters.stateIds}
        onToggle={(v) => toggle("stateIds", v)}
        onClear={() => clear("stateIds")}
      />
      <FacetMenu
        label="Priority"
        options={options.priorities}
        selected={filters.priorities}
        onToggle={(v) => toggle("priorities", v)}
        onClear={() => clear("priorities")}
      />
      <FacetMenu
        label="Assignee"
        options={options.assignees}
        selected={filters.assigneeIds}
        onToggle={(v) => toggle("assigneeIds", v)}
        onClear={() => clear("assigneeIds")}
      />
      <FacetMenu
        label="Label"
        options={options.labels}
        selected={filters.labelIds}
        onToggle={(v) => toggle("labelIds", v)}
        onClear={() => clear("labelIds")}
      />
      <FacetMenu
        label="Project"
        options={options.projects}
        selected={filters.projectIds}
        onToggle={(v) => toggle("projectIds", v)}
        onClear={() => clear("projectIds")}
      />
      <FacetMenu
        label="Cycle"
        options={options.cycles}
        selected={filters.cycleIds}
        onToggle={(v) => toggle("cycleIds", v)}
        onClear={() => clear("cycleIds")}
      />

      {activeCount > 0 && (
        <button
          type="button"
          onClick={resetFilters}
          className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      )}

      <div className="ml-auto flex items-center gap-2">
        <SelectMenu
          label="Group"
          icon={<Group className="h-3.5 w-3.5" />}
          options={GROUP_OPTIONS}
          value={settings.group}
          onChange={setGroup}
        />
        <SelectMenu
          label="Sort"
          icon={<ArrowUpDown className="h-3.5 w-3.5" />}
          options={SORT_OPTIONS}
          value={settings.sort}
          onChange={setSort}
        />
      </div>
    </div>
  );
}

