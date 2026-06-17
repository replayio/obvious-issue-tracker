import { useCallback } from "react";

// Opens an issue's detail surface. The issue-detail PR owns the actual panel /
// route; until it lands this simply writes a `#/issue/:id` hash so the seam is
// stable. Views pass the returned callback to rows/cards as `onOpenIssue`.
export function useOpenIssue(): (id: string) => void {
  return useCallback((id: string) => {
    window.location.hash = `/issue/${id}`;
  }, []);
}

