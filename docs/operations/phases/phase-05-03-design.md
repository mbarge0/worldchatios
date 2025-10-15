## Phase Context
- **Phase:** 05 — Supermodule: Pre-AI Reliability, Persistence, Auth & Advanced Features (A1–A5)
- **Date:** 2025-10-15
- **Design Scope:** Visual/interaction specs for A3 (Authentication & Canvas UI Polish) and A4 (Advanced Features Suite), plus affordances for A1–A2 status indications and A5 helper-driven actions. No code yet.
- **References:**
  - PRD: `/docs/foundation/prd.md` (§2 MVP, §4 Final)
  - Architecture: `/docs/foundation/architecture.md` (§4 Data Flow, §6 Security/Performance)
  - Checklist: `/docs/foundation/dev_checklist.md` (Modules A1–A5)

---

## Visual Objectives
- Modern, minimal canvas-first UI with clear hierarchy.
- Consistent 8px spacing grid; smooth 60 FPS-friendly visuals.
- WCAG AA contrast and fully keyboard navigable.
- Subtle motion (120–200 ms, ease-out) for focus/hover/toolbar open.
- Highly legible typography and unobtrusive chrome that emphasizes the canvas.

---

## Layout Description

### Canvas Route Frame

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Header (auth status, share, presence avatars)                            │ 56px
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Page Frame (light bg with blue outline when canvas focused)             │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                                                                    │  │
│  │                          Konva Stage                               │  │
│  │                                                                    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│ Bottom Toolbar (floating/docked, centered)                               │ 48px
└──────────────────────────────────────────────────────────────────────────┘
```

Spacing & Positioning:
- Header fixed at top; 16px horizontal padding; avatars right-aligned with 8px gaps.
- Page Frame uses 24px outer margin; subtle shadow at edges; focus outline `#3B82F6` (blue-500) 2px.
- Toolbar centered horizontally 16px above bottom edge of Page Frame; 12px between grouped controls.

### Login Page (Two-Column)

```
┌──────────────────────────────────────────────┐
│  Left: Hero image (50%)  │ Right: Auth Card │
│                         │ ┌───────────────┐ │
│                         │ │   Sign in     │ │
│                         │ │  [email]      │ │
│                         │ │  [password]   │ │
│                         │ │ (or MagicLink)│ │
│                         │ │ [Sign In]     │ │
│                         │ │ [Use Magic]   │ │
│                         │ └───────────────┘ │
└──────────────────────────────────────────────┘
```

Auth Card: 480px max width, 24px padding, 12px field spacing, clear focus rings. Hero overlays a gradient for readable contrast.

---

## Component Specifications

### Bottom Toolbar
- Structure: rounded container (16px radius), subtle shadow (sm), glassy background (`bg-white/80` with backdrop blur).
- Groups (left→right): Select, Rectangle, Text, Duplicate, Delete, Align menu, Z-Index menu, Grid toggle, Snap toggle (if separate), Export (menu), Version (menu).
- States per control: default (rest), hover (+2% tint), active (blue-500 text/icon), focus (2px ring blue-500), disabled (opacity-40 cursor-not-allowed).
- Tooltips: `top` placement, 8px offset; include shortcut hints (e.g., “Delete — Del”).
- Motion: fade+scale from 98% to 100% in 140 ms on show; menu open/close slide-fade 140 ms.

### Page Frame & Smart Guides
- Page background: `#F5F7FB` light neutral; canvas center gradient radial at 4% opacity for depth.
- Focus outline: 2px blue-500 when the stage is active; disappears on external focus.
- Grid overlay: 8px spacing, ultra-light lines (`#E5E7EB` gray-200) with 40% opacity.
- Smart guides: magenta/purple (`#A855F7`) 2px solid lines; appear only during drag/resize; fade out 120 ms on release.

