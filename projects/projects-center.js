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
      live: "Live",
      idle: "Idle",
      building: "Building"
    }[status] || "Idle";
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
          <button class="segment-btn ${state.status === tab.key ? "active" : ""}" data-status="${tab.key}" type="button">
            ${tab.label}
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
              <strong>${project.name}</strong>
              <span class="status-pill ${statusClass(project.status)}">${statusLabel(project.status)}</span>
            </div>
            <div class="repo-line">${project.repo} · ${project.branch}</div>
            <div class="card-copy">${project.description}</div>
            <div class="card-meta">
              <span>${project.framework}</span>
              <button class="inline-link" type="button" data-open-detail="${project.id}">Open Detail</button>
            </div>
          </article>
        `
      )
      .join("");

    if (!projects.length) {
      refs.projectList.innerHTML = `
        <article class="project-card">
          <strong>No projects found</strong>
          <div class="card-copy">Try another keyword or import a new repository into this channel.</div>
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
    refs.previewUrl.textContent = project.localUrl || "Not deployed";
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
      showToast("Use the format owner/repo.");
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
      description: "Imported from GitHub. Waiting for the local agent to detect package manager, install strategy, and boot command.",
      command,
      workspace: `~/Hubitos/workspaces/${name}`,
      localUrl: "",
      preferredPort: port,
      lastDeployedAt: "Not deployed yet",
      tokenMode: "Bound User Account",
      verifyPolicy: "Health check + smoke test + homepage render",
      repairPolicy: "Auto-fix enabled for failed verification",
      repairModel: "GPT-4.1",
      retryLimit: 2,
      forceVerifyFailure: true,
      accountName: "current-user@hubitos.ai",
      accountProvider: "Provider linked after auth",
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
    showToast("Repository imported into the channel.");
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
  refs.importProjectBtn.addEventListener("click", () => setModal(true));
  if (refs.sidebarImportBtn) refs.sidebarImportBtn.addEventListener("click", () => setModal(true));
  refs.closeModalBtn.addEventListener("click", () => setModal(false));
  refs.seedDemoBtn.addEventListener("click", seedDemoValues);
  refs.saveProjectBtn.addEventListener("click", saveImportedProject);
  refs.syncBtn.addEventListener("click", () => showToast("GitHub sync is simulated."));
  refs.importModal.addEventListener("click", (event) => {
    if (event.target === refs.importModal) setModal(false);
  });

  rerender();
})();
