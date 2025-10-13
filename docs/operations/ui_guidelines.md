# UI Guidelines

## 1. Principles
- Minimal, clean, modern UI (like Linear or Notion).
- Prioritize clarity, usability, and speed over visual novelty.
- Consistent use of Tailwind + shadcn/ui components.

## 2. Layout Standards
- Base layout: responsive grid + sidebar + header.
- Typography: Tailwind’s defaults (no custom fonts initially).
- Color: neutral palette, 1 accent color max.
- Spacing: consistent padding/margin (use Tailwind scale).

## 3. Component Guidelines
| Type | Rules |
|------|-------|
| Buttons | Use shadcn/ui `Button`; minimal variants. |
| Inputs | Always labeled; support validation messages. |
| Cards | Use for grouping; keep shadows subtle. |
| Modals | Use consistent overlay + escape behavior. |

## 4. Workflow
1. Define UI requirements in PRD’s UX section.
2. Cursor builds layout + core components in the same phase.
3. Log micro-iterations in `iteration_log.md`.
4. Run live preview and self-review for readability.

## 5. Review Prompt
> “Review UI for alignment, consistency, and spacing. Suggest improvements for clarity.”