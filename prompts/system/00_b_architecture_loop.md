## Metadata
- **Document Type:** System Prompt
- **Loop Type:** Architecture Loop
- **Mode:** Ask
- **Output Path:** `/docs/foundation/architecture.md`

---

# Architecture Loop System Prompt

Use this when defining or revisiting the **system architecture** for a new product, feature, or integration.  
This establishes the **technical foundation** before implementation begins and should remain the **single source of truth** for system structure.

---

## Prompt Template

We are entering the **Architecture Loop**.

Please:
1. Define the overall system structure and primary modules.  
2. Describe how components, APIs, and services interact.  
3. Specify core entities, their fields, and relationships.  
4. Map key data flows (input → processing → output).  
5. Identify dependencies, integrations, and libraries.  
6. Note architectural risks, trade-offs, or assumptions.  
7. Outline scalability, security, and testing considerations.  
8. Define **performance and scaling targets**, including expected load, latency thresholds, and optimization strategies.  
9. List **risks and unknowns**, including unvalidated assumptions, bottlenecks, and mitigation strategies.  
10. End with concrete next steps for implementation or checklist generation.

---

## Guidance Notes

- Keep the document **project-level** — not phase-specific.  
- Reference the PRD for *functional intent* and the Checklist for *execution sequencing*.  
- Maintain clarity and traceability: link directly to `/docs/foundation/project-prd.md` and `/docs/foundation/dev_checklist.md` where applicable.  
- Revisit this document whenever **core infrastructure**, **data models**, or **system integrations** change.  
- Prefer diagrams or text-based flow representations for high-level overviews.  

---

## Output Format

The resulting document should be stored as:  
`/docs/foundation/architecture.md`

It should include the following sections:

1. **System Overview**
   - Description of the system’s purpose and scope  
   - Core problem(s) it solves and how it fits within the broader product  

2. **System Diagram**
   - Conceptual map or ASCII diagram of main components  
   - Key relationships between modules, APIs, and databases  

3. **Core Entities and Data Model**
   - List of primary entities and relationships (e.g., Users, Messages, Channels)  
   - Summary of data constraints and indexing strategy  

4. **Data Flow**
   - How data moves through the system from input → processing → output  
   - Event flow and real-time communication mechanisms (e.g., Supabase subscriptions)  

5. **Dependencies and Integrations**
   - Libraries, frameworks, and third-party APIs  
   - Auth providers, hosting platforms, and environment configuration  

6. **Security and Performance Considerations**
   - RLS or access control rules  
   - Performance expectations, latency goals, and caching strategy  
   - Known trade-offs or performance bottlenecks  

7. **Performance & Scaling**
   - Define target frame rates, latency thresholds, and concurrent user limits.  
   - Note caching, batching, or rate-limiting strategies that ensure stability under load.  

8. **Risks & Unknowns**
   - List unvalidated assumptions, dependencies, or potential bottlenecks.  
   - Describe mitigation strategies or future validation plans.  

9. **Design Notes**
   - Architectural principles, naming conventions, and implementation guidelines  
   - Rationale for design decisions or trade-offs  

10. **Next Steps**
   - 1–3 actionable steps for moving into implementation or checklist creation  
   - References to related documents (`project-prd.md`, `schema.sql`, etc.)

---

## Output Instructions

- Before generating the document, confirm with the user:  
  > “Would you like to create or update the **architecture document** at `/docs/foundation/architecture.md`?”  

- If confirmed, write the Markdown file to:  
  `/docs/foundation/architecture.md`

- Standard filenames for project foundation documents:
  - PRD: `project-prd.md`
  - Architecture: `architecture.md`
  - Checklist: `dev_checklist.md`

---

✅ **Highlights**
- Architecture Loop is now **project-level**, not tied to any phase  
- Harmonized with PRD and Checklist Loop structures  
- Includes metadata, clear output format, and confirmation workflow  
- Ready for consistent integration with Cursor’s Ask/Agent modes  