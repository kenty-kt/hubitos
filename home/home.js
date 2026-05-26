const homeLang = (() => {
  try {
    const url = new URL(window.location.href);
    const queryLang = url.searchParams.get("lang");
    if (queryLang === "zh" || queryLang === "en") return queryLang;
    const stored = window.localStorage.getItem("hubitos-language");
    return stored === "zh" ? "zh" : "en";
  } catch (error) {
    return "en";
  }
})();
const isHomeEnglish = homeLang === "en";
const ht = (zh, en) => (isHomeEnglish ? en : zh);

const homeState = {
  tasks: [
    {
      title: "社媒增长自动任务",
      tag: "自动任务",
      description: "进入自动任务页，直接点击运行 Twitter / Facebook 模板，缺失信息由系统对话补齐。",
      meta: "推荐入口：自动任务页 · 打开就能用",
      href: "../workflows/workflows-home.html"
    },
    {
      title: "PRD 生成自动任务",
      tag: "高频任务",
      description: "从对话、附件和历史资料中抽取关键信息，自动生成适合评审和沉淀的 PRD 草案。",
      meta: "推荐模型：Hubitos Pro · 可导出：Markdown / Word",
      prompt: "请帮我把当前需求整理成完整 PRD，并补齐功能结构、业务流程、风险和里程碑。"
    },
    {
      title: "首页视觉提案",
      tag: "设计执行",
      description: "结合已有品牌素材，输出一版更适合桌面端的首页结构、模块优先级和视觉方向建议。",
      meta: "推荐模型：Hubitos Advanced · 可导出：图片 / PPT",
      prompt: "请基于现有品牌资料，为桌面客户端输出一版首页视觉提案，包含模块结构和设计理由。"
    },
    {
      title: "竞品拆解与定位",
      tag: "分析任务",
      description: "把竞品资料拆成能力矩阵、价格策略和差异化机会点，适合市场和产品一起评审。",
      meta: "推荐模型：Hubitos Lite · 可导出：Excel / PDF",
      prompt: "请整理竞品资料，输出功能矩阵、价格比较和差异化机会点。"
    }
  ],
  workspaces: [
    {
      title: "对话执行助手",
      tag: "智能体",
      description: "适合接收你的任务、整理上下文，并继续在对话里一步步推进执行。",
      meta: "chat/chat-workspace.html",
      href: "../chat/chat-workspace.html"
    },
    {
      title: "工具编排助手",
      tag: "智能体",
      description: "帮你挑选合适的提示词、智能体和自动任务，并一键带入当前任务。",
      meta: "tools/tools-center.html",
      href: "../tools/tools-center.html"
    },
    {
      title: "社媒运营助手",
      tag: "智能体",
      description: "帮你直接运行 Twitter / Facebook 任务，信息不够时会边问边补，再自动开始执行。",
      meta: "workflows/workflows-home.html",
      href: "../workflows/workflows-home.html"
    },
    {
      title: "开发协作助手",
      tag: "智能体",
      description: "帮你查看 GitHub 项目、启动本地环境，并继续跟进开发里的问题。",
      meta: "projects/projects-center.html",
      href: "../projects/projects-center.html"
    }
  ],
  signals: [
    { label: "正在进行中的任务", value: "07", note: "已发布30条推特，10次评论互动。" },
    { label: "已产出文件", value: "18", note: "包含文档、图片和表格，已进入对应项目目录。" }
  ],
  activities: [
    {
      title: "市场研究助理已归档竞品分析",
      badge: "竞品拆解与定位",
      copy: "输出了竞品功能矩阵和价格对比，并同步到 Market Analysis 文件夹。",
      time: "12 分钟前"
    },
    {
      title: "PRD Writing Assistant 生成了新的结构草案",
      badge: "PRD 生成自动任务",
      copy: "根据最近对话补齐了需求背景、功能结构和阶段目标。",
      time: "28 分钟前"
    },
    {
      title: "首页视觉提案已准备好进入工作台继续编辑",
      badge: "首页视觉提案",
      copy: "建议从首页卡片直接进入聊天工作台，继续细化页面布局和模块细节。",
      time: "刚刚"
    }
  ]
};

if (window.HubitosI18n && window.HubitosI18n.getLanguage() === "en") {
  const translated = window.HubitosI18n.translateDeep(homeState, "en");
  Object.keys(homeState).forEach((key) => {
    homeState[key] = translated[key];
  });
}

const homeRefs = {
  homePromptInput: document.getElementById("homePromptInput"),
  startTaskBtn: document.getElementById("startTaskBtn"),
  taskList: document.getElementById("taskList"),
  workspaceList: document.getElementById("workspaceList"),
  systemTimeLabel: document.getElementById("systemTimeLabel"),
  signalStack: document.getElementById("signalStack"),
  activityList: document.getElementById("activityList"),
  refreshFeedBtn: document.getElementById("refreshFeedBtn"),
  newTaskBtn: document.getElementById("newTaskBtn"),
  toast: document.getElementById("toast")
};

