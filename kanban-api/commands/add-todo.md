---
description: Create a new todo in the kanban app
hint: "[title or description of the todo]"
---

Create a new todo using the `mcp__kanban-api__create_todo` tool.

Parse the argument: $ARGUMENTS

Extract:
- `title` (required) — the main task description
- `priority` — "high", "medium", or "low" if mentioned
- `due` — YYYY-MM-DD (interpret relative dates like "tomorrow", "Friday" relative to today)
- `project` — project name (resolve slug via `mcp__kanban-api__list_projects`)
- `tags` — any hashtags or explicit tags
- `workspace` — "professional" if work-related, otherwise "personal"; "work" means "professional"
- `status` — default "ready" unless specified
- `body` — any additional detail beyond the title

Only pass fields that were mentioned. Confirm what was created in 1-2 lines.
