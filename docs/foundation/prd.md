# CollabCanvas — Product Requirements Document (PRD)

---

## 1) Objective

- **Mission**: Enable multiple designers to collaboratively create design documents in real time.
- **Problem**: Deliver reliable, low-latency multiplayer design creation and conflict resolution for visual design files, matching the collaborative foundation of Figma.
- **Success (MVP, due tomorrow evening)**:
  - Real-time collaborative canvas deployed and publicly accessible on Vercel
  - Meets all MVP features listed below with stable sync and presence across 2+ users
  - Performance targets met for cursor/object sync and 60 FPS interactions
- **Success (Final, due Sunday)**:
  - AI canvas agent that manipulates the canvas via natural language using function calling
  - Retains multiplayer guarantees: AI actions are synced to all connected clients in real time

Context reference: see `/docs/requirements/requirements.md` for background and MVP; align with `/docs/requirements/evaluation_criteria.md`.

---

## 2) Core Features

### MVP (P0)
- **Canvas interactions**: Pan and zoom with smooth 60 FPS rendering
- **Shapes**: At least one shape type; we will support rectangle and text for MVP (circle optional). Shapes use **solid colors only** (no gradients/patterns).
- **Object manipulation**: Create, move, resize, rotate; basic delete/duplicate
- **Text layers**: Create text with font size and basic styling
- **Selection**: Single and multi-select (shift-click or marquee)
- **Realtime sync**: 2+ users editing the same canvas; live state propagation
- **Presence & cursors**: Labeled, colored cursors for connected users
- **Auth**: Firebase Auth (Email/Password + Magic Link)
- **Persistence**: Autosave canvas state to Firestore; reload restores state
- **Routing**: Single shared canvas per unique URL (`/c/[canvasId]`)
- **Export**: JSON (full canvas document); optional client-side PNG capture
- **Deployment**: Next.js app deployed to Vercel

Notes:
- Undo/redo is excluded from MVP but supported by architecture for later addition
- No comments/chat, sharing roles, or version history in MVP

### Final (adds on top of MVP)
- **AI canvas agent** (OpenAI function calling):
  - Creation: create shape/text
  - Manipulation: move, resize, rotate
  - Layout: simple arrangement commands (e.g., align/space/grid in simple form)
  - Complex: create basic UI compositions (e.g., simple login form) when feasible
- **AI UX**: Minimal chat UI panel to submit prompts; agent acts as a bot user whose actions sync to all clients
- **Guardrails**: Confirmation for destructive actions; all agent actions become undoable once undo/redo is implemented (post-MVP)

---

## 3) User Stories (with priorities)

### Designers (Primary)
- **P0**: As a designer, I can open a canvas URL and see the current design so that I can collaborate.
- **P0**: As a designer, I can pan/zoom the canvas so that I can navigate large designs.
- **P0**: As a designer, I can create rectangles and text so that I can compose simple designs.
- **P0**: As a designer, I can move, resize, and rotate objects so that I can arrange elements.
- **P0**: As a designer, I can multi-select elements so that I can transform them together.
- **P0**: As a designer, I can see other users’ labeled cursors so that I can coordinate in real time.
- **P0**: As a designer, my changes sync instantly to collaborators so that collaboration feels live.
- **P0**: As a designer, I can sign in via Email/Password or Magic Link so that I have an identity.
- **P0**: As a designer, I can reload and see the same state so that work persists.
- **P1**: As a designer, I can export my canvas to JSON (and optionally PNG) so that I can share or archive.

### AI-augmented workflows (Final)
- **P0 (Final)**: As a designer, I can ask the AI agent to create a shape and see it appear for all users.
- **P0 (Final)**: As a designer, I can ask the AI agent to move/resize/rotate a shape and observe real-time updates.
- **P1 (Final)**: As a designer, I can request simple layouts (e.g., evenly space selected items) via natural language.

Out of scope user stories: comments/annotations, per-canvas permissions and invites, roles, version history/restore, advanced constraints/smart guides, offline mode.

---

## 4) Success Criteria

### Performance & Reliability
- Interactions render at **60 FPS** on a modern laptop
- Object sync latency **< 100 ms** across clients (steady state)
- Cursor sync latency **< 50 ms** across clients
- Handles **500+ simple objects** without FPS drops
- Supports **5–8 concurrent users** on a canvas without degradation
- Simple, robust conflict handling at MVP: last-write-wins + transient shape-level locks

### Feature Completeness (MVP)
- All P0 stories above are implemented and verifiable in E2E tests
- Deployment live on Vercel; login required to join canvas; any authenticated user with the link can edit

