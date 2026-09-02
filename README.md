# Issue Tracker

A Linear-style issue tracker for project management and team coordination.

## Stack
- Vite + React 19 + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- dnd-kit (drag & drop), Tiptap (rich text), lucide-react (icons), nanoid
- Local-state prototype: seeded mock data + in-browser persistence (localStorage). No backend.

## Scripts
- `npm run dev` — start dev server
- `npm run build` — typecheck + production build to `dist/`
- `npm run lint` — eslint
- `npm run preview` — preview the production build
- `npm run serve` — serve `dist/` with the Replay QA session proxy (server.mjs)

## Path alias
`@/` → `src/` (configured in `vite.config.ts` and `tsconfig`).

## FullStory session capture

Production builds record FullStory sessions with bounded network capture for Replay QA
journey analysis. The browser-side shim (`src/lib/replay-qa-session.ts`, imported first
in `main.tsx`) captures same-origin `fetch` request/response exchanges, uploads them
through a same-origin proxy, and replays startup GET/HEAD responses through FullStory's
observer without a second backend request. Request and response bodies over 1 MB are
recorded as `null`, the total in-memory capture is capped at 8 MB, and the application
still receives every response normally.

### Environment variables

| Variable | Where it lives | Committed? | Purpose |
|---|---|---|---|
| `VITE_FULLSTORY_ORG_ID` | Build-time (browser) | Yes — `.env.production` (org ids are public page-source values) | FullStory org to record into (`o-250JSR-na1`). When unset — e.g. dev builds — session capture is a complete no-op: no fetch wrapping, no network, no SDK. |
| `REPLAY_QA_SESSION_TOKEN` | Server-only (runtime) | **Never** | Registration token read by `server.mjs` from the environment and sent to Replay QA with each session registration. |

### Running

```bash
npm run build
REPLAY_QA_SESSION_TOKEN=<token> npm run serve   # serves dist/ on PORT || 8080
```

`server.mjs` is a zero-dependency `node:http` server: it serves `dist/` statically with
an SPA fallback and exposes `POST /api/replay-qa-session`, which forwards the capture to
`https://qa.replay.io/api/project-session/register` with the bearer token and returns
the upstream status and JSON body. Use it in place of a plain static file server at
deploy time so the same-origin route exists.

Registered sessions land in the Replay QA project's **User Sessions** tab; journeys
created there use the embedded network capture automatically.
