## Design — Supermodule D: Multiplayer Cursors, Presence Awareness & UI Refresh

### Phase Context
- **Phase**: Supermodule D — Modules #11–#12 Consolidation (Final MVP polish and multiplayer UX)
- **Date**: Oct 15, 2025
- **Design Scope**: T1 (Multiplayer cursors), T2 (Presence UI), T3 (UI refresh for Home/Login + Canvas)
- **References**: PRD (`/docs/foundation/prd.md`), Architecture (`/docs/foundation/architecture.md`), UI Guidelines (`/docs/operations/ui_guidelines.md`), Prior Handoff (`/docs/operations/phases/sm-c-06-handoff.md`)

---

### Visual Objectives
- Clarity first: reduce cognitive load with a minimal, neutral UI and a single accent.
- Motion as feedback: subtle (100–200 ms) transitions that reinforce hierarchy and state.
- Strong hierarchy: consistent spacing, typography scale, and elevation to guide focus.
- Multiplayer legibility: labeled cursors readable on light and busy canvases.
- Accessibility: WCAG AA contrast, visible focus, keyboard navigable core flows.

---

### Layout Description

#### A) Home/Login
Centered authentication card with soft elevation on a neutral background.

Wireframe (desktop ≥ 1024):
```
┌───────────────────────────────────────────────────────────────────────┐
│ Header (minimal, left: logo)                                          │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│                    [ CollabCanvas ]                                   │
│                 Design together, in real time.                        │
│                                                                       │
│             ┌────────────────────────────────────┐                    │
│             │  Email address [______________]    │                    │
│             │  Password      [______________]    │                    │
│             │  [ Sign in ]   (accent)            │                    │
│             │  — or —                           │                    │
│             │  [ Send magic link ] (secondary)   │                    │
│             └────────────────────────────────────┘                    │
│                                                                       │
│                             Footer links                              │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

Spacing: 8px grid; outer container `py-24 md:py-32`, card padding `p-6 md:p-8`, elements `space-y-4`.
Elevation: card uses subtle shadow (1–2 dp) and border for contrast on light bg.

Tablet (≥ 768): same layout, reduced paddings (`py-16`, card `p-6`).

#### B) Canvas
Primary workspace with a compact header and expansive canvas area.

Wireframe (desktop ≥ 1024):
```
┌ Header (surface-elevated) ────────────────────────────────────────────┐
│ [Toolbar: +Rect  +Text  (future: Undo/Redo disabled)]   [PresenceBar] │
└───────────────────────────────────────────────────────────────────────┘
┌ Canvas Container (surface) ────────────────────────────────────────────┐
│ [Konva Stage fills area]                                               │
│  • Selection bounds + handles                                          │
│  • Remote cursors with name labels (sticky above pointer)              │
│  • Zoom/pan preserve readable label scale (min font-size 11–12 px)     │
└───────────────────────────────────────────────────────────────────────┘
```

Header height: 56 px desktop, 52 px tablet. Canvas fills remaining viewport with `overflow-hidden`, background subtle grid optional (very light, non-distracting).

PresenceBar location: header right, horizontal list of avatars/initials; hover tooltips reveal full name/email.

---

### Component Specifications

#### 1) CursorLayer (Multiplayer cursors)
- Structure: pointer glyph + label chip (name). Label offset: 10–12 px from pointer tip.
- Label style: rounded pill with subtle shadow and 90% opaque background for legibility on shapes.
- Colors: per-user color applied to pointer and label border; text stays high-contrast.
- Motion: position updates interpolate linearly to last-known target; update at ~20 Hz inputs.
- States:
  - Default: visible pointer + label.
  - Idle (> 2 min): fade label to 60% opacity; pointer 40%.
  - Disconnected: remove immediately.

#### 2) PresenceBar
- Structure: row of 24–28 px avatars (initials-only; photos added post-MVP), `space-x-2`.
- States:
  - Online: full color, tooltip on hover.
  - Idle: 60–70% opacity.
  - Hover: scale 1.05 with 120 ms ease-out; tooltip reveals `displayName` and email.

#### 3) Toolbar (Canvas)
- Primary actions: `+Rect`, `+Text` (accent button variants). Future commands appear as ghost buttons.
- States: default, hover (bg subtle), active/pressed (stronger bg/border), focus (visible ring), disabled (reduced contrast, no shadow).
- Density: 40–44 px button height, icon size 18–20 px, label optional.

#### 4) LoginCard
- Inputs: labeled, helper text for errors. Submit button accent, magic-link as secondary.
- States: focus ring visible, invalid state with clear message and icon, disabled while submitting.
- Motion: fade/slide-in on page load (120–160 ms), button hover transitions.

#### 5) Toast & Spinner
- Toast: non-blocking bottom-right; success (accent), error (red), info (neutral).
- Spinner: minimal ring, contrasts against both surface and elevated backgrounds.

---

### Color & Typography System

Neutral-first palette with one accent (Tailwind tokens). All colors ensure AA contrast.

Color tokens (light mode):
- `--bg` = `slate-50`
- `--surface` = `white`
- `--surface-elevated` = `slate-100`
- `--border` = `slate-200`
- `--text` = `slate-900`
- `--text-muted` = `slate-600`
- `--accent` = `indigo-500`
- `--accent-hover` = `indigo-600`
- `--danger` = `rose-500`

Cursor color pool (per-user assignment, stable): `rose-500`, `orange-500`, `amber-500`, `lime-500`, `emerald-500`, `cyan-500`, `blue-500`, `violet-500`.

Typography:
- Font: Tailwind default `font-sans`.
- Scale: `text-xs` (12), `sm` (14), `base` (16), `lg` (18), `xl` (20), `2xl` (24).
- Weights: 400 (body), 500 (buttons), 600 (headings).
- Line-height: 1.4–1.6 for body; headings tighter at 1.2–1.3.

Spacing & Radius:
- 8 px base grid; fine adjustments in 4 px when necessary.
- Radius: `rounded-md` (6 px) for inputs/buttons; `rounded-lg` (8–10 px) for cards/labels.

Elevation & Borders:
- Cards: subtle shadow + `border` with neutral tone.
- Active surfaces (toolbar): stronger border contrast on hover/active.

Motion:
- Durations: 120–200 ms; `ease-out` on enter/hover, `ease-in` on exit; `ease-in-out` for state toggles.
- Cursor label following: no spring; linear interpolation to avoid overshoot.

---

### Responsive & Accessibility Guidelines

Breakpoints:
- Tablet target: ≥ 768 px; Desktop: ≥ 1024 px. Mobile is non-goal for canvas; login remains usable ≥ 360 px.

Adaptive rules:
- Header switches to tighter spacing on tablet; presence avatars reduce to 20–24 px and scroll horizontally if overflow.
- Canvas label font floors at 11–12 px to stay legible during zoom out.
- Login card width: 360–420 px on tablet/desktop; full-bleed with generous paddings on small screens.

Accessibility:
- Focus rings: `ring-2 ring-offset-2 ring-[--accent]` visible on all interactive elements.
- Contrast: text vs surface ≥ 4.5:1; buttons ≥ 3:1; label text over cursor chip uses near-opaque chip backgrounds.
- Keyboard: tab order logical; Escape closes modals; Enter submits forms.
- Tooltips: on hover and focus (for keyboard users) with `aria-describedby`.

---

### Component Hierarchy

```
App
├─ Home/Login
│  └─ LoginCard
│     ├─ Input(email)
│     ├─ Input(password)
│     ├─ Button(Sign in)
│     └─ Button(Magic link)
└─ Canvas Page
   ├─ Header
   │  ├─ Toolbar
   │  └─ PresenceBar
   └─ CanvasContainer
      ├─ KonvaStage
      │  ├─ ShapeLayer
      │  ├─ SelectionLayer
      │  └─ CursorLayer
      └─ TextEditModal (as needed)
