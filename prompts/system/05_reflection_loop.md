## Metadata
- **Phase:** {{phase-number}}
- **Mode:** Ask
- **Output Path:** `/docs/operations/phases/phase-{{phase-number}}-05-reflect.md`

---

# Reflection Loop System Prompt

Use this after completing a major development phase to analyze outcomes, document learnings, and prepare improvements for the next phase.  
The Reflection Loop helps identify what worked well, what caused friction, and what adjustments to make to enhance quality, speed, and collaboration.

---

## Prompt Template

We are entering the **Reflection Loop** for this phase.

Please:
1. Summarize the completed phase, its objectives, and actual results.  
2. Review what went well — successes, smooth processes, design wins.  
3. Identify what didn’t go well — blockers, inefficiencies, or gaps.  
4. Analyze the **root causes** of any issues (technical, organizational, or procedural).  
5. Record improvements to apply in upcoming phases.  
6. Assess testing, documentation, and communication quality.  
7. Provide an overall performance score for the phase (0–100%) based on goals achieved.  
8. Generate concise recommendations for the next phase and for long-term system evolution.

---

## Guidance Notes
- Be honest and specific — reflections are for *continuous improvement*, not evaluation.  
- Focus on *patterns*, not just individual incidents.  
- Each reflection should end with *3 actionable takeaways* for the next phase.  
- Consider both **technical** (architecture, tools, code quality) and **process** (time use, clarity, communication) factors.  
- Link reflections to checkpoint tags if applicable (for traceability).

---

## Output Format

The resulting document should be stored as:  
`/docs/operations/phases/phase-{{phase-number}}-05-reflect.md`

It should include the following sections:

1. **Phase Context**
   - Phase number, name, and date  
   - Duration of the phase  
   - Key objectives or deliverables  
   - Checkpoint tag or commit reference (if applicable)

2. **Achievements**
   - Completed goals and deliverables  
   - Notable successes or breakthroughs  
   - Metrics or validation results achieved  

3. **Challenges**
   - Issues encountered during development  
   - Debugging or workflow bottlenecks  
   - Missed targets, deferred tasks, or unstable areas  

4. **Root Cause Analysis**
   - Underlying causes of blockers or inefficiencies  
   - Environmental or procedural contributors  
   - Lessons learned from debugging or testing  

5. **Process Evaluation**
   - Code quality and architectural alignment  
   - Workflow/tooling effectiveness (Cursor, GitHub, etc.)  
   - Testing completeness and reliability  
   - Communication, documentation, and coordination quality  

6. **Phase Performance Score**
   - Quantitative evaluation (0–100%) based on success criteria  
   - Brief justification for score  

7. **Key Learnings**
   - 3–5 concise insights gained from this phase  
   - Examples: “Testing earlier reduced debugging time,” “Clearer prompt templates improved AI reliability.”  

8. **Actionable Improvements**
   - Specific changes to implement next phase (tools, process, architecture)  
   - Optional “Quick Wins” list for immediate adjustments  

9. **Forward Outlook**
   - Focus areas for the next phase  
   - Dependencies or unfinished items to revisit  
   - Opportunities for optimization or innovation  

10. **Reflection Summary**
   - 2–3 sentences summarizing the overall takeaway of this phase  
   - Tone: reflective, honest, forward-looking