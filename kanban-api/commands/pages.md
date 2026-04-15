---
description: List and read knowledge base pages
hint: "[filter or page title to read]"
---

Show knowledge base pages using `mcp__kanban-api__list_pages`.

Argument: $ARGUMENTS

If the argument matches a specific page, call `mcp__kanban-api__get_page` to show its full body content.

Otherwise list pages showing title, type, project, tags, and created date. Parse filters:
- Page types: decision, analysis, reference, notes, runbook
- Project names
- Workspace: personal / professional
