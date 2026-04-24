(function () {
  const STORAGE_KEY = "hubitos-projects-v1";

  const seedProjects = [
    {
      id: "proj-1",
      name: "hubitos-client-shell",
      owner: "kenty-kt",
      repo: "kenty-kt/hubitos",
      branch: "main",
      framework: "Next.js 15",
      status: "live",
      description:
        "Desktop client shell for orchestrating chat, projects, assets, and AI workflows in a single operator workspace.",
      command: "pnpm dev",
      workspace: "~/Hubitos/workspaces/hubitos-client-shell",
      localUrl: "http://localhost:3000",
      lastDeployedAt: "2026-04-23 18:12",
      tokenMode: "Bound User Account",
      verifyPolicy: "Health check + /api/ping + homepage render",
      repairPolicy: "Auto-fix enabled for failed verification",
      repairModel: "GPT-4.1",
      retryLimit: 2,
      forceVerifyFailure: false,
      accountName: "kittytins@hubitos.ai",
      accountProvider: "OpenAI + Anthropic linked",
      codingModel: "GPT-4.1",
      fallbackModel: "Claude Sonnet 4"
    },
    {
      id: "proj-2",
      name: "market-ops-dashboard",
      owner: "hubitos-labs",
      repo: "hubitos-labs/market-ops-dashboard",
      branch: "release/mvp",
      framework: "Vite + React",
      status: "idle",
      description:
        "Internal market operations dashboard with live alerts, campaign routing, and analyst execution traces.",
      command: "npm run dev",
      workspace: "~/Hubitos/workspaces/market-ops-dashboard",
      localUrl: "",
      lastDeployedAt: "Not deployed yet",
      tokenMode: "Bound User Account",
      verifyPolicy: "Smoke test dashboard route + asset load",
      repairPolicy: "Auto-fix enabled for failed verification",
      repairModel: "GPT-4.1 mini",
      retryLimit: 2,
      forceVerifyFailure: true,
      accountName: "ops@hubitos.ai",
      accountProvider: "OpenAI linked",
      codingModel: "GPT-4.1 mini",
      fallbackModel: "Gemini 2.5 Pro"
    },
    {
      id: "proj-3",
      name: "agent-runtime-api",
      owner: "hubitos-core",
      repo: "hubitos-core/agent-runtime-api",
      branch: "main",
      framework: "Node API",
      status: "building",
      description:
        "Execution service for local runners, secret vault handoff, token routing, and streaming deployment logs.",
      command: "pnpm start:dev",
      workspace: "~/Hubitos/workspaces/agent-runtime-api",
      localUrl: "http://localhost:8787",
      lastDeployedAt: "Building now",
      tokenMode: "Bound User Account",
      verifyPolicy: "Boot logs + /healthz + integration smoke test",
      repairPolicy: "Auto-fix enabled for failed verification",
      repairModel: "Claude Sonnet 4",
      retryLimit: 2,
      forceVerifyFailure: false,
      accountName: "builder@hubitos.ai",
      accountProvider: "Anthropic + OpenAI linked",
      codingModel: "Claude Sonnet 4",
      fallbackModel: "GPT-4.1"
    }
  ];

  function loadProjects() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return saved.length ? saved : seedProjects.slice();
    } catch (error) {
      return seedProjects.slice();
    }
  }

  function saveProjects(projects) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }

  function getProjects() {
    return loadProjects();
  }

  function getProject(id) {
    const projects = loadProjects();
    return projects.find((project) => project.id === id) || projects[0] || null;
  }

  function addProject(project) {
    const projects = loadProjects();
    projects.unshift(project);
    saveProjects(projects);
    return project;
  }

  function updateProject(id, updater) {
    const projects = loadProjects();
    const index = projects.findIndex((project) => project.id === id);
    if (index === -1) return null;
    const current = projects[index];
    const next = typeof updater === "function" ? updater({ ...current }) : { ...current, ...updater };
    projects[index] = next;
    saveProjects(projects);
    return next;
  }

  function statusFilters() {
    return [
      { key: "all", label: "All" },
      { key: "live", label: "Live" },
      { key: "idle", label: "Idle" },
      { key: "building", label: "Building" }
    ];
  }

  window.HubitosProjectsStore = {
    getProjects,
    getProject,
    addProject,
    updateProject,
    statusFilters
  };
})();