```

---

### State & Interaction Details

Buttons (Toolbar/Login):
- Hover: bg `slate-100` (neutral) or `indigo-50` (accent), 120 ms.
- Active: bg `slate-200` or `indigo-100`, pressed depth; remove shadow.
- Focus: visible ring with accent; maintain contrast on all surfaces.
- Disabled: 40–50% opacity; cursor not-allowed; no hover transitions.

Presence Avatars:
- Hover: scale 1.05, tooltip with name/email.
- Idle: 60–70% opacity after 2 min inactivity.

Cursors:
- Interpolation: lerp toward latest target each frame; clamp max delta per frame to avoid teleporting.
- Label collision: small offset if overlapping another label (basic avoidance, optional for MVP).

Inputs (Login):
- Focus ring accent; invalid shows `text-rose-600` message and subtle border change.

---

### Design Assets Summary
- Build-ready components:
  - `CursorLayer` (pointer + labeled chip)
  - `PresenceBar` (avatars/initials with idle states + tooltips)
  - `Header` (toolbar left, presence right)
  - `Toolbar` (accent/ghost variants)
  - `LoginCard` (inputs, buttons, error states)
  - `Toast`/`Spinner` usage guidelines
- Iconography: Lucide icons for toolbar and status.
- Animation: Framer Motion optional for page/card fade/slide; CSS transitions sufficient for controls.

---

### Next Steps
Decisions locked:
- Accent color: `indigo-500` (hover `indigo-600`).
- PresenceBar: header-right.
- Avatars: initials-only for MVP; photos later.
- Cursor label chip background: 90% opacity.
- Header heights: 56 px (desktop), 52 px (tablet).
- Tablet minimum width: 768 px (mobile canvas out-of-scope).

No outstanding confirmations. Proceed to generate tokens, finalize component props, and hand off to Build.


