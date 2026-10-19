---
name: GustoPOS / RestoFlow
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#5a4138'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#8e7166'
  outline-variant: '#e2bfb2'
  surface-tint: '#a73a00'
  primary: '#a33900'
  on-primary: '#ffffff'
  primary-container: '#cc4900'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb599'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#006947'
  on-tertiary: '#ffffff'
  tertiary-container: '#00855b'
  on-tertiary-container: '#f5fff6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbce'
  primary-fixed-dim: '#ffb599'
  on-primary-fixed: '#370e00'
  on-primary-fixed-variant: '#7f2b00'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '800'
    lineHeight: 36px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
  tabular-nums:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style
The design system delivers an operational, high-efficiency interface engineered for restaurant points of sale (POS), Kitchen Display Systems (KDS), and floor management suites. It merges culinary warmth with military-grade operational clarity. The visual language balances high-speed ergonomic affordances with appetizing, modern hospitality aesthetics.

Targeting line cooks, floor managers, baristas, and diners interacting via self-order kiosks, the UI evokes speed, confidence, and culinary delight. The design style combines **Tactile Modernism** with **High-Contrast Utilitarianism**: ultra-crisp edge definition, rich chromatic status coding, punchy touch targets, and balanced typographic hierarchy optimized to survive harsh glare and rapid-fire input.

## Colors
The palette is structured to communicate urgency, status, and culinary appeal instantly across the dining room and kitchen line.

- **Primary (`#EA580C` - Warm Ember):** Drives primary actions, fire/send order commands, brand callouts, and key interaction triggers.
- **Secondary (`#0F172A` - Deep Slate):** Delivers dominant structural framing, ticket headers, primary text, and dark-mode kiosk chrome.
- **Tertiary (`#10B981` - Emerald Ready):** Signals successful payment, bumped tickets, completed courses, and kitchen fulfillment.
- **Warning / In-Progress (`#F59E0B` - Amber Simmer):** Reserved for tickets pending cook time, course holds, and incoming delivery integrations.
- **Neutral Canvas (`#F8FAFC` - Crisp Porcelain):** High-clarity, non-reflective base that reduces eye fatigue under industrial kitchen fluorescents.
- **Borders & Dividers (`#E2E8F0` / `#CBD5E1`):** Subtle structural boundaries that preserve module density without visual noise.

## Typography
Typographic scale balances the inviting geometry of **Plus Jakarta Sans** for display elements, table numbers, totals, and buttons, with the neutral, hyper-legible execution of **Inter** for dense order tickets, modifier trees, and ingredients.

All numerical elements (totals, SKU counts, cook timers, guest counts) must activate OpenType tabular numbers (`tnum`) to eliminate layout jitter when quantities or times tick upward. Modifier lines use reduced visual weight and indentation to preserve scannability during peak kitchen rushes.

## Layout & Spacing
The layout adheres to a flexible 12-column grid on desktop and widescreen KDS displays, pivoting to an ergonomic dual-pane split on 10-12" POS tablets (40% ticket cart / 60% menu matrix) and a single-column stacked view on handheld waiter devices.

Touch targets maintain an absolute minimum hit-box of 48x48px (ideally 56px for primary register actions). Spacing relies on compact multiples of 4px to accommodate high-density menu trees and complex split-bill tables without vertical overflow. Modifiers collapse into compact sub-grids with minimal margins (`space-xs` and `space-sm`) to maximize visible ticket volume on kitchen stations.

## Elevation & Depth
Depth in the system is utilitarian and functional rather than decorative, designed to combat glare and fingerprint smudges on touchscreens:

- **Surface Base:** Flat porcelain (`#F8FAFC`) with razor-thin structural borders (`1px solid #E2E8F0`).
- **Surface Raised (Menu & Ticket Cards):** Pure white (`#FFFFFF`) with a subtle ambient falloff (`0 2px 4px -1px rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)`) and an active border outline.
- **Surface Floating (Action Sheets, Modals, Flyouts):** Soft directional depth (`0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -2px rgba(15, 23, 42, 0.05)`).
- **Physical Press State:** Immediate mechanical depression—cards and buttons translate downward by 1px on tap with box-shadow collapse to deliver tactile confirmation during high-speed input.

## Shapes
A roundedness level of `2` provides a modern, friendly touch without sacrificing layout compactness:
- **Base Components (0.5rem / 8px):** Menu item tiles, inputs, modal dialogs, and table markers.
- **Large Components (1rem / 16px):** Order ticket cards, floorplan zones, and sliding checkouts.
- **Pills / Fully Rounded:** Status indicators, order timer tags, category filter chips, and circular quantity increment steppers.

## Components

### Buttons
- **Primary Action (Send/Pay/Fire):** Warm Ember background (`#EA580C`), white typography, bold Plus Jakarta Sans label, 52px height minimum on POS terminals, 1px slight inner border highlight.
- **Kitchen Action / Bump:** Emerald Ready (`#10B981`) solid pill or rounded block, built for quick single-tap dismissal.
- **Secondary / Utility:** Crisp white surface with `#E2E8F0` border and `#0F172A` text; active state shifts to subtle slate tint.

### Status Badges & Chips
- **Amber Pending (`#F59E0B`):** Soft amber tinted base (`#FEF3C7`) with high-contrast text (`#92400E`) and left-aligned pulsating indicator for live timers exceeding threshold.
- **Emerald Ready (`#10B981`):** Soft emerald base (`#D1FAE5`) with dark forest text (`#065F46`).
- **Category Chips:** Horizontal swipeable track, 40px height, pill-shaped, neutral default styling switching to Deep Slate solid fill when selected.

### Food & Item Cards
- High-contrast tile featuring an optional top-aligned 1:1 appetizing image or pure bold typographic title for quick scans.
- Price displayed in bold tabular figures at bottom right; visual modifier badge at bottom left indicating inventory (e.g., "8 left" or "86'd" in muted gray).

### KDS Ticket Columns
- Header coded by order channel (Dine-in, Takeout, Delivery) in solid Deep Slate with tabular clock display.
- Body item list with cross-out affordance per dish, indentations for special instructions in vibrant Warm Ember (`NO ONIONS`).
- Persistent bottom footer containing action bump trigger.

### Inputs & Quantity Steppers
- Big-stepper counter controls (- / +) with minimum 44px tap dimension.
- Clean text input fields with persistent label floating, solid `#CBD5E1` resting border, and an Ember `#EA580C` focus ring with 2px offset.