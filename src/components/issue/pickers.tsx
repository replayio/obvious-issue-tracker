import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Popover } from "@/components/ui/Popover";
import { useLookups, useStore } from "@/store";
import { PriorityIcon, StateIcon } from "./meta";
import { PRIORITY_LABEL, PRIORITY_ORDER } from "./priority";
import type { ID, Priority } from "@/types";

// Shared trigger + option-row primitives so every picker looks identical.

interface FieldTriggerProps {
  open: boolean;
  toggle: () => void;
  triggerId: string;
  children: ReactNode;
}

function FieldTrigger({ open, toggle, triggerId, children }: FieldTriggerProps) {
  return (
    <button
      id={triggerId}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={toggle}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
        "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      {children}
    </button>
  );
}

interface OptionRowProps {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}

function OptionRow({ selected, onClick, children }: OptionRowProps) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors",
        "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2">{children}</span>
      <Check
        className={cn(
          "h-3.5 w-3.5 shrink-0 text-accent",
          selected ? "opacity-100" : "opacity-0",
        )}
      />
    </button>
  );
}

function Dot({ color, ring }: { color: string; ring?: boolean }) {
  return (
    <span
      className={cn("h-2.5 w-2.5 shrink-0 rounded-full", ring && "border")}
      style={ring ? { borderColor: color } : { backgroundColor: color }}
    />
  );
}

function Avatar({
  initials,
  color,
}: {
  initials: string;
  color: string;
}) {
  return (
    <span
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {initials}
    </span>
  );
}

// ---- State ------------------------------------------------------------------

export function StatePicker({
  value,
  onChange,
}: {
  value: ID;
  onChange: (stateId: ID) => void;
}) {
  const { state } = useStore();
  const ordered = [...state.states].sort((a, b) => a.order - b.order);
  const current = ordered.find((s) => s.id === value) ?? ordered[0];

  return (
    <Popover
      trigger={(p) => (
        <FieldTrigger {...p}>
          <StateIcon state={current} />
          <span className="truncate">{current.name}</span>
        </FieldTrigger>
      )}
    >
      {(close) =>
        ordered.map((s) => (
          <OptionRow
            key={s.id}
            selected={s.id === value}
            onClick={() => {
              onChange(s.id);
              close();
            }}
          >
            <StateIcon state={s} />
            <span className="truncate">{s.name}</span>
          </OptionRow>
        ))
      }
    </Popover>
  );
}

// ---- Priority ---------------------------------------------------------------

export function PriorityPicker({
  value,
  onChange,
}: {
  value: Priority;
  onChange: (priority: Priority) => void;
}) {
  return (
    <Popover
      trigger={(p) => (
        <FieldTrigger {...p}>
          <PriorityIcon priority={value} />
          <span className="truncate">{PRIORITY_LABEL[value]}</span>
        </FieldTrigger>
      )}
    >
      {(close) =>
        PRIORITY_ORDER.map((priority) => (
          <OptionRow
            key={priority}
            selected={priority === value}
            onClick={() => {
              onChange(priority);
              close();
            }}
          >
            <PriorityIcon priority={priority} />
            <span className="truncate">{PRIORITY_LABEL[priority]}</span>
          </OptionRow>
        ))
      }
    </Popover>
  );
}

// ---- Assignee ---------------------------------------------------------------

export function AssigneePicker({
  value,
  onChange,
}: {
  value: ID | undefined;
  onChange: (assigneeId: ID | undefined) => void;
}) {
  const { state } = useStore();
  const { membersById } = useLookups();
  const current = value ? membersById.get(value) : undefined;

  return (
    <Popover
      trigger={(p) => (
        <FieldTrigger {...p}>
          {current ? (
            <Avatar initials={current.initials} color={current.avatarColor} />
          ) : (
            <span className="h-5 w-5 shrink-0 rounded-full border border-dashed border-border" />
          )}
          <span className="truncate">{current?.name ?? "Unassigned"}</span>
        </FieldTrigger>
      )}
    >
      {(close) => (
        <>
          <OptionRow
            selected={!value}
            onClick={() => {
              onChange(undefined);
              close();
            }}
          >
            <span className="h-5 w-5 shrink-0 rounded-full border border-dashed border-border" />
            <span className="truncate">Unassigned</span>
          </OptionRow>
          {state.members.map((m) => (
            <OptionRow
              key={m.id}
              selected={m.id === value}
              onClick={() => {
                onChange(m.id);
                close();
              }}
            >
              <Avatar initials={m.initials} color={m.avatarColor} />
              <span className="truncate">{m.name}</span>
            </OptionRow>
          ))}
        </>
      )}
    </Popover>
  );
}

