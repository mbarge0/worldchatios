# Foundry Core (v1.2)

A production-ready **Next.js 14+ / TypeScript / Tailwind / Supabase / OpenAI** starter template for **rapid AI-enhanced app development** during the **Gauntlet AI program**.  
This repo includes a clean architecture, automation scripts, and a documentation framework aligned with the **Gauntlet Collaboration Protocol** and **Cursor Context Management Playbook**.

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router)  
- **Language:** TypeScript  
- **Styling:** Tailwind CSS + Shadcn UI  
- **Database:** Supabase (PostgreSQL)  
- **AI Integration:** OpenAI API (with Zod validation)  
- **State Management:** Zustand  
- **Testing:** Vitest + React Testing Library  
- **Animations & Charts:** Framer Motion + Recharts  

---

## Project Setup

### 1) Clone the repository

```bash
git clone https://github.com/mbarge0/foundrycore.git
```

### 2) Set up environment variables

Copy the example file and add your real keys:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Database Configuration (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

### 3) Run Setup Script

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh --skip-init
```

This will:

- Install dependencies  
- Configure Supabase and OpenAI integrations  
- Initialize Shadcn UI components  
- Set up testing tools  
- Prepare your environment for development  

---

### 4) Approve Builds

Some native dependencies like `esbuild`, `sharp`, and `@tailwindcss/oxide` require manual approval:

```bash
pnpm approve-builds
```

---

### 5) Start the Development Server

```bash
pnpm dev
```

Then open:

```
http://localhost:3000
```

---

## Folder Structure

```
gauntletstartertemplate/
├── app/                  # Next.js App Router (pages, routes, api)
├── components/           # Reusable UI components (Shadcn + Tailwind)
├── config/               # Environment, AI, and database configs
├── docs/                 # Documentation system + templates
│   ├── templates/        # PRD, checklist, weekly report templates
│   ├── context.md        # Project and collaboration context
│   ├── context_management_playbook.md  # Operational context & testing guide
│   ├── index.md          # Full documentation index
│   └── reflections/      # Phase-by-phase summaries
├── prompts/              # Literal and system prompts for Cursor
│   ├── literal/          # Ready-to-copy prompts by phase
│   └── system/           # Structural prompt templates
├── lib/                  # Utilities (AI, auth, db)
├── hooks/                # Custom React hooks
├── scripts/              # Automation scripts (setup, deploy)
├── types/                # TypeScript type definitions
├── .env.local.example    # Environment variable template
├── next.config.ts        # Next.js configuration
└── package.json          # Dependencies and scripts
```

---

## Gauntlet Collaboration Workflow

This starter follows the official **Gauntlet Collaboration Protocol**, expanded into six modular phases for clarity and precision:

| Phase | Purpose |
|--------|----------|
| **01 – Start** | Define project vision, success criteria, and goals. |
| **02 – Planning** | Develop architecture, PRD, and technical plan. |
| **03 – Building** | Execute core implementation and feature development. |
| **04 – Debugging** | Diagnose, stabilize, and optimize system performance. |
| **05 – Reflection** | Summarize progress, insights, and refactor opportunities. |
| **06 – Handoff** | Conduct testing, validation, and deployment. |

Documentation for each phase lives in `/docs/` and `/prompts/`.

---

## Prompt System Overview

This system transforms Cursor into a structured co-developer.

| Folder | Purpose |
|---------|----------|
| **/prompts/literal/** | Ready-to-use natural language prompts organized by phase. These guide Cursor’s execution directly. |
| **/prompts/system/** | Formalized templates that define the structure and reasoning pattern Cursor follows when executing literal prompts. |
| **cursor.config.md** | Governs Cursor’s global behavior, including phase handoffs, context management, and testing integration. |

### Usage Workflow

1. Select the appropriate **literal prompt** based on your current phase.  
2. Cursor will automatically reference the linked **system template** to maintain structural consistency.  
3. Confirm Cursor’s interpretation before it executes code.  
4. Save a reflection summary at phase completion.  

---

## Context Management Playbook

`/docs/context_management_playbook.md` defines:

- How to manage Cursor’s context window effectively  
- How to transition between phases cleanly  
- When and how to integrate testing into each development phase  
- Reflection and checkpointing best practices  

This is the operational backbone for structured, low-friction collaboration with Cursor.

---

## Core Scripts

| Command | Description |
|----------|-------------|
| `./scripts/setup.sh` | Full setup automation script |
| `pnpm install` | Install dependencies manually |
| `pnpm dev` | Start local development server |
| `pnpm build` | Build app for production |
| `pnpm test` | Run tests with Vitest |
| `pnpm approve-builds` | Approve native build dependencies |
| `./scripts/deploy.sh` | (Optional) Deploy to hosting provider |

---

## Deployment

Supports deployment to major platforms:

**Vercel**

```bash
vercel deploy
```

**Firebase**

```bash
firebase deploy
```

**Supabase Edge**

```bash
supabase functions deploy
```

Before deploying, ensure:

- All environment variables are configured  
- Tests and build pass locally  
- API routes are validated  

---

## License

MIT © 2025 Matt Barge  
Built for the Gauntlet AI Program — structured creative development at speed.
