# Risk & Stability Checklist

Use this before adding new features, refactoring, or large architectural changes.

---

## Prompt Template
I’m about to modify or extend an existing feature.

Evaluate the following risks and confirm mitigations:
1. Will this change impact any tested modules?
2. Are there shared components, stores, or hooks that may break?
3. Does this phase have sufficient test coverage for the impacted files?
4. Is there a rollback plan or version checkpoint?

Please:
- Review the relevant areas of the codebase.
- Identify specific files or functions at risk.
- Suggest pre-change tests or mocks that should be created.
- Summarize safety measures before proceeding.