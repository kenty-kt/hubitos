(function () {
  const store = window.HubitosProjectsStore;
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("project");
  let project = store.getProject(requestedId);
  const state = {
    logs: [
      { stage: "system", message: "[系统] 本地运行器已就绪，等待你选择项目。" },
      { stage: "policy", message: "[规则] 当前模型调用费用会记到用户自己绑定的服务商账号上。" }
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
    stageClone: document.getElementById("stageClone"),
    stageCloneState: document.getElementById("stageCloneState"),
    stageCloneTitle: document.getElementById("stageCloneTitle"),
    stageCloneCopy: document.getElementById("stageCloneCopy"),
    stageInstall: document.getElementById("stageInstall"),
    stageInstallState: document.getElementById("stageInstallState"),
    stageInstallTitle: document.getElementById("stageInstallTitle"),
    stageInstallCopy: document.getElementById("stageInstallCopy"),
    stageBoot: document.getElementById("stageBoot"),
    stageBootState: document.getElementById("stageBootState"),
    stageBootTitle: document.getElementById("stageBootTitle"),
    stageBootCopy: document.getElementById("stageBootCopy"),
    stageVerify: document.getElementById("stageVerify"),
    stageVerifyState: document.getElementById("stageVerifyState"),
    stageVerifyTitle: document.getElementById("stageVerifyTitle"),
    stageVerifyCopy: document.getElementById("stageVerifyCopy"),
    stageRepair: document.getElementById("stageRepair"),
    stageRepairState: document.getElementById("stageRepairState"),
    stageRepairTitle: document.getElementById("stageRepairTitle"),
    stageRepairCopy: document.getElementById("stageRepairCopy"),
    stageRetry: document.getElementById("stageRetry"),
    stageRetryState: document.getElementById("stageRetryState"),
    stageRetryTitle: document.getElementById("stageRetryTitle"),
    stageRetryCopy: document.getElementById("stageRetryCopy")
  };

  const stageMeta = {
    clone: {
      label: "拉代码",
      title: "Clone / Pull",
      copy: "Use the GitHub remote and selected branch.",
      card: refs.stageClone,
      state: refs.stageCloneState,
      titleRef: refs.stageCloneTitle,
      copyRef: refs.stageCloneCopy
    },
    install: {
      label: "装依赖",
      title: "Install",
      copy: "Detect the package manager and install dependencies.",
      card: refs.stageInstall,
      state: refs.stageInstallState,
      titleRef: refs.stageInstallTitle,
      copyRef: refs.stageInstallCopy
    },
    boot: {
      label: "启动服务",
      title: "Boot",
      copy: "Start the local service and stream logs back here.",
      card: refs.stageBoot,
      state: refs.stageBootState,
      titleRef: refs.stageBootTitle,
      copyRef: refs.stageBootCopy
    },
    verify: {
      label: "检查",
      title: "Verify",
      copy: "Run checks before exposing localhost.",
      card: refs.stageVerify,
      state: refs.stageVerifyState,
      titleRef: refs.stageVerifyTitle,
      copyRef: refs.stageVerifyCopy
    },
    repair: {
      label: "AI 修复",
      title: "AI Repair",
      copy: "Send logs and failing files to the coding model.",
      card: refs.stageRepair,
      state: refs.stageRepairState,
      titleRef: refs.stageRepairTitle,
      copyRef: refs.stageRepairCopy
    },
    retry: {
      label: "重试",
      title: "Retry",
      copy: "Restart and run verification again after patching.",
      card: refs.stageRetry,
      state: refs.stageRetryState,
      titleRef: refs.stageRetryTitle,
      copyRef: refs.stageRetryCopy
    },
    system: { label: "系统" },
    policy: { label: "规则" },
    routing: { label: "分流" },
    open: { label: "打开" }
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

  function getSafeLocalUrl(value) {
    if (!value) return "";
    try {
      const url = new URL(value);
      const allowedHosts = new Set(["localhost", "127.0.0.1"]);
      if ((url.protocol === "http:" || url.protocol === "https:") && allowedHosts.has(url.hostname)) {
        return url.toString();
      }
      return "";
    } catch (error) {
      return "";
    }
  }

  function statusClass(status) {
    return {
      live: "status-live",
      idle: "status-idle",
      building: "status-building"
    }[status] || "status-idle";
  }

  function deploymentLabel(current) {
    if (state.deploying) return "启动中";
    return {
      live: "运行中",
      idle: "空闲",
      building: "启动中"
    }[current.status] || "空闲";
  }

  function showToast(message) {
    refs.toast.textContent = message;
    refs.toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => refs.toast.classList.remove("visible"), 2200);
  }

  function renderLegend() {
    if (!refs.logLegend) return;
    refs.logLegend.innerHTML = ["clone", "install", "boot", "verify", "repair", "retry"]
      .map((key) => `<div class="log-chip ${state.activeStage === key ? "is-active" : ""}">${escapeHtml(stageMeta[key].label)}</div>`)
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
        return `
          <div class="log-row">
            <span class="log-time">${minute}:${second}</span>
            <span class="log-message">${escapeHtml(entry.message)}</span>
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
      meta.state.textContent = "进行中";
    } else if (status === "done") {
      meta.card.classList.add("is-done");
      meta.state.textContent = "完成";
    } else if (status === "failed") {
      meta.card.classList.add("is-failed");
      meta.state.textContent = "失败";
    } else {
      meta.state.textContent = "等待中";
    }
    state.activeStage = key;
    renderLegend();
  }

  function resetStages() {
    ["clone", "install", "boot", "verify", "repair", "retry"].forEach((key) => updateStageState(key, "waiting"));
  }

  function renderStageText() {
    const translate =
      window.HubitosI18n && typeof window.HubitosI18n.translate === "function"
        ? window.HubitosI18n.translate.bind(window.HubitosI18n)
        : (value) => value;
    ["clone", "install", "boot", "verify", "repair", "retry"].forEach((key) => {
      const meta = stageMeta[key];
      if (meta.titleRef) meta.titleRef.textContent = translate(meta.title);
      if (meta.copyRef) meta.copyRef.textContent = translate(meta.copy);
    });
  }

  function renderDetails() {
    project = store.getProject(project ? project.id : requestedId);
    if (!project) return;
    refs.projectTitle.textContent = project.name;
    refs.projectSummary.textContent = project.description;
    refs.projectFramework.textContent = project.framework;
    refs.projectUrl.textContent = project.localUrl || "还没启动";
    if (refs.projectTokenMode) refs.projectTokenMode.textContent = project.tokenMode;
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
    refs.repairRetryLimit.textContent = `${project.retryLimit || 1} 次`;
    refs.autoRepairToggle.checked = (project.repairPolicy || "").includes("自动");
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
    appendLog("clone", `[启动] 开始为 ${project.repo} 启动本地项目`);

    updateStageState("clone", "running");
    appendLog("clone", `[git] git clone --branch ${project.branch} git@github.com:${project.repo}.git`);
    await wait(700);

    updateStageState("clone", "done");
    updateStageState("install", "running");
    appendLog("install", `[安装] 正在识别 ${project.framework}，并准备安装依赖`);
    await wait(900);

    updateStageState("install", "done");
    updateStageState("boot", "running");
    appendLog("boot", "[运行] 正在启动本地服务，并占用一个可用端口");
    await wait(900);

    const preferredPort = project.localUrl ? project.localUrl.split(":").pop() : project.preferredPort || "3000";
    store.updateProject(project.id, { localUrl: `http://localhost:${preferredPort}` });
    project = store.getProject(project.id);
    updateStageState("boot", "done");

    updateStageState("verify", "running");
    appendLog("verify", `[检查] 正在执行：${project.verifyPolicy || "默认检查流程"}`);
    await wait(800);

    if (project.forceVerifyFailure) {
      updateStageState("verify", "failed");
      appendLog("verify", "[检查] 失败：启动后的基础检查发现运行错误");

      if (!refs.autoRepairToggle.checked) {
        store.updateProject(project.id, { status: "idle", lastDeployedAt: "检查失败" });
        project = store.getProject(project.id);
        state.deploying = false;
        renderDetails();
        showToast("检查失败了。打开自动修复后，系统会交给 AI 继续处理。");
        return;
      }

      updateStageState("repair", "running");
      appendLog("repair", `[修复] 正在把日志、失败信息和改动文件发送给 ${project.repairModel || project.codingModel}`);
      await wait(900);
      appendLog("repair", "[修复] AI 已给出修复方案：调整引用路径、补环境变量兜底、然后重启服务");
      updateStageState("repair", "done");

      updateStageState("retry", "running");
      appendLog("retry", "[重试] 正在重新启动服务，并再次执行检查");
      await wait(800);
      updateStageState("retry", "done");
      updateStageState("verify", "done");
      store.updateProject(project.id, { forceVerifyFailure: false });
      project = store.getProject(project.id);
      appendLog("retry", "[重试] AI 修复后，项目已经通过检查");
    } else {
      updateStageState("verify", "done");
      updateStageState("repair", "done");
      updateStageState("retry", "done");
      appendLog("verify", "[检查] 首次检查已通过");
    }

    store.updateProject(project.id, {
      status: "live",
      lastDeployedAt: new Date().toLocaleString("zh-CN", { hour12: false })
    });
    project = store.getProject(project.id);
    appendLog("boot", `[ready] Service is available at ${project.localUrl}`);
    appendLog("policy", "[规则] 这个项目的模型调用会走用户自己绑定的账号");
    state.deploying = false;
    renderDetails();
    showToast(`本地项目已经启动好了：${project.localUrl}`);
  }

  function openSelectedProject() {
    const safeUrl = getSafeLocalUrl(project.localUrl);
    if (!safeUrl) {
      showToast("请先启动项目，才能拿到本地地址。");
      return;
    }
    window.open(safeUrl, "_blank", "noopener,noreferrer");
    appendLog("open", `[打开] 正在浏览器里打开 ${safeUrl}`);
  }

  function stopRunning() {
    if (!project.localUrl) {
      showToast("当前没有正在运行的本地服务。");
      return;
    }
    store.updateProject(project.id, {
      status: "idle",
      localUrl: "",
      lastDeployedAt: "已在本地停止"
    });
    project = store.getProject(project.id);
    appendLog("boot", "[运行] 本地服务已停止，端口也已经释放");
    renderDetails();
    showToast("本地服务已经停止。");
  }

  function deleteLocalWorkspace() {
    store.updateProject(project.id, {
      status: "idle",
      localUrl: "",
      lastDeployedAt: "本地副本已删除"
    });
    project = store.getProject(project.id);
    appendLog("boot", `[清理] 已删除 ${project.repo} 的本地副本`);
    appendLog("system", "[清理] 本地代码、安装缓存和运行状态都已清掉");
    renderDetails();
    showToast("本地副本已经删除。");
  }

  refs.backBtn.addEventListener("click", () => {
    window.location.href = "./projects-center.html";
  });
  refs.deployBtn.addEventListener("click", simulateDeploy);
  refs.stopBtn.addEventListener("click", stopRunning);
  refs.deleteLocalBtn.addEventListener("click", deleteLocalWorkspace);
  refs.openLocalBtn.addEventListener("click", openSelectedProject);
  refs.clearLogsBtn.addEventListener("click", () => {
    state.logs = [{ stage: "system", message: "[系统] 日志已清空。" }];
    renderLogs();
    renderLegend();
  });
  refs.autoRepairToggle.addEventListener("change", () => {
    const repairPolicy = refs.autoRepairToggle.checked
      ? "检查失败时自动交给 AI 修复"
      : "检查失败后需要人工处理";
    store.updateProject(project.id, { repairPolicy });
    project = store.getProject(project.id);
    renderDetails();
    appendLog(
      "policy",
      refs.autoRepairToggle.checked
        ? "[规则] 已开启自动修复，检查失败后会自动交给 AI"
        : "[规则] 已关闭自动修复，失败后会等待人工处理"
    );
  });
  refs.routeConfigBtn.addEventListener("click", () => {
    appendLog("routing", "[分流] 已打开模型分流规则。后续版本会支持服务商优先级、额度限制和密钥轮换。");
    showToast("这里先演示分流规则入口，暂时不会真的修改。");
  });

  renderDetails();
  renderStageText();
  renderLogs();
  renderLegend();
})();
