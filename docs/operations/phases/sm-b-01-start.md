## Metadata
- **Phase:** Supermodule B
- **Mode:** Ask
- **Output Path:** `/docs/operations/phases/sm-b-01-start.md`

---

# Start — Supermodule B: Product & Stability Layer (Modules 8–10)

## 1) Phase Context
- **Phase:** Supermodule B — Modules #8 Shapes & Text, #9 Security Rules, #10 Observability & Performance
- **Date:** Oct 14, 2025
- **Intent:** Transition from realtime backbone → product-ready canvas with creative toolset, security, and observability for MVP readiness.
- **Predecessor:** Supermodule A — Data & Realtime Backbone handoff (`/docs/operations/phases/sm-a-06-handoff.md`).

## 2) Scope
- Implement Text creation/editing alongside Rectangles; finalize shape properties (fill, stroke, opacity, zIndex, rotation, keyboard actions).
- Ensure `ShapeLayer` supports dynamic creation, transform, deletion, and Firestore persistence.
- Add Firebase Security Rules for Firestore (auth required, scoped to existing `canvasId`) and RTDB (`presence/{canvasId}/{userId}` writes restricted to same user).
- Integrate Observability & Performance: Sentry client, FPS/render-time instrumentation, Konva render optimizations (batch updates, rAF), and unsubscribe on hidden tab.
- Tests: unit/integration for shapes, rules, performance logic; E2E for create/edit text and security enforcement; regression against Modules 1–7.

## 3) Deliverables
- `ShapeLayer` supports text + rectangle creation/editing/deletion with full styling props.
- Firestore + RTDB security rules implemented with emulator tests green.
- Sentry integrated and capturing client-side errors.
- Performance maintains ~60 FPS under 100+ objects (dev profile) with instrumentation.
- Tests (unit, integration, E2E) green.
- Docs updated: `sm-b-01-start.md`, `sm-b-02-plan.md`, build/debug logs.

## 4) Dependencies
- Auth and Firebase clients (`lib/firebase.ts`, `lib/firebase/client.ts`).
- Data & Realtime adapter/hooks from Supermodule A: `lib/data/firestore-adapter.ts`, `lib/hooks/useShapesSync.ts`, `lib/hooks/useShapeWriter.ts`, `lib/hooks/usePresence.ts`.
- Canvas components: `components/canvas/*` and routing `/c/[canvasId]` under `AuthGuard`.
- Dev Checklist Modules #8–#10 criteria (`/docs/foundation/dev_checklist.md`).

## 5) Non-Goals
- Additional shape primitives beyond rect/text (e.g., circle) unless time permits.
- AI agent tools integration (Supermodule C and later).
- Production deployment and final QA (Modules 11–12).

## 6) Risks
- Text editing complexity (contentEditable vs Konva Text editing) can introduce focus/IME edge cases.
- Security rules correctness and emulator parity with production.
- Performance regressions from frequent updates; need batching and unsubscribe on tab hidden.

## 7) Success Criteria (High Level)
- Users can create/edit/move/resize/rotate/delete rectangles and text with persisted properties.
- Unauthorized access blocked by rules; authorized flows succeed; emulator tests pass.
- Sentry captures client errors; no console noise during core flows.
- Canvas interactions remain smooth at ~60 FPS with 100+ shapes.

## 8) References
- Dev Checklist Modules 8–10: `/docs/foundation/dev_checklist.md`
- Supermodule A Handoff: `/docs/operations/phases/sm-a-06-handoff.md`
- Architecture/PRD: `/docs/foundation/architecture.md`, `/docs/foundation/prd.md`


