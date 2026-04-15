import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_URL = process.env.KANBAN_API_URL?.replace(/\/$/, "");
const API_KEY = process.env.KANBAN_API_KEY;

if (!API_URL || !API_KEY) {
  console.error(
    "KANBAN_API_URL and KANBAN_API_KEY must be set in environment."
  );
  process.exit(1);
}

// ── HTTP helpers ──────────────────────────────────────────────────────────

async function api(path, options = {}) {
  const res = await fetch(`${API_URL}/api${path}`, {
    headers: {
      "X-Api-Key": API_KEY,
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

const get = (path) => api(path);
const post = (path, data) =>
  api(path, { method: "POST", body: JSON.stringify(data) });
const put = (path, data) =>
  api(path, { method: "PUT", body: JSON.stringify(data) });
const del = (path) => api(path, { method: "DELETE" });

// ── MCP Server ────────────────────────────────────────────────────────────

const server = new McpServer({
  name: "kanban-api",
  version: "1.0.0",
});

// ── Todo tools ────────────────────────────────────────────────────────────

server.tool(
  "list_todos",
  "List all todos. Returns id, numericId, title, status, priority, due, project, tags, workspace, created, done_date, body for each todo.",
  {
    status: z
      .enum(["not-ready", "ready", "in-progress", "waiting", "done"])
      .optional()
      .describe("Filter by status"),
    project: z.string().optional().describe("Filter by project slug"),
    workspace: z
      .enum(["personal", "professional"])
      .optional()
      .describe("Filter by workspace"),
    priority: z
      .enum(["high", "medium", "low"])
      .optional()
      .describe("Filter by priority"),
    include_done: z
      .boolean()
      .optional()
      .describe("Include done items older than 7 days (default: false)"),
  },
  async ({ status, project, workspace, priority, include_done }) => {
    let todos = await get("/todos");

    if (status) todos = todos.filter((t) => t.status === status);
    if (project) todos = todos.filter((t) => t.project === project);
    if (workspace) todos = todos.filter((t) => t.workspace === workspace);
    if (priority) todos = todos.filter((t) => t.priority === priority);

    if (!include_done) {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      todos = todos.filter(
        (t) =>
          t.status !== "done" ||
          !t.done_date ||
          new Date(t.done_date).getTime() > sevenDaysAgo
      );
    }

    return {
      content: [{ type: "text", text: JSON.stringify(todos, null, 2) }],
    };
  }
);

server.tool(
  "get_todo",
  "Get a single todo by its slug ID. Use the id field (slug), not the numericId.",
  {
    id: z.string().describe("Todo slug ID"),
    project: z
      .string()
      .optional()
      .describe("Project slug (required for project todos)"),
  },
  async ({ id, project }) => {
    const path = project ? `/todos/${project}/${id}` : `/todos/${id}`;
    const todo = await get(path);
    return {
      content: [{ type: "text", text: JSON.stringify(todo, null, 2) }],
    };
  }
);

server.tool(
  "create_todo",
  "Create a new todo. Returns the created todo with its assigned ID.",
  {
    title: z.string().describe("Todo title (required)"),
    status: z
      .enum(["not-ready", "ready", "in-progress", "waiting", "done"])
      .optional()
      .describe("Status (default: ready)"),
    priority: z
      .enum(["high", "medium", "low"])
      .optional()
      .describe("Priority level"),
    due: z
      .string()
      .optional()
      .describe("Due date in YYYY-MM-DD format"),
    project: z.string().optional().describe("Project slug to assign to"),
    tags: z.array(z.string()).optional().describe("Tags"),
    workspace: z
      .enum(["personal", "professional"])
      .optional()
      .describe("Workspace (default: personal)"),
    body: z.string().optional().describe("Markdown body content"),
  },
  async (params) => {
    // Only send non-undefined fields
    const data = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined)
    );
    const todo = await post("/todos", data);
    return {
      content: [
        {
          type: "text",
          text: `Created todo #${todo.numericId}: ${todo.title}\n${JSON.stringify(todo, null, 2)}`,
        },
      ],
    };
  }
);

server.tool(
  "update_todo",
  "Update an existing todo. Only send the fields you want to change.",
  {
    id: z.string().describe("Todo slug ID"),
    project: z
      .string()
      .optional()
      .describe("Project slug (required for project todos)"),
    title: z.string().optional().describe("New title"),
    status: z
      .enum(["not-ready", "ready", "in-progress", "waiting", "done"])
      .optional()
      .describe("New status"),
    priority: z
      .enum(["high", "medium", "low"])
      .nullable()
      .optional()
      .describe("New priority (null to clear)"),
    due: z
      .string()
      .nullable()
      .optional()
      .describe("New due date YYYY-MM-DD (null to clear)"),
    tags: z.array(z.string()).optional().describe("Replace tags"),
    workspace: z
      .enum(["personal", "professional"])
      .optional()
      .describe("New workspace"),
    body: z.string().optional().describe("New body content"),
  },
  async ({ id, project, ...changes }) => {
    const data = Object.fromEntries(
      Object.entries(changes).filter(([, v]) => v !== undefined)
    );
    const path = project ? `/todos/${project}/${id}` : `/todos/${id}`;
    const todo = await put(path, data);
    return {
      content: [
        {
          type: "text",
          text: `Updated todo #${todo.numericId}: ${todo.title}\n${JSON.stringify(todo, null, 2)}`,
        },
      ],
    };
  }
);

server.tool(
  "delete_todo",
  "Delete a todo permanently.",
  {
    id: z.string().describe("Todo slug ID"),
    project: z
      .string()
      .optional()
      .describe("Project slug (required for project todos)"),
  },
  async ({ id, project }) => {
    const path = project ? `/todos/${project}/${id}` : `/todos/${id}`;
    await del(path);
    return { content: [{ type: "text", text: `Deleted todo: ${id}` }] };
  }
);

// ── Project tools ─────────────────────────────────────────────────────────

server.tool(
  "list_projects",
  "List all projects. Returns id, numericId, name, description, color, workspace for each.",
  {
    workspace: z
      .enum(["personal", "professional"])
      .optional()
      .describe("Filter by workspace"),
  },
  async ({ workspace }) => {
    let projects = await get("/projects");
    if (workspace) projects = projects.filter((p) => p.workspace === workspace);
    return {
      content: [{ type: "text", text: JSON.stringify(projects, null, 2) }],
    };
  }
);

server.tool(
  "create_project",
  "Create a new project.",
  {
    name: z.string().describe("Project name (required)"),
    description: z.string().optional().describe("Project description"),
    color: z.string().optional().describe("Hex color (e.g. #3b82f6)"),
    workspace: z
      .enum(["personal", "professional"])
      .optional()
      .describe("Workspace (default: personal)"),
  },
  async (params) => {
    const data = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined)
    );
    const project = await post("/projects", data);
    return {
      content: [
        {
          type: "text",
          text: `Created project: ${project.name}\n${JSON.stringify(project, null, 2)}`,
        },
      ],
    };
  }
);

