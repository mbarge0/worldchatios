# Phase 03 — Two-Device Timing & Burst Tests

## Two-Device Timing (B.R2/B.R3)
Prereqs: Two devices/simulators signed into different accounts in same conversation.

1) Open the same conversation on both devices.
2) On Device A, send 5 single-line messages at natural pace.
   - Observe on Device B: measure `sending→sent` (A) and `delivered/read` (A) latencies.
   - Target: `sending→sent` p95 < 500ms; delivered/read < 2s.
3) Typing indicator: On Device B, begin typing; Device A should show “Typing…” within 200ms, clear after idle.

## Burst Messaging (B.R8)
Prereqs: Node 18+, Firebase Admin creds (service account JSON).

- Env: `export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json`
- Run:
```
./scripts/burst-messages.ts <conversationId> <senderId> 20
```
- Verify in UI:
  - All 20 messages appear in order by server timestamp.
  - No drops or duplicates.
  - Scroll performance remains smooth.

## Notes
- Capture console timestamps for latency calculation.
- If p95 exceeds targets, log deltas and network conditions; consider batching tweaks or UI debounce.
