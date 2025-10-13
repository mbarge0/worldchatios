# Testing Prompts and Workflow

A focused set of prompts to reinforce test-driven development (TDD).

---

## Phase Initialization Add-On
Use this at the end of the Phase Starter prompt:
> Also, generate a Testing Plan for this phase.
> - Identify which modules and functions require unit, integration, or E2E tests.
> - Specify what each test should validate and note edge cases.
> - Include test file paths you’ll create for each.

---

## Mid-Phase Testing Prompt
Run this halfway through the phase:
> Review all new files so far and identify which lack corresponding test coverage.
> Generate placeholder test files with basic structure (`describe`, `it`, mocks).
> Mark TODOs where implementation details are missing.

---

## Phase Validation Prompt
Before phase closure:
> Review all code and tests from this phase.
> Summarize test coverage.
> Identify missing or redundant tests.
> Add or adjust tests to ensure reliability.
> Provide a short test coverage summary for my reflection log.

---

## AI Feature Safety Prompt
For OpenAI or other API modules:
> Generate mock-based tests that simulate:
> - Successful model responses
> - Invalid or malformed responses
> - Rate limit or timeout errors  
> Ensure UI or API responds gracefully in all cases.