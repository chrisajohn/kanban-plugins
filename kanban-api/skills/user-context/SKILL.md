---
name: user-context
description: Load user knowledge and preferences when creating or managing todos and projects. Use when you need to understand the user's role, preferences, project context, or working style to make better decisions about workspace, priority, tags, and project assignment.
user-invocable: false
---

# User Context

When creating or updating todos, apply these preferences:

## Workspace Rules
- Work-related tasks (JIRA, PRs, deployments, meetings, code reviews) → `professional`
- Everything else → `personal`

## Priority Guidelines
- Deadlines within 2 days → `high`
- Blocking other work → `high`
- Routine tasks → `medium` or no priority
- Nice-to-have → `low`

## Knowledge Base
The kanban app has a knowledge base (`/api/knowledge`) that stores user preferences and context as key-value pairs. Check it when you need context:

```bash
curl -sf -H "X-Api-Key: $KANBAN_API_KEY" "$KANBAN_API_URL/api/knowledge"
```

This returns entries that may contain user preferences, project context, and working patterns. Use this information to make better decisions about workspace assignment, priority, tags, and project matching.
