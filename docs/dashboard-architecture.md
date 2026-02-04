# Modern Dashboard Architecture for Cartpanda

## Executive Summary

This document outlines a comprehensive architecture for building a scalable admin dashboard for Cartpanda's funnels and checkout product. The architecture prioritizes:

- **Performance** at scale (thousands of orders, complex analytics)
- **Developer experience** for parallel team development
- **Accessibility** (WCAG 2.1 AA compliance)
- **Maintainability** to avoid "big rewrite" traps

---

## Table of Contents

1. [Architecture](#1-architecture)
2. [Design System](#2-design-system)
3. [Data Fetching & State](#3-data-fetching--state)
4. [Performance](#4-performance)
5. [Developer Experience & Team Scaling](#5-developer-experience--team-scaling)
6. [Testing Strategy](#6-testing-strategy)
7. [Release & Quality](#7-release--quality)

---

## 1. Architecture

### 1.1 High-Level Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth-required layout group
│   │   ├── dashboard/
│   │   ├── funnels/
│   │   ├── orders/
│   │   ├── customers/
│   │   ├── subscriptions/
│   │   ├── analytics/
│   │   ├── disputes/
│   │   └── settings/
│   ├── (public)/          # Public pages (login, etc.)
│   └── layout.tsx         # Root layout
├── features/              # Feature modules (domain-driven)
│   ├── funnels/
│   │   ├── components/    # Feature-specific components
│   │   ├── hooks/         # Feature-specific hooks
│   │   ├── api/           # API layer (queries, mutations)
│   │   ├── types/         # Feature types
│   │   └── utils/         # Feature utilities
│   ├── orders/
│   ├── customers/
│   ├── analytics/
│   └── ...
├── shared/                # Shared across features
│   ├── components/        # Generic UI components
│   ├── hooks/             # Generic hooks
│   ├── utils/             # Generic utilities
│   └── types/             # Shared types
├── design-system/         # Design tokens & primitives
│   ├── tokens/            # Colors, spacing, typography
│   ├── primitives/        # Base components
│   └── patterns/          # Composite patterns
└── lib/                   # External integrations
    ├── api-client/        # HTTP client configuration
    ├── analytics/         # Analytics integration
    └── feature-flags/     # Feature flag client
```

### 1.2 Feature Modules (Domain-Driven Design)

Each feature module is **self-contained** and owns:

```typescript
// features/orders/index.ts - Public API of the feature
export { OrdersTable } from './components/OrdersTable';
export { useOrders } from './hooks/useOrders';
export { orderKeys } from './api/queryKeys';
export type { Order, OrderStatus } from './types';
```

**Benefits:**
- Engineers can work on different features in parallel without conflicts
- Clear ownership boundaries
- Easy to refactor or replace a feature
- Lazy-loadable at the route level

**Rules:**
1. Features can import from `shared/` and `design-system/`
2. Features **cannot** import from other features directly
3. Cross-feature communication goes through shared state or events

### 1.3 Route Organization (Next.js App Router)

```typescript
// app/(auth)/orders/page.tsx
import { OrdersTable } from '@/features/orders';
import { PageHeader } from '@/shared/components';

export default function OrdersPage() {
  return (
    <main>
      <PageHeader title="Orders" />
      <Suspense fallback={<OrdersTableSkeleton />}>
        <OrdersTable />
      </Suspense>
    </main>
  );
}
```

**Why App Router over Pages Router:**
- Server Components reduce client bundle
- Streaming and Suspense for better loading UX
- Nested layouts for shared navigation
- Built-in loading/error states

### 1.4 Avoiding Spaghetti Code

| Pattern | Purpose |
|---------|---------|
| **Feature folders** | Encapsulate domain logic |
| **Barrel exports** | Explicit public APIs |
| **Shared contracts** | TypeScript interfaces for cross-feature data |
| **Dependency rules** | ESLint boundaries plugin |
| **Event-driven communication** | For feature-to-feature triggers |

```typescript
// eslint config for boundaries
{
  "rules": {
    "boundaries/element-types": [
      "error",
      {
        "default": "disallow",
        "rules": [
          { "from": "features/*", "allow": ["shared", "design-system", "lib"] },
          { "from": "shared", "allow": ["design-system", "lib"] },
          { "from": "app", "allow": ["features", "shared", "design-system"] }
        ]
      }
    ]
  }
}
```

---

## 2. Design System

### 2.1 Build vs. Buy Decision

**Recommendation: Hybrid Approach**

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Primitives** | Radix UI | Accessible, unstyled, composable |
| **Styling** | Tailwind CSS | Rapid development, consistent tokens |
| **Complex components** | Build on Radix | Full control over UX |
| **Charts** | Recharts or Tremor | Accessible, customizable |
| **Tables** | TanStack Table | Headless, feature-rich |

**Why not Chakra/MUI/Ant Design?**
- Bundle size concerns
- Limited customization for Cartpanda's brand
- Harder to maintain consistency with design specs
- Accessibility sometimes compromised for features

### 2.2 Design Tokens

```typescript
// design-system/tokens/colors.ts
export const colors = {
  // Semantic colors
  primary: {
    50: '#EFF6FF',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
  },
  success: { ... },
  warning: { ... },
  error: { ... },
  
  // Functional colors
  background: {
    default: 'var(--bg-default)',
    subtle: 'var(--bg-subtle)',
    muted: 'var(--bg-muted)',
  },
  text: {
    primary: 'var(--text-primary)',
    secondary: 'var(--text-secondary)',
    disabled: 'var(--text-disabled)',
  },
} as const;

// design-system/tokens/spacing.ts
export const spacing = {
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  2: '0.5rem',
  // ... follows 4px grid
} as const;

// design-system/tokens/typography.ts
export const typography = {
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;
```

### 2.3 Enforcing Consistency

1. **Tailwind Config** - Tokens are the only values allowed
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    colors: require('./design-system/tokens/colors'),
    spacing: require('./design-system/tokens/spacing'),
    // Disable arbitrary values
  },
  corePlugins: {
    // Disable plugins that allow arbitrary values
  },
};
```

2. **ESLint Rules** - No arbitrary Tailwind classes
```javascript
{
  "rules": {
    "tailwindcss/no-arbitrary-value": "error"
  }
}
```

3. **Storybook** - Component documentation
```typescript
// design-system/primitives/Button.stories.tsx
export default {
  title: 'Primitives/Button',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
```

### 2.4 Accessibility in Design System

```typescript
// design-system/primitives/Button.tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // Base styles with focus states
  'inline-flex items-center justify-center rounded-md font-medium transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500',
        destructive: 'bg-error-600 text-white hover:bg-error-700 focus-visible:ring-error-500',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, isLoading, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    return (
      <Comp
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner className="mr-2" aria-hidden />
            <span className="sr-only">Loading</span>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
```

---

## 3. Data Fetching & State

### 3.1 Server State vs. Client State

| Type | Tool | Examples |
|------|------|----------|
| **Server state** | TanStack Query | Orders, customers, funnels, analytics |
| **Client state** | Zustand (or React Context) | UI state, modals, sidebar collapse |
| **URL state** | nuqs (or Next.js searchParams) | Filters, pagination, tabs |
| **Form state** | React Hook Form + Zod | Edit forms, settings |

### 3.2 TanStack Query Setup

```typescript
// lib/api-client/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30,   // 30 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// features/orders/api/queryKeys.ts
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: OrderFilters) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

// features/orders/api/queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderKeys } from './queryKeys';
import { fetchOrders, updateOrder, type Order, type OrderFilters } from './client';

export function useOrders(filters: OrderFilters) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: () => fetchOrders(filters),
    placeholderData: keepPreviousData,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => fetchOrder(id),
    enabled: !!id,
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateOrder,
    onSuccess: (data) => {
      // Update detail cache
      queryClient.setQueryData(orderKeys.detail(data.id), data);
      // Invalidate list caches
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}
```

### 3.3 Loading, Error, and Empty States

```typescript
// shared/components/QueryStateHandler.tsx
interface QueryStateHandlerProps<T> {
  query: UseQueryResult<T>;
  children: (data: T) => React.ReactNode;
  loadingFallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  emptyFallback?: React.ReactNode;
  isEmpty?: (data: T) => boolean;
}

export function QueryStateHandler<T>({
  query,
  children,
  loadingFallback = <Skeleton />,
  errorFallback,
  emptyFallback,
  isEmpty = (data) => Array.isArray(data) && data.length === 0,
}: QueryStateHandlerProps<T>) {
  if (query.isLoading) {
    return <>{loadingFallback}</>;
  }

  if (query.isError) {
    return (
      <>
        {errorFallback || (
          <ErrorState
            title="Something went wrong"
            message={query.error.message}
            onRetry={() => query.refetch()}
          />
        )}
      </>
    );
  }

  if (query.data && isEmpty(query.data)) {
    return (
      <>
        {emptyFallback || (
          <EmptyState
            title="No data found"
            description="Try adjusting your filters or create your first item."
          />
        )}
      </>
    );
  }

  return <>{children(query.data!)}</>;
}
```

### 3.4 Table Filters, Sorts, and Pagination

```typescript
// features/orders/hooks/useOrdersTable.ts
import { useQueryStates, parseAsString, parseAsInteger } from 'nuqs';

const filterParsers = {
  status: parseAsString.withDefault('all'),
  search: parseAsString.withDefault(''),
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(20),
  sortBy: parseAsString.withDefault('createdAt'),
  sortOrder: parseAsString.withDefault('desc'),
};

export function useOrdersTable() {
  const [filters, setFilters] = useQueryStates(filterParsers, {
    history: 'push',
  });

  const ordersQuery = useOrders(filters);

  const handleFilterChange = (key: keyof typeof filters, value: string | number) => {
    setFilters({ [key]: value, page: 1 }); // Reset to page 1 on filter change
  };

  const handleSort = (column: string) => {
    setFilters({
      sortBy: column,
      sortOrder: filters.sortBy === column && filters.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };

  const handlePageChange = (page: number) => {
    setFilters({ page });
  };

  return {
    filters,
    ordersQuery,
    handleFilterChange,
    handleSort,
    handlePageChange,
  };
}
```

### 3.5 Runtime Validation with Zod

```typescript
// features/orders/types/schemas.ts
import { z } from 'zod';

export const OrderSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  status: z.enum(['pending', 'processing', 'completed', 'refunded', 'disputed']),
  total: z.number().positive(),
  currency: z.string().length(3),
  items: z.array(z.object({
    productId: z.string().uuid(),
    name: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
  })),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Order = z.infer<typeof OrderSchema>;

// In API client
async function fetchOrders(filters: OrderFilters): Promise<Order[]> {
  const response = await apiClient.get('/orders', { params: filters });
  // Validate at runtime to catch API contract breaks early
  return z.array(OrderSchema).parse(response.data);
}
```

---

## 4. Performance

### 4.1 Bundle Splitting Strategy

```typescript
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: ['@radix-ui/*', 'lodash-es', 'date-fns'],
  },
};

// Route-based splitting (automatic with App Router)
// app/(auth)/analytics/page.tsx
import dynamic from 'next/dynamic';

const AnalyticsCharts = dynamic(
  () => import('@/features/analytics/components/AnalyticsCharts'),
  {
    loading: () => <ChartsSkeleton />,
    ssr: false, // Heavy charts don't need SSR
  }
);
```

### 4.2 Virtualization for Large Tables

```typescript
// features/orders/components/OrdersTable.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export function OrdersTable({ orders }: { orders: Order[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: orders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52, // Row height
    overscan: 10,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <table>
        <thead>{/* ... */}</thead>
        <tbody
          style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const order = orders[virtualRow.index];
            return (
              <tr
                key={order.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {/* ... cells */}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

### 4.3 Memoization Strategy

```typescript
// Memoize expensive computations
const processedData = useMemo(() => {
  return transformOrderData(orders, filters);
}, [orders, filters]);

// Memoize callbacks passed to children
const handleRowClick = useCallback((order: Order) => {
  router.push(`/orders/${order.id}`);
}, [router]);

// Memoize child components for stable references
const columns = useMemo(() => createColumns(handleRowClick), [handleRowClick]);
```

### 4.4 Performance Instrumentation

```typescript
// lib/analytics/performance.ts
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

export function initPerformanceMonitoring() {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onLCP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}

function sendToAnalytics(metric: Metric) {
  // Send to your analytics service (e.g., Datadog, New Relic)
  analytics.track('Web Vitals', {
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    id: metric.id,
    page: window.location.pathname,
  });
}

// Custom timing for "dashboard feels slow" investigations
export function measureInteraction(name: string, fn: () => Promise<void>) {
  const start = performance.now();
  return fn().finally(() => {
    const duration = performance.now() - start;
    analytics.track('Interaction Timing', {
      name,
      duration,
      page: window.location.pathname,
    });
  });
}
```

### 4.5 Performance Budget

```json
// .lighthouserc.json
{
  "ci": {
    "assert": {
      "assertions": {
        "first-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 3000 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }]
      }
    }
  }
}
```

---

## 5. Developer Experience & Team Scaling

### 5.1 Onboarding Engineers

1. **CONTRIBUTING.md** - Step-by-step guide
   - Local setup in < 5 minutes
   - Feature module structure explained
   - Common tasks documented

2. **README per feature**
```markdown
# Orders Feature

## Overview
Manages order listing, details, and actions (refunds, status changes).

## Key Files
- `components/OrdersTable.tsx` - Main table with filters
- `api/queries.ts` - TanStack Query hooks
- `types/schemas.ts` - Zod schemas

## Adding a New Action
1. Add mutation in `api/mutations.ts`
2. Add button in `components/OrderActions.tsx`
3. Add test in `__tests__/OrderActions.test.tsx`
```

3. **Storybook** - Interactive component playground
4. **ADRs (Architecture Decision Records)** - Document "why" behind choices

### 5.2 Enforced Conventions

| Convention | Tool |
|------------|------|
| Code formatting | Prettier (auto-format on save) |
| Linting | ESLint with strict rules |
| Import order | `eslint-plugin-import` |
| Type safety | `typescript-eslint` strict mode |
| Commit messages | Conventional Commits + Husky |
| PR template | Required sections |
| Component patterns | ESLint custom rules |

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:tailwindcss/recommended',
  ],
  rules: {
    // Enforce named exports for components
    'import/no-default-export': 'error',
    // Allow default export only for pages
    'import/no-default-export': ['error', { allow: ['page.tsx', 'layout.tsx'] }],
    
    // Prevent console.log in production code
    'no-console': ['error', { allow: ['warn', 'error'] }],
    
    // Require return types on functions
    '@typescript-eslint/explicit-function-return-type': 'error',
  },
};
```

### 5.3 PR Template

```markdown
## Description
<!-- What does this PR do? -->

## Type of Change
- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation

## Checklist
- [ ] Tests added/updated
- [ ] Storybook stories added (if UI change)
- [ ] Accessibility checked (keyboard nav, screen reader)
- [ ] No console errors/warnings
- [ ] Types are complete (no `any`)

## Screenshots
<!-- If UI change, add before/after -->
```

### 5.4 Preventing One-Off UI

1. **Component library enforcement**
```typescript
// ESLint rule to prevent raw HTML elements
'no-restricted-elements': ['error', {
  'button': 'Use <Button> from design-system',
  'input': 'Use <Input> from design-system',
}]
```

2. **Tailwind restrictions** - Only allow design tokens
3. **Code review checklist** - "Does this use existing components?"
4. **Weekly design sync** - Engineers + Designer review new patterns

---

## 6. Testing Strategy

### 6.1 Testing Pyramid

```
        /\
       /  \      E2E (Critical paths: 10%)
      /----\     
     /      \    Integration (Feature flows: 30%)
    /--------\   
   /          \  Unit (Utils, hooks: 60%)
  /------------\
```

### 6.2 What Gets Tested Where

| Type | What | Tool | Example |
|------|------|------|---------|
| **Unit** | Pure functions, utils | Vitest | `formatCurrency()`, `validateOrder()` |
| **Unit** | Hooks | Vitest + React Testing Library | `useOrders()` query states |
| **Integration** | Components with mocked API | Vitest + MSW | `<OrdersTable />` filtering |
| **E2E** | Critical user journeys | Playwright | Login → View orders → Export |

### 6.3 Minimum Testing Requirements

**Before merge, every PR must have:**

1. Unit tests for any new utility function
2. Integration test for any new user interaction
3. Tests must pass in CI

**Optional but encouraged:**
- Snapshot tests for complex UI components
- Visual regression tests for design system changes

### 6.4 Example Tests

```typescript
// Unit: utils/__tests__/formatCurrency.test.ts
import { formatCurrency } from '../formatCurrency';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });

  it('handles zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });
});

// Integration: features/orders/__tests__/OrdersTable.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';
import { OrdersTable } from '../components/OrdersTable';

describe('OrdersTable', () => {
  it('filters orders by status', async () => {
    render(<OrdersTable />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Order #123')).toBeInTheDocument();
    });

    // Filter by completed
    await userEvent.selectOptions(
      screen.getByLabelText('Status filter'),
      'completed'
    );

    // Verify filtered results
    await waitFor(() => {
      expect(screen.queryByText('Order #123')).not.toBeInTheDocument();
      expect(screen.getByText('Order #456')).toBeInTheDocument();
    });
  });
});

// E2E: e2e/orders.spec.ts
import { test, expect } from '@playwright/test';

test('user can view and export orders', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Navigate to orders
  await page.click('text=Orders');
  await expect(page.locator('h1')).toHaveText('Orders');

  // Export orders
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('text=Export CSV'),
  ]);

  expect(download.suggestedFilename()).toContain('orders');
});
```

---

## 7. Release & Quality

### 7.1 Feature Flags

```typescript
// lib/feature-flags/client.ts
import { LaunchDarkly } from 'launchdarkly-react-client-sdk';

// Or use Vercel Edge Config, Statsig, etc.
export const featureFlags = {
  newAnalyticsDashboard: 'new-analytics-dashboard',
  bulkOrderActions: 'bulk-order-actions',
  darkMode: 'dark-mode',
} as const;

// Usage in component
import { useFlags } from 'launchdarkly-react-client-sdk';

function AnalyticsPage() {
  const flags = useFlags();

  if (flags[featureFlags.newAnalyticsDashboard]) {
    return <NewAnalyticsDashboard />;
  }

  return <LegacyAnalyticsDashboard />;
}
```

### 7.2 Staged Rollouts

1. **Development** → All features enabled
2. **Staging** → Mirrors production data, all features enabled
3. **Production (Internal)** → Cartpanda team only (5%)
4. **Production (Beta)** → Opt-in users (20%)
5. **Production (GA)** → All users (100%)

```yaml
# Feature flag targeting rules
rules:
  - id: internal-team
    variation: true
    clauses:
      - attribute: email
        op: endsWith
        values: ['@cartpanda.com']
  
  - id: beta-users
    variation: true
    rollout:
      percentage: 20
      bucketBy: userId
  
  - id: everyone-else
    variation: false
```

### 7.3 Error Monitoring

```typescript
// lib/error-tracking/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENV,
  
  // Capture 10% of transactions for performance monitoring
  tracesSampleRate: 0.1,
  
  // Capture 100% of errors
  sampleRate: 1.0,
  
  beforeSend(event) {
    // Scrub sensitive data
    if (event.request?.headers) {
      delete event.request.headers['Authorization'];
    }
    return event;
  },
});

// Error boundary for graceful degradation
export function FeatureErrorBoundary({ children, feature }: Props) {
  return (
    <ErrorBoundary
      fallback={<FeatureErrorState feature={feature} />}
      onError={(error) => {
        Sentry.captureException(error, {
          tags: { feature },
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### 7.4 Ship Fast, Ship Safe

| Practice | Implementation |
|----------|----------------|
| **CI checks** | Lint, types, tests must pass |
| **Preview deployments** | Vercel preview for every PR |
| **Automated visual testing** | Chromatic for Storybook |
| **Gradual rollouts** | Feature flags with percentage-based release |
| **Instant rollback** | Feature flags off, or Vercel instant rollback |
| **Real-time monitoring** | Sentry errors, Datadog APM |
| **Alerting** | PagerDuty for error rate spikes |

### 7.5 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  lint-and-type:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: .next
```

---

## Summary

This architecture provides:

1. **Scalability** through feature modules, clear boundaries, and code splitting
2. **Developer velocity** through conventions, templates, and documentation
3. **Quality** through layered testing, feature flags, and monitoring
4. **Accessibility** through design system primitives and WCAG compliance
5. **Performance** through virtualization, memoization, and instrumentation

The key is **pragmatism**: start with the minimum viable architecture and add complexity only when needed. The patterns above are proven at scale but can be adopted incrementally.

### What I'd Skip Initially

- Advanced state management (Zustand) - Start with TanStack Query + React Context
- Visual regression testing - Add when design system stabilizes
- Complex feature flags - Start with environment-based toggles
- Full E2E coverage - Focus on critical paths only

### What I'd Never Skip

- TypeScript strict mode
- Accessibility fundamentals
- Code review with linting
- Error monitoring from day one
- Feature folder structure
