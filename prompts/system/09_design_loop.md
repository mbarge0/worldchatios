## Metadata
- **Phase:** {{phase-number}}
- **Mode:** Designer
- **Output Path:** `/docs/operations/phases/phase-{{phase-number}}-03-design.md`

---

# Design Loop System Prompt

Use this during the **Design Phase** to define the UI/UX specifications for upcoming implementation.  
This loop precedes the Build Phase and focuses on usability, aesthetics, and interaction fidelity.

---

## Prompt Template

We are entering the **Design Loop** for this phase.

Please:
1. Review the PRD, architecture diagram, and feature checklist for context.  
2. Define the **user interface layout** for the target module(s).  
3. Specify colors, typography, spacing, and hierarchy using modern UI/UX best practices.  
4. Identify each UI component (e.g., Toolbars, Buttons, Sidebars, Modals) and describe their roles and states (default, hover, active, focus).  
5. Provide simple **ASCII or Markdown wireframes** for layout visualization.  
6. Include accessibility and motion guidelines (keyboard navigation, contrast ratios, animation timing).  
7. Reference **shadcn/ui**, **Tailwind v3.4+**, **Lucide icons**, and **Framer Motion** for component structure and animation standards.  
8. Suggest responsive breakpoints and describe how layout adapts for tablet and mobile.  
9. Deliver component hierarchy, color tokens, and typography tokens ready for use by the Build Phase.  
10. Pause for confirmation before transitioning to Build.

---

## Guidance Notes
- Keep designs modular and system-driven; avoid inline or ad hoc styling.  
- Maintain a consistent 8px spacing grid and typography scale.  
- Ensure accessibility (WCAG AA or higher).  
- Use Tailwind’s `font-`, `text-`, `space-`, and `rounded-` utilities to standardize look and feel.  
- Animations should be subtle (100–250 ms) and use easing curves (`ease-in-out`, `ease-out`).  
- Prioritize usability over decoration.

---

## Output Format

The resulting document should be stored as:  
`/docs/operations/phases/phase-{{phase-number}}-02-design.md`

It should contain the following sections:

1. **Phase Context**
   - Phase number, name, and date  
   - Design scope and related features  
   - References to PRD and architecture  

2. **Visual Objectives**
   - Primary goals of the design (clarity, modernity, accessibility, responsiveness)  

3. **Layout Description**
   - Textual or Markdown wireframe of main UI  
   - Notes on spacing, margins, and component positioning  

4. **Component Specifications**
   - List of UI components with description and states  
   - Interaction details (hover, focus, motion)  

5. **Color & Typography System**
   - Palette with Tailwind tokens  
   - Font sizes, weights, and line heights  

6. **Responsive & Accessibility Guidelines**
   - Breakpoints and adaptive layout rules  
   - Accessibility notes (focus rings, contrast ratios)  

7. **Design Assets Summary**
   - Components to hand off to Build Phase  
   - References to icon libraries or assets  

8. **Next Steps**
   - Confirmation items before implementation  
   - Open questions or dependencies