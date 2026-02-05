# Cartpanda Funnel Builder — Front-end Practical Test

A **drag-and-drop upsell funnel builder** (visual editor only). No login, no backend — just the canvas, palette, and persistence as specified.

---

## What you must submit (required) — Checklist

| Requirement | Status |
|-------------|--------|
| **Public demo URL** (no login) | Deploy to Vercel/Netlify (see [Deploy](#deploy-for-public-url) below), then add the URL here. |
| **GitHub repository** (with commit history) | Push this project to a new repo; keep meaningful commits. |
| **README** (setup + architecture + accessibility) | This file. |
| **Written dashboard answer** | [docs/dashboard-architecture.md](docs/dashboard-architecture.md) |

---

## How to run locally

**Prerequisites:** Node.js 18+, npm (or pnpm/yarn).

```bash
# Clone (or use this folder)
git clone <your-repo-url>
cd cartpanda-funnel-builder

# Install
npm install

# Run
npm run dev
```

Open **http://localhost:5173**. No env vars or login required.

**Production build:**

```bash
npm run build
npm run preview
```

---

## Deploy for public URL

- **Vercel:** Connect the GitHub repo; use default settings (Vite is detected). Or from CLI: `npx vercel`.
- **Netlify:** Connect the repo; build command `npm run build`, publish directory `dist`.
- **Cloudflare Pages:** Build command `npm run build`, output directory `dist`.

After deploy, put the live URL in the “Public demo URL” row above (and in your application).

---

## Main architecture decisions

1. **React Flow (@xyflow/react)** — Canvas, pan/zoom, minimap, connections. Keeps graph logic and edge handling out of our code; TypeScript support and accessibility are good. Tradeoff: extra bundle size for a focused editor.

2. **Single custom hook (`useFunnelStore`)** — All funnel state (nodes, edges, undo/redo, persistence) lives in one place. Uses React Flow’s `useNodesState` / `useEdgesState` and React state. No Redux/Zustand for scope and simplicity. Easy to swap to a global store later if needed.

3. **Tailwind CSS** — Utility-first styling, design tokens in `src/theme.ts`, consistent spacing and colors. Fast to iterate and keep the UI consistent.

4. **Validation as derived state** — Validation runs on current nodes/edges and is shown in a top-right panel (and as ⚠️ on nodes). No separate “validation service”; rules live in `src/utils/validation.ts` and are easy to extend.

5. **Persistence** — Auto-save to `localStorage`; Export/Import JSON for backup and portability. No backend required by the brief.

---

## Tradeoffs / what I’d improve next

- **Undo/redo** — Implemented in the hook with a history stack. For a larger app I’d use a dedicated library (e.g. `use-undo` or command pattern) and possibly persist history.
- **Snap to grid** — Not implemented. Tradeoff: ship MVP first; add later via React Flow options if needed.
- **Click-to-place (accessibility)** — Drag-from-palette is mouse/touch only. I’d add “click palette item, then click on canvas to place” for keyboard and AT users.
- **Mobile** — Layout works; touch drag/drop and small-screen palette could be refined (e.g. bottom sheet for palette).
- **Real backend** — If the product grows, I’d add a small API and sync funnel state there while keeping Export/Import as a fallback.

---

## Accessibility notes

- **Semantic structure:** `<main>`, `<aside>`, `<header>`, `role="toolbar"`, `role="application"` where appropriate; skip link to main canvas.
- **Keyboard:** Tab through toolbar and palette; Enter/Space to activate. Undo/Redo via Ctrl+Z / Ctrl+Shift+Z. Delete/Backspace removes selected nodes/edges.
- **Focus:** Visible focus rings (e.g. `focus:ring-2`); no focus traps.
- **Labels:** `aria-label` on controls (e.g. “Validation”, “Export”, “Incoming connection”, “Outgoing connection”).
- **Contrast:** Text and UI use colors that meet WCAG AA where used.
- **Reduced motion:** `prefers-reduced-motion` respected in global CSS (animations/transitions minimized).
- **Limitations:** Drag-from-palette is pointer-based; canvas pan/zoom and connection handles are best with pointer. Improving this would mean adding click-to-place and possibly more keyboard shortcuts for connection creation.

---

## Requirements coverage (Part 1 — Build)

**MVP:** Canvas (pan, grid, draggable nodes) ✅ · All 5 node types with title, thumbnail, button label ✅ · Palette drag-to-canvas ✅ · Connections with arrows and handles ✅ · Thank You no outgoing; Sales Page one-outgoing warning; auto-increment labels ✅ · localStorage + Export/Import JSON ✅  

**Bonus:** Zoom ✅ · Mini-map ✅ · Undo/redo ✅ · Node/edge deletion ✅ · Validation panel (orphans, rules) ✅  

(Snap to grid not implemented; tradeoff noted above.)

---

## Funnel rules (implemented)

- **Thank You** — No outgoing edges (handle hidden).
- **Sales Page** — Allowed to have any connections; validation **warns** if it doesn’t have exactly one outgoing edge (e.g. to Order Page).
- **Orphan nodes** — Flagged in the validation panel when a node has no connections (and there is more than one node).
- **Upsell / Downsell labels** — Auto-increment (Upsell 1, Upsell 2, …; Downsell 1, …) when adding from the palette.
- **Connections** — One connection per (source, target); no self-loops; Thank You cannot be a source.

---

## Project structure

```
src/
├── components/          # UI
│   ├── FunnelBuilder.tsx
│   ├── FunnelNode.tsx
│   ├── Sidebar.tsx
│   ├── Toolbar.tsx
│   ├── ValidationPanel.tsx
│   └── MiniMap.tsx
├── hooks/
│   └── useFunnelStore.ts
├── types/
│   └── index.ts
├── constants/
│   └── nodeTemplates.ts
├── utils/
│   ├── validation.ts
│   └── storage.ts
├── theme.ts
├── App.tsx
├── main.tsx
└── index.css
```

---

## Tech stack

- React 19, TypeScript, Vite 7  
- @xyflow/react (React Flow v12)  
- Tailwind CSS v4  
- nanoid (node ids)

---

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Serve production build locally |
| `npm run lint` | Run ESLint |

---

## Part 2: Dashboard architecture

The written answer for the **modern dashboard architecture** (scalable front-end, team patterns, WCAG, performance, DX, testing, release) is in:

**[docs/dashboard-architecture.md](docs/dashboard-architecture.md)**

It covers: architecture and feature modules, design system, data fetching and state, performance, DX and scaling, testing strategy, and release/quality.

---

## License

MIT — see [LICENSE](LICENSE).
