---
description: Create a new knowledge base page
hint: "[title and content or topic]"
---

Create a knowledge base page using `mcp__kanban-api__create_page`.

Parse the argument: $ARGUMENTS

Extract:
- `title` (required)
- `type` — decision, analysis, reference, notes, runbook (default "notes")
- `project` — resolve slug via `mcp__kanban-api__list_projects`
- `tags` — any tags mentioned
- `workspace` — "professional" or "personal" (default "personal")
- `body` — markdown content

If the user gives a topic but no body, generate a starter template:
- **decision** — Context, Options, Decision, Rationale
- **analysis** — Summary, Findings, Recommendations
- **reference** — Overview, Details, Links
- **notes** — freeform
- **runbook** — Prerequisites, Steps, Troubleshooting

Confirm what was created in 1-2 lines.
