# 🧩 CollabCanvas

**CollabCanvas** is an AI-powered real-time collaborative design canvas — built during **Gauntlet AI Week 1**.  
It enables multiple users to draw shapes, add text, and see each other's cursors and presence in real time.

🌐 **Live App:** [https://collab-canvas-xi.vercel.app](https://collab-canvas-xi.vercel.app)

### Updated UI (Module 13)

Login (brand repaint) and canvas with left-docked toolbar:

![Login](/docs/operations/evidence/auto/login.png)
![Canvas](/docs/operations/evidence/auto/canvas.png)

---

## 🚀 Features (MVP)

- 🔐 **Firebase Authentication** — Email/password & Magic Link login  
- 🧑‍🤝‍🧑 **Real-time Collaboration** — Shared canvas powered by Firebase Realtime Database  
- 🖱️ **Multiplayer Cursors** — Each user’s cursor is labeled and color-coded  
- 🟦 **Shape Tools** — Create and edit rectangles and text blocks  
- 🧭 **Panning & Zooming** — Smooth canvas navigation  
- 👥 **Presence Awareness** — See who’s currently online in the shared canvas  
- ☁️ **Deployment** — Hosted on [Vercel](https://vercel.com)

---

## ⚙️ Environment Setup

### 1️⃣ Prerequisites
- Node.js ≥ 18  
- pnpm (recommended) or npm/yarn  
- Firebase project with **Firestore** + **Realtime Database** + **Authentication** enabled  
- Optional: Sentry project (for observability)

---

### 2️⃣ Environment Variables

Create a `.env.local` file at the project root, using the template below:

```bash
NEXT_PUBLIC_APP_URL=https://collab-canvas-xi.vercel.app
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_firebase_project-default-rtdb.firebaseio.com
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
OPENAI_API_KEY=your_openai_key

(See .env.example for reference.)

Run locally
pnpm install
pnpm dev
Visit → http://localhost:3000

🏗️ Architecture Overview

🔸 Overview

CollabCanvas is a modern Next.js 14 app using React, Firebase, and Vercel.
It follows a modular architecture with clearly defined layers for data, UI, and collaboration.

app/
 ├─ login/              → Auth UI (email, password, magic link)
 ├─ c/[id]/             → Canvas page (dynamic route per canvas)
 └─ layout.tsx          → Global layout and providers

components/
 ├─ canvas/             → CanvasStage, ShapeLayer, CursorLayer
 ├─ layout/             → AuthHeader, PresenceBar, AuthGuard
 └─ ui/                 → Shared UI elements (buttons, modals, etc.)

lib/
 ├─ firebase/           → Firebase client initialization
 ├─ data/               → Firestore + Realtime Database adapters
 ├─ hooks/              → usePresence, useFirebaseAuth, etc.
 └─ store/              → Zustand store for canvas state

public/
 └─ icons/              → App icons and favicons

docs/
 └─ operations/         → Build logs, prompts, and methodology

 🔹 Data Flow
	1.	Authentication — Firebase Auth handles user sessions (email/password or magic link).
	2.	Realtime Presence — usePresence hook manages cursors and online users via Firebase Realtime Database.
	3.	Shapes & Canvas Data — Stored and synced via Firestore, enabling shared editing.
	4.	UI Rendering — react-konva renders the canvas with layers for shapes, selection, and cursors.
	5.	State Management — Zustand manages viewport scale, selection, and mode across components.
	6.	Deployment — The app is deployed to Vercel with automatic CI/CD triggered on main branch push.

⸻

🧪 Testing

Run all tests:
pnpm test

To focus on canvas-specific tests:
pnpm test -- tests/unit/canvas

Tech Stack
Next.js 14 (App Router)
Language
TypeScript
State
Zustand
Realtime Backend
Firebase (RTDB + Firestore)
Auth
Firebase Authentication
UI
Tailwind CSS + shadcn/ui + lucide-react
Canvas
React-Konva
Deployment
Vercel
Observability
Sentry
AI Integration
OpenAI API (planned post-MVP)

🧭 Development Process

CollabCanvas was built using the Gauntlet AI System methodology, featuring:
	•	Automated PRDs, Architecture, and Build Loops
	•	SuperModule Development Flow
	•	Design, Build, Debug, and Reflect phases
	•	Prompt-driven iteration using Cursor + GPT-5

    🌍 Deployment

Live at:
🔗 https://collab-canvas-xi.vercel.app

Deployed automatically via Vercel on push to main.
Firebase services power authentication, data sync, and presence tracking.

⸻

👤 Author

Matt Barge
Built as part of Gauntlet AI Week 1 Challenge (Oct 2025).

⸻

🧱 License

MIT License © 2025 Matt Barge
