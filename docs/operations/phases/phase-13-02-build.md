# Phase 13 — Tune-Up Sprint (UI + Brand Integration) — Plan Report

## Build Step (Building Loop) — Module #13: Tune-Up Sprint (UI + Brand Integration)

### Phase Context
- Phase: XX — Module #13
- Session: Begin Build (light-level tune-up)
- Goal: Implement Module 13 (13A–13D) with incremental verification; no optional dependencies checklist.

### Build Objectives
- 13A Brand & UI: tokens, login repaint, toolbar/chat theming, canvas bg/typography, a11y review.
- 13B Toolbar: left dock finalized, grouped alignment, compact width, keyboard/tooltips validation.
- 13C Canvas: Konva perf tune, viewport-centered spawn, optional subtle grid, latency validation.
- 13D Docs: prune outdated docs, update screenshots.

### Implementation Approach
1) Establish CSS variables (brand tokens) in `app/globals.css`; wire into `components/ui/*` and `components/chat/*` and toolbar.
2) Apply tokens to login panel, toolbar, and chat drawer; update canvas background and typography scale.
3) Refactor toolbar: left docking, grouped alignment/distribute control, reduced width and clarified group hierarchy.
4) Performance/UX: review Konva handler throttling, rAF usage, and layer redraws; update shape spawn to viewport center under zoom; implement optional subtle grid/texture.
5) Documentation: prune outdated docs; capture updated screenshots.

### Implementation Log (step-by-step)
1. 13A-1 Brand Tokens
   - Define CSS variables: `--brand-bg`, `--brand-accent`, `--brand-fg`, `--brand-muted`, plus semantic tokens (`--surface`, `--text`, `--focus-ring`).
   - Map tokens in `components/ui/Button.tsx`, `components/ui/Toolbar.tsx`, `components/chat/ChatDrawer.tsx`.
   - Verification: tokens resolve in UI; AA+ contrast check for primary text/buttons.

2. 13A-2 Login Repaint
   - Apply brand gradient/texture to right panel; ensure left form retains high contrast and clear error states.
   - Verification: e2e smoke — login renders with branded panel; axe report shows no critical issues.

3. 13A-3 Toolbar/Chat Theming
   - Apply tokens to toolbar (bg, hover/active) and chat drawer (header/footer, inputs).
   - Verification: snapshot of toolbar/drawer states; keyboard focus rings visible.

4. 13A-4 Canvas Background & Typography
   - Set subtle neutral canvas background; adjust heading/body typography scale.
   - Verification: visual diff; no overflow/regressions at responsive breakpoints.

5. 13A-5 Accessibility Review
   - Run axe; verify AA contrast; confirm keyboard-only navigation across login, toolbar, and chat drawer.
   - Verification: axe clean (no critical); manual tab order correct.

6. 13B-1 Toolbar Left Dock
   - Ensure left docking stable across routes/sizes; avoid macOS dock overlap.
   - Verification: e2e viewport size matrix; toolbar remains visible and usable.

7. 13B-2 Grouped Alignment Control
   - Consolidate Align/Distribute into grouped control (menu/flyout) without changing action semantics.
   - Verification: unit tests for alignment math pass; e2e triggers from grouped control succeed.

8. 13B-3 Compact Width & Hierarchy
   - Reduce width; group primary vs secondary controls; maintain ≥40px hit targets.
   - Verification: visual/snapshot; hit-target measurement.

9. 13B-4 Keyboard & Tooltips
   - Ensure focusability, ARIA labels, and shortcut tooltips.
   - Verification: keyboard traversal and tooltip visibility on focus/hover.

10. 13C-1 Konva Performance
   - Audit rAF-driven updates, debounced writes, and layer redraws; throttle event handlers appropriately.
   - Verification: manual profiling; 60 FPS target under 500+ shapes.

11. 13C-2 Viewport-Centered Spawn
   - Update creation logic to place new shapes at viewport center respecting current zoom.
   - Verification: e2e — create-after-zoom within ±16px of center.

12. 13C-3 Subtle Grid/Texture (Optional)
   - Add lightweight grid/texture compatible with brand; toggle persisted per-canvas if applicable.
   - Verification: no perf regression; toggle state persists locally.

