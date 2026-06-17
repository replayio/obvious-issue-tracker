import { useContext } from "react";
import {
  IssueDialogContext,
  type IssueDialogContextValue,
} from "./dialogContext";

export function useIssueDialog(): IssueDialogContextValue {
  const ctx = useContext(IssueDialogContext);
  if (!ctx) {
    throw new Error("useIssueDialog must be used within an IssueDialogProvider");
  }
  return ctx;
}

