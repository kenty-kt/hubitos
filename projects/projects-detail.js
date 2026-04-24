(function () {
  const store = window.HubitosProjectsStore;
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("project");
  let project = store.getProject(requestedId);
  const state = {
    logs: [
      { stage: "system", message: "[system] Local runner ready. Waiting for repo selection." },
      { stage: "policy", message: "[policy] Token billing is configured to use each user's bound provider account." }
    ],
    activeStage: "system",
    deploying: false
  };

  const refs = {
    backBtn: document.getElementById("backBtn"),
    projectTitle: document.getElementById("projectTitle"),
    projectSummary: document.getElementById("projectSummary"),
    projectFramework: document.getElementById("projectFramework"),
    projectUrl: document.getElementById("projectUrl"),
    projectTokenMode: document.getElementById("projectTokenMode"),
    projectRepo: document.getElementById("projectRepo"),
    projectWorkspace: document.getElementById("projectWorkspace"),
    projectDeployedAt: document.getElementById("projectDeployedAt"),
    deploymentStatus: document.getElementById("deploymentStatus"),
    logStream: document.getElementById("logStream"),
    deployBtn: document.getElementById("deployBtn"),
    stopBtn: document.getElementById("stopBtn"),
    deleteLocalBtn: document.getElementById("deleteLocalBtn"),
    openLocalBtn: document.getElementById("openLocalBtn"),
    clearLogsBtn: document.getElementById("clearLogsBtn"),
    routeConfigBtn: document.getElementById("routeConfigBtn"),
    accountName: document.getElementById("accountName"),
    accountProvider: document.getElementById("accountProvider"),
    billingSource: document.getElementById("billingSource"),
    codingModel: document.getElementById("codingModel"),
    fallbackModel: document.getElementById("fallbackModel"),
    repairModel: document.getElementById("repairModel"),
    repairRetryLimit: document.getElementById("repairRetryLimit"),
    autoRepairToggle: document.getElementById("autoRepairToggle"),
    accountAvatar: document.getElementById("accountAvatar"),
    toast: document.getElementById("toast"),
    logLegend: document.getElementById("logLegend"),
    stageClone: document.getElementById("stageClone"),
    stageCloneState: document.getElementById("stageCloneState"),
    stageInstall: document.getElementById("stageInstall"),
    stageInstallState: document.getElementById("stageInstallState"),
    stageBoot: document.getElementById("stageBoot"),
    stageBootState: document.getElementById("stageBootState"),
    stageVerify: document.getElementById("stageVerify"),
    stageVerifyState: document.getElementById("stageVerifyState"),
    stageRepair: document.getElementById("stageRepair"),
    stageRepairState: document.getElementById("stageRepairState"),
    stageRetry: document.getElementById("stageRetry"),
    stageRetryState: document.getElementById("stageRetryState")
  };

  const stageMeta = {
    clone: { label: "Clone", card: refs.stageClone, state: refs.stageCloneState },
    install: { label: "Install", card: refs.stageInstall, state: refs.stageInstallState },
    boot: { label: "Boot", card: refs.stageBoot, state: refs.stageBootState },
    verify: { label: "Verify", card: refs.stageVerify, state: refs.stageVerifyState },
    repair: { label: "Repair", card: refs.stageRepair, state: refs.stageRepairState },
    retry: { label: "Retry", card: refs.stageRetry, state: refs.stageRetryState },
    system: { label: "System" },
    policy: { label: "Policy" },
    routing: { label: "Routing" },
    open: { label: "Open" }
  };

  let toastTimer = null;

  function statusClass(status) {
    return {
      live: "status-live",
      idle: "status-idle",
      building: "status-building"
    }[status] || "status-idle";
  }

  function deploymentLabel(current) {
    if (state.deploying) return "Deploying";
    return {
      live: "Live",
      idle: "Idle",
      building: "Building"
    }[current.status] || "Idle";
  }

  function showToast(message) {
    refs.toast.textContent = message;
    refs.toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => refs.toast.classList.remove("visible"), 2200);
  }

  function renderLegend() {
    refs.logLegend.innerHTML = ["clone", "install", "boot", "verify", "repair", "retry"]
      .map((key) => `<div class="log-chip ${state.activeStage === key ? "is-active" : ""}">${stageMeta[key].label}</div>`)
      .join("");
  }

  function appendLog(stage, message) {
    state.logs.push({ stage, message });
    state.activeStage = stage;
    renderLogs();
    renderLegend();
  }

  function renderLogs() {
    refs.logStream.innerHTML = state.logs
      .map((entry, index) => {
        const minute = String(12 + (index % 8)).padStart(2, "0");
        const second = String(10 + index).padStart(2, "0");
        const label = (stageMeta[entry.stage] && stageMeta[entry.stage].label) || "Log";
        return `
          <div class="log-row">
            <span class="log-time">${minute}:${second}</span>
            <span class="log-stage">${label}</span>
            <span class="log-message">${entry.message}</span>
          </div>
        `;
      })
      .join("");
    refs.logStream.scrollTop = refs.logStream.scrollHeight;
  }

  function updateStageState(key, status) {
    const meta = stageMeta[key];
    if (!meta || !meta.card || !meta.state) return;
    meta.card.classList.remove("is-running", "is-done", "is-failed");
    if (status === "running") {
      meta.card.classList.add("is-running");
      meta.state.textContent = "Running";
    } else if (status === "done") {
      meta.card.classList.add("is-done");
      meta.state.textContent = "Done";
    } else if (status === "failed") {
      meta.card.classList.add("is-failed");
      meta.state.textContent = "Failed";
    } else {
      meta.state.textContent = "Waiting";
    }
    state.activeStage = key;
    renderLegend();
  }

  function resetStages() {
    ["clone", "install", "boot", "verify", "repair", "retry"].forEach((key) => updateStageState(key, "waiting"));
  }

  function renderDetails() {
    project = store.getProject(project ? project.id : requestedId);
    if (!project) return;
    refs.projectTitle.textContent = project.name;
    refs.projectSummary.textContent = project.description;
    refs.projectFramework.textContent = project.framework;
    refs.projectUrl.textContent = project.localUrl || "Not deployed";
    refs.projectTokenMode.textContent = project.tokenMode;
    refs.projectRepo.textContent = project.repo;
    refs.projectWorkspace.textContent = project.workspace;
    refs.projectDeployedAt.textContent = project.lastDeployedAt;
    refs.deploymentStatus.textContent = deploymentLabel(project);
    refs.deploymentStatus.className = `status-pill ${statusClass(project.status)}`;
    refs.accountName.textContent = project.accountName;
    refs.accountProvider.textContent = project.accountProvider;
    refs.billingSource.textContent = project.tokenMode;
    refs.codingModel.textContent = project.codingModel;
    refs.fallbackModel.textContent = project.fallbackModel;
    refs.repairModel.textContent = project.repairModel || project.codingModel;
    refs.repairRetryLimit.textContent = `${project.retryLimit || 1} attempts`;
    refs.autoRepairToggle.checked = (project.repairPolicy || "").includes("enabled");
    refs.accountAvatar.textContent = (project.accountName || "H").charAt(0).toUpperCase();
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function simulateDeploy() {
    if (!project || state.deploying) return;
    state.deploying = true;
    store.updateProject(project.id, { status: "building" });
    resetStages();
    renderDetails();
    appendLog("clone", `[deploy] Starting local deployment for ${project.repo}`);

    updateStageState("clone", "running");
    appendLog("clone", `[git] git clone --branch ${project.branch} git@github.com:${project.repo}.git`);
    await wait(700);

    updateStageState("clone", "done");
    updateStageState("install", "running");
    appendLog("install", `[install] Detecting framework ${project.framework} and preparing dependencies`);
    await wait(900);

    updateStageState("install", "done");
    updateStageState("boot", "running");
    appendLog("boot", "[runtime] Starting local runner and reserving an available port");
    await wait(900);

    const preferredPort = project.localUrl ? project.localUrl.split(":").pop() : project.preferredPort || "3000";
    store.updateProject(project.id, { localUrl: `http://localhost:${preferredPort}` });
    project = store.getProject(project.id);
    updateStageState("boot", "done");

    updateStageState("verify", "running");
    appendLog("verify", `[verify] Running ${project.verifyPolicy || "default verification suite"}`);
    await wait(800);

    if (project.forceVerifyFailure) {
      updateStageState("verify", "failed");
      appendLog("verify", "[verify] Verification failed: startup smoke test found a runtime error");

      if (!refs.autoRepairToggle.checked) {
        store.updateProject(project.id, { status: "idle", lastDeployedAt: "Verification failed" });
        project = store.getProject(project.id);
        state.deploying = false;
        renderDetails();
        showToast("Verification failed. Enable auto-repair to send it to AI.");
        return;
      }

      updateStageState("repair", "running");
      appendLog("repair", `[repair] Sending logs, failing checks, and changed files to ${project.repairModel || project.codingModel}`);
      await wait(900);
      appendLog("repair", "[repair] AI proposed a patch: fix import path, add env fallback, restart local runner");
      updateStageState("repair", "done");

      updateStageState("retry", "running");
      appendLog("retry", "[retry] Restarting service and running verification again");
      await wait(800);
      updateStageState("retry", "done");
      updateStageState("verify", "done");
      store.updateProject(project.id, { forceVerifyFailure: false });
      project = store.getProject(project.id);
      appendLog("retry", "[retry] Verification passed after AI repair");
    } else {
      updateStageState("verify", "done");
      updateStageState("repair", "done");
      updateStageState("retry", "done");
      appendLog("verify", "[verify] Verification passed on the first attempt");
    }

    store.updateProject(project.id, {
      status: "live",
      lastDeployedAt: new Date().toLocaleString("zh-CN", { hour12: false })
    });
    project = store.getProject(project.id);
    appendLog("boot", `[ready] Service is available at ${project.localUrl}`);
    appendLog("policy", "[policy] Model calls for this workspace are routed through the bound user account vault");
    state.deploying = false;
    renderDetails();
    showToast(`Local deployment ready at ${project.localUrl}`);
  }

  function openSelectedProject() {
    if (!project.localUrl) {
      showToast("Deploy the project first to get a local URL.");
      return;
    }
    window.open(project.localUrl, "_blank", "noopener,noreferrer");
    appendLog("open", `[open] Opening ${project.localUrl} in the local browser`);
  }

  function stopRunning() {
    if (!project.localUrl) {
      showToast("No local service is running.");
      return;
    }
    store.updateProject(project.id, {
      status: "idle",
      localUrl: "",
      lastDeployedAt: "Stopped locally"
    });
    project = store.getProject(project.id);
    appendLog("boot", "[runtime] Local service stopped and localhost port released");
    renderDetails();
    showToast("Local service stopped.");
  }

  function deleteLocalWorkspace() {
    store.updateProject(project.id, {
      status: "idle",
      localUrl: "",
      lastDeployedAt: "Local workspace removed"
    });
    project = store.getProject(project.id);
    appendLog("boot", `[cleanup] Removed local workspace for ${project.repo}`);
    appendLog("system", "[cleanup] Local clone, install cache, and runtime state cleared");
    renderDetails();
    showToast("Local workspace deleted.");
  }

  refs.backBtn.addEventListener("click", () => {
    window.location.href = "./projects-center.html";
  });
  refs.deployBtn.addEventListener("click", simulateDeploy);
  refs.stopBtn.addEventListener("click", stopRunning);
  refs.deleteLocalBtn.addEventListener("click", deleteLocalWorkspace);
  refs.openLocalBtn.addEventListener("click", openSelectedProject);
  refs.clearLogsBtn.addEventListener("click", () => {
    state.logs = [{ stage: "system", message: "[system] Log stream cleared." }];
    renderLogs();
    renderLegend();
  });
  refs.autoRepairToggle.addEventListener("change", () => {
    const repairPolicy = refs.autoRepairToggle.checked
      ? "Auto-fix enabled for failed verification"
      : "Manual intervention required after failed verification";
    store.updateProject(project.id, { repairPolicy });
    project = store.getProject(project.id);
    renderDetails();
    appendLog(
      "policy",
      refs.autoRepairToggle.checked
        ? "[policy] Auto-repair enabled for failed deployment verification"
        : "[policy] Auto-repair disabled. Failures now wait for manual review"
    );
  });
  refs.routeConfigBtn.addEventListener("click", () => {
    appendLog("routing", "[routing] Opened routing policy editor. Future version will allow provider priority, quota limits, and secret rotation.");
    showToast("Routing policy review is mocked in this prototype.");
  });

  renderDetails();
  renderLogs();
  renderLegend();
})();
