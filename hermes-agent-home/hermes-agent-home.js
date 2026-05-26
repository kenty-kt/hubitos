const hermesState = {
  squads: [
    "Research Agent",
    "Planner Agent",
    "Writer Agent",
    "Visual Agent",
    "Ops Agent"
  ],
  metrics: [
    { label: "在线 Agent", value: "09", copy: "5 个核心执行角色，4 个备用能力节点正在待命。" },
    { label: "并行任务", value: "06", copy: "当前有 3 个任务处于并行拆解，2 个任务等待人工确认。" },
    { label: "本日交付", value: "14", copy: "已产出文档、表格、视觉草图和对外说明材料。" }
  ],
  roster: [
    {
      name: "Research Scout",
      badge: "Research",
      copy: "负责竞品扫描、资料搜集、引用整理和事实归档，适合作为多 Agent 流程的第一棒。",
      meta: "延迟低 · 擅长资料抽取与结构化总结",
      prompt: "请先作为 Research Scout 对当前任务做资料扫描，输出竞品、参考样本和事实依据。"
    },
    {
      name: "Flow Planner",
      badge: "Planning",
      copy: "把模糊目标拆成执行阶段、输入输出、依赖关系和交接节点，适合任务编排。",
      meta: "规划强 · 擅长阶段拆解与执行路径设计",
      prompt: "请作为 Flow Planner 把当前任务拆成阶段、依赖和明确交付物。"
    },
    {
      name: "Narrative Writer",
      badge: "Writing",
      copy: "承接研究和规划结果，生成 PRD、方案文案、提案结构和对外表达文本。",
      meta: "语言强 · 擅长商业表达与结构化写作",
      prompt: "请作为 Narrative Writer 基于已有结论，生成完整方案文案和 PRD 结构。"
    },
    {
      name: "Visual Composer",
      badge: "Visual",
      copy: "负责页面结构、视觉方向、模块优先级和设计表达，让文本产物转成可看的界面草图。",
      meta: "视觉强 · 擅长信息架构与界面方向提案",
      prompt: "请作为 Visual Composer 输出首页信息架构、模块顺序和视觉方向建议。"
    }
  ],
  pipeline: [
    {
      title: "任务解析",
      copy: "识别目标、约束、附件类型和预期交付，把一句任务翻译成可执行任务书。",
      meta: "输入: Prompt / Files · 输出: Mission Brief"
    },
    {
      title: "编队组装",
      copy: "根据任务类型挑选合适 Agent，定义每个角色的边界、输入和接力顺序。",
      meta: "输入: Mission Brief · 输出: Agent Squad"
    },
    {
      title: "并行执行",
      copy: "研究、规划、文案和视觉可并行推进，系统会把交叉依赖自动串联起来。",
      meta: "输入: Agent Squad · 输出: Draft Assets"
    },
    {
      title: "结果汇总",
      copy: "把多 Agent 的输出统一编排为一个可继续编辑、可沉淀、可交付的工作流结果。",
      meta: "输入: Draft Assets · 输出: Workspace Thread"
    }
  ],
  queue: [
    {
      title: "Hubitos 首页重构",
      badge: "进行中",
      copy: "Research Scout 已完成参考样本收集，Flow Planner 正在拆模块优先级。",
      meta: "Owner: Product Design · ETA: 18 min",
      prompt: "继续推进 Hubitos 首页重构任务，并整合研究、规划和视觉建议。"
    },
    {
      title: "PRD 资产归档整理",
      badge: "排队中",
      copy: "等待 Writer 接手，把最近几轮对话整理成正式 PRD 章节。",
      meta: "Owner: Strategy · ETA: 32 min",
      prompt: "把最近对话内容整理成正式 PRD，并补齐风险、节奏和里程碑。"
    },
    {
      title: "Agent 市场文案草拟",
      badge: "待确认",
      copy: "Visual 与 Narrative 编队已经准备好，等待确认是否进入对外文案模式。",
      meta: "Owner: Growth · ETA: Pending",
      prompt: "启动 Agent 市场文案任务，先生成首页文案框架和卖点结构。"
    }
  ],
  deliverables: [
    {
      title: "Agent_Home_IA_v2.fig",
      badge: "Visual",
      copy: "首页信息架构与模块排序建议，适合继续进入界面细化。",
      meta: "8 分钟前 · Visual Composer"
    },
    {
      title: "Mission_Brief_ProductLaunch.md",
      badge: "Brief",
      copy: "任务目标、用户群、阶段节点与关键约束条件已整理完成。",
      meta: "21 分钟前 · Flow Planner"
    },
    {
      title: "Competitor_Agent_Matrix.xlsx",
      badge: "Research",
      copy: "竞品能力矩阵、价格层和差异化空位已更新。",
      meta: "36 分钟前 · Research Scout"
    }
  ]
};

if (window.HubitosI18n && window.HubitosI18n.getLanguage() === "en") {
  const translated = window.HubitosI18n.translateDeep(hermesState, "en");
  Object.keys(hermesState).forEach((key) => {
    hermesState[key] = translated[key];
  });
}

