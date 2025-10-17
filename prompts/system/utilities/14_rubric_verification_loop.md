## Metadata
- **Phase:** {{phase-number}}
- **Mode:** Ask
- **Output Path:** `/docs/operations/phases/phase-{{phase-number}}-05-verification.md`

---

# Rubric Verification Loop System Prompt

Use this system prompt for **final validation and quality assurance** after project completion or deployment.  
This loop is designed to ensure that the project meets **all rubric criteria**, **functional requirements**, and **quality standards** prior to final submission or sign-off.

It acts as the closing phase of a development cycle — verifying correctness, completeness, performance, and documentation.

---

## Prompt Template

We are entering the **Rubric Verification Loop** for this phase.

Please:
1. Identify the **type of verification** — *Final Rubric Review*, *QA Audit*, or *Pre-Submission Validation*.  
2. Retrieve the project rubric or evaluation criteria (if available).  
3. Summarize all key project deliverables, including deployed URL, build version, documentation, and assets.  
4. Verify each rubric category against the deployed project:
    - Functionality  
    - Performance & Responsiveness  
    - Persistence & Data Handling  
    - Scalability (stress and edge tests)  
    - Accessibility & Usability  
    - Visual Design & Branding  
    - AI Agent Functionality (if applicable)  
    - Documentation & Deliverables (Dev Log, Video, README)  
5. Conduct practical validation tests — e.g., create multiple shapes, move items, refresh browser, test login flow, etc.  
6. Log test results and evidence for each criterion, marking **Pass / Needs Review / Fail**.  
7. Note any regressions or deviations from prior verified builds.  
8. Summarize overall rubric alignment with a table of results.  
9. Provide a list of required or recommended fixes (if any).  
10. Record key observations, learnings, and final submission readiness verdict.

---

## Guidance Notes

### Final Rubric Review
- Run this before submitting the project or milestone.  
- Validate each rubric item against the current deployed version.  
- Focus on completeness, correctness, and stability.  
- Include visual and behavioral evidence where possible (screenshots, logs, URLs).

### QA Audit
- Use for broader quality validation, even outside of formal rubric evaluation.  
- Confirm performance, accessibility, and cross-browser behavior.  
- Optionally extend with Lighthouse, axe-core, or manual tests.

### Pre-Submission Validation
- A lighter pass focused on final polish, deliverables, and submission readiness.  
- Confirm that required documents (development log, video, etc.) are complete and properly linked.

**General Rules:**
- Verify every rubric category, even if it appears obvious.  
- Document exact test cases and evidence for transparency.  
- Capture edge case results (e.g., max object count, offline refresh).  
- After completion, mark the verification status (Pass / Needs Review / Fail) for each rubric group.  
- If “Needs Review” or “Fail,” schedule a short Debug Loop before resubmission.

---

## Output Format

The resulting document should be stored as:  
`/docs/operations/phases/phase-{{phase-number}}-05-verification.md`

It should include the following sections:

1. **Verification Context**
   - Phase number, name, and date  
   - Verification type: *Final Rubric Review*, *QA Audit*, or *Pre-Submission Validation*  
   - Deployed URL or build reference  
   - Summary of project artifacts reviewed (e.g., docs, demo video, etc.)

2. **Rubric Summary**
   - Overview of rubric categories  
   - Source of rubric (link or attached document)  
   - Any weighting or scoring scheme applied  

3. **Functional Verification**
   - Core features tested and their results  
   - Step-by-step test actions and observations  
   - Screenshots or logs supporting results  

4. **Performance & Stability**
   - Load, latency, and rendering performance  
   - Error handling and edge-case behavior  
   - Browser and device compatibility  

5. **Persistence & Scalability**
   - Data integrity across reloads or sessions  
   - High-volume operations (e.g., 500+ shapes)  
   - Storage and sync validation  

6. **Accessibility & UI/UX**
   - Layout, color contrast, keyboard navigation  
   - Responsive behavior across screen sizes  
   - Brand consistency and visual quality  

7. **AI Agent Functionality (if applicable)**
   - Command interpretation accuracy  
   - Tool execution (e.g., createShape, moveShape)  
   - Response latency and error recovery  

8. **Documentation & Deliverables**
   - Presence and quality of development log  
   - Demo video completeness and clarity  
   - README and setup instructions accuracy  
   - Any missing or incomplete deliverables  

9. **Rubric Verification Table**
   | Category | Status | Notes |
   |-----------|---------|-------|
   | Functionality | ✅ Pass | All features working |
   | Performance | ⚠️ Needs Review | Minor lag under stress |
   | Accessibility | ✅ Pass | Contrast and focus validated |
   | Documentation | ❌ Fail | Missing updated video link |

10. **Outcome Summary**
   - Overall project status (Ready for Submission / Needs Rework / Pending Fixes)  
   - Summary of major strengths and weaknesses  
   - Required actions before submission  
   - Optional improvements for future versions  

11. **Next Steps**
   - Confirm readiness for final submission  
   - Identify any remaining fixes (delegate to Debug Loop if needed)  
   - Update the development log and checklist to reflect final validation results  
   - Record a “ready-for-submit” decision

---

## Integration Notes

This Rubric Verification Loop runs **outside** of the Supermodule pipeline.  
It is typically executed:
- After all build and debug loops are complete  
- Immediately before final submission or presentation  
- As a reusable audit literal for any future project

Store this literal in:  
`/literal/verification/rubric_verification.system.md`
and run it manually as a **post-sprint QA literal**.