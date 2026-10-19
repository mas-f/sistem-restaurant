# AGENTS.md

## What this is

Next.js 16 (App Router, `app/`) + React 19 + TypeScript (strict) + Tailwind CSS v4 frontend **prototype** of a restaurant QR-ordering & POS system. All PRD screens are built: customer ordering, kitchen display, cashier POS, admin panel, plus a role-picker landing at `/`.

**Source of truth:** `planning/restaurant-qr-ordering-pos-prd.md` (~2000 lines). Read the relevant section before building any feature. Key sections:

- §29 Route structure — exact route tree (`/order/...`, `/staff/...`, `/admin/...`). Follow it; don't invent routes.
- §30 Component architecture — `components/{customer,kitchen,cashier,admin,ui}` split.
- §25–28 — design system (Tailwind + shadcn/ui + Lucide), status colors, mock data minimums, state simulation flows.
- §41 — build order (design system → customer → kitchen → cashier → admin → polish). Backend is an explicit non-goal this phase.

**Scope hard constraint (§3 Non-Goals):** mock data + local React state only. No database, Prisma, API routes, auth, payments, WebSockets, or third-party services. Do not add them.

## Commands

```bash
npm run dev      # dev server (localhost:3000)
npm run build    # production build — run before claiming work is done
npm run lint     # eslint (flat config, eslint-config-next)
npx tsc --noEmit # typecheck — there is NO typecheck script
```

There is no test framework, formatter config, or CI in this repo. Verify with `npm run lint && npx tsc --noEmit && npm run build`.

## Conventions

- Path alias `@/*` → repo root (tsconfig).
- Tailwind v4: no `tailwind.config`; theme lives in `app/globals.css` via `@theme`.
- Root `DESIGN.md` (+ `.impeccable/design.json`) is the visual source of truth for this build: Warm Ember world (`#EA580C` primary), Plus Jakarta Sans headings / Inter body, status triplet (icon + label + color), tabular numerals (`tnum` utility). Follow it when styling.
- Status indicators (AVAILABLE / OCCUPIED / PREPARING / READY / ...) must not rely on color alone — pair with icon + label (PRD §26).
- Mock data must stay consistent across pages: one shared source (`lib/mock-data.ts`), runtime mutations flow through `lib/store.tsx` — kitchen, cashier, and admin all read store state (PRD §27). Timestamps in `lib/mock-data.ts` are deliberately shifted relative to load time (`at()` / `minsAgo()` helpers) so timers stay sane; absolute time strings must render through `components/time-label.tsx` (mounted-gated) to avoid hydration mismatch.

## Reference material (not app code)

- `templete/` (sic) — static HTML mockups + screenshots per role: `customer_qr_order_meja_a01`, `kasir_billing_pos_meja_a01`, `kitchen_display_system_kds`, `admin_analytics_stok_bahan`. Use as visual reference.
- `templete/gustopos_restoflow/DESIGN.md` — the *template's* design tokens. Reference only: this build deliberately chose Warm Ember `#EA580C` (not the template's `#A33900`) and a 4-column KDS per PRD §8.1. The build's own tokens live in root `DESIGN.md` / `app/globals.css`.

## Gotchas

- `templete/` is misspelled — don't "fix" the directory name in imports/docs.
- `planning/*.md` route trees use Windows console-encoded box-drawing chars; the routes themselves are plain ASCII paths inside the code fences.
- `README.md` is the untouched create-next-app default — ignore it in favor of the PRD.