// ---- Labels (multi-select) --------------------------------------------------

export function LabelPicker({
  value,
  onChange,
}: {
  value: ID[];
  onChange: (labelIds: ID[]) => void;
}) {
  const { state } = useStore();
  const { labelsById } = useLookups();
  const selected = value
    .map((id) => labelsById.get(id))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));

  const toggle = (id: ID) => {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id],
    );
  };

  return (
    <Popover
      trigger={(p) => (
        <FieldTrigger {...p}>
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">No labels</span>
            ) : (
              selected.map((label) => (
                <span
                  key={label.id}
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: `${label.color}22`,
                    color: label.color,
                  }}
                >
                  {label.name}
                </span>
              ))
            )}
          </span>
        </FieldTrigger>
      )}
    >
      {() =>
        state.labels.map((label) => (
          <OptionRow
            key={label.id}
            selected={value.includes(label.id)}
            onClick={() => toggle(label.id)}
          >
            <Dot color={label.color} />
            <span className="truncate">{label.name}</span>
          </OptionRow>
        ))
      }
    </Popover>
  );
}

// ---- Project ----------------------------------------------------------------

export function ProjectPicker({
  value,
  onChange,
}: {
  value: ID | undefined;
  onChange: (projectId: ID | undefined) => void;
}) {
  const { state } = useStore();
  const current = value
    ? state.projects.find((p) => p.id === value)
    : undefined;

  return (
    <Popover
      trigger={(p) => (
        <FieldTrigger {...p}>
          {current ? (
            <Dot color={current.color} />
          ) : (
            <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-dashed border-border" />
          )}
          <span className="truncate">{current?.name ?? "No project"}</span>
        </FieldTrigger>
      )}
    >
      {(close) => (
        <>
          <OptionRow
            selected={!value}
            onClick={() => {
              onChange(undefined);
              close();
            }}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-dashed border-border" />
            <span className="truncate">No project</span>
          </OptionRow>
          {state.projects.map((project) => (
            <OptionRow
              key={project.id}
              selected={project.id === value}
              onClick={() => {
                onChange(project.id);
                close();
              }}
            >
              <Dot color={project.color} />
              <span className="truncate">{project.name}</span>
            </OptionRow>
          ))}
        </>
      )}
    </Popover>
  );
}

// ---- Cycle ------------------------------------------------------------------

export function CyclePicker({
  value,
  onChange,
}: {
  value: ID | undefined;
  onChange: (cycleId: ID | undefined) => void;
}) {
  const { state } = useStore();
  const ordered = [...state.cycles].sort((a, b) => b.number - a.number);
  const current = value ? ordered.find((c) => c.id === value) : undefined;

  return (
    <Popover
      trigger={(p) => (
        <FieldTrigger {...p}>
          <span
            className={cn(
              "h-2.5 w-2.5 shrink-0 rounded-sm",
              current ? "bg-accent" : "border border-dashed border-border",
            )}
          />
          <span className="truncate">{current?.name ?? "No cycle"}</span>
        </FieldTrigger>
      )}
    >
      {(close) => (
        <>
          <OptionRow
            selected={!value}
            onClick={() => {
              onChange(undefined);
              close();
            }}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm border border-dashed border-border" />
            <span className="truncate">No cycle</span>
          </OptionRow>
          {ordered.map((cycle) => (
            <OptionRow
              key={cycle.id}
              selected={cycle.id === value}
              onClick={() => {
                onChange(cycle.id);
                close();
              }}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-accent" />
              <span className="truncate">{cycle.name}</span>
            </OptionRow>
          ))}
        </>
      )}
    </Popover>
  );
}

