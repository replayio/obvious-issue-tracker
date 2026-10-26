// The SPA shell is served at every document path (routing is hash-based), so
// a page's canonical URL is fixed per document load: the production origin
// plus the document path. The origin is hardcoded rather than derived from
// location so scheme/host variants (http/https, www/apex, deploy previews)
// consolidate onto one production URL instead of each canonicalizing to
// itself (bug-mvpozf0w-ilgs).
const CANONICAL_ORIGIN = "https://obvious-issue-tracker-github.netlify.app";

// Canonical form of a document path: lowercase, no trailing slash (except the
// root), and no query or hash, so tracking-parameter, case, and
// trailing-slash variants collapse onto a single URL.
export function canonicalHref(pathname: string): string {
  const path = pathname.toLowerCase().replace(/\/+$/, "");
  return `${CANONICAL_ORIGIN}${path === "" ? "/" : path}`;
}

// Idempotently point the document's canonical link at the given path. Safe to
// call multiple times; the path is constant for the session because routing
// never rewrites the document path.
export function setCanonicalHref(pathname: string): void {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = canonicalHref(pathname);
}
