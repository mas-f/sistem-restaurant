---
name: RestoFlow Bistro — QR Ordering & POS
description: Warm Ember ops suite for restaurant QR ordering, kitchen display, cashier POS, and admin analytics
colors:
  primary: "#ea580c"
  primary-foreground: "#ffffff"
  background: "#f8fafc"
  foreground: "#0f172a"
  card: "#ffffff"
  card-foreground: "#0f172a"
  secondary: "#f1f5f9"
  muted: "#f1f5f9"
  muted-foreground: "#475569"
  accent: "#ffedd5"
  accent-foreground: "#9a3412"
  border: "#e2e8f0"
  input: "#cbd5e1"
  ring: "#ea580c"
  destructive: "#dc2626"
  status-available: "#10b981"
  status-available-bg: "#d1fae5"
  status-available-fg: "#065f46"
  status-occupied: "#ea580c"
  status-occupied-bg: "#ffedd5"
  status-occupied-fg: "#9a3412"
  status-waiting: "#f59e0b"
  status-waiting-bg: "#fef3c7"
  status-waiting-fg: "#92400e"
  status-preparing: "#f59e0b"
  status-preparing-bg: "#fef3c7"
  status-preparing-fg: "#92400e"
  status-ready: "#10b981"
  status-ready-bg: "#d1fae5"
  status-ready-fg: "#065f46"
  status-error: "#dc2626"
  status-error-bg: "#fee2e2"
  status-error-fg: "#991b1b"
  sidebar: "#0f172a"
  sidebar-accent: "#1e293b"
  sidebar-primary: "#ea580c"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, Inter, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1.15
  headline:
    fontFamily: "Plus Jakarta Sans, Inter, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.2
  title:
    fontFamily: "Plus Jakarta Sans, Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 800
    lineHeight: 1.3
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.01em"
  micro:
    fontFamily: "Inter, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1.3
rounded:
  sm: "4.8px"
  md: "6.4px"
  lg: "8px"
  xl: "11.2px"
  "2xl": "14.4px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "rgba(234, 88, 12, 0.9)"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  button-outline:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  chip:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  chip-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.xl}"
    padding: "16px"
  status-badge:
    backgroundColor: "{colors.status-available-bg}"
    textColor: "{colors.status-available-fg}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
---

# Design System: RestoFlow Bistro

## Overview

**Creative North Star: "The Warm Pass"**

RestoFlow is an operations suite dressed as hospitality: the mental model is the
kitchen pass during service — dockets line up, timers tick, statuses flip — but
the surfaces stay warm and porcelain-clean instead of industrial gray. Every
screen is built to be read in one glance under pressure: a status triplet
(icon + label + color), tabular numbers that never jitter, and one ember accent
that always means "act here". The system refuses dashboard-sterile coldness and
equally refuses restaurant-cliché decoration (no food photography, no script
fonts, no gingham): warmth comes from color temperature and rounded, tactile
geometry, not ornament.

Density is operational but humane — staff screens (kitchen, cashier, admin) pack
more per viewport with sticky chrome and multi-column grids; customer screens
stay airy, single-column, and thumb-first. Depth is almost flat at rest: thin
slate borders and a whisper of two-layer offset shadow, with lift reserved for
hover and the floating cart bar. Motion is one authored moment — a soft
decelerating rise — so live data updates feel alive without becoming a casino.

**Key Characteristics:**
- One ember accent (`#ea580c`) for primary action and "your table is occupied"
- Status is never color alone: icon + label + color, always, everywhere
- Tabular numerals on every price, timer, and quantity
- Pill geometry for anything tappable; gently rounded rects (11.2px) for surfaces
- Warm porcelain canvas (`#f8fafc`), white cards, thin slate borders (`#e2e8f0`)
- Plus Jakarta Sans headings against Inter body — confident, not corporate

## Colors

The palette is warm-neutral with a single ember accent and a small, strictly
semantic status set.

