---
description: Update an existing todo's status, priority, or other fields
hint: "[todo ID, name, or description] [changes]"
---

Update a todo using the `mcp__kanban-api__update_todo` tool.

Parse the argument: $ARGUMENTS

1. Call `mcp__kanban-api__list_todos` (with `include_done: true`) to find the matching todo by numeric ID, title, or slug. If ambiguous, show candidates and ask.

2. Determine changes:
   - "mark as done" / "complete" → status: "done"
   - "start" / "working on" → status: "in-progress"
   - "block" / "waiting" → status: "waiting"
   - "prioritize" / "urgent" → priority: "high"
   - "move to ready" → status: "ready"
   - "due Friday" → due: "YYYY-MM-DD"

3. Call `mcp__kanban-api__update_todo` with the slug ID and only changed fields. For project todos, include the project parameter.

Confirm the change in 1-2 lines.
