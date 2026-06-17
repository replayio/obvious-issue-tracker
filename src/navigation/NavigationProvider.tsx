import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ID } from "@/types";
import {
  NavigationContext,
  isViewId,
  type NavigationContextValue,
  type Route,
  type ViewId,
} from "./context";

const DEFAULT_VIEW: ViewId = "my-issues";

function routeFromHash(): Route {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const issueMatch = raw.match(/^issue\/(.+)$/);
  if (issueMatch) return { kind: "issue", issueId: issueMatch[1] };
  return { kind: "view", view: isViewId(raw) ? raw : DEFAULT_VIEW };
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const initialRoute = routeFromHash();
  const [route, setRoute] = useState<Route>(initialRoute);
  // The last sidebar destination, so it stays highlighted while an issue
  // detail route is active. Kept in state (not a ref) so render stays pure.
  const [lastView, setLastView] = useState<ViewId>(
    initialRoute.kind === "view" ? initialRoute.view : DEFAULT_VIEW,
  );

  // The hash is the single source of truth; state syncs from hashchange, which
  // fires for both user navigation and our programmatic hash writes.
  useEffect(() => {
    const onHashChange = () => {
      const next = routeFromHash();
      setRoute(next);
      if (next.kind === "view") setLastView(next.view);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = useCallback((next: ViewId) => {
    window.location.hash = `/${next}`;
  }, []);

  const openIssue = useCallback((issueId: ID) => {
    window.location.hash = `/issue/${issueId}`;
  }, []);

  const back = useCallback(() => {
    window.location.hash = `/${lastView}`;
  }, [lastView]);

  const value = useMemo<NavigationContextValue>(
    () => ({
      route,
      view: route.kind === "view" ? route.view : lastView,
      navigate,
      openIssue,
      back,
    }),
    [route, lastView, navigate, openIssue, back],
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}
