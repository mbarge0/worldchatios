# CollabCanvas — Architecture

---

## 1) System Overview

CollabCanvas is a real-time collaborative design tool (Figma-like) with an AI agent. The MVP delivers a multiplayer canvas with pan/zoom, rectangle and text shapes, creation and transforms (move/resize/rotate), labeled cursors, presence, autosave, and JSON export. The final phase layers in an AI canvas agent (OpenAI function calling) that manipulates the canvas for all connected users.

Scope aligns with the PRD at `/docs/foundation/prd.md`.

---

## 2) System Diagram (Conceptual)

```
[Browser - Next.js/React + Konva]
  |  
  |  (Auth, DB SDKs)
  v
[Firebase Auth]  <--- authenticated users (email/password, Magic Link)
  |
  | (listen/write)
  v
[Firestore]
  - canvases/{canvasId}
  - canvases/{canvasId}/shapes/{shapeId}

[Firebase Realtime Database]
  - presence/{canvasId}/{userId}  (cursor + online)

[OpenAI] (Final)
  ^   |
  |   | tool calls via Next.js API
  |   v
[Next.js API /api/ai/*]
```

---

## 3) Core Entities and Data Model

### Firestore
- **Canvas (canvases/{canvasId})**
  - `id: string`
  - `name: string`
  - `ownerId: string`
  - `createdAt: Timestamp`
  - `updatedAt: Timestamp`

- **Shape (canvases/{canvasId}/shapes/{shapeId})**
  - `id: string`
  - `type: 'rect' | 'circle' | 'text' | 'line'`
  - `x: number`, `y: number` (top-left)
  - `width: number`, `height: number`
  - `rotation: number` (degrees; about center)
  - `fill: string` (solid hex, e.g., #3366FF)
  - `stroke: string` (solid hex)
  - `strokeWidth: number`
  - `opacity: number` (0..1)
  - `zIndex: number`
  - Text-only: `text: string`, `fontSize: number`, `fontFamily: string`, `fontWeight: string`, `textAlign?: 'left' | 'center' | 'right'`, `lineHeight?: number`
  - Collaboration: `createdBy: string`, `lockedBy?: string`, `groupId?: string`
  - `updatedAt: Timestamp`

### Realtime Database (presence)
- `presence/{canvasId}/{userId}`
  - `displayName: string`
  - `color: string`
  - `x: number`, `y: number`
  - `lastUpdated: number` (ms)

Indexes: minimal; potential index on `updatedAt` for export/pagination.

---

## 4) Data Flow

### User Session & Routing
1. User authenticates via Firebase Auth (Email/Password or Magic Link)
2. Navigate to `/c/[canvasId]`
3. Client subscribes to Firestore canvas + shapes, and RTDB presence for the canvas

### Creation & Transforms (LWW + Locks)
1. Local state updates optimistically for smooth UI (Konva)
2. During drag/resize/rotate, client writes are debounced (~75 ms) to Firestore; final write on mouseup
3. `lockedBy` is set to the acting user while transforming; cleared on mouseup or TTL expiry (5 s)
4. Other clients see updates via Firestore listeners; LWW applies on write conflicts

### Presence & Cursors
1. On join, client writes `presence/{canvasId}/{userId}` with `onDisconnect().remove()`
2. Cursor positions stream at ~20 Hz (50 ms) with throttling; labels derive from profile display name; color assigned locally

### Export
- JSON export: gather canvas + shapes and serialize
- Optional client PNG via Konva `toDataURL()`

### AI (Final)
1. User sends prompt to minimal chat UI
2. Next.js API proxies to OpenAI with tool schema
3. Tool calls map to Firestore mutations (create/move/resize/rotate/createText)
4. All changes propagate to clients via existing listeners

---

## 5) Dependencies and Integrations

- **Framework**: Next.js (App Router), React, TypeScript
- **Rendering**: Konva (react-konva)
- **State**: Zustand for canvas and UI state
- **Backend**: Firebase (Auth, Firestore, Realtime Database)
- **AI (Final)**: OpenAI (function calling)
- **Testing**: Vitest, React Testing Library, Playwright
- **Observability**: Sentry (client)
- **Hosting**: Vercel

---

## 6) Security and Performance Considerations

### Security
- Auth required for all read/write to canvases/shapes
- MVP access model: any authenticated user with canvas link can read/write
- RTDB rules restrict presence writes to the authenticated `userId` path
- Input validation and basic rate limiting on AI API endpoints (final)

### Performance
- 60 FPS rendering via Konva; batch state updates; avoid unnecessary re-renders
- Firestore writes debounced (≈75 ms) during transforms; final commit on mouseup
- Cursors via RTDB only; no Firestore writes for movement
- Targets: < 100 ms object sync, < 50 ms cursor sync, 5–8 users, 500+ shapes

---

## 7) Risks and Unknowns
- LWW + locks may be insufficient for highly concurrent edits; CRDT (Yjs) considered if needed
- Browser performance under 500+ nodes varies; may need virtualization or layer splits
- OpenAI latency/rate limits could impact perceived responsiveness; fallbacks and optimistic UI required

---

## 8) Design Notes
- Modules favor clarity over cleverness; early returns, explicit types
- Naming aligns with domain: `Canvas`, `Shape`, `Presence`
- Colors are solid only; opacity handled as a separate numeric property
- Rotation origin: shape center; coordinates are top-left
- Directory layout:
  - `app/c/[canvasId]/page.tsx` — canvas route
  - `components/canvas/*` — canvas stage, layers, nodes, selection, toolbar
  - `lib/firebase/*` — Firebase clients, presence helpers
  - `lib/store/*` — Zustand stores (canvas objects, selection, UI)
  - `app/api/ai/*` — AI proxy (final)
  - `lib/ai/*` — tool schemas and handlers (final)

---

## 9) Next Steps
1. Scaffold Firebase clients (Auth, Firestore, RTDB) and security rules
2. Implement canvas route and Konva stage with rectangle + text nodes
3. Wire realtime: Firestore shapes (debounced writes, locks), RTDB presence/cursors

References: `docs/foundation/prd.md`, `docs/foundation/dev_checklist.md`, `docs/requirements/evaluation_criteria.md`


