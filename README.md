# CollabCanvas
AI-powered real-time collaborative design tool built during Gauntlet AI Week 1.

## Environment Setup

Create a `.env.local` using the following keys (see `.env.example`):

```
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_SENTRY_DSN=
OPENAI_API_KEY=
```

Optional (legacy Supabase placeholders):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Run locally:

```
pnpm install
pnpm dev
```