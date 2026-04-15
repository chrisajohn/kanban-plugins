---
name: todo-management
description: This skill should be used when the user asks to add a todo, create a task, check my todos, what's on my plate, update a todo, mark as done, show my tasks, list todos, what am I working on, move to in-progress, show my projects, or mentions managing tasks, todos, or project items. Provides knowledge of the kanban API and MCP tools.
user-invocable: false
---

# Kanban API — Todo Management

You have access to a hosted kanban todo app via MCP tools. The tools are provided by the `kanban-api` MCP server.

## Available MCP Tools

### Todos
- **`mcp__kanban-api__list_todos`** — List todos with optional filters: status, project, workspace, priority, include_done
- **`mcp__kanban-api__get_todo`** — Get a single todo by slug ID
- **`mcp__kanban-api__create_todo`** — Create a todo with title, status, priority, due, project, tags, workspace, body
- **`mcp__kanban-api__update_todo`** — Update a todo's fields (only send what's changing)
- **`mcp__kanban-api__delete_todo`** — Delete a todo

### Projects
- **`mcp__kanban-api__list_projects`** — List projects with optional workspace filter
- **`mcp__kanban-api__create_project`** — Create a project with name, description, color, workspace
- **`mcp__kanban-api__update_project`** — Update a project
- **`mcp__kanban-api__delete_project`** — Delete a project

### Knowledge Base Pages
- **`mcp__kanban-api__list_pages`** — List pages with optional type, project, workspace filters
- **`mcp__kanban-api__get_page`** — Get a page with full body content
- **`mcp__kanban-api__create_page`** — Create a page with title, type, project, tags, workspace, body
- **`mcp__kanban-api__update_page`** — Update a page
- **`mcp__kanban-api__delete_page`** — Delete a page

## Key Concepts

### Statuses
`not-ready` → `ready` → `in-progress` → `waiting` → `done`

### Workspaces
Todos and projects have a `workspace` field: `personal` (default) or `professional`.

### Done Auto-Hide
Items with status "done" are hidden after 7 days (based on `done_date`). Pass `include_done: true` to see them.

### IDs
Todos have both a string slug (`id`) and a numeric ID (`numericId`). Use the slug for API operations. The numeric ID is for user-facing display (`#42`).

### Project Todos
Todos can belong to a project. Pass the `project` parameter with the project slug when operating on project todos.

### Sorting
Priority (high → medium → low → none), then due date (soonest first), then created date (newest first).
