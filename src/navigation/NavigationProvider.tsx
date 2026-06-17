import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  NavigationContext,
  isViewId,
  type NavigationContextValue,
  type ViewId,
} from "./context";

const DEFAULT_VIEW: ViewId = "my-issues";

function viewFromHash(): ViewId {
  const raw = window.location.hash.replace(/^#\/?/, "");
  return isViewId(raw) ? raw : DEFAULT_VIEW;
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewId>(viewFromHash);

  useEffect(() => {
    const onHashChange = () => setView(viewFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = useCallback((next: ViewId) => {
    window.location.hash = `/${next}`;
    setView(next);
  }, []);

  const value = useMemo<NavigationContextValue>(
    () => ({ view, navigate }),
    [view, navigate],
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