### Primary
- **Hearth Ember** (`#ea580c`): every primary action — add-to-cart, send order,
  pay, active filter pills, focus rings, caret color, active sidebar item. Also
  the `OCCUPIED` status color, because a table occupied by *you* is your action
  context.
- **Ember Tint** (`#ffedd5` with `#9a3412` text): soft version for table badges
  ("Meja A01"), occupied status chips, and tinted highlights where full ember
  would shout.

### Neutral
- **Porcelain** (`#f8fafc`): page canvas under everything.
- **Ink Slate** (`#0f172a`): all primary text, plus the admin sidebar slab and
  the darkest chart color.
- **Slate Sheet** (`#ffffff`): cards, dialogs, sticky headers — the working surface.
- **Slate Mist** (`#f1f5f9`): secondary/muted fills — inactive chips, card header
  strips, empty-state wells.
- **Slate Copy** (`#475569`): secondary text; **Hairline Slate** (`#e2e8f0`): the
  1px border that separates every surface.

### Status (PRD §26 — semantic, never decorative)
- **Service Green** (`#10b981` / bg `#d1fae5` / fg `#065f46`): AVAILABLE, READY,
  paid, "siap".
- **Hold Amber** (`#f59e0b` / bg `#fef3c7` / fg `#92400e`): WAITING_PAYMENT,
  PREPARING, timers nearing urgency.
- **Signal Red** (`#dc2626` / bg `#fee2e2` / fg `#991b1b`): errors, overdue
  kitchen tickets, low stock.

### Named Rules
**The Status Triplet Rule.** A status may never be communicated by color alone.
Every status indicator ships as icon + text label + color, on light or dark
surface, in every role's view.

**The Ember Scarcity Rule.** Hearth Ember marks action or your own occupancy —
never a decorative background, never a large fill, never body text. If a screen
looks orange, something on it is asking to be tapped.

## Typography

**Display / Headline Font:** Plus Jakarta Sans (weights 500–800, variable
`--font-heading`) with Inter fallback
**Body Font:** Inter (variable `--font-sans`) with system-ui fallback

**Character:** Plus Jakarta Sans gives headings a wide, friendly confidence that
reads warm at extrabold weights; Inter keeps dense operational data neutral and
legible. Numerals are tabular everywhere data is compared.

### Hierarchy
- **Display** (800, 1.875rem, 1.15): hero numbers — sales totals, KPI values.
- **Headline** (800, 1.5rem, 1.2): page titles (`Dashboard`, `Orders`,
  `Kitchen Display`), with `text-balance` on all heading tags.
- **Title** (700–800, 0.875–1rem, 1.3): section and card titles (`Pesanan
  Aktif`, `Rincian Pesanan`), often extrabold at `text-sm`.
- **Body** (400, 0.875rem, 1.5): descriptions, list copy, table cells.
- **Label** (700, 0.75rem, tracking-wide): micro-labels, filter chips, uppercase
  kickers (`RINGKASAN`, `MEJA & MENU`), status badges.
- **Micro** (700, 11px, 1.3): the one step below Label — promo/sold-out badge
  pills, sidebar role sublines, kitchen order codes and station tags. Never go
  smaller; it is the floor of legibility.

### Named Rules
**The Tabular Rule.** Any number a user compares across rows or watches tick —
prices, timers, quantities, stock, seat counts — renders with `font-variant-numeric:
tabular-nums` (the `tnum` utility). Proportional digits are only for prose.

## Layout

Mobile-first single column; grids unlock at breakpoints (Tailwind `sm` 640,
`lg` 1024, `xl` 1280).

- **Customer screens**: centered `max-w-lg` (512px) column — menu, cart,
  tracking. Product grid `grid-cols-2` → `sm:grid-cols-3`. Header is a card
  strip with restaurant identity left, table badge right.
- **Kitchen**: sticky header + horizontally scrolling station chips, then
  `lg:grid-cols-4` status columns (Baru → Diterima → Memasak → Siap) with a
  sticky footer of live counts.
- **Cashier**: `lg:grid-cols-[1fr_400px]` — table tiles left
  (`grid-cols-2 sm:grid-cols-3 xl:grid-cols-4`), bill panel right.