### Final (AI)
- Agent supports: create, move, resize, rotate, create text, get canvas state
- AI actions broadcast to all clients in real time; acknowledgment < 500 ms, completion target < 1–2 s

### Documentation & Dev Quality
- README with setup, env config, and deployment steps
- PRD, architecture, and dev checklist committed and referenced

---

## 5) Testing & Quality Infrastructure

- **Unit & Integration**: Vitest + React Testing Library
- **E2E**: Playwright covering:
  - Two users join same canvas; see presence + labeled cursors
  - Create/move/resize/rotate rectangle and text; changes sync both ways
  - Refresh mid-edit restores persistent state
  - Export JSON works
- **Manual QA Matrix**: Chrome, Safari, Firefox, Edge; 2 users; rapid object changes; reconnect behavior
- **Error Reporting**: Sentry client instrumentation for runtime errors
- **Deployment Validation**: Post-deploy smoke E2E run; manual verification of auth, presence, and sync
- **Regression**: Maintain a small suite of scenario tests per core flow; run on PRs to `main`

---

## 6) Technical Constraints

### Architecture & Stack
- **Frontend**: Next.js (React + TypeScript); rendering via **Konva** (Canvas2D) for shapes, transforms, and hit-testing
- **Realtime/Persistence**: **Firebase**
  - **Firestore**: authoritative canvas state (documents/collections)
  - **Realtime Database** (or Firestore with throttled updates): presence + cursors (< 50 ms perceived)
- **Auth**: Firebase Auth (Email/Password + Magic Link)
- **Hosting**: Vercel (production; no staging for now)
- **AI**: OpenAI (function calling) for final phase
- **Observability**: Sentry for client errors

### Sync & Conflicts (MVP)
- **Model**: Client-originated updates to Firestore; last-write-wins (LWW)
- **Locks**: Shape-level transient lock (`lockedBy`) during active transforms to reduce thrashing
- **Plan**: Consider CRDT (e.g., Yjs) as a stretch goal if complexity rises

### Data Model (AI-ready at MVP)
- **Canvas document**
  - `id`, `name`, `objects[]`, `ownerId`, `createdAt`, `updatedAt`
- **Shape object**
  - `id`, `type` (`rect|circle|text|line`), `x`, `y`, `width`, `height`, `rotation`, `fill`, `stroke`, `strokeWidth`, `zIndex`, `opacity` (colors are **solid hex** only; opacity separate)
  - Text-specific: `text`, `fontSize`, `fontFamily`, `fontWeight`
  - Collaboration: `createdBy`, `lockedBy` (nullable), `groupId` (nullable), `updatedAt`
- **Presence/cursor payload**
  - `userId`, `displayName`, `color`, `x`, `y`, `lastUpdated`

### Security & Access
- Auth required to join a canvas
- MVP access model: any authenticated user with the canvas link can edit
- Basic rate limiting and input validation for server endpoints; agent guardrails for destructive actions

### URLs & Routing
- Canvas route: `/c/[canvasId]` with server-generated IDs

---

## 7) Stretch Goals (Post-MVP, optional)
- Undo/redo history
- Grouping, alignment, distribution, snapping/grid, simple layers panel
- Additional shapes (ellipse, line tools, image nodes)
- Export PNG/SVG server-side rendering
- CRDT-based sync for conflict-free offline/merge scenarios
- Social logins; link-based restricted roles (viewer/editor/owner)

---

## 8) Out of Scope (Explicitly Excluded for Now)
- Comments/annotations and in-canvas chat
- Per-canvas permissions/roles, invites, and sharing links
- Version history and restore
- Advanced constraints/smart guides beyond minimal snapping
- Offline-first mode and complex merge resolution

---

## 9) Evaluation & Testing Alignment (Gauntlet)

| Category | How We Satisfy |
|---|---|
| Performance | 60 FPS; < 100 ms object sync; < 50 ms cursor sync; 5–8 users; 500+ objects |
| Features | MVP P0 user stories complete; Final includes working AI agent with function calling |
| User Flow | Clear navigation to `/c/[canvasId]`, no dead ends, obvious entry to canvas and auth |
| Code & Deployment | Typed React/Next.js; clean architecture; tests; deployed on Vercel; Sentry; documented setup |

---

## 10) References
- Background & requirements: `/docs/requirements/requirements.md`
- Evaluation criteria: `/docs/requirements/evaluation_criteria.md`
- Architecture (companion doc): `/docs/foundation/architecture.md`
- Development checklist: `/docs/foundation/dev_checklist.md`


