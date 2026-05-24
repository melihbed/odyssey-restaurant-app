# Odyssey Restaurant — Fullstack Assignment

A production-quality restaurant operations dashboard built to Odyssey's stack specs.

## Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | pnpm workspaces + Turborepo |
| Dashboard | Expo + React Native Web + expo-router |
| Backend | Hono on Cloudflare Workers |
| Database | PostgreSQL (Neon serverless) + Drizzle ORM |
| Validation | drizzle-zod → @hono/zod-openapi |
| API Contract | OpenAPI → Orval → React Query hooks |
| Design System | Custom tokens + React Native components |

## Architecture

```
Drizzle schema
  → drizzle-zod schemas
    → @hono/zod-openapi route definitions
      → /openapi.json endpoint
        → pnpm gen:contract (Orval)
          → packages/api-client/src/generated/
            → apps/dashboard hooks
```

All frontend API types come from Orval-generated code — no handwritten DTOs.

## Project Structure

```
apps/dashboard/          # Expo + React Native Web
services/backend/        # Hono on Cloudflare Workers
packages/ui/             # Design system (tokens + components)
packages/shared/         # formatCurrency, dates, order status utils
packages/api-client/     # Orval-generated hooks + axios mutator
```

## Local Setup

### 1. Prerequisites

- Node.js 20+
- pnpm 9+
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment

```bash
cp services/backend/.dev.vars.example services/backend/.dev.vars
# Edit .dev.vars and set DATABASE_URL to your Neon connection string
```

### 4. Run migrations

```bash
pnpm db:migrate
```

### 5. Seed sample data

```bash
pnpm db:seed
```

This seeds:
- 4 menu categories + 14 menu items
- 6 customers
- 14 orders across all status states (historical + active)
- Default settings

### 6. Generate API client (requires running backend)

```bash
# Terminal 1: start backend
pnpm dev:backend

# Terminal 2: export spec + generate client
pnpm gen:contract
```

### 7. Start the dashboard

```bash
pnpm dev:dashboard
# Open http://localhost:8081
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev:backend` | Start Hono on http://localhost:8787 |
| `pnpm dev:dashboard` | Start Expo web on http://localhost:8081 |
| `pnpm gen:contract` | Export OpenAPI spec + run Orval codegen |
| `pnpm db:migrate` | Run Drizzle migrations |
| `pnpm db:seed` | Seed database with sample data |
| `pnpm typecheck` | TypeScript check across all packages |
| `pnpm lint` | ESLint across all packages |
| `pnpm test` | Run all tests |
| `pnpm build` | Full production build |

## Testing

Run the full test suite across all packages:

```bash
pnpm test
```

65 tests across 5 suites, all passing with no real database required.

### Backend (`services/backend`)

**Order State Machine — 13 tests**  
Pure unit tests for `lib/order-state-machine.ts`. Covers every valid transition (`pending → accepted`, `accepted → preparing`, etc.), every illegal transition throwing a 422, and `getValidActions` returning the correct available actions per status (including empty arrays for terminal statuses).

**Order & Menu HTTP Validation — 6 tests**  
Integration-style tests against the Hono app with the database mocked via `vi.mock`. Covers Zod rejection of empty items arrays, invalid UUIDs, zero quantities, unknown order actions, and invalid query parameter values — plus a happy-path assertion that `GET /menu/items?available=true` returns `200 []`.

### Dashboard (`apps/dashboard`)

**Order Status Constants — 5 tests**  
Tests the `ORDER_STATUS_LABELS`, `ORDER_STATUS_COLORS`, and `ORDER_ACTION_LABELS` constants from `@repo/shared`. Verifies every status has a label and a valid `#rrggbb` hex color, and that terminal vs. active statuses use distinct colors.

**Formatting Utilities — 10 tests**  
Tests `formatCurrency`, `formatCompactNumber`, `truncate`, and `initials` from `@repo/shared`. Covers cents-to-dollars formatting, thousands abbreviation, ellipsis truncation, and initials extraction.

**UI Component Tests — 31 tests**  
Render tests for four key components using `@testing-library/react` + jsdom, with React Native mapped to DOM equivalents:

- **Button (5 tests)** — renders label, shows spinner and hides label when loading, disabled state for both `loading` and `disabled` props, fires `onPress` handler.
- **Badge / StatusBadge (9 tests)** — renders children, maps all 7 order statuses (`pending`, `accepted`, `preparing`, `ready`, `completed`, `rejected`, `cancelled`) to their display labels, passes unknown status strings through as-is.
- **EmptyState / ErrorState (11 tests)** — conditional description rendering, action button only shown when both `actionLabel` and `onAction` are provided, click fires the handler; ErrorState default title, custom title, retry button presence and click, no retry when omitted.
- **KpiCard (6 tests)** — label and value rendering, optional subvalue, upward/downward trend indicators (↑/↓), no trend when prop omitted.

---

## API Reference

Interactive docs at **http://localhost:8787/ui** when backend is running.

OpenAPI spec at **http://localhost:8787/openapi.json**

### Endpoints

```
GET/POST   /menu/categories
PUT/DELETE /menu/categories/:id

GET/POST   /menu/items
PUT/DELETE /menu/items/:id
PATCH      /menu/items/:id/availability

GET/POST   /customers
GET/PUT    /customers/:id

GET/POST   /orders
GET        /orders/:id
POST       /orders/:id/actions   { action: accept|reject|start_preparing|mark_ready|complete|cancel }

GET/PUT    /settings

GET        /home/stats
```

### Order State Machine

```
pending ──→ accepted ──→ preparing ──→ ready ──→ completed
   └──→ rejected       └──→ cancelled
```

Invalid transitions return `422 Unprocessable Entity`.

## Design System

Visit **/design-system** in the dashboard for a live showcase of all tokens and components:
- Color palette + semantic aliases
- Typography scale
- Spacing + radius + shadows
- Buttons, Inputs, Select, Modal, Card
- Badges, StatusBadge, Avatar, Skeleton
- EmptyState, ErrorState, Toast

## Architecture Decisions

**Neon over Cloudflare D1** — D1 lacks PostgreSQL enums, UUID generation, and complex join support that Drizzle relies on. Neon's HTTP driver works without TCP in the Workers runtime.

**Price in integer cents** — avoids floating-point precision bugs for currency. All prices stored as integers; `formatCurrency(cents)` in `packages/shared` handles display.

**Orval tags-split mode** — generates one file per OpenAPI tag (`menu.ts`, `orders.ts`, etc.) for clean imports and no barrel-file megabundle.

**Dynamic-ID mutation hooks** — Orval binds the resource ID at hook creation time. For page-level mutations where the target item changes (e.g. delete confirmation modal), the hooks use `useMutation` with the ID as part of the mutation function argument.

**Settings as key-value jsonb** — flexible for schema evolution without migrations; strict Zod validation at the API layer compensates for reduced DB-level type safety.

## Tradeoffs / Incomplete Areas

- **No authentication** — out of scope for the assignment; a real deployment would add Clerk or similar via middleware
- **No real-time updates** — orders page requires manual refresh; production would use SSE or WebSockets
- **Native not tested** — the dashboard runs on web; React Native mobile rendering is untested
- **No image upload** — menu items have an `imageUrl` field but no upload UI
- **Orval codegen requires running backend** — the `gen:contract` step fetches the live OpenAPI spec; could be improved by adding a static export step
