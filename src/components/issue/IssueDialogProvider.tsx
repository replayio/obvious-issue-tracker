import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  IssueDialogContext,
  type CreateIssueDefaults,
  type IssueDialogContextValue,
} from "./dialogContext";
import { CreateIssueDialog } from "./CreateIssueDialog";

interface DialogState {
  open: boolean;
  defaults: CreateIssueDefaults;
}

export function IssueDialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    defaults: {},
  });

  const openCreate = useCallback((defaults: CreateIssueDefaults = {}) => {
    setDialog({ open: true, defaults });
  }, []);

  const close = useCallback(
    () => setDialog((d) => ({ ...d, open: false })),
    [],
  );

  const value = useMemo<IssueDialogContextValue>(
    () => ({ openCreate }),
    [openCreate],
  );

  return (
    <IssueDialogContext.Provider value={value}>
      {children}
      {dialog.open && (
        <CreateIssueDialog
          // Remount per open so the draft resets to the provided defaults.
          key={JSON.stringify(dialog.defaults)}
          open={dialog.open}
          defaults={dialog.defaults}
          onClose={close}
        />
      )}
    </IssueDialogContext.Provider>
  );
}