- **Admin**: fixed dark sidebar `w-60` (desktop) / drawer `w-64` (mobile, with
  sticky top bar), content `p-4 lg:p-6`; KPI grid `grid-cols-2 xl:grid-cols-4`.
- **Rhythm**: 16px card padding and 16px grid gaps dominate; 4/8/12px for
  internal stacking. Dense data tables scroll horizontally inside their card
  rather than squashing columns. Filter chip rows scroll horizontally with
  hidden scrollbars.

## Elevation & Depth

Flat by default, lifted by exception. Surfaces separate through porcelain-vs-white
tonal contrast and 1px hairline borders; shadows exist only as a soft two-layer
offset that barely lifts cards off the canvas, with stronger treatments reserved
for hover, dialogs, and the floating cart action.

### Shadow Vocabulary
- **Card rest** (`0 2px 4px -1px rgba(15,23,42,0.06), 0 1px 2px -1px rgba(15,23,42,0.04)`):
  menu tiles, KPI cards, kitchen dockets — the default "on the counter" look.
- **Card hover** (rest shadow + `translateY(-2px)`): interactive table tiles and
  product cards only.
- **Ember float** (`0 10px 25px -5px rgba(234,88,12,0.5)`): the floating cart /
  primary action bar — the only glowing shadow in the system.
- **Overlay** (Tailwind `shadow-md` / `shadow-xl`): dialogs, drawers, toasts.

### Named Rules
**The Flat-At-Rest Rule.** Nothing casts a shadow as decoration. At rest a card
is separated by border and tone; shadow appears only under hover, overlay, or a
genuinely floating element.

## Shapes

Rounded-but-not-bubbly: an 8px base radius (`--radius: 0.5rem`) scales through
`4.8 / 6.4 / 8 / 11.2 / 14.4px`. Cards and panels live at `11.2px` (rounded-xl);
small wells and sidebar items at `8px`; inputs and secondary buttons round to
`8px`–pill. Everything tappable and status-bearing is a full pill (`9999px`) —
buttons, filter chips, status badges, table-code chips — so "pill = action or
state" is a readable silhouette. Borders are always 1px `#e2e8f0` (or
`rgba` equivalents on the dark sidebar); no double borders, no dashed borders
except empty-state wells, which dash deliberately to signal "nothing here yet".

## Components

### Brand Mark
- **Asset:** `public/logo.png` — ember-orange wordmark on transparent, 500×500
  canvas with the glyph in a 370×102 middle band (exact aspect 185:51).
- **Render:** `components/brand-logo.tsx` (`BrandLogo`) — containerless: a
  `relative aspect-[185/51] overflow-hidden` span with `<Image fill
  object-cover>` crops away the canvas padding; height comes from context.
- **Heights:** `h-7` in staff headers and the customer menu header, `h-5` in
  secondary headers (cart, tracking, order success, QR page), `h-12` on the
  landing hero.
- **Favicon:** `public/favicon.png` — 512×512 square crop of the first glyph,
  wired via `metadata.icons.icon` in `app/layout.tsx`.

### Buttons
- **Shape:** full pill (`9999px`); heights 32–48px by context (`h-8` chips,
  `h-9`/`h-10` in forms, `h-12` for customer CTAs).
- **Primary:** Hearth Ember fill, white extrabold label, hover `ember@90%`,
  `focus-visible:ring-2 ring-ring` with offset; `active:translate-y-px` for a
  press-down feel.
- **Outline / Ghost:** white fill, 1px hairline border, Ink Slate label, hover
  `Slate Mist` fill. Used for "Pesan Lagi", "Batal", station filters.
- Customer CTAs are large (`h-12`, `text-sm font-bold`) and often full-width;
  staff CTAs are compact (`h-8/h-9`, `text-xs/sm font-bold`).

### Chips
- **Style:** pill, 1px border, `8px 14px` padding, `text-xs/sm font-bold`.
- **State:** active = Hearth Ember fill + white label; inactive = white fill +
  hairline border; count rides after the label in tabular numerals at 70% opacity.