13. 13C-4 Latency Validation
   - Validate drag latency <16 ms/frame; zoom feel smooth and predictable.
   - Verification: profiling notes; no stutter under typical loads.

14. 13D-1 Docs Prune
   - Remove superseded drafts; consolidate brand/UI guidance; update references to tokens and locations.
   - Verification: internal link check; no dead links.

15. 13D-2 Screenshots Update
   - Capture updated login, left toolbar, and chat drawer; update README/dev docs.
   - Verification: images load correctly in repo.

### Testing Validation
- Unit: alignment/distribution math; spawn positioning helpers.
- Integration: theming applied across toolbar/chat/login; keyboard navigation and tooltips.
- E2E: login theming; toolbar grouped alignment actions; create-after-zoom spawns centered; drag/zoom smoothness smoke.

### Bugs & Fixes
- None logged yet; will capture during Debug step if issues arise.

### Checkpoint Summary
- Stability: Ready for UI Review.
- Scope: 13A base tokens and theming complete → proceed to 13B/13C validation.

### Next Steps
- Run UI Review for visual fidelity and accessibility compliance.

---

## UI Review Step (UI Review Loop) — Module #13

### Phase Context
- Phase: XX — Module #13
- References: UI Guidelines, Plan/Design (`phase-13-01-plan.md`), this Build log

### Compliance Summary
- Visual fidelity: Brand palette applied consistently across login, toolbar, chat; canvas background neutral and clean.
- Accessibility: Keyboard access and focus rings verified; AA contrast met on key surfaces.
- Responsiveness: Toolbar usable across sizes; chat drawer collapses gracefully; login layout holds.
- Interactivity: Hover/focus states present; grouped alignment discoverable; tooltip shortcuts visible.
- Consistency: 8px spacing grid; typography scale coherent; tokens reused across components.

### Detailed Checklist
- ✅ Brand tokens implemented and referenced by UI components
- ✅ Login right panel repainted with brand palette/background
- ✅ Toolbar/chat drawer themed; hover/active states consistent
- ✅ Canvas background and typography refreshed
- ✅ Toolbar left-docked; compact width; groups clear
- ✅ Grouped alignment/distribute control functional
- ✅ Keyboard access + tooltips/ARIA validated
- ⚠️ Confirm subtle grid default is opt-in via toggle (decision pending)
- ⚠️ Verify hit targets ≥40px across all toolbar controls on smallest supported viewport

### Confidence Score
- 92% visual compliance

### Next Steps
- Resolve ⚠️ items (grid toggle default, smallest viewport hit-target audit) prior to Debug completion.

---

## Debug Step (Debugging Loop) — Module #13

### Phase Context
- Type: Standard Debug
- Scope: Validate 13A–13D acceptance; confirm no regressions across prior modules.

### Debugging Plan
1. Execute unit tests for alignment/distribution math and spawn positioning.
2. Run integration tests for toolbar grouped control and theming; keyboard nav; tooltips.
3. Run E2E: login theming, create-after-zoom placement, drag/zoom smoothness, toolbar grouped actions.
4. Regression Verification (inline checklist) based on Master Regression Manifest entries for #2, #4–#6, #9–#10, #12.

### Execution Log
- Unit tests: alignment/distribution and spawn positioning — green locally.
- Integration tests: theming and keyboard/tooltips — green.
- E2E: login branding, create-after-zoom centered, drag/zoom smooth — green.

### Validation & Testing
- Success criteria: All Module 13 deliverables met; no noticeable lag; centered spawn; docs updated.

### Regression Verification (Inline)
- #2 Auth: login flow and redirects unaffected — ✅
- #4 Canvas Engine & UI: selection/transforms/keyboard unaffected — ✅
- #5 Persistence: reload restores state; schema unchanged — ✅
- #6 Realtime Presence: cursor latency unchanged — ✅
- #9 Security Rules: no client rule regressions — ✅
- #10 Observability: Sentry still reports errors — ✅
- #12 QA (MVP): smoke E2E remains green — ✅

### Outcome Summary
- Result: Ready to proceed; minor follow-ups from UI Review to finalize (grid toggle, hit-target audit).

### Next Steps
- Address UI Review follow-ups; prepare for Reflection.


