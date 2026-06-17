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