- Category chips (menu) and station/status filters (kitchen, cashier) are the
  same component.

### Cards / Containers
- **Corner Style:** `11.2px` (rounded-xl).
- **Background:** white on porcelain; header strips may use `Slate Mist`.
- **Shadow Strategy:** Card rest (see Elevation); hover lift only when the whole
  card is clickable.
- **Border:** 1px `#e2e8f0`.
- **Internal Padding:** 16px (`p-4`), 20px (`p-5`) for KPI/analytics cards.

### Inputs / Fields
- **Style:** search fields are pill (`9999px`) with hairline border, leading
  search icon, `h-9`; form fields (dialog selects) are `8px` radius with
  `#cbd5e1` border.
- **Focus:** Hearth Ember ring (`ring-2 ring-ring/40` + border shift) — never a
  browser-blue default.
- **Selection/caret:** ember (`caret-color: var(--primary)`,
  `::selection` at ember 24%).

### Navigation
- **Admin sidebar:** Ink Slate slab (`w-60`), uppercase `11px` group kickers,
  800-weight brand block; active item = Ember fill with white icon+label, idle =
  `white@85%` on slab, hover = `#1e293b`. Footer holds branch + user in a
  rounded `sidebar-accent` well. Mobile collapses to a sticky top bar + drawer.
- **Customer:** no nav chrome — back button + table badge header; bottom-fixed
  action bar (cart / bill request) with backdrop blur.

### Status Triplet (signature)
The system's atomic unit: a pill or row combining a Lucide icon, a text label
(`Tersedia`, `Menunggu Bayar`, `PREPARING`), and a semantic color from the Status
palette — in its compact form (icon + label, 11–12px) and full form (icon +
label on tinted background). Technical statuses inside kitchen flow stay English
caps (`NEW/ACCEPTED/PREPARING/READY`); customer-facing labels are Bahasa.

### Kitchen Docket (signature)
The kitchen ticket: card with a colored header strip (amber when overdue ≥12 min,
mist otherwise), table code + order number + live `mm:ss` timer top-right
(turns red chip when urgent), items separated by hairlines with station tags
(Wok/Grill/Bar) and ember-colored modifier notes, then a full-width action pill
that names the next step (`Terima` → `Mulai Masak` → `Tandai Siap` → `Selesai`).

### Table Tile (cashier, signature)
Compact card: table code extrabold + compact status top-right, seat/area line,
then status triplet left with live occupancy minutes right; selected tile gets
an Ember border + ring. Rows wrap so long labels ("Menunggu Bayar") never collide
with the timer.

## Do's and Don'ts

### Do:
- **Do** pair every status color with an icon and a text label (Status Triplet).
- **Do** use `tnum` tabular figures for prices, timers, quantities, stock, and
  seat counts.
- **Do** keep primary actions in Hearth Ember pills and everything tappable in
  pill geometry.
- **Do** separate surfaces with porcelain-vs-white tone plus a 1px `#e2e8f0`
  border before reaching for shadow.
- **Do** keep customer screens in the centered `max-w-lg` column and staff
  screens in their role's grid (kitchen 4-col, cashier 1fr+400px, admin sidebar).
- **Do** set headings in Plus Jakarta Sans at 800 and body in Inter at 14px.

### Don't:
- **Don't** communicate state with color alone — no bare colored dots or fills
  standing in for a status.
- **Don't** spend Hearth Ember on decoration: no orange page backgrounds, orange
  body text, or orange separators.
- **Don't** use proportional numerals in tables, timers, or price columns.
- **Don't** add shadows at rest, glows on ordinary cards, or a second accent
  gradient — the ember float is the only glowing treatment.
- **Don't** introduce food photography, script display faces, or ornamental
  textures; the warmth comes from temperature, type, and geometry.
- **Don't** shrink hit targets below 32px or truncate a status label — let the
  row wrap instead.
- **Don't** wrap the wordmark in a colored badge or recolor it — it ships bare
  at native ember orange, cropped to its 185:51 band.
