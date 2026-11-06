# AGENTS.md

## What this is

Next.js 16 (App Router, `app/`) + React 19 + TypeScript (strict) + Tailwind CSS v4 +
**Prisma 7 (PostgreSQL/Supabase)** + **NextAuth v5** — a **full-stack** restaurant
QR-ordering & POS system. All PRD screens exist: customer ordering, kitchen display,
cashier POS, admin panel, plus a role-picker landing at `/`. The app is **mid-migration
from mock data to the database**; keep both worlds consistent while migrating screen by
screen.

**Source of truth:**

- Flows, screens, requirements: `planning/restaurant-qr-ordering-pos-prd.md` (~2000 lines).
  Read the relevant section before building any feature. Key sections: §29 route structure
  (don't invent routes), §30 component architecture (`components/{customer,kitchen,cashier,admin,ui}`
  split), §25–28 design system / status colors / simulation flows, §26 status triplets.
- Data model: `prisma/schema.prisma` (generator `prisma-client` → generated client in
  `lib/generated/prisma`).

**DB vs mock (update this list whenever you migrate a screen):**

- **On the database (live):** auth (credentials via `auth.ts` +
  `app/api/auth/[...nextauth]`, role guard in `proxy.ts`), admin CRUD for categories,
  products, dining tables (async server components + server actions in `lib/action.ts`),
  product images on Supabase Storage (`lib/supabase-storage.ts`), table QR codes on
  `/admin/tables/qr` (real scannable SVG from `sessionToken`), customer ordering
  (menu from DB, cart → `createOrderAction` → tracking page), `TableSession` /
  `Order` / `OrderItem` / `Payment` flow, kitchen display (`advanceKitchenAction`),
  cashier billing & per-order payment (`payOrdersAction`, receipt print at
  `/staff/cashier/receipt/[paymentCode]`, payment history at
  `/staff/cashier/payments`), admin/staff orders + admin payments, and the admin
  dashboard & sales dashboard (KPIs, active orders, table status, daily
  revenue/payments, and best sellers from `lib/orders.ts`). Inventory is live:
  `Supplier`, `Ingredient`, and `StockMovement` back `/admin/inventory`
  (KPI, status, stock in/out/adjustment, per-ingredient history) and
  `/admin/suppliers` (CRUD), and the dashboard stock warnings read the DB. Recipes
  are live too: `RecipeItem` links every product to its ingredients at
  `/admin/menu/[id]/recipe`, stock is deducted when a customer order is created
  (`createOrderAction`), and product availability on the guest menu is derived from
  recipe stock.
- **Still mock:** cart UI state and toast store (`lib/store.tsx`), restaurant metadata in
  `lib/mock-data.ts`, and the admin staff/shifts/settings screens. Modifiers are not
  modeled yet.

**Scope:** the prototype-only constraint (PRD §3 Non-Goals) is lifted for this phase:
database, Prisma, server actions, auth, and third-party services (Supabase Storage) are in
use. Still out of scope: real payment gateways / QRIS processing, WebSockets, POS hardware,
push notifications, tests/CI.

## Commands

```bash
npm run dev      # dev server (localhost:3000)
npm run build    # production build — run before claiming work is done
npm run lint     # eslint (flat config, eslint-config-next)
npx tsc --noEmit # typecheck — there is NO typecheck script

npx prisma migrate dev --name <slug>   # schema change (interactive TTY only)
npx prisma migrate deploy             # apply pending migrations (CI/non-interactive)
npx prisma generate                   # regenerate lib/generated/prisma
npx prisma studio                     # inspect the database
npx tsx prisma/seed.ts                # users + tables + demo orders if no sessions (needs .env)
```

There is no test framework, formatter config, or CI in this repo. Verify with
`npm run lint && npx tsc --noEmit && npm run build`.

## Conventions

- Path alias `@/*` → repo root (tsconfig).
- Tailwind v4: no `tailwind.config`; theme lives in `app/globals.css` via `@theme`.
- Root `DESIGN.md` (+ `.impeccable/design.json`) is the visual source of truth for this
  build: Warm Ember world (`#EA580C` primary), Plus Jakarta Sans headings / Inter body,
  status triplet (icon + label + color), tabular numerals (`tnum` utility). Follow it when
  styling.
- Status indicators (AVAILABLE / OCCUPIED / PREPARING / READY / ...) must not rely on
  color alone — pair with icon + label (PRD §26). DB enums are lowercase; map them to the
  uppercase UI values at the server → client boundary (see `DB_STATUS_TO_UI` in
  `app/admin/tables/page.tsx` and `lib/resolve-table.ts`).
- **Data reads:** pages that show DB data are `async` server components querying `prisma`
  directly, passing plain serializable props into `components/*-screen`. Follow this shape
  for new pages instead of fetching in the client.
- **Writes:** server actions live in `lib/action.ts` — validate input (existing `parse*`
  helpers), return `{ error }` for form state, then `revalidatePath` + `redirect`. Keep new
  actions there with the same signature.
- **Order totals:** `Order.total = Order.subtotal`; service charge and tax are intentionally
  not modeled (columns removed in
  `prisma/migrations/20261021130000_remove_order_service_tax`). Do not reintroduce them.
- **Payment methods:** only `QRIS`/`qris` and `CASH`/`cash` are supported. Legacy
  debit/credit/e-wallet rows were normalized to `qris` in
  `prisma/migrations/20261021140000_reduce_payment_methods`. Do not add new method values.