function localizeHomeChrome() {
  document.title = ht("Hubitos Home", "Hubitos Home");
  const topbarKicker = document.querySelector(".topbar-kicker");
  if (topbarKicker) topbarKicker.textContent = ht("首页", "Home");
  const heading = document.querySelector(".home-topbar h1");
  if (heading) heading.textContent = ht("欢迎回来，开始今天的 AI 工作", "Welcome back. Start today's AI work.");
  if (homeRefs.homePromptInput) {
    homeRefs.homePromptInput.placeholder = ht(
      "例如：帮我把这个需求整理成 PRD，并给出首页结构草图",
      "For example: turn this request into a PRD and outline the homepage structure."
    );
  }
  if (homeRefs.startTaskBtn) homeRefs.startTaskBtn.textContent = ht("开始任务", "Start Task");
  const contentPanels = document.querySelectorAll(".content-grid .panel h3");
  if (contentPanels[0]) contentPanels[0].textContent = ht("自动任务", "Workflows");
  if (contentPanels[1]) contentPanels[1].textContent = ht("智能体", "Agents");
  const recentKicker = document.querySelector(".activity-panel .panel-kicker");
  if (recentKicker) recentKicker.textContent = ht("最近", "Recent");
  if (homeRefs.refreshFeedBtn) homeRefs.refreshFeedBtn.textContent = ht("刷新", "Refresh");
}

function showToast(text) {
  homeRefs.toast.textContent = text;
  homeRefs.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => homeRefs.toast.classList.remove("show"), 1800);
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function goToChat(prompt) {
  const trimmed = (prompt || "").trim();
  const base = "../chat/chat-workspace.html";
  window.location.href = trimmed ? `${base}?prompt=${encodeURIComponent(trimmed)}&source=home` : `${base}?source=home`;
}

function renderSystemTime() {
  if (!homeRefs.systemTimeLabel) return;
  const now = new Date();
  if (isHomeEnglish) {
    homeRefs.systemTimeLabel.textContent = now.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
    return;
  }
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  homeRefs.systemTimeLabel.textContent = `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
}

function renderSignals() {
  homeRefs.signalStack.innerHTML = homeState.signals
    .map(
      (item) => `
        <article class="signal-item">
          <div class="signal-label">${escapeHtml(item.label)}</div>
          <div class="signal-value">${escapeHtml(item.value)}</div>
          <div class="signal-note">${escapeHtml(item.note)}</div>
        </article>
      `
    )
    .join("");
}

function renderTasks() {
  homeRefs.taskList.innerHTML = homeState.tasks
    .map(
      (item) => `
        <button class="task-card" type="button" ${item.href ? `data-href="${escapeHtml(item.href)}"` : `data-prompt="${escapeHtml(item.prompt)}"`}>
          <div class="task-card-header">
            <div>
              <h3>${escapeHtml(item.title)}</h3>
            </div>
            <div class="text-link">开始</div>
          </div>
          <p>${escapeHtml(item.description)}</p>
          <div class="task-meta">${escapeHtml(item.meta)}</div>
        </button>
      `
    )
    .join("");
}

function renderWorkspaces() {
  homeRefs.workspaceList.innerHTML = homeState.workspaces
    .map(
      (item) => `
        <a class="workspace-card" href="${item.href}">
          <div class="workspace-card-header">
            <div>
              <h3>${escapeHtml(item.title)}</h3>
            </div>
            <div class="text-link">进入</div>
          </div>
          <p>${escapeHtml(item.description)}</p>
          <div class="workspace-meta">${escapeHtml(item.meta)}</div>
        </a>
      `
    )
    .join("");
}

function renderActivities() {
  homeRefs.activityList.innerHTML = homeState.activities
    .map(
      (item) => `
        <article class="activity-item">
          <div class="activity-row">
            <div class="activity-title">${escapeHtml(item.title)}</div>
            <div class="activity-badge">${escapeHtml(item.badge)}</div>
          </div>
          <div class="activity-copy">${escapeHtml(item.copy)}</div>
          <div class="activity-time">${escapeHtml(item.time)}</div>
        </article>
      `
    )
    .join("");
}

function initHomeEvents() {
  homeRefs.startTaskBtn.addEventListener("click", () => goToChat(homeRefs.homePromptInput.value));
  homeRefs.newTaskBtn.addEventListener("click", () => goToChat(""));
  homeRefs.refreshFeedBtn.addEventListener("click", () => showToast("已刷新最近动态。"));

  homeRefs.taskList.addEventListener("click", (event) => {
    const button = event.target.closest(".task-card");
    if (!button) return;
    if (button.dataset.href) {
      window.location.href = button.dataset.href;
      return;
    }
    goToChat(button.dataset.prompt || "");
  });

  homeRefs.homePromptInput.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      goToChat(homeRefs.homePromptInput.value);
    }
  });

}

function renderHome() {
  localizeHomeChrome();
  renderSystemTime();
  renderSignals();
  renderTasks();
  renderWorkspaces();
  renderActivities();
}

initHomeEvents();
renderHome();
setInterval(renderSystemTime, 1000);
