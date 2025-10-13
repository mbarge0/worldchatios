## Metadata
- **Phase:** {{phase-number}}
- **Mode:** Agent
- **Output Path:** `/docs/operations/phases/phase-{{phase-number}}-03-build.md`

---

# Building Loop System Prompt

Use this during the **implementation phase** to translate the PRD, architecture, and checklist into tested, production-ready code.  
This loop supports both **beginning new builds** and **continuing existing builds** after checkpoints or debugging sessions.

---

## Prompt Template

We are entering the **Building Loop** for this phase.

Please:
1. Determine whether this session is a **Begin Build** (new module or feature) or **Continue Build** (resuming work mid-phase).  
2. Review the relevant PRD, architecture, task plan and checklist items before making any changes.  
3. Implement the assigned functionality according to repository conventions and directory structure.  
4. Maintain consistency with prior design, naming, and testing patterns.  
5. Record all major code changes, rationale, and testing results in this document.  
6. If continuing work, summarize prior progress, what remains, and any dependencies to validate.  
7. Run validation tests and note results before concluding the session.  
8. Pause before merging or deployment for review or checkpoint creation.

---

## Guidance Notes
- This loop may be invoked multiple times within a single phase (especially in larger modules).  
- Keep builds atomic: small, testable, and reversible.  
- Always verify you’re on the correct feature branch before proceeding.  
- Document not just *what* you built, but *why* design or implementation choices were made.  
- Use checkpoints at key milestones (component complete, test passing, major fix).  

---

## Output Format

The resulting document should be stored as:  
`/docs/operations/phases/phase-{{phase-number}}-03-build.md`

If `phase-{{phase-number}}-build.md` already exists, 
append new session entries under a heading:
### Continuation Session {{continuation-id}}
instead of overwriting the file.
Preserve all previous session logs.
Once the information has been appended, review the entire build log once more to ensure the document is completely up-to-date.

The build log should include the following sections:

1. **Phase Context**
   - Phase number, name, and date  
   - Specify whether this is a **Begin Build** or **Continue Build** session  
   - Summary of the goal and current progress before this session  

2. **Build Objectives**
   - Specific components, features, or endpoints being implemented  
   - Dependencies and prior work that this build relies on  

3. **Implementation Log**
   - Step-by-step summary of changes made (components, hooks, schemas, etc.)  
   - Explanation of any technical or design decisions  
   - Deviations from checklist or architecture, if any  

4. **Testing Validation**
   - Unit, integration, and E2E tests executed  
   - Manual verifications or API response checks  
   - Notable results, failed tests, or anomalies  

5. **Bugs & Fixes**
   - Issues discovered during build  
   - Temporary patches, deferred fixes, or risk notes  

6. **Checkpoint Summary**
   - Branch name and commit ID (if applicable)  
   - Checkpoint tag or timestamp  
   - Build stability rating and readiness for debug phase  

7. **Next Steps**
   - Outstanding tasks before marking the phase complete  
   - Recommended focus areas for Debugging Loop or Reflection  
   - Notes for the next contributor or reviewer