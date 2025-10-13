## Metadata
- **Phase:** 03
- **Mode:** Ask
- **Output Path:** `/docs/operations/phases/phase-03-01-start.md`

---

# Phase Starter — Module #3: Routing & Shell (MVP)

Use this when beginning a new phase of development to establish clarity, context, and stability.

---

## 1. Phase Overview
- **Phase number, name, date:** 03 — Routing & Shell (MVP), Oct 13, 2025
- **Summary of previous phase:**
  - Module #2 delivered Firebase Auth (Email/Password + Magic Link) with `/login` UI and a client-side `AuthGuard` protecting `/c/[canvasId]`. Display-name fallback added; legacy Supabase removed. Production build and smoke tests passed with high stability. One low-severity `act()` warning remains from a legacy test slated for update.
  - References: `docs/operations/phases/phase-02-06-handoff.md`, `docs/operations/phases/phase-02-05-reflect.md`.
- **Objectives & deliverables for this phase:**
  - Scaffold Next.js App Router route for `/c/[canvasId]` with a minimal canvas shell and layout.
  - Ensure seamless integration with `AuthGuard` and navigation from login to canvas.
  - Establish base layout components (shell, header/toolbar placeholders, content area) ready for Konva integration next phase.
  - Add initial E2E covering auth redirect and successful entry into the canvas shell.

## 2. Scope
### Included
- Route scaffold for `/c/[canvasId]` rendering a basic shell.
- Shell layout structure: container, header placeholder, main canvas area.
- Navigation flow: unauthenticated users redirected to `/login`; authenticated land in `/c/[canvasId]` without flashes beyond loader.
- Basic 404 handling for invalid canvas IDs shape (placeholder logic acceptable for now).
- E2E: navigation from `/login` to `/c/[canvasId]` and shell visibility assertion.

### Excluded / Deferred
- Konva stage and rendering; selection/transform UI.
- Firestore/RTDB wiring, persistence, presence, and cursor streaming.
- Security rules changes.
- JSON export, shapes, and performance tuning.

## 3. Risks and Assumptions
### Risks
- Client-side guard may flash loader briefly; UX acceptable for MVP but may require middleware later.
- Route parameter validation could block layout rendering if too strict early; use permissive placeholder validation.

### Assumptions
- Firebase Auth is stable and configured (`useFirebaseAuth`, `AuthGuard`).
- App uses Next.js App Router with existing pages: `/login`, `/c/[canvasId]`.
- PRD and Architecture constraints remain unchanged: MVP targets routing to a single canvas per URL.

## 4. Testing Focus
- **Unit/Integration:**
  - Component rendering of `/c/[canvasId]` shell.
  - `AuthGuard` behavior with mocked auth state.
  - Suggested paths: `tests/unit/routes/c-canvas-shell.test.tsx`.
- **E2E (Playwright):**
  - Unauthenticated user visiting `/c/abc` is redirected to `/login`.
  - Authenticated user navigates to `/c/abc` and sees shell elements.
  - Suggested paths: `tests/e2e/routing-shell.spec.ts`.

## 5. Implementation Plan
1. Confirm and reuse `components/layout/AuthGuard.tsx` in `app/c/[canvasId]/page.tsx`.
2. Create/adjust shell layout markup in `app/c/[canvasId]/page.tsx` to provide clear regions (header placeholder, main area).
3. Add minimal UI markers (data-testid attributes) for E2E assertions.
4. Write unit test for shell render with mocked auth.
5. Write Playwright E2E for redirect and successful shell load.
6. Update docs if any public-facing paths or names change.

## 6. Expected Outcome
- Definition of done:
  - Navigating to a valid `/c/[canvasId]` as an authenticated user renders the shell reliably.
  - Unauthenticated users are redirected to `/login`.
  - Unit and E2E tests covering these flows pass locally and in CI.

## 7. Checkpoint Preparation
- Verify:
  - Auth flows still pass (unit + smoke) and new routing E2E passes.
  - No regressions in production build.
- Suggested commit message:
  - "phase-03(start): scaffold routing & shell for /c/[canvasId] with tests"


