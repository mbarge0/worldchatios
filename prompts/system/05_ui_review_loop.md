## Metadata
- **Phase:** {{phase-number}}
- **Mode:** Agent
- **Output Path:** `/docs/operations/phases/phase-{{phase-number}}-03-ui-review.md`

---

# UI Review System Prompt

Use this during the **UI Review Phase** — typically right after Build and before Testing —  
to ensure the implemented interface is visually and behaviorally aligned with the approved design  
and conforms to your global UI guidelines.

---

## Prompt Template

We are now performing a **UI Review** for this phase.

Please:

1. Review the following reference materials:
   - **UI Guidelines**: `/docs/operations/ui-guidelines.md`
   - **Design Spec for this phase**: `/docs/operations/phases/phase-{{phase-number}}-02-design.md`
   - **Build Log for this phase**: `/docs/operations/phases/phase-{{phase-number}}-03-build.md`
2. Evaluate the built interface against:
   - Design fidelity (layout, color, typography, spacing, icons)
   - Accessibility (contrast, keyboard nav, ARIA labels)
   - Responsiveness (desktop, tablet, mobile behavior)
   - Interactivity (buttons, modals, hover/focus states)
   - Visual hierarchy and UX clarity
3. Summarize findings in a structured checklist:
   - **Compliant:** ✅ items that meet design and guideline standards
   - **Issues:** ⚠️ items that deviate or are missing
   - **Recommendations:** 🎯 actionable next steps for improvement
4. Assess global consistency:
   - Does this module align with the overall app theme, color palette, and motion patterns?
   - Are reusable components consistent (buttons, modals, input fields, etc.)?
5. Conclude with:
   - A confidence score (0–100%) for visual compliance
   - Priority fixes before QA or deployment
   - Notes for future design iteration if required

---

## Guidance Notes

- **Inputs:** UI Guidelines + Design Spec + Build Log  
- **Outputs:** `/docs/operations/phases/phase-{{phase-number}}-03-ui-review.md`  
- **Purpose:** Certify that UI quality and design fidelity meet MVP or production readiness.  
- **Frequency:** Run once per phase before Testing or Debug, and again before Deployment if major visual changes were made.  
- **Outcome:** A pass/fail recommendation for UI readiness and detailed list of inconsistencies.

---

## Output Format

The resulting document should be stored as:

`/docs/operations/phases/phase-{{phase-number}}-03-ui-review.md`

and contain the following sections:

1. **Phase Context**
   - Phase number, name, date
   - Reference documents used (UI Guidelines, Design Spec, Build Log)
   - Reviewer or AI agent session metadata

2. **Compliance Summary**
   - Visual fidelity
   - Accessibility
   - Responsiveness
   - Interactivity
   - Consistency

3. **Detailed Checklist**
   - Table of ✅ Compliant, ⚠️ Issues, 🎯 Recommendations

4. **Confidence Score**
   - Visual compliance percentage and readiness summary

5. **Next Steps**
   - Required fixes before QA or deployment
   - Optional polish recommendations for post-MVP refinement