# Cursor Gauntlet Mode Configuration (v2)

## Overview
This configuration defines the **Gauntlet Mode** operating system for all AI-first development projects.  
It governs how Cursor behaves, how code is structured, and how each phase of development should proceed using your literal and system prompt libraries.

---

### 1. Mode Definition
**Mode Name:** Gauntlet Mode  
**Purpose:** Structured AI-first development with phase control, testing rigor, and reflection checkpoints.  
**Primary Directories:**  
- /prompts/system/  
- /prompts/literal/  
- /docs/reflections/  
- /docs/  
- /tests/

---

### 2. Behavioral Rules
- Always confirm before executing major code actions, refactors, or deletions.  
- Follow **phase-based prompting** using the literal prompt system.  
- Maintain **context discipline**: summarize each phase and open a new tab for subsequent phases.  
- Reference corresponding **system templates** for prompt structure.  
- Keep context below 90%. When context approaches 85–90%, create a phase summary and start a new tab.  
- Generate reflections at the end of each phase and save to `/docs/reflections/`.  
- All generated or modified code must comply with **/docs/coding_rules.md**.  
- Always run or write tests before confirming “feature complete.”  

---

### 3. Development Philosophy
1. Build for clarity first, scale second.  
2. Every feature ships with testing infrastructure.  
3. Never refactor blindly — reflect and plan first.  
4. Code → Test → Document → Reflect. (CTDR rhythm)  
5. Human judgment precedes AI execution.  
6. Cursor operates as a pair engineer — all work should follow conversational confirmation loops.

---

### 4. Testing Expectations
- Write or update **unit, integration, and end-to-end tests** for each new feature or modification.  
- Store tests under:
  - `/tests/unit/`
  - `/tests/integration/`
  - `/tests/e2e/`
- Validate new code against existing tests before merging.  
- If new functionality breaks existing tests, run a “Debugging Loop” using `/prompts/system/04_debugging_loop.md`.  
- When test coverage feels incomplete, use “Testing Loop” to generate or expand test cases.

---

### 5. Reflection Protocol
At the end of each phase:
1. Run a Reflection prompt from `/prompts/literal/05_reflection/`.  
2. Save reflection under `/docs/reflections/{phase_name}.md`.  
3. Use this summary to initialize the next phase tab.  
4. Record in each reflection:
   - Completed objectives  
   - Remaining open issues  
   - Pending enhancements  
   - Lessons learned  

---

### 6. Confirmation & Safety Layer
Before executing any major change, Cursor must ask:
> “Do you want me to proceed with implementation based on this plan?”

If confirmed → proceed.  
If not → pause and clarify assumptions.

---

### 7. Coding Rules Reference
All code written, refactored, or reviewed must comply with:  
**/docs/coding_rules.md**

Before generating new modules, Cursor should:
- Load the rules from that file.  
- Apply all naming, testing, and structure conventions.  
- Cross-check linting, typing, and modularity expectations.  
- Reference style decisions (e.g., React patterns, API structure, database conventions).  

If code generation or test output conflicts with the coding rules, Cursor must **pause and request human confirmation.**

---

### 8. Template Pathing
**Phase Template References**
- Phase Start Template → `/prompts/system/01_phase_start.md`  
- Planning Loop Template → `/prompts/system/02_planning_loop.md`  
- Building Loop Template → `/prompts/system/03_building_loop.md`  
- Debugging Loop Template → `/prompts/system/04_debugging_loop.md`  
- Reflection Loop Template → `/prompts/system/05_reflection_loop.md`  
- Handoff Loop Template → `/prompts/system/06_handoff_loop.md`  

**Literal Prompt Directory:** `/prompts/literal/`

---

### 9. Logging Protocol
- Maintain a running development log under `/docs/log.md`.  
- Each log entry must include:
  - Timestamp  
  - Phase name  
  - Key actions  
  - Test result summary  
  - Reflection notes  
- Major issues should be prefixed with `❗` for visibility and follow-up.

---

### 10. Context Safeguards
- Cursor must alert when context usage exceeds 80%.  
- Before new phase work begins, generate a **context summary** (3–6 sentences).  
- Include this summary at the top of the next phase’s first literal prompt.  
- If context drift occurs, Cursor should reinitialize behavior by referencing this configuration file.

---

### 11. Quick Start
To initialize any new project in Gauntlet Mode:

1. Place this file in the project root.  
2. Open Cursor → new tab → paste a literal prompt (e.g. “New Phase Initialization”).  
3. Cursor reads this configuration automatically.  
4. Confirm operational readiness with:  
   ```
   Confirm you’re operating in Gauntlet Mode and have loaded /docs/coding_rules.md.
   ```
5. Begin structured AI-first development.

---

### 12. Notes
This configuration acts as your *pair engineering agreement* between human and AI.  
It defines how to think, build, test, and reflect in a high-performance AI-first development cycle.

---