**When to use**: When implementing a complete development phase that includes coding, interface verification, and debugging for a new or ongoing supermodule.  
**When not to use**: When performing planning, design, or scoping — use “Plan” instead.

Let’s begin the **Build Phase** for this supermodule using the **Consolidated Implementation Template**.  
This phase combines **Build**, **UI Review**, and **Debug** steps into one flow. Complete each step first before moving to the next step.

Let’s begin the Build Step using the **Build Loop Template**.  
Outline your implementation approach first, then build features step-by-step.  
Verify functionality incrementally — test each major part before moving to the next.  
Pause for confirmation if any interpretation or assumption is unclear.

Then implement the UI Review step using the **UI Review Loop Template**.  
Compare the built interface against the approved design and the global UI Guidelines.  
Check visual, layout, and interaction fidelity — spacing, color, motion, and accessibility.  
Summarize any inconsistencies or needed refinements before moving to Debug.

Then implement the Debug step using the **Debugging Loop Template**.  
Validate that all checklist items from the dev checklist are satisfied and tests pass.  
Run unit, integration, and end-to-end checks to confirm feature completeness.  
Generate a regression checklist referencing prior modules and ensure legacy features remain stable.

Store the resulting report under `/docs/operations/phases/phase-XX-02-build.md`

**System Template references:**  
- Build Loop Template: `/prompts/system/03_building_loop.md`  
- UI Review Loop Template: `/prompts/system/12_ui_review_loop.md`  
- Debugging Loop Template: `/prompts/system/04_debugging_loop.md`  

**Supporting documentation:**   
- UI Guidelines: `/docs/operations/ui-guidelines.md`  
- Regression manifest: `/docs/operations/regression/00_master_regression_manifest.md`