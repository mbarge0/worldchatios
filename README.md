## Foundry Core v2

"A reusable development framework for structured, AI-assisted, multi-phase projects with built-in verification, automation, and documentation systems."

### What’s Included
- Phase-driven automation (`/scripts`) and verification loops (`/tools`)
- Full documentation system (`/docs`) aligned with Gauntlet methodology
- Ready-to-adapt Firebase/Supabase scaffolding and environment templates

### Quick Start
```bash
pnpm install
pnpm dev
```

### Core Commands
- `pnpm plan` – planning phase hooks
- `pnpm develop` – development phase hooks
- `pnpm build` – silent, non-interactive compile (no verification)
- `pnpm debug` – full verification suite (build → evolvr → visual)

Skip flags for debug:
```bash
SKIP_EVOLVR=1 pnpm debug   # skip evolvr verification
SKIP_VISUAL=1 pnpm debug   # skip visual verification
```

### Docs
See `/docs/index.md`, `/docs/context_management_playbook.md`, and `/docs/operations/` for workflows. New work goes into `/docs/operations/recent/`; move completed artifacts to `/docs/operations/archive/`.

### License
MIT © 2025 Matt Barge
