# Cartpanda Funnel Builder

Drag-and-drop upsell funnel builder (visual only). No login or backend.

---

## Submit checklist

| Required | Action |
|----------|--------|
| **Public demo URL** | Deploy (see below) → add URL here |
| **GitHub repo** | Push with meaningful commit history |
| **README** | This file |
| **Dashboard answer** | [docs/dashboard-architecture.md](docs/dashboard-architecture.md) |

---

## Run locally

```bash
npm install && npm run dev
```

Open **http://localhost:5173**. No env vars.

**Build:** `npm run build` → `npm run preview`

---

## Deploy (public URL)

- **Vercel** — Connect repo (Vite auto-detected) or `npx vercel`
- **Netlify / Cloudflare Pages** — Build: `npm run build`, output: `dist`

---

## Architecture (short)

- **React Flow** — Canvas, pan/zoom, grid, connections, minimap. Tradeoff: bundle size.
- **useFunnelStore** — One hook: nodes, edges, undo/redo, localStorage. No Redux.
- **Tailwind + theme.ts** — Tokens for consistency.
- **validation.ts** — Funnel rules as pure functions; ValidationPanel shows issues.
- **Persistence** — Auto-save to localStorage; Export/Import JSON.

**Tradeoffs:** Undo = in-memory history (could use library later). Snap to grid = on. Click-to-place for a11y = not yet (drag is pointer-only). Mobile = works; palette could be a bottom sheet.

---

## Accessibility

- Semantic HTML + `role="toolbar"`, `role="application"`, skip link to `#main-canvas`.
- Keyboard: Tab, Enter/Space, Ctrl+Z / Ctrl+Shift+Z, Backspace/Delete for remove.
- Focus rings, `aria-label` on controls, WCAG AA contrast, `prefers-reduced-motion`.
- Limit: Drag-from-palette and connection handles are pointer-driven.

---

## Requirements (Part 1)

| | Status |
|---|--------|
| **A) Canvas** | Pan, zoom, grid, draggable nodes |
| **B) Node types** | Sales Page, Order Page, Upsell, Downsell, Thank You — title, icon, thumbnail placeholder, button label |
| **C) Add nodes** | Sidebar palette → drag to canvas; mobile: Add page + tap |
| **D) Connections** | Drag ● (out) to ○ (in); arrows; invalid → toast |
| **E) Rules** | Thank You = no out; Sales Page = warn if not 1 out; Upsell/Downsell auto-increment |
| **F) Persist** | localStorage, Export/Import JSON |
| **Bonus** | Zoom, snap grid, minimap, undo/redo, delete, validation panel |

---

## Connections & rules

- **Connect:** Drag from right handle (●) to left handle (○). Invalid (self, duplicate, from Thank You) → amber toast.
- Thank You has no outgoing handle. Sales Page: any links allowed; validation warns if ≠1 outgoing. Orphans and multiple starts → validation panel. One edge per (source, target).

---

## Project layout

```
src/
├── components/   FunnelBuilder, FunnelNode, Sidebar, Toolbar, ValidationPanel, MiniMap
├── hooks/       useFunnelStore
├── types/       index.ts
├── constants/   nodeTemplates.ts
├── utils/       validation.ts, storage.ts
├── theme.ts, App.tsx, main.tsx, index.css
```

**Stack:** React 19, TypeScript, Vite 7, @xyflow/react, Tailwind v4, nanoid.

**Scripts:** `dev` | `build` | `preview` | `lint`

---

## Part 2

Dashboard architecture (scalable front-end, team patterns, WCAG, data/state, performance, DX, testing, release): **[docs/dashboard-architecture.md](docs/dashboard-architecture.md)**

---

MIT — [LICENSE](LICENSE)
