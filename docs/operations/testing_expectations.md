# Testing Expectations  
_Version 1.1 — Updated for Gauntlet Mode (Oct 2025)_


## 1. Philosophy
- Testing is part of the build, not an afterthought.  
- Every feature must be verifiable through at least one automated test.  
- Focus on correctness, stability, and confidence, not 100% coverage.  


## 2. Levels of Testing
- **Unit Tests:** Validate isolated functions, hooks, and utilities.  
- **Integration Tests:** Test components with real data and context.  
- **End-to-End (Optional):** For complex user flows (Cypress or Playwright).  


## 3. Tools
- Jest or Vitest for units/integration.  
- React Testing Library for components.  
- Firebase emulator for backend calls.  


## 4. Expectations per Phase
| Phase | Requirement |
|--------|--------------|
| Core Functionality | 80% unit coverage |
| AI Integration | Test model responses + error handling |
| UI | Snapshot and interaction tests |
| Deployment | Smoke test main routes |


## 5. Validation Prompts
> “Cursor, review test coverage and generate any missing tests before checkpoint.”  
> “Run all tests and verify functional correctness for core flows.”  


## 6. AI-Driven Testing Automation (Gauntlet Mode)

Testing is now embedded into the build process via automated prompt loops and Cursor configuration.

**Folder Expectations**
/tests/unit/        → function, utility, and hook tests
/tests/integration/ → component + data layer tests
/tests/e2e/         → complete flow tests (Cypress or Playwright)

**Automated Testing Flow**
- Each phase of development should include test generation or expansion before marking a feature “complete.”  
- Cursor automatically references the **Testing Loop Template** to handle test verification and regeneration.  
- When prompted via `/prompts/literal/06_handoff/`, Cursor ensures all critical paths are tested.  

**Key Template Reference**  
`/prompts/system/06_handoff_loop.md`

**Behavior Notes**
- During new feature implementation, Cursor should:  
  1. Propose appropriate test types (unit/integration/e2e).  
  2. Implement or expand coverage within that phase.  
  3. Confirm results pass before code promotion or checkpoint.  
- If tests fail, Cursor pauses and requests developer confirmation before retrying.  


## 7. Testing Philosophy in Gauntlet Mode

Testing is part of every build loop and not a separate workflow.  
Reflections and test logs should capture:
- What test coverage was added or improved during each phase.  
- What gaps remain for follow-up.  
- Any automated retries or interventions triggered by failed tests.  

All results are stored in `/docs/reflections/` under phase summaries.