### Alignment & Z-Index Menus
- Alignment menu: icons for Left, Center-X, Right, Top, Middle-Y, Bottom; Distribute H/V separated by divider.
- Z-Index menu: Bring to Front, Send to Back, Step Forward, Step Back; show current index in tooltip.
- Menu surface: 8px padding; 8px gap; keyboard navigable with arrow keys and Enter.

### Export Menu
- Options: Canvas PNG (scale selector 1x, 2x, 4x), Selection PNG, SVG (canvas/selection if applicable).
- Download feedback: toast “Exported PNG (2x)” with dismiss after 2.5s.

### Connection Status Chip (A2)
- Location: header right near avatars; pill with dot (green=connected, yellow=reconnecting, gray=offline).
- Tooltip explains state and last sync (relative time) when available.

### Login Page Components
- Inputs: large, 44px height, clear labels; helper/error text below.
- Primary button: orange accent for emphasis (`#F97316`) per screenshot reference; hover darkens 6%.
- Secondary link-style for Magic Link; remembers last-used method per local storage.
- Social icons optional placeholders (not functional in this phase).
- States: default, hover, focus ring (blue-500), disabled (loading).

---

## Color & Typography System

### Color Tokens (Tailwind semantics)
- Primary: `blue-500 #3B82F6` (focus outlines, active toolbar)
- Accent: `indigo-500 #6366F1` (smart guides alt) / `purple-500 #A855F7` (guides)
- Success: `green-500 #22C55E` (connected chip)
- Warning: `amber-500 #F59E0B` (reconnecting chip)
- Muted: `gray-200 #E5E7EB`, `gray-300 #D1D5DB`, `gray-600 #4B5563`, `gray-800 #1F2937`
- Canvas bg: `#F5F7FB`
- Toolbar bg: `white/80` with backdrop blur
- Auth primary: `orange-500 #F97316` (login CTA)

### Typography
- Base: Inter, system-ui; `text-[15px]` base, 1.5 line-height.
- Headings: `text-2xl`/`font-semibold` for Auth card title; toolbar labels `text-xs` in tooltips.
- Numbers: tabular-nums for indices/scales in menus.

### Spacing & Radius
- 8px grid: 8/12/16/24/32 spacing steps.
- Radius: toolbar 16px; menus 12px; inputs 10px.

---

## Responsive & Accessibility Guidelines

### Breakpoints
- Desktop ≥ 1280px: full layout as above.
- Tablet 768–1279px: toolbar condenses (group export/version into overflow menu); login switches to stacked (hero top, form below, 24px margins).
- Mobile ≤ 767px: toolbar becomes scrollable pill strip; page frame margins reduce to 12px; login full-width card with sticky actions.

### Accessibility
- Keyboard navigation: Tab cycles through toolbar items; arrow keys navigate within open menus; Esc closes menu.
- Focus rings: 2px blue-500 outer ring with 2px offset shadow; visible even on white backgrounds.
- Contrast: text/icons on toolbar meet AA (≥4.5:1); hero overlay ensures form text ≥7:1 over image.
- Motion: reduce-motion respects OS setting — disable scale transitions, use simple opacity fades.

---

## Design Assets Summary
- Components for build:
  - `Header` (avatars, share, connection chip)
  - `CanvasPageFrame` (bg, outline, margins)
  - `BottomToolbar` with menus (align, z-index, export, version)
  - `GridOverlay` and `SmartGuidesLayer`
  - `LoginCard` (email/password + magic link toggle)
  - `Toast` messages for exports
  - Icon set: Lucide (pointer, square, type, copy, trash, align*, layers*, grid, scan, download, history)

Token/Config:
- Tailwind tokens above, spacing grid, motion durations (120–200 ms), easing `ease-out`.

---

## Next Steps
- Confirm these assumptions:
  - Grid = 8px; snap radius = 6px; guides in purple-500.
  - Login CTA color uses `orange-500`; rest of app uses blue-500 for primary focus.
  - Toolbar is bottom-docked by default, can float if viewport height < 720px.
- If confirmed, proceed to Build Loop implementing A3 components, then A4 features, wiring A1–A2 indicators and A5 helpers.


