import { useState } from "react";
import type { Cycle } from "@/types";
import { useStore } from "@/store";
import { Modal } from "@/components/Modal";
import { cn } from "@/lib/utils";

interface CycleFormProps {
  cycle?: Cycle;
  onClose: () => void;
}

export function CycleForm({ cycle, onClose }: CycleFormProps) {
  const { state, createCycle, updateCycle } = useStore();

  const nextNumber = state.cycles.length
    ? Math.max(...state.cycles.map((c) => c.number)) + 1
    : 1;

  const [name, setName] = useState(cycle?.name ?? `Cycle ${nextNumber}`);
  const [number, setNumber] = useState<number>(cycle?.number ?? nextNumber);
  const [startDate, setStartDate] = useState(
    cycle?.startDate ? cycle.startDate.slice(0, 10) : "",
  );
  const [endDate, setEndDate] = useState(
    cycle?.endDate ? cycle.endDate.slice(0, 10) : "",
  );

  const isEdit = cycle !== undefined;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || !startDate || !endDate) return;

    const payload: Omit<Cycle, "id"> = {
      name: trimmedName,
      number,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
    };

    if (isEdit) {
      updateCycle(cycle.id, payload);
    } else {
      createCycle(payload);
    }
    onClose();
  }

  return (
    <Modal title={isEdit ? `Edit ${cycle.name}` : "New Cycle"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Name + Number row */}
        <div className="flex gap-3">
          <div className="flex-1 space-y-1">
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
              placeholder="Cycle 13"
              required
              autoFocus
            />
          </div>
          <div className="w-20 space-y-1">
            <label className="text-xs font-medium text-muted-foreground">#</label>
            <input
              type="number"
              min={1}
              value={number}
              onChange={(e) => setNumber(Number(e.target.value))}
              className={cn(
                "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
              required
            />
          </div>
        </div>

        {/* Dates */}
        <div className="flex gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Start date <span className="text-destructive">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={cn(
                "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
              required
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              End date <span className="text-destructive">*</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={cn(
                "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
              required
            />
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

