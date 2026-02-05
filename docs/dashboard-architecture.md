# Modern Dashboard Architecture (Cartpanda)

How to build a scalable admin dashboard (funnels, orders, customers, analytics, etc.) that stays fast, supports parallel teams, avoids big rewrites, and meets WCAG.

---

## 1. Architecture

**Structure:** Next.js App Router. Domain-driven **feature modules** (`features/orders`, `features/funnels`, …) that own components, hooks, API layer, and types. **Shared** and **design-system** for cross-cutting code. **app/** only imports from features and shared.

**Rules:** Features do not import from other features. Barrel exports per feature. ESLint boundaries (e.g. `boundaries/element-types`) to enforce layers. Routes = thin pages that mount feature components + Suspense.

**Why:** Clear ownership, parallel work, lazy-load by route, no spaghetti.

---

## 2. Design System

**Choice:** Hybrid. **Radix UI** for primitives (accessible, unstyled). **Tailwind** for styling with **tokens only** (colors, spacing, typography from `design-system/tokens`). Build complex components on Radix; use Recharts/Tremor for charts, TanStack Table for tables. Avoid heavy full-stack UI libraries (bundle and customization tradeoffs).

**Consistency:** Tailwind config sourced from tokens; ESLint to disallow arbitrary values. **Storybook** for component docs. Buttons/inputs from design-system only (optional ESLint rule to block raw `<button>`/`<input>`).

**A11y:** Focus-visible, disabled states, and `aria-*` in primitives by default.

---

## 3. Data Fetching & State

| State | Tool | Use for |
|-------|------|--------|
| Server | TanStack Query | Orders, customers, funnels, analytics |
| Client UI | Zustand or Context | Modals, sidebar, UI toggles |
| URL | nuqs or searchParams | Filters, pagination, sort |
| Forms | React Hook Form + Zod | Edit forms, settings |

**Query keys:** Structured per feature (e.g. `orderKeys.list(filters)`, `orderKeys.detail(id)`). Mutations invalidate or set cache as needed.

**Loading/error/empty:** Shared `QueryStateHandler` (or similar) that renders skeleton, error UI, or empty state so every list/detail uses the same pattern. Tables: filters/sort/pagination in URL so they’re shareable and back-button friendly. **Zod** for runtime validation of API responses.

---

## 4. Performance

- **Bundle:** Route-based splitting (automatic with App Router). Dynamic import for heavy features (e.g. analytics charts). Optimize package imports for Radix, lodash-es, date-fns.
- **Lists:** Virtualize long tables (e.g. TanStack Virtual) with fixed row height.
- **Renders:** useMemo for derived data, useCallback for handlers passed to children. Memoize table columns and list items where it matters.
- **Measure:** Web Vitals (LCP, FID, CLS) + custom interaction timing (“dashboard feels slow”) sent to analytics. Lighthouse CI with budgets (e.g. LCP &lt; 2.5s, CLS &lt; 0.1).

---

## 5. DX & Team Scaling

- **Onboard:** CONTRIBUTING.md (setup &lt; 5 min), feature READMEs, Storybook, ADRs for big decisions.
- **Conventions:** Prettier, ESLint (strict TS, Tailwind, import order), Conventional Commits, PR template (description, checklist: tests, a11y, no `any`).
- **Prevent one-off UI:** Prefer design-system components; code review checklist; optional ESLint rule for restricted elements. Tailwind = tokens only.

---

## 6. Testing Strategy

**What gets unit vs integration vs E2E?**

| Layer | What | Examples |
|-------|------|----------|
| **Unit** | Pure logic, utils, hooks | `validateOrder`, `formatCurrency`, `useOrders` |
| **Integration** | Components + mocked API (MSW) | Tables (filter/sort), forms, feature flows |
| **E2E** | Full journeys in browser | Login → orders → export; critical paths only |

**Minimum before moving fast:** (1) Unit tests for every new/changed util or validation. (2) At least one integration test per new user-facing interaction. (3) All tests green in CI. E2E: start with 3–5 critical journeys; skip heavy snapshot/visual regression at first.

**Tools:** Vitest (+ React Testing Library) for unit/integration; Playwright for E2E.

---

## 7. Release & Quality

- **Feature flags:** LaunchDarkly (or Vercel Edge Config, Statsig). Toggle new features by percentage or audience. Rollback = turn flag off.
- **Rollout:** Dev → Staging → Prod (internal %) → Beta % → GA. Target internal team first, then bucket by userId.
- **Errors:** Sentry (or similar). Capture errors; scrub sensitive headers. Feature-level error boundaries + tags for debugging.
- **Ship fast, safe:** CI = lint, types, tests. Preview deploy per PR. Gradual rollouts and instant rollback via flags. Monitor errors and core metrics.

---

## Summary

- **Scalable:** Feature modules, clear boundaries, code splitting.
- **Team-friendly:** Conventions, docs, PR template, design-system usage.
- **Quality:** Layered testing, feature flags, error monitoring.
- **A11y:** WCAG via design-system primitives and tokens.
- **Performance:** Virtualization, memoization, Web Vitals, budgets.

**Pragmatism:** Adopt incrementally. Skip at first: Zustand (use Context), visual regression, full E2E coverage, complex flag targeting. Never skip: TypeScript strict, a11y basics, lint in CI, error monitoring, feature-folder structure.
