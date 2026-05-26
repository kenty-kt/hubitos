(function () {
  const STORAGE_KEY = "hubitos-projects-v1";
  const isEnglish =
    window.HubitosI18n && typeof window.HubitosI18n.getLanguage === "function"
      ? window.HubitosI18n.getLanguage() === "en"
      : false;
  const translateDeep =
    window.HubitosI18n && typeof window.HubitosI18n.translateDeep === "function"
      ? window.HubitosI18n.translateDeep.bind(window.HubitosI18n)
      : null;

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
        "一个把对话、项目、文件和 AI 工作流放在一起的桌面工作台。",
      command: "pnpm dev",
      workspace: "~/Hubitos/workspaces/hubitos-client-shell",
      localUrl: "http://localhost:3000",
      lastDeployedAt: "2026-04-23 18:12",
      tokenMode: "使用当前账号",
      verifyPolicy: "健康检查 + /api/ping + 首页是否能正常打开",
      repairPolicy: "检查失败时自动交给 AI 修复",
      repairModel: "GPT-4.1",
      retryLimit: 2,
      forceVerifyFailure: false,
      accountName: "kittytins@hubitos.ai",
      accountProvider: "已连接 OpenAI 和 Anthropic",
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
        "一个给运营团队用的内部看板，可以看提醒、活动分发和执行记录。",
      command: "npm run dev",
      workspace: "~/Hubitos/workspaces/market-ops-dashboard",
      localUrl: "",
      lastDeployedAt: "还没启动过",
      tokenMode: "使用当前账号",
      verifyPolicy: "基础页面检查 + 静态资源加载检查",
      repairPolicy: "检查失败时自动交给 AI 修复",
      repairModel: "GPT-4.1 mini",
      retryLimit: 2,
      forceVerifyFailure: true,
      accountName: "ops@hubitos.ai",
      accountProvider: "已连接 OpenAI",
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
        "负责本地运行、密钥传递、模型调用分流和日志回传的服务。",
      command: "pnpm start:dev",
      workspace: "~/Hubitos/workspaces/agent-runtime-api",
      localUrl: "http://localhost:8787",
      lastDeployedAt: "正在启动中",
      tokenMode: "使用当前账号",
      verifyPolicy: "启动日志 + /healthz + 基础联调检查",
      repairPolicy: "检查失败时自动交给 AI 修复",
      repairModel: "Claude Sonnet 4",
      retryLimit: 2,
      forceVerifyFailure: false,
      accountName: "builder@hubitos.ai",
      accountProvider: "已连接 Anthropic 和 OpenAI",
      codingModel: "Claude Sonnet 4",
      fallbackModel: "GPT-4.1"
    }
  ];

  function localize(value) {
    if (!isEnglish || !translateDeep) return value;
    return translateDeep(value, "en");
  }

  function loadProjects() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return localize(saved.length ? saved : seedProjects.slice());
    } catch (error) {
      return localize(seedProjects.slice());
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
    return localize([
      { key: "all", label: "全部" },
      { key: "live", label: "运行中" },
      { key: "idle", label: "空闲" },
      { key: "building", label: "启动中" }
    ]);
  }

  window.HubitosProjectsStore = {
    getProjects,
    getProject,
    addProject,
    updateProject,
    statusFilters
  };
})();
