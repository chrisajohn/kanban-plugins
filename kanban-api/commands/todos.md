---
description: Show current todos overview with status, priority, and due dates
hint: "[filter: status/project/workspace/priority]"
---

Show the user's current todos using the `mcp__kanban-api__list_todos` tool.

Parse any filters from the argument: $ARGUMENTS

- "work" or "professional" → workspace: "professional"
- "personal" → workspace: "personal"
- "in progress" → status: "in-progress"
- "high priority" → priority: "high"
- A project name → project: "<slug>" (call `mcp__kanban-api__list_projects` first to resolve)

Display as a clean summary grouped by status (in-progress, waiting, ready, not-ready, done). Show:
- Numeric ID, title, priority, due date, project, tags
- Highlight overdue items
- One line per todo, concise