server.tool(
  "update_project",
  "Update a project.",
  {
    id: z.string().describe("Project slug ID"),
    name: z.string().optional().describe("New name"),
    description: z.string().optional().describe("New description"),
    color: z.string().optional().describe("New hex color"),
    workspace: z
      .enum(["personal", "professional"])
      .optional()
      .describe("New workspace"),
  },
  async ({ id, ...changes }) => {
    const data = Object.fromEntries(
      Object.entries(changes).filter(([, v]) => v !== undefined)
    );
    const project = await put(`/projects/${id}`, data);
    return {
      content: [
        {
          type: "text",
          text: `Updated project: ${project.name}\n${JSON.stringify(project, null, 2)}`,
        },
      ],
    };
  }
);

server.tool(
  "delete_project",
  "Delete a project permanently.",
  { id: z.string().describe("Project slug ID") },
  async ({ id }) => {
    await del(`/projects/${id}`);
    return {
      content: [{ type: "text", text: `Deleted project: ${id}` }],
    };
  }
);

// ── Page tools ────────────────────────────────────────────────────────────

server.tool(
  "list_pages",
  "List all knowledge base pages. Returns id, numericId, title, type, project, tags, workspace, created for each.",
  {
    type: z
      .enum(["decision", "analysis", "reference", "notes", "runbook"])
      .optional()
      .describe("Filter by page type"),
    project: z.string().optional().describe("Filter by project slug"),
    workspace: z
      .enum(["personal", "professional"])
      .optional()
      .describe("Filter by workspace"),
  },
  async ({ type, project, workspace }) => {
    let pages = await get("/pages");
    if (type) pages = pages.filter((p) => p.type === type);
    if (project) pages = pages.filter((p) => p.project === project);
    if (workspace) pages = pages.filter((p) => p.workspace === workspace);
    return {
      content: [{ type: "text", text: JSON.stringify(pages, null, 2) }],
    };
  }
);

server.tool(
  "get_page",
  "Get a single knowledge base page with its full body content.",
  { id: z.string().describe("Page slug ID") },
  async ({ id }) => {
    const page = await get(`/pages/${id}`);
    return {
      content: [{ type: "text", text: JSON.stringify(page, null, 2) }],
    };
  }
);

server.tool(
  "create_page",
  "Create a new knowledge base page.",
  {
    title: z.string().describe("Page title (required)"),
    type: z
      .enum(["decision", "analysis", "reference", "notes", "runbook"])
      .optional()
      .describe("Page type (default: notes)"),
    project: z.string().optional().describe("Project slug"),
    tags: z.array(z.string()).optional().describe("Tags"),
    workspace: z
      .enum(["personal", "professional"])
      .optional()
      .describe("Workspace (default: personal)"),
    body: z.string().optional().describe("Markdown body content"),
  },
  async (params) => {
    const data = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined)
    );
    const page = await post("/pages", data);
    return {
      content: [
        {
          type: "text",
          text: `Created page: ${page.title}\n${JSON.stringify(page, null, 2)}`,
        },
      ],
    };
  }
);

server.tool(
  "update_page",
  "Update a knowledge base page.",
  {
    id: z.string().describe("Page slug ID"),
    title: z.string().optional().describe("New title"),
    type: z
      .enum(["decision", "analysis", "reference", "notes", "runbook"])
      .optional()
      .describe("New type"),
    project: z
      .string()
      .nullable()
      .optional()
      .describe("New project slug (null to clear)"),
    tags: z.array(z.string()).optional().describe("Replace tags"),
    workspace: z
      .enum(["personal", "professional"])
      .optional()
      .describe("New workspace"),
    body: z.string().optional().describe("New body content"),
  },
  async ({ id, ...changes }) => {
    const data = Object.fromEntries(
      Object.entries(changes).filter(([, v]) => v !== undefined)
    );
    const page = await put(`/pages/${id}`, data);
    return {
      content: [
        {
          type: "text",
          text: `Updated page: ${page.title}\n${JSON.stringify(page, null, 2)}`,
        },
      ],
    };
  }
);

server.tool(
  "delete_page",
  "Delete a knowledge base page permanently.",
  { id: z.string().describe("Page slug ID") },
  async ({ id }) => {
    await del(`/pages/${id}`);
    return { content: [{ type: "text", text: `Deleted page: ${id}` }] };
  }
);

// ── Start ─────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
