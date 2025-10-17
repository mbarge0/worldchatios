# Phase 13 — Tune-Up Sprint (UI + Brand Integration) — Plan Report

- Date: 2025-10-17
- Owner: Matt Barge
- Status: Planning Complete (Start → Plan → Design)

References:
- Previous Phase Summary: `/docs/operations/phases/phase-XX-03-reflect.md`
- PRD: `/docs/foundation/prd.md`
- Architecture: `/docs/foundation/architecture.md`
- Dev Checklist: `/docs/foundation/dev_checklist.md#module-13-tune-up-sprint-ui--brand-integration`
- Regression Manifest: `/docs/operations/regression/00_master_regression_manifest.md`

---

## Start Step (Phase Start Template)

### Phase Overview
- Phase: XX — Module #13: Tune-Up Sprint (UI + Brand Integration)
- Date: 2025-10-17
- Previous Phase Summary (Supermodule B — AI Agent, LangChain Orchestration, Voice & Brand UX):
  - Delivered a working AI loop end-to-end (chat → API → tools → canvas → Firestore → reply) with voice and persistence.
  - Stabilized via defaults and validation in `lib/ai/actions.ts` and ensured immediate UI via `lib/ai/bridge.ts`.
  - Applied initial brand palette and left-docked toolbar; added minimal E2E coverage.
  - Remaining opportunities: broaden tests, refine prompts/tool schemas, expand UI polish.

### Objectives and Deliverables for This Phase
- Final polish and performance tuning aligned with Matt’s brand.
- Visual refresh across login, toolbar, chat drawer, and canvas background/typography.
- Toolbar move → left (final), consolidate alignment controls, reduce footprint, improve hierarchy.
- Canvas improvements: smoother zoom/drag and viewport-centered shape spawn.
- Documentation cleanup (remove stale assets, update screenshots).

### Scope
Included:
- Submodule 13A: Brand tokens, login repaint, toolbar/chat palette, canvas background/typography, a11y pass.
- Submodule 13B: Toolbar left-dock finalization, grouped alignment, compact width, keyboard/tooltip hygiene.
- Submodule 13C: Konva perf tune, viewport-centered spawn, subtle grid/texture.
- Submodule 13D: Docs pruning and updated visuals.

Explicitly Excluded / Deferred:
- New AI features or orchestration changes.
- New shape types; complex theming framework migration.
- Undo/redo or layers panel.

### Risks and Assumptions
Assumptions:
- Brand palette: Dark Blue #072d51, Gold #cfa968, White #ffffff, Light Blue #cdd2c5 (per checklist).
- Current toolbar and chat drawer are implemented and can adopt tokens without breaking APIs.
- Konva performance optimizations achievable without data model changes.

Risks:
- Perf regressions from background/grid rendering.
- Color/contrast changes impacting accessibility.
- Toolbar consolidation altering discoverability of alignment actions.

Mitigations:
- Feature-flag or quick revert CSS variables; measure frame times before/after.
- Run axe checks and manual contrast review; keep token contrast guardrails.
- Provide tooltips/shortcuts and keep alignment menu icon affordance.

### Testing Focus (for this phase)
- Unit: alignment math, spawn position utilities.
- Integration: toolbar grouped controls; chat drawer theming states.
- E2E: login theming, canvas create-after-zoom spawns at viewport center; drag/zoom smoothness smoke; toolbar left docking.

### Implementation Plan (high level)
1) Establish brand tokens and global CSS variables; map to UI primitives.
2) Apply theme to login, toolbar, chat drawer; refresh canvas background/typography.
3) Refactor toolbar: left dock, group alignment controls, compress width.
4) Canvas perf and UX: Konva tune, viewport-centered spawn; optional subtle grid.
5) Docs cleanup and updated screenshots.

### Expected Outcome
- Unified brand across key surfaces; smoother canvas; clearer, smaller left toolbar; viewport-centered creation; docs current.

### Checkpoint Preparation (readiness)
- Dependencies reviewed (PRD/Architecture/Checklist). No blocking external deps.
- Acceptance criteria defined in dev checklist Module #13; testing hooks identified.
- Ready to proceed to Plan and Design steps.

---

## Plan Step (Planning Loop Template)

### Phase Context
- Module: #13 — Tune-Up Sprint (UI + Brand Integration)
- Reason for planning: Consolidate scope, order, estimates, dependencies, and regression coverage before implementation.

### Task Summary (from Dev Checklist mapping)
- Total Tasks: 14 (across 13A–13D)
- Priority Levels: P0 (brand tokens, toolbar left/group, perf + spawn), P1 (chat/login repaint), P2 (subtle grid, docs screenshots)
- Effort Estimate: ~24–32 hours (1–2 dev-days)

