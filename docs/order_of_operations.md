# Gauntlet Project Order of Operations

**Purpose:**  
Provide a high-level roadmap for executing any Gauntlet build, starting from the moment new requirements are received.

---

## 0️⃣ Receive Requirements
- Review the Gauntlet assignment document (e.g., Word-Wise, Slack clone, etc.).
- Extract key success criteria (performance, features, user flow).
- Store a copy in `/docs/requirements/`.

---

## 1️⃣ Project Setup
See: [`/docs/setup_checklist.md`](./setup_checklist.md)

**Goals:**  
- Create a clean local workspace.  
- Configure environment and dependencies.  
- Verify the app runs locally.

**Includes:**
- Repo clone / folder structure verification.  
- `.env` and `.env.example` creation.  
- API key configuration (OpenAI, Supabase, etc.).  
- Supabase + Vercel project linking.  
- `pnpm install` and `pnpm dev` run check.

---

## 2️⃣ Planning Loop
See: [`/prompts/literal/02_planning/architecture_planning.md`](../prompts/literal/02_planning/architecture_planning.md)

**Goals:**  
- Design architecture before any code.  
- Define data model, core entities, and dependencies.  
- Generate `/docs/architecture.md` using the Planning Loop prompt.

---

## 3️⃣ Building Loop
See: [`/prompts/literal/03_building/build_loop.md`](../prompts/literal/03_building/build_loop.md)

**Goals:**  
- Implement core features based on the approved architecture.  
- Use Cursor’s Building Loop prompt to maintain consistent coding rhythm.  
- Commit and deploy frequently.

---

## 4️⃣ Debugging & QA
See: [`/prompts/literal/04_debugging/debug_prompt.md`](../prompts/literal/04_debugging/debug_prompt.md)

**Goals:**  
- Systematically identify and resolve issues.  
- Verify end-to-end functionality and performance baselines.

---

## 5️⃣ Reflection & Documentation
See: [`/prompts/literal/05_reflection/reflection_prompt.md`](../prompts/literal/05_reflection/reflection_prompt.md)

**Goals:**  
- Write daily retros (`/docs/retro.md`).  
- Update README and Architecture docs with final details.  
- Record what worked, what didn’t, and next-phase improvements.

---

## 6️⃣ Handoff / Submission
See: [`/prompts/literal/06_handoff/handoff_prompt.md`](../prompts/literal/06_handoff/handoff_prompt.md)

**Goals:**  
- Package the final deliverable for Gauntlet submission.  
- Ensure deployment, documentation, and codebase are clean.  
- Prepare Demo Day presentation materials.

---

## Summary Workflow

```mermaid
graph TD
  A[Receive Requirements] --> B[Project Setup]
  B --> C[Planning Loop]
  C --> D[Building Loop]
  D --> E[Debugging & QA]
  E --> F[Reflection]
  F --> G[Handoff / Submission]