- **Payments are per selected order:** `Order.paymentId` marks an order as paid; one
  `Payment` may cover multiple orders. The cashier closes the session/table only when no
  unpaid orders remain. Receipts are rendered per payment code at
  `/staff/cashier/receipt/[paymentCode]` and printed through the browser (80mm CSS).
- **Inventory stock is mutation-based:** never write `Ingredient.stock` directly outside
  `createIngredientAction` (opening stock) or `adjustStockAction`. Every change must write
  a `StockMovement` row (`in` / `out` / `adjustment`) with signed `quantity` and
  `stockBefore`/`stockAfter` in the same transaction; `adjustStockAction` uses an
  optimistic `updateMany({ where: { stock: before } })` guard. Stock columns are `Decimal`
  — convert to `number` at the server → client boundary. Status
  (`IN_STOCK`/`LOW_STOCK`/`OUT_OF_STOCK`) is derived via `inventoryStatus()` in
  `lib/inventory.ts`; `lib/inventory.ts` stays free of `prisma` so client components can
  import it (DB helpers live in `lib/inventory-queries.ts`). Ingredients and suppliers are
  archived (`isActive=false`) when they have history; hard deletes are blocked.
- **Recipes drive stock and availability:** `RecipeItem` (unique per product + ingredient)
  stores the quantity of one ingredient per one portion. Every product must have at least
  one ingredient to be orderable. `createOrderAction` aggregates recipe quantities × order
  quantity, rejects the order when stock is insufficient or a recipe is missing, deducts
  stock with the same optimistic `updateMany({ where: { stock: before } })` guard, and
  writes a `StockMovement` (`out`, note `Pemakaian order <code>`) inside the order
  transaction. Guest-menu availability (`MenuProduct.available` / `portions`) comes from
  `getProductAvailabilityMap()` in `lib/recipe-queries.ts`; pure helpers live in
  `lib/recipe.ts` and must stay free of `prisma`. Ingredients used by a recipe cannot be
  hard-deleted, deactivated, or have their unit changed. Adding a cancel/refund flow
  requires restoring stock with an `in` movement referencing the order code.
- **Auth:** `auth()` from `@/auth`; role-based route guard runs in `proxy.ts`
  (`/admin` → admin; `/staff/kitchen`, `/staff/cashier`, `/staff/orders` per role). Roles
  and role landing paths live in `lib/auth-types.ts`.
- **Table QR:** payload is always `${NEXT_PUBLIC_APP_URL}/order/table/{sessionToken}`.
  `DiningTable.sessionToken` (non-null, unique) is the public identifier — never embed the
  DB `id`, and never treat the human `code` (A01) as the QR payload. Generate real QR SVGs
  server-side with `qrcode` via `lib/qrcode.ts` (`tableQrUrl` + `qrSvg`); placeholder /
  decorative patterns that only look like QR codes are not acceptable.
- **Token → table resolution:** server pages resolve the `?token=` / `/order/table/[token]`
  segment with `resolveTableByToken()` from `lib/resolve-table.ts` (DB token → DB code →
  mock fallback), and `fallbackMockTable()` for tokenless demo links. Use it instead of
  ad-hoc `tables.find(...)` so scanned QR identity survives menu → cart → tracking.
- **Mock data (transitional):** `lib/mock-data.ts` remains the single source for screens
  not yet migrated; runtime mutations flow through `lib/store.tsx`. When migrating a screen
  to the DB, drop its mock/store reads in the same change and keep prop shapes stable. Mock
  timestamps use the `at()` / `minsAgo()` helpers; absolute time strings render through
  `components/time-label.tsx` (mounted-gated) to avoid hydration mismatch.
- **Environment:** names only — values live in local `.env` (never commit, never hardcode):
  `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_APP_URL`, `AUTH_SECRET`,
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_BUCKET`,
  and `ADMIN_/KITCHEN_/CASHIER_EMAIL` + `_PASSWORD` (consumed by the seed).

## Reference material (not app code)

- `templete/` (sic) — static HTML mockups + screenshots per role: `customer_qr_order_meja_a01`,
  `kasir_billing_pos_meja_a01`, `kitchen_display_system_kds`, `admin_analytics_stok_bahan`.
  Use as visual reference.
- `templete/gustopos_restoflow/DESIGN.md` — the *template's* design tokens. Reference only:
  this build deliberately chose Warm Ember `#EA580C` (not the template's `#A33900`) and a
  4-column KDS per PRD §8.1. The build's own tokens live in root `DESIGN.md` / `app/globals.css`.

## Gotchas

- `templete/` is misspelled — don't "fix" the directory name in imports/docs.
- `planning/*.md` route trees use Windows console-encoded box-drawing chars; the routes
  themselves are plain ASCII paths inside the code fences.
- `README.md` is the untouched create-next-app default — ignore it in favor of the PRD.
- `lib/generated/prisma` is generated output — edit `prisma/schema.prisma` and run
  `npx prisma generate`; never hand-edit files there.
- `prisma migrate dev` requires an interactive TTY; in non-interactive shells create the
  migration SQL by hand under `prisma/migrations/<ts>_<name>/` and apply with
  `npx prisma migrate deploy`.
- There is no seed npm script; run `npx tsx prisma/seed.ts` (requires `.env`). It is
  idempotent: existing dining tables are never modified (printed QR tokens stay valid),
  and demo sessions/orders/payments are only created when `TableSession` is empty.
  Missing users/tables are created; existing users are upserted.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
