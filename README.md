# Cartpanda Funnel Builder

A visual drag-and-drop funnel builder for creating sales funnels. Built as part of the Cartpanda Front-end Engineer Practical Test.

![Funnel Builder Screenshot](https://via.placeholder.com/800x450?text=Funnel+Builder+Preview)

## Live Demo

🔗 **[View Live Demo](#)** *(Deploy URL will be added after deployment)*

## Features

### Core Features (MVP)
- ✅ **Infinite Canvas** - Pan and zoom to navigate your funnel
- ✅ **Draggable Nodes** - Drag page types from the palette onto the canvas
- ✅ **5 Node Types** - Sales Page, Order Page, Upsell, Downsell, Thank You
- ✅ **Visual Connections** - Connect nodes with animated arrow edges
- ✅ **Auto-incrementing Labels** - Upsell 1, Upsell 2, etc.
- ✅ **Funnel Validation** - Real-time validation with error/warning indicators
- ✅ **Persistence** - Auto-saves to localStorage
- ✅ **Export/Import** - Download and upload funnel JSON files

### Bonus Features
- ✅ **Zoom Controls** - Zoom in/out with scroll wheel or buttons
- ✅ **Mini-map** - Bird's-eye view of the entire canvas
- ✅ **Undo/Redo** - Ctrl+Z / Ctrl+Shift+Z keyboard shortcuts
- ✅ **Node/Edge Deletion** - Delete with Backspace or Delete key
- ✅ **Validation Panel** - Shows orphan nodes, invalid connections
- ✅ **Grid Background** - Dotted grid for visual alignment

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+ (or pnpm/yarn)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/cartpanda-funnel-builder.git
cd cartpanda-funnel-builder

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/           # React components
│   ├── FunnelBuilder.tsx # Main application component
│   ├── FunnelNode.tsx    # Custom node component
│   ├── Sidebar.tsx       # Draggable palette
│   ├── Toolbar.tsx       # Action buttons
│   ├── ValidationPanel.tsx # Validation display
│   └── MiniMap.tsx       # Canvas mini-map
├── hooks/
│   └── useFunnelStore.ts # Central state management
├── types/
│   └── index.ts          # TypeScript interfaces
├── constants/
│   └── nodeTemplates.ts  # Node configurations
├── utils/
│   ├── validation.ts     # Funnel validation logic
│   └── storage.ts        # localStorage & JSON export
└── App.tsx               # Application entry
```

## Architecture Decisions

### 1. React Flow (@xyflow/react)
**Choice:** Used React Flow v12 for the canvas and graph functionality.

**Rationale:**
- Battle-tested library with excellent TypeScript support
- Built-in pan/zoom, minimap, controls
- Performant with virtualization for large graphs
- Accessible by default (keyboard navigation)
- Rich ecosystem and documentation

**Tradeoff:** Adds ~50KB to bundle. For this use case, the DX and feature set justify the size.

### 2. State Management
**Choice:** Custom hook (`useFunnelStore`) with React's built-in state + React Flow's hooks.

**Rationale:**
- No need for external state libraries (Redux, Zustand) for this scope
- React Flow provides `useNodesState` and `useEdgesState` optimized for graph operations
- Single source of truth in one hook
- Easy to extend if needed (could migrate to Zustand/Redux later)

**Tradeoff:** Undo/redo is custom-built. For a production app, might use a library like `use-undo`.

### 3. Styling: Tailwind CSS v4
**Choice:** Tailwind with the new v4 CSS-first approach.

**Rationale:**
- Rapid prototyping with utility classes
- No CSS file management
- Consistent spacing, colors, typography
- Tree-shaking removes unused styles
- Great accessibility utilities (focus rings, etc.)

### 4. Validation Strategy
**Choice:** Declarative validation that runs on state change, displayed in a panel.

**Rationale:**
- Non-blocking UX (allows invalid states, just warns)
- Clear feedback without modal interruptions
- Easy to extend with new rules
- Clickable issues for navigation

### 5. Persistence
**Choice:** localStorage for auto-save, JSON export for portability.

**Rationale:**
- No backend required (as per requirements)
- Instant persistence without user action
- Export enables sharing and backup
- Import enables collaboration/templates

## Funnel Rules Implemented

1. **Thank You pages** cannot have outgoing connections (terminal node)
2. **Sales Pages** should connect to one Order Page (warning if missing/multiple)
3. **Orphan nodes** are flagged (nodes with no connections)
4. **Duplicate connections** are prevented
5. **Self-connections** are prevented

## Accessibility (WCAG)

### Implemented
- ✅ Semantic HTML (`<main>`, `<aside>`, `<header>`, `role` attributes)
- ✅ Keyboard navigation (Tab through palette, Enter/Space to interact)
- ✅ Focus indicators (visible focus rings on all interactive elements)
- ✅ Screen reader labels (`aria-label` on buttons, regions, controls)
- ✅ Color contrast (text meets WCAG AA standards)
- ✅ Reduced motion support (`prefers-reduced-motion` media query)
- ✅ High contrast mode support
- ✅ Skip link for keyboard users

### Accessibility Limitations
- Drag-and-drop requires mouse; keyboard users need alternative (could add click-to-place)
- Canvas interactions are partially accessible via React Flow's built-in support
- Screen reader announcements for state changes could be enhanced with ARIA live regions

## What I'd Improve Next

### Short-term
1. **Click-to-place mode** - Accessibility alternative to drag-and-drop
2. **Node editing** - Edit labels, button text inline
3. **Edge labels** - Show "Yes/No" for conditional paths
4. **Snap to grid** - Alignment when dragging nodes
5. **Better mobile support** - Touch gestures, responsive sidebar

### Medium-term
1. **Templates** - Pre-built funnel templates
2. **Theming** - Light/dark mode toggle
3. **Real-time collaboration** - WebSocket sync (like Figma)
4. **Version history** - Named saves, branching

### Long-term
1. **Backend integration** - REST API for persistence
2. **Preview mode** - Simulate funnel flow
3. **Analytics overlay** - Show conversion rates on edges
4. **A/B testing** - Variant nodes

## Tech Stack

- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite 7
- **Graph Library:** @xyflow/react (React Flow v12)
- **Styling:** Tailwind CSS v4
- **ID Generation:** nanoid

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## License

MIT License - See [LICENSE](LICENSE) for details.

---

## Part 2: Dashboard Architecture

See [docs/dashboard-architecture.md](docs/dashboard-architecture.md) for the comprehensive dashboard architecture answer.
