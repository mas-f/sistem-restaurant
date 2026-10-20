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
  `/admin/tables/qr` (real scannable SVG from `sessionToken`).
- **Still mock:** customer ordering flow — menu/cart content, orders, tracking, sessions
  (`lib/mock-data.ts` + `lib/store.tsx`), kitchen display, cashier, and the admin
  dashboard/orders/payments/sales/staff/shifts/inventory/suppliers/settings screens.

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
npx tsx prisma/seed.ts                # seed users + dining tables (needs .env, no npm script)
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
  ensure-only and idempotent — existing tables are never touched, so user data and
  printed QR tokens stay valid; it only creates missing rows.
