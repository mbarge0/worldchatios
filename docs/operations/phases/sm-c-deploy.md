## Deployment & Environment Guide (Supermodule C)

Targets
- Vercel (recommended)
- Firebase Hosting (optional alternative)

Environment Variables (client-required)
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- NEXT_PUBLIC_FIREBASE_DATABASE_URL
- NEXT_PUBLIC_APP_URL (optional, defaults to localhost)
- NEXT_PUBLIC_SENTRY_DSN (optional)

Steps — Vercel
1. Create a new Vercel project from this repo
2. Add the env vars above in Project Settings → Environment Variables
3. Deploy a Preview; confirm build succeeds
4. Visit preview URL; confirm login, canvas load, presence
5. Promote to Production

Firebase Rules Verification
- firestore.rules / database.rules.json must match the production project
- Use Firebase console or CLI to validate rules

Smoke Checklist
- Login works; redirects OK
- Shapes load/sync; toolbar creates rect/text; delete allowed per rules
- Presence avatars visible in two sessions (<1s)
- No console errors; Sentry optional

Notes
- `config/env.ts` validates required client vars at runtime
- Avoid secrets on client; only NEXT_PUBLIC_* used

