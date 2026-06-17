import type { Priority } from "@/types";

// Display order used by inline menus and sort-by-priority (urgent first).
export const PRIORITY_ORDER: Priority[] = [
  "urgent",
  "high",
  "medium",
  "low",
  "none",
];

export const PRIORITY_LABEL: Record<Priority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
  none: "No priority",
};