### Dependency Graph (text)
```
13A-1 Tokens → 13A-2 Login repaint, 13A-3 Toolbar/Chat theme, 13A-4 Canvas bg/typography → 13A-5 A11y
         └→ 13B-1 Toolbar left, 13B-2 Alignment group, 13B-3 Compact width → 13B-4 Keyboard/Tooltips
13C-1 Konva perf → 13C-4 Latency validation
13C-2 Viewport-centered spawn (independent of tokens)
13C-3 Subtle grid (optional; after 13A-4 tokens/bg)
13D-1 Docs prune → 13D-2 Screenshots update (after visual changes)
```

### Task Breakdown (IDs, description, acceptance, deps, estimate)

13A — Brand & UI Enhancements
- 13A-1 [Plan] Define brand tokens in `app/globals.css`; map to components
  - Acceptance: tokens exist and referenced in UI; AA+ contrast where required
  - Deps: none | Effort: 2–3h
- 13A-2 [Build] Repaint login right panel with brand palette/background
  - Acceptance: branded panel matches palette; a11y passes
  - Deps: 13A-1 | Effort: 2–3h
- 13A-3 [Build] Apply brand colors to toolbar and chat drawer
  - Acceptance: consistent bg/fg/hover/active states
  - Deps: 13A-1 | Effort: 2–3h
- 13A-4 [Build] Refresh canvas background and typography
  - Acceptance: subtle neutral backdrop; updated headings/body
  - Deps: 13A-1 | Effort: 2h
- 13A-5 [Validate] A11y & contrast review post-theme
  - Acceptance: axe clean (no critical); keyboard-only nav OK
  - Deps: 13A-2..4 | Effort: 1–2h

13B — Toolbar Refactor
- 13B-1 [Build] Move toolbar to left-hand side (finalize)
  - Acceptance: stable left docking across routes/sizes
  - Deps: 13A-1 | Effort: 1–2h
- 13B-2 [Build] Consolidate alignment into grouped control
  - Acceptance: single grouped menu/flyout; actions intact
  - Deps: 13A-1 | Effort: 2–3h
- 13B-3 [Build] Reduce toolbar width; clarify hierarchy
  - Acceptance: compact, clear groups; targets ≥40px
  - Deps: 13A-1 | Effort: 1–2h
- 13B-4 [Validate] Keyboard access + tooltips/ARIA
  - Acceptance: focusable, labeled, shortcuts surfaced
  - Deps: 13B-1..3 | Effort: 1h

13C — Canvas Experience
- 13C-1 [Build] Optimize Konva drag/zoom
  - Acceptance: 60 FPS on 500+ shapes; no input lag
  - Deps: none | Effort: 3–5h
- 13C-2 [Build] Viewport-centered shape spawn
  - Acceptance: create spawns within ±16px of center under any zoom
  - Deps: none | Effort: 2–3h
- 13C-3 [Build] Subtle grid/texture background (optional)
  - Acceptance: non-intrusive; no perf regression
  - Deps: 13A-4 | Effort: 1–2h
- 13C-4 [Validate] Latency/smoothness validation
  - Acceptance: drag latency <16ms/frame; zoom curve smooth
  - Deps: 13C-1 | Effort: 1h

13D — Documentation Cleanup
- 13D-1 [Build] Prune outdated docs; consolidate brand/UI guidance
  - Acceptance: no dead links; updated references
  - Deps: 13A–13C | Effort: 1–2h
- 13D-2 [Validate] Update screenshots in README/dev docs
  - Acceptance: images reflect new login/toolbar/chat styling
  - Deps: 13D-1 | Effort: 1h

### Critical Path
13A-1 → 13A-3 → 13B-2 → 13B-4 → 13C-1 → 13C-4 → 13D-1 → 13D-2

### Risk Mitigation (per task class)
- Theming: ship via CSS variables and minimal component deltas; quick rollback path.
- Toolbar grouping: retain keyboard shortcuts and clear labels to preserve discoverability.
- Perf tuning: measure before/after; avoid unnecessary layer redraws; throttle handlers.

### Regression Plan (per Manifest + local scope)
Potentially affected prior systems:
- #2 Authentication (login route visual changes): verify sign-in flows and redirects unaffected.
- #4 Canvas Engine & UI: selection/transforms/keyboard unaffected by theme and toolbar changes.
- #6 Realtime Presence: cursors unchanged; ensure paint/perf tweaks don’t degrade cursor latency.
- #10 Observability: Sentry still capturing client errors; no noisy logs from theme toggles.
- B3 Chat Interface Front-End: drawer theming shouldn’t impact chat send/display.
- B5 Brand UI: ensure final palette consistent; a11y pass.

Checks to include in Debug phase:
- Quick smoke (login → canvas → create/drag/zoom → chat open) shows no console errors.
- E2E: create-after-zoom spawns centered; toolbar grouped alignment still executes actions; FPS acceptable.
- Axe/a11y scan: no critical violations after theming.

