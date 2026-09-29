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

## Path alias
`@/` → `src/` (configured in `vite.config.ts` and `tsconfig`).

## Self Healing
Production builds initialize Replay Self Healing session capture (`@replayio/self-healing-capture`)
in `src/main.tsx` — dev builds stay capture-free. Captured sessions POST to
`/api/self-healing/session`, a Netlify Function (`netlify/functions/self-healing-session.mts`)
that forwards them verbatim to the Self Healing API. Two site environment
variables are required (names only — values never live in the repo or bundle):

- `SELF_HEALING_URL` — Self Healing API base URL
- `SELF_HEALING_API_KEY` — Self Healing account API key

