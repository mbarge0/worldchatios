## Plan — Supermodule D: Multiplayer Cursors, Presence Awareness & UI Refresh

### 1) Current Status
- MVP backend and canvas interaction fully implemented (Supermodules A–C).
- Presence data structure exists but lacks UI surfacing.
- Cursor positions sync but lack name labels or interpolation.
- UI is functionally solid but visually minimal and non-guideline compliant.

---

### 2) Scope Breakdown

| Track | Description | Priority | Effort | Dependencies |
|---|---|---|---|---|
| **T1 — Multiplayer Cursors** | Add labeled cursors with name + smooth motion | P1 | M | `usePresence.ts` |
| **T2 — Presence UI** | Build presence bar or sidebar showing who’s online | P1 | M | RTDB presence |
| **T3 — UI Refresh** | Apply UI redesign across Home & Canvas | P2 | L | UI Guidelines |
| **T4 — Testing & Regression** | Integration + visual regression | P2 | M | All |

---

### 3) Acceptance Criteria

#### T1 — Multiplayer Cursors
- Each connected user displays a colored cursor + name label.
- Cursors update in real-time (≤200ms lag typical).
- Cursor positions interpolate for smooth motion.
- Disconnect removes cursor instantly.

#### T2 — Presence UI
- Displays active users in presence bar (avatars or initials).
- Updates in real-time as users join/leave.
- Idle users grayed out after 2 minutes.
- Supports hover tooltip for full name/email.

#### T3 — UI Refresh
- Home/Login page redesigned with centered layout, soft shadow, and modern typography.
- Canvas page refreshed: clean toolbar, subtle depth, polished selection states.
- Applies `/docs/operations/ui-guidelines.md` tokens (spacing, typography, colors, motion).
- Fully responsive for ≥768px width.

#### T4 — Testing & Regression
- Integration tests verify cursor and presence sync.
- Visual regression snapshots for Home & Canvas pages.
- Manual regression: all MVP core flows verified (login → canvas → realtime edit).

---

### 4) Task Breakdown
1. **Extend Presence Hook**
   - Include user display names, color assignments, and idle timers.
2. **Add CursorLayer Component**
   - Render labeled cursors with motion interpolation.
3. **Create PresenceBar Component**
   - Display active users horizontally at top or side.
4. **Apply UI Guidelines**
   - Update Tailwind tokens, colors, typography, spacing.
5. **Refactor Layout Components**
   - Redesign Home/Login and Canvas with design consistency.
6. **Integration Testing**
   - Verify realtime sync between 2+ users.
7. **UI Review & QA**
   - Run `/prompts/literal/04_building/ui_review.md` before deploy.

---

### 5) Dependency Graph
T1 (Multiplayer Cursors)
|
v
T2 (Presence UI)
|
v
T3 (UI Refresh)
|
v
T4 (Testing & Regression)

---

### 6) Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Network jitter causing cursor jumps | Implement linear interpolation between frames |
| UI redesign introduces layout bugs | Build behind feature flag until verified |
| Presence desync on disconnect | Add periodic cleanup and onDisconnect handlers |
| Scope creep from design polish | Freeze style tokens early and adhere to guidelines |

---

### 7) Success Metrics
- Cursor latency ≤ 200ms (local test)
- Presence updates < 1s propagation
- 100% design compliance (UI Review)
- 0 console errors on client during usage
- All regression tests pass

---

### 8) Checkpoints
- **CP1:** Cursors functional (real-time labeled motion)
- **CP2:** Presence bar visible and synced
- **CP3:** UI redesign applied
- **CP4:** Tests + Review complete, ready for deploy