### Updated Success Criteria
- Visual updates consistent with brand palette across key surfaces.
- Toolbar left, grouped alignment, compact layout verified.
- Drag/zoom remain smooth; spawn at viewport center.
- Docs updated and clean.

### Checkpoint Schedule
- Commit after tokens + login repaint (13A-1..2)
- Commit after toolbar refactor (13B-1..3)
- Commit after perf + spawn (13C-1..2)
- Commit after docs cleanup (13D-1..2)

### Next Steps
1) Implement 13A-1..4, run a11y check (13A-5)
2) Implement 13B-1..3, validate keyboard/tooltips (13B-4)
3) Implement 13C-1..3, run latency validation (13C-4)
4) Execute docs cleanup and screenshots (13D-1..2)

---

## Design Step (Design Loop Template)

### Phase Context
- Phase: XX — Module #13: Tune-Up Sprint
- Date: 2025-10-17
- Scope: Login repaint, toolbar left/grouped/compact, chat drawer theming, canvas background/typography, Konva perf feels, spawn logic, optional subtle grid.
- References: PRD §2–5; Architecture §3–6; Dev Checklist Module #13.

### Visual Objectives
- Modern, minimal UI aligned to brand; strong contrast and clarity.
- Reduce visual noise in canvas; emphasize content.
- Maintain accessibility (WCAG AA+); clear focus states; consistent spacing.

### Layout Description (textual wireframes)

Login (two-column with branded right panel)
```
---------------------------------------------------------
|        Left: Auth Form        |   Right: Brand Panel  |
|  [Logo]                       |  Gradient/texture     |
|  [Email Input___________]     |  Dark Blue base       |
|  [Continue] [Magic Link]      |  Gold accents         |
|  [Helper / errors]            |  Subtle patterns      |
---------------------------------------------------------
```

Canvas with Left Toolbar + Right Chat Drawer (collapsed)
```
┌─Toolbar (Left, compact)─┬────────────────── Canvas ──────────────────┬─Chat Drawer (collapsed)─┐
│ [Select]                 │                                              │ [⋮]                     │
│ [Rect] [Text]            │  Subtle neutral background; grid optional   │                         │
│ [Align ▾] [Distribute ▾] │  Viewport-centered create under zoom        │                         │
│ [Z-Index ▾] [Export]     │  Smooth drag/zoom (60 FPS)                  │                         │
└──────────────────────────┴──────────────────────────────────────────────┴─────────────────────────┘
```

### Component Specifications
- Toolbar (Left, Compact)
  - Groups: Primary (Select, Rect, Text), Layout (Align/Distribute menus), Order (Z-Index), Export.
  - States: default, hover, active, focus-visible (outline), disabled.
  - Shortcuts: visible in tooltip (e.g., “R” for Rect).
- Align/Distribute Grouped Control
  - Flyout or dropdown; icon grid; labels on hover.
  - Retain keyboard invocation via shortcuts.
- Chat Drawer
  - Themed header/footer; consistent tokens; focus traps respected.
- Login
  - Right panel brand visuals; left form keeps high-contrast fields and clear errors.
- Canvas Background/Grid
  - Neutral base; optional subtle grid lines at 8px; low alpha to avoid shimmer.

### Color & Typography System
- Color Tokens (CSS variables suggested):
  - `--brand-bg: #072d51` (Dark Blue)
  - `--brand-accent: #cfa968` (Gold)
  - `--brand-fg: #ffffff` (White)
  - `--brand-muted: #cdd2c5` (Light Blue)
  - Semantic: `--surface`, `--surface-muted`, `--text`, `--text-muted`, `--border`, `--focus-ring`
- Typography:
  - Base 16px; scale 1.125; headings semibold; body regular; line-height 1.45–1.6
  - Buttons/toolbar labels: 12–14px with uppercase only where necessary

### Responsive & Accessibility Guidelines
- Breakpoints: mobile ≥360px (toolbar collapses to icons only), tablet ≥768px, desktop ≥1024px.
- Focus: 2px focus ring with brand-accent; maintain contrast AA+.
- Hit areas: minimum 40px touch targets for toolbar.
- Motion: 150–200 ms, ease-out for hover/expand; no parallax.

### Design Assets Summary (for Build)
- CSS variables in `app/globals.css` for color tokens.
- Toolbar group structure and iconography; tooltips with shortcuts.
- Chat Drawer theming tokens.
- Optional grid style: lightweight draw routine or background layer.

### Next Steps / Open Questions
- Confirm whether subtle grid is default-on or opt-in; propose opt-in via toolbar toggle.
- Confirm final brand imagery/texture choice for login panel (placeholder gradient acceptable initially).

---

## Readiness Checkpoint (Short Summary)
- Dependencies aligned; scope and deliverables clear; acceptance criteria mapped to checklist.
- Risks identified with mitigations; regression plan enumerated.
- Ready to proceed to Build and Debug for Module #13.


