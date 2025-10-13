## Metadata
- **Document Type:** System Prompt
- **Loop Type:** Checklist Loop
- **Mode:** Ask
- **Output Path:** `/docs/foundation/dev_checklist.md`

---

# Checklist Loop System Prompt

Use this loop to **generate or review operational development checklists** that translate the PRD and Architecture into a clear, actionable execution plan.

This document defines **what will be built**, **in what order**, and **how success will be verified** — forming the bridge between planning and coding.

---

## Prompt Template

We are entering the **Checklist Loop**.

Please:
1. Read the current PRD and Architecture documents.  
2. Identify every major feature or module described.  
3. Translate each into **actionable, testable tasks**.  
4. Organize tasks by module or phase (e.g., Auth, Channels, Messaging, Testing, Deployment).  
5. For each task, specify:
   - Dependencies (prerequisite modules or setup)
   - Acceptance criteria (definition of done)
   - Testing expectations (unit, integration, E2E)
6. Group and order tasks logically — by **Day/Phase**, **Module**, or **Milestone**.  
7. Produce a Markdown checklist suitable for iterative tracking and validation.
8. Pause before writing to confirm completeness and clarity with the user.

---

## Guidance Notes

- Each task should be **independently verifiable** — ideally testable or demoable.  
- Use **~80–100 sub-tasks** for a full project-level checklist (roughly 10–12 modules).  
- Cross-reference PRD features and Architecture entities to ensure complete coverage.  
- Keep dependencies clear: a developer should be able to pick any task and know what comes before it.  
- Group testing tasks within their modules unless the project requires a dedicated QA section.  
- Use concise, action-oriented phrasing (“Implement,” “Add,” “Test,” “Deploy,” etc.).  
- Reference associated files or directories (e.g., `app/api/`, `lib/hooks/`, `config/env.ts`).

---

## Output Format

The resulting document should be stored as:  
`/docs/foundation/dev_checklist.md`

It should include the following sections:

1. **Overview**
   - Brief description of the checklist’s scope and objectives  
   - Estimated total number of tasks  
   - Relation to current PRD and Architecture documents  

2. **Structure**
   - Organized by module and timeline (e.g., “Day 1 Morning – Environment Setup”)  
   - Each section labeled with phase, module name, and approximate time allocation  

3. **Module Sections**
   - For each module:
     - **Module Number and Title** (e.g., #1 Authentication, #2 Messaging, #3 Presence)  
     - **Subtasks List** (checkbox list `- [ ] Task Name`)  
     - **Acceptance Criteria** (bullet list or inline for each task)  
     - **Dependencies** (modules or steps required first)  
     - **Testing Expectations** (unit, integration, E2E)  

4. **Cross-Module Tasks**
   - Shared responsibilities like deployment, documentation, and error handling  

5. **Testing Coverage Map**
   - Summary of where testing occurs across the checklist  
   - Identify gaps or deferred QA tasks  

6. **Completion Definition**
   - Clear criteria for considering the project checklist complete  
   - Includes quality targets (e.g., 100% task completion, 90% test pass rate)  

7. **References**
   - Link back to `/docs/foundation/project-prd.md` and `/docs/foundation/architecture.md`  
   - Mention `/docs/schema.sql` if relevant  
   - Note the next phase to begin after checklist completion

---

## Output Instructions

- Before generating the document, confirm with the user:  
  > “Would you like to create or update the **development checklist** at `/docs/foundation/dev_checklist.md`?”  

- If confirmed, write the Markdown file to:  
  `/docs/foundation/dev_checklist.md`

- Standard filenames for foundation documents:
  - PRD: `project-prd.md`
  - Architecture: `architecture.md`
  - Checklist: `dev_checklist.md`