const hermesRefs = {
  missionInput: document.getElementById("missionInput"),
  launchMissionBtn: document.getElementById("launchMissionBtn"),
  squadRow: document.getElementById("squadRow"),
  metricStack: document.getElementById("metricStack"),
  rosterGrid: document.getElementById("rosterGrid"),
  pipelineList: document.getElementById("pipelineList"),
  queueList: document.getElementById("queueList"),
  deliverableList: document.getElementById("deliverableList"),
  rebalanceBtn: document.getElementById("rebalanceBtn"),
  refreshQueueBtn: document.getElementById("refreshQueueBtn"),
  newMissionBtn: document.getElementById("newMissionBtn"),
  toast: document.getElementById("toast")
};

function showToast(text) {
  hermesRefs.toast.textContent = text;
  hermesRefs.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => hermesRefs.toast.classList.remove("show"), 1800);
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
  const trimmed = prompt.trim();
  const base = "../chat/chat-workspace.html";
  window.location.href = trimmed ? `${base}?prompt=${encodeURIComponent(trimmed)}&source=hermes` : `${base}?source=hermes`;
}

function renderSquads() {
  hermesRefs.squadRow.innerHTML = hermesState.squads
    .map(
      (item) => `
        <button class="squad-chip" type="button" data-squad="${escapeHtml(item)}">
          <span class="squad-dot"></span>
          <span>${escapeHtml(item)}</span>
        </button>
      `
    )
    .join("");
}

function renderMetrics() {
  hermesRefs.metricStack.innerHTML = hermesState.metrics
    .map(
      (item) => `
        <article class="metric-card">
          <div class="metric-label">${escapeHtml(item.label)}</div>
          <div class="metric-value">${escapeHtml(item.value)}</div>
          <div class="metric-copy">${escapeHtml(item.copy)}</div>
        </article>
      `
    )
    .join("");
}

function renderRoster() {
  hermesRefs.rosterGrid.innerHTML = hermesState.roster
    .map(
      (item) => `
        <button class="agent-card" type="button" data-prompt="${escapeHtml(item.prompt)}">
          <div class="agent-head">
            <div>
              <div class="unit-badge">${escapeHtml(item.badge)}</div>
              <h4>${escapeHtml(item.name)}</h4>
            </div>
            <div class="subtle-btn">调用</div>
          </div>
          <p class="agent-copy">${escapeHtml(item.copy)}</p>
          <div class="agent-meta">${escapeHtml(item.meta)}</div>
        </button>
      `
    )
    .join("");
}

function renderPipeline() {
  hermesRefs.pipelineList.innerHTML = hermesState.pipeline
    .map(
      (item, index) => `
        <article class="pipeline-item">
          <div class="pipeline-index">${index + 1}</div>
          <div>
            <h4>${escapeHtml(item.title)}</h4>
            <p class="pipeline-copy">${escapeHtml(item.copy)}</p>
            <div class="pipeline-meta">${escapeHtml(item.meta)}</div>
          </div>
        </article>
      `
    )
    .join("");
}

function renderQueue() {
  hermesRefs.queueList.innerHTML = hermesState.queue
    .map(
      (item) => `
        <button class="queue-item" type="button" data-prompt="${escapeHtml(item.prompt)}">
          <div class="queue-head">
            <div>
              <div class="queue-badge">${escapeHtml(item.badge)}</div>
              <h4>${escapeHtml(item.title)}</h4>
            </div>
            <div class="subtle-btn">继续</div>
          </div>
          <p class="queue-copy">${escapeHtml(item.copy)}</p>
          <div class="queue-meta">${escapeHtml(item.meta)}</div>
        </button>
      `
    )
    .join("");
}

function renderDeliverables() {
  hermesRefs.deliverableList.innerHTML = hermesState.deliverables
    .map(
      (item) => `
        <article class="deliverable-item">
          <div class="deliverable-head">
            <div>
              <div class="deliverable-badge">${escapeHtml(item.badge)}</div>
              <h4>${escapeHtml(item.title)}</h4>
            </div>
          </div>
          <p class="deliverable-copy">${escapeHtml(item.copy)}</p>
          <div class="deliverable-meta">${escapeHtml(item.meta)}</div>
        </article>
      `
    )
    .join("");
}

function initEvents() {
  hermesRefs.launchMissionBtn.addEventListener("click", () => goToChat(hermesRefs.missionInput.value));
  hermesRefs.newMissionBtn.addEventListener("click", () => goToChat(hermesRefs.missionInput.value));
  hermesRefs.rebalanceBtn.addEventListener("click", () => showToast("已重新给任务推荐 Agent 编队。"));
  hermesRefs.refreshQueueBtn.addEventListener("click", () => showToast("实时任务队列已刷新。"));

  hermesRefs.squadRow.addEventListener("click", (event) => {
    const button = event.target.closest("[data-squad]");
    if (!button) return;
    hermesRefs.missionInput.value = `请调度 ${button.dataset.squad} 参与当前任务，并说明它的角色边界与交接方式。`;
    hermesRefs.missionInput.focus();
  });

  hermesRefs.rosterGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-prompt]");
    if (!button) return;
    goToChat(button.dataset.prompt);
  });

  hermesRefs.queueList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-prompt]");
    if (!button) return;
    goToChat(button.dataset.prompt);
  });

  hermesRefs.missionInput.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      goToChat(hermesRefs.missionInput.value);
    }
  });
}

function render() {
  renderSquads();
  renderMetrics();
  renderRoster();
  renderPipeline();
  renderQueue();
  renderDeliverables();
}

initEvents();
render();
