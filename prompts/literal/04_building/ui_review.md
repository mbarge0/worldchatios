**When to use**: After completing a Build phase and passing functional smoke tests, before entering Testing or Debug.  
**When not to use**: During early development or active building — only use once the UI is implemented and stable.  

Run this to conduct a **UI Review** — verifying that the implemented interface matches the **Design Spec** (`/docs/operations/phases/phase-XX-02-design.md`)  
and adheres to the **UI Guidelines** (`/docs/foundation/ui-guidelines.md`).

This prompt should:
- Compare the built UI to the intended design and global style guide.  
- Identify any visual, accessibility, or layout inconsistencies.  
- Generate a concise checklist report confirming compliance or listing deviations.  
- Recommend fixes or design clarifications for next iteration if needed.  

**System Prompt reference**: `/prompts/system/12_ui_review_loop.md`