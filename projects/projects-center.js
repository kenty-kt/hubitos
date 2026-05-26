(function () {
  const store = window.HubitosProjectsStore;
  const state = {
    projects: store.getProjects(),
    selectedId: store.getProjects()[0] ? store.getProjects()[0].id : null,
    status: "all",
    query: ""
  };

  const refs = {
    statusTabs: document.getElementById("statusTabs"),
    searchInput: document.getElementById("searchInput"),
    projectList: document.getElementById("projectList"),
    previewTitle: document.getElementById("previewTitle"),
    previewSummary: document.getElementById("previewSummary"),
    previewRepo: document.getElementById("previewRepo"),
    previewFramework: document.getElementById("previewFramework"),
    previewStatus: document.getElementById("previewStatus"),
    previewUpdatedAt: document.getElementById("previewUpdatedAt"),
    previewUrl: document.getElementById("previewUrl"),
    previewRepair: document.getElementById("previewRepair"),
    openDetailBtn: document.getElementById("openDetailBtn"),
    importProjectBtn: document.getElementById("importProjectBtn"),
    sidebarImportBtn: document.getElementById("sidebarImportBtn"),
    syncBtn: document.getElementById("syncBtn"),
    importModal: document.getElementById("importModal"),
    closeModalBtn: document.getElementById("closeModalBtn"),
    seedDemoBtn: document.getElementById("seedDemoBtn"),
    saveProjectBtn: document.getElementById("saveProjectBtn"),
    repoInput: document.getElementById("repoInput"),
    frameworkInput: document.getElementById("frameworkInput"),
    branchInput: document.getElementById("branchInput"),
    portInput: document.getElementById("portInput"),
    toast: document.getElementById("toast")
  };

  let toastTimer = null;

  function escapeHtml(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function selectedProject() {
    return state.projects.find((project) => project.id === state.selectedId) || state.projects[0] || null;
  }

  function statusClass(status) {
    return {
      live: "status-live",
      idle: "status-idle",
      building: "status-building"
    }[status] || "status-idle";
  }

  function statusLabel(status) {
    return {
      live: "运行中",
      idle: "空闲",
      building: "启动中"
    }[status] || "空闲";
  }

  function showToast(message) {
    refs.toast.textContent = message;
    refs.toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => refs.toast.classList.remove("visible"), 2200);
  }

  function setModal(open) {
    refs.importModal.classList.toggle("hidden", !open);
  }

  function filteredProjects() {
    return state.projects.filter((project) => {
      const matchesStatus = state.status === "all" || project.status === state.status;
      const text = `${project.name} ${project.repo} ${project.framework}`.toLowerCase();
      const matchesQuery = text.includes(state.query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }

  function renderStatusTabs() {
    refs.statusTabs.innerHTML = store
      .statusFilters()
      .map(
        (tab) => `
          <button class="market-tab ${state.status === tab.key ? "active" : ""}" data-status="${tab.key}" type="button">
            ${escapeHtml(tab.label)}
          </button>
        `
      )
      .join("");
  }

  function renderProjectList() {
    const projects = filteredProjects();
    refs.projectList.innerHTML = projects
      .map(
        (project) => `
          <article class="project-card ${project.id === state.selectedId ? "active" : ""}" data-id="${project.id}">
            <div class="project-card-top">
              <strong>${escapeHtml(project.name)}</strong>
              <span class="status-pill ${statusClass(project.status)}">${statusLabel(project.status)}</span>
            </div>
            <div class="repo-line">${escapeHtml(project.repo)} · ${escapeHtml(project.branch)}</div>
            <div class="card-copy">${escapeHtml(project.description)}</div>
            <div class="card-meta">
              <span>${escapeHtml(project.framework)}</span>
              <button class="inline-link" type="button" data-open-detail="${project.id}">查看详情</button>
            </div>
          </article>
        `
      )
      .join("");

    if (!projects.length) {
      refs.projectList.innerHTML = `
        <article class="project-card">
          <strong>没找到项目</strong>
          <div class="card-copy">换个关键词试试，或者先导入一个新项目。</div>
        </article>
      `;
    }
  }

  function renderPreview() {
    const project = selectedProject();
    if (!project) return;
    refs.previewTitle.textContent = project.name;
    refs.previewSummary.textContent = project.description;
    refs.previewRepo.textContent = project.repo;
    refs.previewFramework.textContent = project.framework;
    refs.previewStatus.textContent = statusLabel(project.status);
    refs.previewStatus.className = `status-pill ${statusClass(project.status)}`;
    refs.previewUpdatedAt.textContent = project.lastDeployedAt;
    refs.previewUrl.textContent = project.localUrl || "还没启动";
    refs.previewRepair.textContent = project.repairPolicy;
  }

  function rerender() {
    state.projects = store.getProjects();
    if (!state.projects.find((project) => project.id === state.selectedId)) {
      state.selectedId = state.projects[0] ? state.projects[0].id : null;
    }
    renderStatusTabs();
    renderProjectList();
    renderPreview();
  }

  function openDetail(projectId) {
    const id = projectId || state.selectedId;
    if (!id) return;
    window.location.href = `./projects-detail.html?project=${encodeURIComponent(id)}`;
  }

  function seedDemoValues() {
    refs.repoInput.value = "kenty-kt/new-local-launcher";
    refs.frameworkInput.value = "Vite";
    refs.branchInput.value = "main";
    refs.portInput.value = "4173";
  }

  function saveImportedProject() {
    const repo = refs.repoInput.value.trim();
    if (!repo.includes("/")) {
      showToast("请按 owner/repo 的格式填写。");
      return;
    }

    const framework = refs.frameworkInput.value;
    const branch = refs.branchInput.value.trim() || "main";
    const port = refs.portInput.value.trim() || "3000";
    const name = repo.split("/")[1];
    const command = framework === "Python" ? "python -m uvicorn app:app --reload" : "npm run dev";
    const project = {
      id: `proj-${Date.now()}`,
      name,
      owner: repo.split("/")[0],
      repo,
      branch,
      framework,
      status: "idle",
      description: "已从 GitHub 导入，等待系统识别安装方式和启动命令。",
      command,
      workspace: `~/Hubitos/workspaces/${name}`,
      localUrl: "",
      preferredPort: port,
      lastDeployedAt: "还没启动过",
      tokenMode: "使用当前账号",
      verifyPolicy: "健康检查 + 基础可用性检查 + 首页是否能打开",
      repairPolicy: "检查失败时自动交给 AI 修复",
      repairModel: "GPT-4.1",
      retryLimit: 2,
      forceVerifyFailure: true,
      accountName: "current-user@hubitos.ai",
      accountProvider: "授权后会显示已连接的服务商",
      codingModel: "GPT-4.1",
      fallbackModel: "Claude Sonnet 4"
    };

    store.addProject(project);
    state.selectedId = project.id;
    setModal(false);
    refs.repoInput.value = "";
    refs.branchInput.value = "main";
    refs.portInput.value = "3000";
    rerender();
    showToast("项目已经导入到列表里了。");
  }

  refs.statusTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-status]");
    if (!button) return;
    state.status = button.dataset.status;
    renderStatusTabs();
    renderProjectList();
  });

  refs.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    renderProjectList();
  });

  refs.projectList.addEventListener("click", (event) => {
    const openButton = event.target.closest("[data-open-detail]");
    if (openButton) {
      openDetail(openButton.dataset.openDetail);
      return;
    }
    const card = event.target.closest("[data-id]");
    if (!card) return;
    state.selectedId = card.dataset.id;
    renderProjectList();
    renderPreview();
  });

  refs.openDetailBtn.addEventListener("click", () => openDetail());
  if (refs.importProjectBtn) refs.importProjectBtn.addEventListener("click", () => setModal(true));
  if (refs.sidebarImportBtn) refs.sidebarImportBtn.addEventListener("click", () => setModal(true));
  refs.closeModalBtn.addEventListener("click", () => setModal(false));
  refs.seedDemoBtn.addEventListener("click", seedDemoValues);
  refs.saveProjectBtn.addEventListener("click", saveImportedProject);
  if (refs.syncBtn) refs.syncBtn.addEventListener("click", () => showToast("这里先演示同步效果，暂时不会真的拉 GitHub。"));
  refs.importModal.addEventListener("click", (event) => {
    if (event.target === refs.importModal) setModal(false);
  });

  rerender();
})();
