# Gauntlet AI Starter Template – Development Context  
_Version 1.1 — Gauntlet Mode (Oct 2025)_  

This repository serves as the **core starter framework** for all Gauntlet AI fellowship builds.  
Gauntlet is a 10-week AI engineering program where each week a new app is cloned, enhanced with AI features (RAG, Agents, LangChain, fine-tuning, etc.), and deployed as a working product.


## 1. Purpose
Provide a reusable, production-grade foundation optimized for **AI-first development**:  
- Speed, simplicity, and modularity.  
- Pre-integrated testing and prompt systems.  
- Clean baseline for weekly cloning and enhancement cycles.  

Cursor and Copilot use this context file to reorient at the start of every phase or session.  


## 2. Core Goals
- Reuse this template as the foundation for weekly Gauntlet builds.  
- Support **Next.js + Tailwind + TypeScript** as default frontend stack.  
- Integrate **Firebase (Auth + Firestore)** or **Supabase** for persistence.  
- Include **OpenAI API layer** (`lib/ai/openai.ts`) pre-configured for GPT-4o.  
- Ship each build deployable to **Vercel** or **Firebase Hosting**.  
- Maintain consistent documentation system via `/docs/`:
  - `source_of_truth.md`  
  - `weekly_report.md`  
  - `testing_expectations.md`  
  - `retrospective.md`  
  - `cursor.config.md`  


## 3. Gauntlet Mode Overview
Each week follows a structured rhythm:  
1. **Clone Phase** – Rebuild a real-world enterprise app (e.g., Slack, Notion, Linear).  
2. **Enhancement Phase** – Add AI features using OpenAI API and supporting tools.  
3. **Testing Phase** – Validate stability through automated and manual QA.  
4. **Reflection Phase** – Summarize outcomes, challenges, and learnings.  

Cursor reads this file before executing any major operation to confirm:  
- System goals  
- Current phase context  
- Active testing expectations  
- Reflection and checkpointing cadence  


## 4. Development Principles (Vibe Coding)
- **Anti-complexity:** small, modular components.  
- **Anti-refactor:** deep planning, clean single execution.  
- **Testing integrated:** each feature includes at least one automated test.  
- **Context continuity:** Cursor loads `context.md`, `collaboration_protocol.md`, and `coding_rules.md` each session.  
- **Checkpoints:** save progress at the end of every major phase.  
- **Reflection:** summarize lessons learned into `retrospective.md` weekly.  

> *“Think slowly, code quickly.”* — Vibe Coding Ethos  


## 5. Cursor Quick Start Protocol
Before any build or phase:
1. **Load context:** review this file to understand purpose and stack.  
2. **Load rules:** open `/docs/coding_rules.md` for behavioral constraints.  
3. **Confirm phase:** identify which literal prompt to begin with (from `/prompts/literal/`).  
4. **Execute:** follow the linked prompt template (from `/prompts/system/`).  
5. **Reflect:** close each session with a Context Summary using `/prompts/literal/05_reflection/phase_summary.md`.  

> Cursor, always confirm before executing any major action.  


## 6. Testing & Validation Hooks
- All features must include corresponding unit or integration tests.  
- Use Jest or Vitest with React Testing Library.  
- Run test suite before checkpoint commits.  
- Cursor should generate or update tests automatically before merges.  

**Prompt references:**  
- `/prompts/system/03_building_loop.md`  
- `/prompts/system/06_handoff_loop.md`  


## 7. Reflection Integration
- Weekly reflections are logged in `/docs/weekly_report.md`.  
- Cumulative insights are tracked in `/docs/retrospective.md`.  
- Cursor automatically references these files when generating summaries.  

> Prompt: “Cursor, summarize this week’s development and update both `weekly_report.md` and `retrospective.md`.”  


## 8. Meta Systems Map
| System | Purpose | Key File |
|---------|----------|----------|
| Prompt Library | Structured AI prompting system | `/prompts/` |
| Context Management | Session orientation + risk prevention | `/docs/context_management_playbook.md` |
| Testing | Build integrity + reliability | `/docs/testing_expectations.md` |
| Reflection | Weekly learning + mindset growth | `/docs/retrospective.md` |
| Collaboration | Clear human–AI role alignment | `/docs/collaboration_protocol.md` |


---

**Summary:**  
`context.md` = the brainstem of your Gauntlet workspace.  
It keeps Cursor grounded, aligned, and aware of goals, rules, and active phase context.  
Every week begins and ends here — with clarity, reflection, and forward motion.