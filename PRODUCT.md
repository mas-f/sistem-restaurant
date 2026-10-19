# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Restaurant guests** — scan a QR code at their table, browse the menu, order, track progress, and request the bill from a phone browser.
- **Kitchen staff** — receive, prepare, and mark orders ready on a kitchen display (KDS).
- **Cashier** — manage tables, generate bills, and take payments at the POS.
- **Admin/Manager** — manage menu, tables, QR codes, inventory, suppliers, staff, shifts, and view sales/payment reports.

## Product Purpose

RestoFlow is a restaurant QR-ordering & POS system: guests order from the table via QR, the kitchen processes dockets on a KDS, the cashier bills and takes payment, and admin runs the operation from dashboards. The current phase is a production-grade **frontend prototype** that simulates every flow end-to-end with mock data and local state. Success = the PRD Definition of Done (`planning/restaurant-qr-ordering-pos-prd.md` §42): all role flows demonstrable, responsive, and visually production-grade. Secondary: portfolio proof of multi-role, stateful frontend work, and a foundation for the later backend phase.

## Positioning

One system, four role surfaces, one shared simulated state: the same order moves QR → cart → kitchen docket → cashier bill → admin report, so the restaurant's real operating chain (Restaurant → Branch → Table → Table Session → Order → Order Items, PRD §5) is visible and coherent in the UI before any backend exists. A neighboring product could copy screens; the position is the end-to-end simulated operation with kitchen-grade readability (status triplets, live timers, glanceable dockets) in a warm hospitality visual language rather than industrial dashboard chrome.

## Operating Context

- Single Next.js 16 (App Router) web app; all four role surfaces live in one codebase under `/order`, `/staff`, `/admin`, with a role-picker landing at `/`.
- Usage scene: guests on personal phones at the table; staff on shared screens under service pressure (kitchen pass, cashier counter) — surfaces must be read in one glance.
- Source of truth for scope and flows: `planning/restaurant-qr-ordering-pos-prd.md`. Visual system: root `DESIGN.md` (Warm Ember world). Static reference mockups: `templete/`.
- Data today: `lib/mock-data.ts` + `lib/store.tsx` (client state). An early, exploratory backend scaffolding exists from the future backend phase (Prisma 7 + Supabase: `prisma/schema.prisma`, `prisma/seed.ts`, `prisma7.config.ts`, `.env` with DATABASE_URL/DIRECT_URL); it is not yet wired to the UI.

## Capabilities and Constraints

- **In scope (prototype):** customer QR ordering, product detail + modifiers, cart, order confirmation/tracking, bill request; kitchen display; cashier POS/table panel/payment interface; admin for tables, QR, menu, categories, inventory, suppliers, orders, payments, sales dashboard, staff, shifts; responsive layouts; mock-data state simulation (PRD §27–28).
- **Explicit non-goals of the prototype phase (PRD §3):** production database, real Prisma/PostgreSQL integration in the UI, backend auth/authz, payment gateway, QR payment, WebSocket, Redis, notifications, printer/hardware POS, inventory sync, real transactions. All UI data is mock + frontend state.
- **Early backend phase (exploratory, user-started):** Prisma 7 + Supabase project scaffolding exists but is undecided in scope and not integrated; whether/when the full backend (PRD §39–40) proceeds is an open decision.
- **Terminology:** kitchen technical statuses stay English caps (NEW/ACCEPTED/PREPARING/READY); customer-facing copy is Bahasa Indonesia; currency is Rupiah.
- **Undecided:** production deployment target; real restaurant client vs. evergreen demo; backend phase timing.

## Brand Commitments

- **Product name:** RestoFlow (also the system wordmark). Demo venue in mock data: "RestoFlow Bistro", tagline "Dapur panas, layanan cepat", branches Cabang Senopati / Cabang Kelapa Gading.
- **Voice:** warm, operational, Bahasa Indonesia for guest- and staff-facing copy; crisp and glanceable under service pressure.
- **Assets:** `public/logo.png` wordmark (+ `public/favicon.png` glyph crop); brand renders via `components/brand-logo.tsx`.
- **Visual identity** is owned by root `DESIGN.md` (Warm Ember world) — do not restyle without a deliberate system decision.

## Evidence on Hand

- `planning/restaurant-qr-ordering-pos-prd.md` (~2000-line PRD: flows, requirements, mock-data minimums, acceptance criteria).
- `templete/` static HTML mockups + screenshots per role (customer, cashier, KDS, admin).
- `lib/mock-data.ts` + `lib/store.tsx` — the running simulated operation.
- `DESIGN.md` + `.impeccable/design.json` — recorded visual system.
- **Absences future work must not fabricate:** no real customers, testimonials, revenue figures, performance benchmarks, or commercial claims; demo figures (sales totals, order counts) are synthetic mock data.

## Product Principles

1. **Status is never color alone** — icon + label + color, everywhere, for every role.
2. **Glanceable under pressure** — kitchen and cashier screens are read in one glance during service; density is operational but humane.
3. **One simulated truth** — the same mock order and table session flow through customer, kitchen, cashier, and admin; no screen invents its own data.
4. **Prototype honesty** — simulated states are clearly simulated; no fake claims of real payments, auth, or hardware.
5. **Warm, not industrial** — hospitality warmth (porcelain + ember) over dashboard-sterile coldness; no restaurant clichés either.

## Accessibility & Inclusion

PRD §32 baseline: keyboard navigation, visible focus states, semantic HTML, accessible labels, sufficient contrast, accessible dialogs, form validation messages, and button states. Status must be understandable without color discrimination. No stricter product-specific standard has been set; treat WCAG AA contrast as the working floor.
