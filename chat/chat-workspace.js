const state = {
  routingEnabled: true,
  currentConversationId: "conv-home",
  currentModelId: "pro",
  compareModelIds: ["pro"],
  activeTool: null,
  activeWorkflow: null,
  entrySource: "",
  contextExpanded: false,
  attachedItems: [
    { id: "asset-file-1", type: "file", label: "设计说明.pdf" },
    { id: "asset-file-2", type: "file", label: "品牌参考图.png" }
  ],
  skills: [
    { id: "file-search", name: "查找文件", enabled: true },
    { id: "image-gen", name: "生成图片", enabled: true },
    { id: "code-explain", name: "解释代码", enabled: false },
    { id: "template-pack", name: "模板库", enabled: true }
  ],
  models: [
    { id: "pro", name: "Hubitos Pro", meta: "适合复杂任务 · 思考更深入", icon: "✦", tokenUsed: 14200, tokenTotal: 128000 },
    { id: "lite", name: "Hubitos Lite", meta: "适合日常任务 · 响应更快", icon: "⚡", tokenUsed: 4200, tokenTotal: 64000 },
    { id: "advanced", name: "Hubitos Advanced", meta: "适合深度执行 · 上下文更多", icon: "◎", tokenUsed: 31800, tokenTotal: 256000 }
  ],
  recentSkills: [
    { id: "rs1", icon: "⚡", name: "PRD 写作助手", prompt: "请用 PRD 写作助手帮我整理这个需求，并输出完整的大纲。" },
    { id: "rs2", icon: "⌕", name: "查找文件", prompt: "请帮我搜索刚上传的文件，并提取里面的关键结论。" },
    { id: "rs3", icon: "🖼", name: "生成图片", prompt: "请根据当前品牌方向，生成一版红白主视觉草图。" }
  ],
  recentAgents: [
    { id: "ra1", icon: "✦", name: "市场调研助手", prompt: "请调用市场调研助手，输出竞品分析和建议总结。" },
    { id: "ra2", icon: "◎", name: "品牌视觉顾问", prompt: "请调用品牌视觉顾问，给我一版桌面首页的视觉提案。" },
    { id: "ra3", icon: "⚙", name: "运营日报助手", prompt: "请调用运营日报助手，整理今天的关键数据和执行建议。" }
  ],
  recentPrompts: [
    "请把这份项目说明整理成完整 PRD，并同时输出 Word 和 Markdown。",
    "请根据我上传的 PDF 和图片，生成一版桌面客户端首页草图。",
    "请把这些资料整理成一个可复用的自动任务，并输出适合团队协作的执行方案。"
  ],
  conversations: [
    {
      id: "conv-home",
      title: "新对话",
      folder: "未归档",
      pinned: false,
      assets: [],
      messages: []
    },
    {
      id: "conv-market",
      title: "市场调研整理",
      folder: "品牌策略",
      pinned: true,
      assets: [
        { id: "docx-1", icon: "▤", name: "PRD_Final.docx", meta: "Document | Archived to Brand Strategy" },
        { id: "png-1", icon: "▧", name: "Design_Layout.png", meta: "Image | Cover direction generated" },
        { id: "xlsx-1", icon: "▦", name: "Research_Sample.xlsx", meta: "Table | Synced to cloud" }
      ],
      messages: [
        {
          id: "m1",
          role: "user",
          text: "请基于这份 PDF，继续完善 AI OS 桌面端的视觉风格，并整理成适合高执行团队使用的 PRD 设计说明。"
        },
        {
          id: "m2",
          role: "assistant",
          sourcePrompt: "Hubitos, please continue refining the AI OS desktop visual style based on this PDF and turn it into a PRD design brief suitable for a high-execution brand.",
          sourceModelId: "pro",
          text: "我已经吸收了你给的设计原则。接下来我会先整理视觉方向、页面结构和相关素材，再统一归档到“品牌策略”文件夹里。",
          tags: ["自动分配模型：Hubitos Pro", "输出格式：Word", "已启用 3 个技能"],
          status: "已归档到 品牌策略",
          selectedOutput: "Word",
          assetsByOutput: {
            Word: [{ icon: "📄", title: "PRD_终稿.docx", subtitle: "文档｜已归档" }],
            Image: [{ icon: "🖼", title: "封面概念图_V1.png", subtitle: "图片｜已生成" }]
          },
          actions: ["接着帮我补齐关键页面结构和交互细节。"]
        }
      ]
    },
    {
      id: "conv-prd",
      title: "PRD 撰写讨论",
      folder: "产品策略",
      pinned: false,
      assets: [
        { id: "prd-md", icon: "▤", name: "Hubitos_PRD.md", meta: "Markdown｜待确认" }
      ],
      messages: [
        { id: "p1", role: "user", text: "请把当前对话整理成完整 PRD，并补上核心功能和商业模式。" },
        {
          id: "p2",
          role: "assistant",
          sourcePrompt: "Please turn the conversation into a complete PRD and fill in the core features and business model.",
          sourceModelId: "pro",
          text: "我已经把内容拆成项目概览、功能结构、业务流程、技术建议和阶段路线图。下一步你可以直接导出 Word，或者继续沉淀成技能。",
          tags: ["自动分配模型：Hubitos Pro", "输出格式：Word"],
          status: "文档草稿已准备好",
          selectedOutput: "Word",
          assetsByOutput: {
            Word: [{ icon: "📄", title: "Hubitos_PRD.docx", subtitle: "Word 文档｜可导出" }],
            Markdown: [{ icon: "📝", title: "Hubitos_PRD.md", subtitle: "Markdown｜待确认" }]
          },
          actions: ["继续帮我补齐里程碑、风险和上线指标。"]
        }
      ]
    },
    {
      id: "conv-report",
      title: "竞品分析汇总",
      folder: "市场分析",
      pinned: false,
      assets: [
        { id: "report-xlsx", icon: "▦", name: "竞品分析.xlsx", meta: "Excel｜含功能对比" }
      ],
      messages: [
        { id: "r1", role: "user", text: "请把这些竞品整理成功能对比表和价格分析。" },
        {
          id: "r2",
          role: "assistant",
          sourcePrompt: "Organize these competitors into a feature comparison table and pricing analysis.",
          sourceModelId: "lite",
          text: "我已经整理出一份可继续扩展的竞品分析表，也保留了关键参考链接。接下来可以继续补视觉风格矩阵，或者直接导出 Excel。",
          tags: ["自动分配模型：Hubitos Lite", "输出格式：Excel"],
          status: "表格已同步",
          selectedOutput: "Excel",
          assetsByOutput: {
            Excel: [{ icon: "▦", title: "竞品分析.xlsx", subtitle: "Excel｜含功能对比" }]
          },
          actions: ["继续帮我补上价格对比，并标出差距最大的地方。"]
        }
      ]
    }
  ]
};

if (window.HubitosI18n && window.HubitosI18n.getLanguage() === "en") {
  const translated = window.HubitosI18n.translateDeep(state, "en");
  Object.keys(state).forEach((key) => {
    state[key] = translated[key];
  });
}

const refs = {
  historyList: document.getElementById("historyList"),
  conversationTitle: document.getElementById("conversationTitle"),
  conversationMeta: document.getElementById("conversationMeta"),
  messageList: document.getElementById("messageList"),
  homeStart: document.getElementById("homeStart"),
  recentSections: document.getElementById("recentSections"),
  recentSkills: document.getElementById("recentSkills"),
  recentAgents: document.getElementById("recentAgents"),
  recentPrompts: document.getElementById("recentPrompts"),
  promptSection: document.getElementById("promptSection"),
  chatScroll: document.getElementById("chatScroll"),
  modelPickerToggle: document.getElementById("modelPickerToggle"),
  modelPickerLabel: document.getElementById("modelPickerLabel"),
  modelPickerMenu: document.getElementById("modelPickerMenu"),
  attachedItems: document.getElementById("attachedItems"),
  taskContextTitle: document.getElementById("taskContextTitle"),
  taskContextMeta: document.getElementById("taskContextMeta"),
  taskContextDetails: document.getElementById("taskContextDetails"),
  taskContextExpectation: document.getElementById("taskContextExpectation"),
  toggleContextDetailsBtn: document.getElementById("toggleContextDetailsBtn"),
  activeToolBar: document.getElementById("activeToolBar"),
  activeToolIcon: document.getElementById("activeToolIcon"),
  activeToolTitle: document.getElementById("activeToolTitle"),
  activeToolMeta: document.getElementById("activeToolMeta"),
  applyToolBtn: document.getElementById("applyToolBtn"),
  clearToolBtn: document.getElementById("clearToolBtn"),
  activeWorkflowBar: document.getElementById("activeWorkflowBar"),
  activeWorkflowTitle: document.getElementById("activeWorkflowTitle"),
  activeWorkflowMeta: document.getElementById("activeWorkflowMeta"),
  applyWorkflowBtn: document.getElementById("applyWorkflowBtn"),
  clearWorkflowBtn: document.getElementById("clearWorkflowBtn"),
  promptInput: document.getElementById("promptInput"),
  sendBtn: document.getElementById("sendBtn"),
  skillChips: document.getElementById("skillChips"),
  assetsSection: document.getElementById("assetsSection"),
  panelAssetList: document.getElementById("panelAssetList"),
  toggleRoutingBtn: document.getElementById("toggleRoutingBtn"),
  newConversationBtn: document.getElementById("newConversationBtn"),
  attachFileBtn: document.getElementById("attachFileBtn"),
  skillPresetBtn: document.getElementById("skillPresetBtn"),
  pinConversationBtn: document.getElementById("pinConversationBtn"),
  saveTemplateBtn: document.getElementById("saveTemplateBtn"),
  toast: document.getElementById("toast")
};

const outputFormats = ["Markdown", "Word", "PPT", "Excel", "PDF", "图片"];
const ACTIVE_TOOL_KEY = "hubitos-active-tool";
const ACTIVE_WORKFLOW_KEY = "hubitos-active-workflow";

function localizeInputText(value) {
  if (!value) return value;
  if (window.HubitosI18n && typeof window.HubitosI18n.translateDeep === "function") {
    return window.HubitosI18n.translateDeep(String(value), window.HubitosI18n.getLanguage());
  }
  return value;
}

function setPromptInputValue(value) {
  refs.promptInput.value = localizeInputText(value || "");
  autoResizePrompt();
  if (refs.taskContextTitle) renderTaskContext();
}

function hydratePromptFromQuery() {
  try {
    const url = new URL(window.location.href);
    const prompt = url.searchParams.get("prompt");
    state.entrySource = url.searchParams.get("source") || "";
    if (!prompt) return;
    setPromptInputValue(prompt);
    if (window.HubitosI18n && typeof window.HubitosI18n.refresh === "function") window.HubitosI18n.refresh();
  } catch (error) {
    // Ignore malformed URLs and keep the workspace usable.
  }
}

function getEntrySourceLabel() {
  const sourceMap = {
    home: "Source: Home task card",
    workflow: "Source: Workflow continuation",
    hermes: "Source: Agent command deck"
  };
  return sourceMap[state.entrySource] || "";
}

function closeModelPickerMenu() {
  refs.modelPickerMenu.classList.remove("open");
  refs.modelPickerToggle.setAttribute("aria-expanded", "false");
}

function openModelPickerMenu() {
  refs.modelPickerMenu.classList.add("open");
  refs.modelPickerToggle.setAttribute("aria-expanded", "true");
  requestAnimationFrame(() => {
    const firstOption = refs.modelPickerMenu.querySelector("[data-model-id]");
    if (firstOption) firstOption.focus();
  });
}

function loadActiveTool() {
  try {
    const raw = window.localStorage.getItem(ACTIVE_TOOL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function loadActiveWorkflow() {
  try {
    const raw = window.localStorage.getItem(ACTIVE_WORKFLOW_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function saveActiveTool(tool) {
  state.activeTool = tool;
  if (!tool) {
    window.localStorage.removeItem(ACTIVE_TOOL_KEY);
    return;
  }
  window.localStorage.setItem(ACTIVE_TOOL_KEY, JSON.stringify(tool));
}

function saveActiveWorkflow(workflow) {
  state.activeWorkflow = workflow;
  if (!workflow) {
    window.localStorage.removeItem(ACTIVE_WORKFLOW_KEY);
    return;
  }
  window.localStorage.setItem(ACTIVE_WORKFLOW_KEY, JSON.stringify(workflow));
}

function getConversation() {
  return state.conversations.find((item) => item.id === state.currentConversationId);
}

function getCurrentModel() {
  return state.models.find((item) => item.id === state.currentModelId);
}

function getSelectedModels() {
  return state.models.filter((item) => state.compareModelIds.includes(item.id));
}

function showToast(text) {
  refs.toast.textContent = text;
  refs.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => refs.toast.classList.remove("show"), 1800);
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderHistory() {
  refs.historyList.innerHTML = state.conversations
    .filter((conversation) => conversation.id !== "conv-home")
    .map(
      (conversation) => `
        <button class="history-item ${conversation.id === state.currentConversationId ? "active" : ""}" data-conversation-id="${conversation.id}" type="button">
          <span class="history-label">${escapeHtml(conversation.title)}</span>
          <span class="history-delete">${conversation.pinned ? "📌" : "🗑"}</span>
        </button>
      `
    )
    .join("");
}

function renderHomeStart() {
  refs.recentSkills.innerHTML = state.recentSkills
    .map(
      (item) => `
        <button class="recent-item" type="button" data-prompt="${escapeHtml(item.prompt)}">
          <span class="recent-item-icon">${item.icon}</span>
          <span class="recent-item-content">
            <span class="recent-item-title">${escapeHtml(item.name)}</span>
            <span class="recent-item-desc">一键带入最近常用的技能，直接用到当前任务里。</span>
          </span>
        </button>
      `
    )
    .join("");

  refs.recentAgents.innerHTML = state.recentAgents
    .map(
      (item) => `
        <button class="recent-item" type="button" data-prompt="${escapeHtml(item.prompt)}">
          <span class="recent-item-icon">${item.icon}</span>
          <span class="recent-item-content">
            <span class="recent-item-title">${escapeHtml(item.name)}</span>
            <span class="recent-item-desc">直接复用最近常用的智能体角色和做事方式。</span>
          </span>
        </button>
      `
    )
    .join("");

  refs.recentPrompts.innerHTML = state.recentPrompts
    .map(
      (prompt) => `
        <button class="recent-item prompt-item" type="button" data-prompt="${escapeHtml(prompt)}">
          <span class="recent-item-icon">⌘</span>
          <span class="recent-item-content">
            <span class="recent-item-title">${escapeHtml(prompt)}</span>
          </span>
        </button>
      `
    )
    .join("");
}

function renderAttachments() {
  refs.attachedItems.innerHTML = state.attachedItems.length
    ? state.attachedItems
        .map(
          (item) => `
            <div class="attached-chip">
              <span>📄 ${escapeHtml(item.label)}</span>
              <button type="button" data-attachment-id="${item.id}" aria-label="移除文件 ${escapeHtml(item.label)}">×</button>
            </div>
          `
        )
        .join("")
    : "";
}

function getEffectivePrompt(promptText) {
  const prompt = (promptText || "").trim();
  if (prompt) return prompt;
  if (state.activeWorkflow?.prompt) return state.activeWorkflow.prompt;
  if (state.activeTool?.invokeText) return state.activeTool.invokeText;
  if (state.activeTool?.title) return `Use ${state.activeTool.title} to continue this task.`;
  if (state.attachedItems.length) return "Please continue based on the files already attached.";
  return "";
}

function renderTaskContext() {
  const selectedModels = getSelectedModels();
  const modelLabel =
    selectedModels.length > 1
      ? selectedModels.map((model) => model.name).join(" + ")
      : getCurrentModel().name;
  const routingLabel = state.routingEnabled ? "Auto routing on" : "Manual model selection";
  const sourceLabel = getEntrySourceLabel();
  const fileCount = state.attachedItems.length;
  const detailChips = [];

  if (sourceLabel) {
    detailChips.push(`<div class="context-chip source-chip"><span>${escapeHtml(sourceLabel)}</span></div>`);
  }

  state.attachedItems.forEach((item) => {
    detailChips.push(`
      <div class="context-chip">
        <span>File: ${escapeHtml(item.label)}</span>
        <button type="button" data-context-remove="attachment" data-context-id="${item.id}" aria-label="移除文件上下文 ${escapeHtml(item.label)}">×</button>
      </div>
    `);
  });

  if (state.activeTool) {
    detailChips.push(`
      <div class="context-chip">
        <span>Tool: ${escapeHtml(state.activeTool.title || "Selected tool")}</span>
        <button type="button" data-context-remove="tool" aria-label="移除工具上下文 ${escapeHtml(state.activeTool.title || "Selected tool")}">×</button>
      </div>
    `);
  }

  if (state.activeWorkflow) {
    detailChips.push(`
      <div class="context-chip">
        <span>Workflow: ${escapeHtml(state.activeWorkflow.title || "Selected workflow")}</span>
        <button type="button" data-context-remove="workflow" aria-label="移除自动任务上下文 ${escapeHtml(state.activeWorkflow.title || "Selected workflow")}">×</button>
      </div>
    `);
  }

  const summaryParts = [];
  summaryParts.push(fileCount ? `${fileCount} file${fileCount > 1 ? "s" : ""}` : "No files");
  summaryParts.push(state.activeTool ? `Tool: ${state.activeTool.title}` : "No tool");
  summaryParts.push(state.activeWorkflow ? `Workflow: ${state.activeWorkflow.title}` : "No workflow");
  if (sourceLabel) summaryParts.push(sourceLabel);

  refs.taskContextTitle.textContent = `Using ${modelLabel} · ${routingLabel}`;
  refs.taskContextMeta.textContent = summaryParts.join(" · ");
  refs.taskContextDetails.innerHTML = detailChips.length ? detailChips.join("") : `<div class="context-chip"><span>No additional context yet.</span></div>`;
  refs.taskContextDetails.classList.toggle("hidden", !state.contextExpanded);
  refs.toggleContextDetailsBtn.textContent = state.contextExpanded ? "Hide details" : "Expand details";
  refs.toggleContextDetailsBtn.setAttribute("aria-expanded", state.contextExpanded ? "true" : "false");

  const effectivePrompt = getEffectivePrompt(refs.promptInput.value);
  const hasContext = Boolean(
    refs.promptInput.value.trim() ||
      state.attachedItems.length ||
      state.activeTool ||
      state.activeWorkflow
  );
  if (!hasContext) {
    refs.taskContextExpectation.textContent = "Add a request or choose a context before sending.";
    refs.sendBtn.disabled = true;
    refs.sendBtn.title = "Add a request or context first";
  } else if (!refs.promptInput.value.trim() && (state.activeTool || state.activeWorkflow || state.attachedItems.length)) {
    refs.taskContextExpectation.textContent = state.activeWorkflow
      ? "Sending will continue this workflow with the current context."
      : state.activeTool
        ? "Sending will continue with the selected tool and current files."
        : "Sending will continue based on the attached files.";
    refs.sendBtn.disabled = false;
    refs.sendBtn.title = "Continue with current context";
  } else {
    refs.taskContextExpectation.textContent = state.activeWorkflow
      ? "Sending will continue the workflow and open the next execution step in chat."
      : state.activeTool
        ? "Sending will run with the selected tool and produce a first draft in chat."
        : effectivePrompt
          ? "Sending will start a normal chat execution with the current model."
          : "Add a request or choose a context before sending.";
    refs.sendBtn.disabled = !effectivePrompt;
    refs.sendBtn.title = refs.sendBtn.disabled ? "Add a request or context first" : "Send";
  }
}

function renderActiveTool() {
  const tool = state.activeTool;
  if (!tool) {
    refs.activeToolBar.classList.add("hidden");
    return;
  }
  refs.activeToolBar.classList.remove("hidden");
  refs.activeToolIcon.textContent = tool.icon || "✦";
  refs.activeToolTitle.textContent = tool.title || "当前工具";
  refs.activeToolMeta.textContent = `${tool.type || "工具"} · ${(tool.tags || []).join(" / ") || "可直接使用"}`;
}

function renderActiveWorkflow() {
  const workflow = state.activeWorkflow;
  if (!workflow) {
    refs.activeWorkflowBar.classList.add("hidden");
    return;
  }
  refs.activeWorkflowBar.classList.remove("hidden");
  refs.activeWorkflowTitle.textContent = workflow.title || "当前自动任务";
  const metaParts = [workflow.platform || "自动任务"];
  if (typeof workflow.missingCount === "number") {
    metaParts.push(workflow.missingCount > 0 ? `还差 ${workflow.missingCount} 项信息` : "可以继续");
  }
  refs.activeWorkflowMeta.textContent = metaParts.join(" · ");
}

function renderModelPickerMenu() {
  const selectedModels = getSelectedModels();
  refs.modelPickerLabel.textContent =
    selectedModels.length > 1
      ? `⇄ ${selectedModels.map((model) => model.name).join(" + ")}`
      : `${selectedModels[0].icon} ${selectedModels[0].name}`;
  refs.modelPickerMenu.innerHTML = state.models
    .map((model) => {
      const selected = state.compareModelIds.includes(model.id);
      return `
        <button class="format-option ${selected ? "active" : ""}" type="button" data-model-id="${model.id}">
          <span class="format-option-main format-option-check">
            <span class="format-option-checkbox">${selected ? "✓" : ""}</span>
            <span class="format-option-icon">${escapeHtml(model.icon)}</span>
            <span class="format-option-copy">
              <span class="format-option-title">${escapeHtml(model.name)}</span>
              <span class="format-option-subtitle">${escapeHtml(model.meta)}</span>
            </span>
          </span>
        </button>
      `;
    })
    .join("");
}

function renderMessages() {
  const conversation = getConversation();
  refs.messageList.innerHTML = conversation.messages
    .map((message) => {
      if (message.role === "user") {
        return `
          <div class="message-row user-row">
            <div class="message user-message">${escapeHtml(message.text)}</div>
          </div>
        `;
      }

      if (message.role === "typing") {
        return `
          <div class="message-row assistant-row">
            <div class="assistant-head">
              <div class="assistant-badge">✦</div>
              <div class="assistant-name">Ⅱ + HUBITOS PRO</div>
            </div>
            <div class="assistant-card typing-card">
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
            </div>
          </div>
        `;
      }

      if (message.role === "assistant-compare") {
        const compareGridClass = message.options.length > 3 ? "compare-grid is-scrollable" : "compare-grid";
        return `
          <div class="message-row assistant-row">
            <div class="assistant-head">
              <div class="assistant-badge">⇄</div>
              <div class="assistant-name">Ⅱ + 模型对比</div>
            </div>
            <div class="assistant-card compare-card">
              <div class="compare-header">
                <div class="compare-title">同一个问题已经让多个模型回答了。选一个继续往下聊。</div>
                <div class="assistant-status">${escapeHtml(message.status || "")}</div>
              </div>
              <div class="${compareGridClass}" style="--compare-count:${message.options.length};">
                ${message.options
                  .map(
                    (option) => `
                      <div class="compare-column ${message.selectedModelId === option.modelId ? "selected" : ""}">
                        <div class="compare-model">
                          <div>
                            <div class="compare-model-name">${escapeHtml(option.icon)} ${escapeHtml(option.modelName)}</div>
                            <div class="compare-model-meta">${escapeHtml(option.meta)}</div>
                          </div>
                          <div class="compare-badge">${message.selectedModelId === option.modelId ? "已选中" : "可选择"}</div>
                        </div>
                        <div class="compare-body">
                          <div class="compare-body-text">${escapeHtml(option.text)}</div>
                          <div class="compare-stats">
                            <span class="compare-stat">Latency ${escapeHtml(option.latency)}</span>
                            <span class="compare-stat">${escapeHtml(option.fit)}</span>
                            <span class="compare-stat">${escapeHtml(option.output)}</span>
                          </div>
                          <div class="compare-note">${escapeHtml(option.note)}</div>
                        </div>
                        <div class="compare-actions">
                          <button class="compare-pick" type="button" data-compare-pick="${message.id}" data-model-choice="${option.modelId}">
                            ${message.selectedModelId === option.modelId ? "继续用这个模型" : "选这个模型"}
                          </button>
                        </div>
                      </div>
                    `
                  )
                  .join("")}
              </div>
            </div>
          </div>
        `;
      }

      return `
        <div class="message-row assistant-row">
          <div class="assistant-head">
            <div class="assistant-badge">✦</div>
            <div class="assistant-name">Ⅱ + HUBITOS PRO</div>
          </div>
          <div class="assistant-card">
            <div class="assistant-text">${escapeHtml(message.text)}</div>
            <div class="message-meta-row compact">
              <label class="inline-output-control">
                <span class="inline-output-label">换个模型</span>
                <select class="inline-output-select" data-message-compare-select="${message.id}">
                  <option value="">请选择模型</option>
                  ${state.models
                    .filter((model) => model.id !== (message.sourceModelId || state.currentModelId))
                    .map(
                      (model) => `
                        <option value="${escapeHtml(model.id)}">
                          ${escapeHtml(model.name)}
                        </option>
                      `
                    )
                    .join("")}
                </select>
              </label>
              <div class="assistant-status">${escapeHtml(message.status || "")}</div>
            </div>
            ${
              message.actions && message.actions.length
                ? `
                  <div class="quick-actions">
                    ${message.actions
                      .map(
                        (action) => `
                          <button class="quick-action" type="button" data-quick-action="${escapeHtml(action)}">${escapeHtml(action)}</button>
                        `
                      )
                      .join("")}
                  </div>
                `
                : ""
            }
          </div>
        </div>
      `;
    })
    .join("");
}

function renderPanel() {
  const conversation = getConversation();
  const model = getCurrentModel();
  refs.conversationTitle.textContent = conversation.messages.length ? conversation.title : "New Chat";
  refs.conversationMeta.textContent = "Conversations are saved as skills by default and can be found in Tools > Mine.";
  refs.toggleRoutingBtn.classList.toggle("active", state.routingEnabled);
  renderTaskContext();

  if (refs.skillChips) {
    refs.skillChips.innerHTML = state.skills
      .map(
        (skill) => `
          <button class="skill-chip ${skill.enabled ? "" : "off"}" data-skill-id="${skill.id}" type="button">
            <span>${skill.enabled ? "✓" : "＋"}</span>
            <span>${escapeHtml(skill.name)}</span>
          </button>
        `
      )
      .join("");
  }

  if (refs.panelAssetList) {
    refs.panelAssetList.innerHTML = conversation.assets.length
      ? conversation.assets
          .map(
            (asset) => `
              <div class="panel-asset">
                <div>
                  <strong>${escapeHtml(asset.icon)} ${escapeHtml(asset.name)}</strong>
                  <small>${escapeHtml(asset.meta)}</small>
                </div>
                <span class="download-icon">↓</span>
              </div>
            `
          )
          .join("")
      : `<div class="empty-state">这里还没有内容。后面生成的文档、图片和表格会自动放到这里。</div>`;
  }
  if (refs.assetsSection) {
    refs.assetsSection.classList.toggle("hidden", conversation.assets.length === 0);
  }
}

function render() {
  renderHistory();
  renderHomeStart();
  renderModelPickerMenu();
  renderAttachments();
  renderActiveTool();
  renderActiveWorkflow();
  renderMessages();
  renderPanel();
  refs.homeStart.classList.toggle("hidden", getConversation().messages.length > 0);
  refs.chatScroll.scrollTop = refs.chatScroll.scrollHeight;
}

function autoResizePrompt() {
  refs.promptInput.style.height = "auto";
  refs.promptInput.style.height = `${Math.min(refs.promptInput.scrollHeight, 220)}px`;
}

function addAttachment() {
  const candidates = ["会议纪要.docx", "参考海报.png", "需求清单.xlsx", "竞品资料.pdf", "数据样例.csv"];
  const item = {
    id: `file-${Date.now()}`,
    type: "file",
    label: candidates[Math.floor(Math.random() * candidates.length)]
  };
  state.attachedItems.push(item);
  renderAttachments();
  renderTaskContext();
  showToast(`已上传 ${item.label}，系统会自动识别文件类型。`);
}

function removeAttachment(id) {
  state.attachedItems = state.attachedItems.filter((item) => item.id !== id);
  renderAttachments();
  renderTaskContext();
}

function chooseAutoModel(prompt) {
  const lower = prompt.toLowerCase();
  const attachmentLabels = state.attachedItems.map((item) => item.label.toLowerCase()).join(" ");

  if (
    lower.includes("image") ||
    lower.includes("poster") ||
    attachmentLabels.includes(".png") ||
    attachmentLabels.includes(".jpg")
  ) {
    return "advanced";
  }

  if (
    lower.includes("table") ||
    attachmentLabels.includes(".xlsx") ||
    attachmentLabels.includes(".csv")
  ) {
    return "lite";
  }

  return "pro";
}

function buildAssistantText(prompt, modelId) {
  const conversation = getConversation();
  const attachments = state.attachedItems.map((item) => item.label).join("、") || "没有上传文件";
  const enabledSkills = state.skills.filter((skill) => skill.enabled).map((skill) => skill.name);
  const skillText = enabledSkills.length ? enabledSkills.join("、") : "暂时没有启用技能";
  const voices = {
    pro: `我会按“高质量整理”的方式来处理这个任务。当前参考资料有：${attachments}。我会先梳理设计方向、页面层级和判断标准，再把结果整理到“${conversation.folder}”这条线里。当前启用的技能有：${skillText}。输出会更偏结构化说明，方便你继续修改，也方便交接给下一个同事。`,
    lite: `我会用更直接、更省时间的方式来处理。结合这些资料：${attachments}，我会尽量给你一个更短、更好执行的版本。输出会更偏重点清单和下一步动作，让团队能马上接着干。`,
    advanced: `我会把它当成一个更复杂的执行任务来处理。我会把 ${attachments} 里的上下文一起考虑进去，先把关键取舍想清楚，再给你更完整的建议。你会看到更细的执行假设、边界情况和后续怎么落地的说明。`
  };
  return voices[modelId] || voices.pro;
}

function buildComparePayload(prompt, modelIds) {
  const compareProfiles = {
    pro: {
      latency: "约 9 秒",
      fit: "适合整理复杂信息，输出结构更完整",
      output: "大纲 + 说明理由 + 下一步建议",
      note: "会结合文件、当前文件夹和已启用技能一起回答"
    },
    lite: {
      latency: "约 3 秒",
      fit: "适合快速迭代，先给你能马上执行的版本",
      output: "简短答案 + 执行清单",
      note: "文案更短，更适合立刻修改"
    },
    advanced: {
      latency: "约 14 秒",
      fit: "适合做规划、比较方案和处理复杂任务",
      output: "更完整的建议 + 执行注意点",
      note: "会带更多上下文，覆盖更多决策情况"
    }
  };

  return {
    id: `cmp-${Date.now()}`,
    role: "assistant-compare",
    status: "请先对比，再选一个模型继续",
    selectedModelId: "",
    options: modelIds.map((modelId) => {
      const model = state.models.find((item) => item.id === modelId);
      const profile = compareProfiles[modelId] || compareProfiles.pro;
      return {
        modelId,
        modelName: model.name,
        meta: model.meta,
        icon: model.icon,
        text: buildAssistantText(prompt, modelId),
        latency: profile.latency,
        fit: profile.fit,
        output: profile.output,
        note: profile.note
      };
    })
  };
}

function getPromptForMessage(messageId) {
  const conversation = getConversation();
  const index = conversation.messages.findIndex((item) => item.id === messageId);
  if (index === -1) return "";
  const message = conversation.messages[index];
  if (message.sourcePrompt) return message.sourcePrompt;
  for (let i = index - 1; i >= 0; i -= 1) {
    if (conversation.messages[i].role === "user") {
      return conversation.messages[i].text;
    }
  }
  return "";
}

function getCompareModelSet(baseModelId, targetModelId) {
  const base = baseModelId || state.currentModelId;
  if (targetModelId) return [base, targetModelId];
  if (state.compareModelIds.length > 1) return [...state.compareModelIds];
  const fallback = state.models.find((model) => model.id !== base);
  return fallback ? [base, fallback.id] : [base];
}

function buildAssistantPayload(prompt) {
  const conversation = getConversation();
  const attachments = state.attachedItems.map((item) => item.label).join("、") || "没有上传文件";
  const enabledSkills = state.skills.filter((skill) => skill.enabled).map((skill) => skill.name);
  const skillText = enabledSkills.length ? enabledSkills.join("、") : "暂时没有启用技能";
  let text = `我收到任务了。当前参考资料有：${attachments}。我会先判断这些文件适合怎么处理，再结合 ${skillText} 来准备结果，默认会保存到 ${conversation.folder}。草稿准备好后，你可以在下面选择输出格式，对应文件也会直接出现在这条回复下面。`;
  let assetsByOutput = {};
  let status = `已保存到 ${conversation.folder}`;

  if (attachments.includes(".xlsx") || attachments.includes(".csv")) {
    assetsByOutput = {
      Excel: [{ icon: "▦", title: "Hubitos_识别结果.xlsx", subtitle: "根据表格内容自动生成" }],
      PDF: [{ icon: "📕", title: "Hubitos_数据报告.pdf", subtitle: "PDF｜表格结果快照" }]
    };
    text += " 因为检测到了表格文件，所以我会优先准备表格版结果。";
  } else if (attachments.includes(".png") || attachments.includes(".jpg")) {
    assetsByOutput = {
      Image: [{ icon: "🖼", title: "Hubitos_视觉延展.png", subtitle: "根据图片内容自动生成" }],
      PPT: [{ icon: "📊", title: "Hubitos_视觉方案.pptx", subtitle: "PPT｜含视觉参考" }]
    };
    text += " 因为检测到了图片文件，所以我会优先准备视觉版结果。";
  } else if (attachments.includes(".pdf")) {
    assetsByOutput = {
      Word: [{ icon: "📄", title: "Hubitos_提取笔记.docx", subtitle: "根据 PDF 自动生成" }],
      Markdown: [{ icon: "📝", title: "Hubitos_提取笔记.md", subtitle: "Markdown｜可继续编辑" }]
    };
    text += " 因为检测到了 PDF，所以我会优先准备可编辑的文档版结果。";
  } else {
    assetsByOutput = {
      Markdown: [{ icon: "📝", title: "Hubitos_输出草稿.md", subtitle: "Markdown｜结构化草稿已完成" }],
      Word: [{ icon: "📄", title: "Hubitos_项目说明.docx", subtitle: "Word 文档｜可继续编辑" }],
      PPT: [{ icon: "📊", title: "Hubitos_方案大纲.pptx", subtitle: "PPT｜含封面方向" }],
      Excel: [{ icon: "▦", title: "Hubitos_任务拆解.xlsx", subtitle: "表格｜已含结构化字段" }],
      PDF: [{ icon: "📕", title: "Hubitos_报告.pdf", subtitle: "PDF｜已生成导出稿" }],
      Image: [{ icon: "🖼", title: "Hubitos_概念海报.png", subtitle: "图片｜可继续修改" }]
    };
    text += " 因为你没有指定输出格式，所以我先把多个常用格式都准备好了，方便你直接选。";
  }

  return {
    id: `a-${Date.now()}`,
    role: "assistant",
    sourcePrompt: prompt,
    sourceModelId: state.currentModelId,
    text,
    tags: [`自动分配模型：${getCurrentModel().name}`, "输出格式：下方可选", `已启用 ${enabledSkills.length} 个技能`],
    status,
    selectedOutput: "",
    assetsByOutput,
    actions: ["继续帮我整理成下一版可直接执行的草稿。"]
  };
}

function submitPrompt(promptText) {
  const prompt = getEffectivePrompt(promptText);
  if (!prompt) {
    showToast("请先输入任务，或选择一个上下文后继续。");
    return;
  }

  const conversation = getConversation();
  const selectedModels = [...state.compareModelIds];
  conversation.messages.push({
    id: `u-${Date.now()}`,
    role: "user",
    text: prompt
  });

  if (state.routingEnabled && selectedModels.length <= 1) {
    state.currentModelId = chooseAutoModel(prompt);
    state.compareModelIds = [state.currentModelId];
  }

  conversation.messages.push({
    id: `typing-${Date.now()}`,
    role: "typing"
  });

  refs.promptInput.value = "";
  autoResizePrompt();
  render();

  setTimeout(() => {
    conversation.messages = conversation.messages.filter((item) => item.role !== "typing");
    if (selectedModels.length > 1) {
      conversation.messages.push(buildComparePayload(prompt, selectedModels));
    } else {
      conversation.messages.push(buildAssistantPayload(prompt));
    }
    render();
  }, 900);
}

function handleQuickAction(action) {
  submitPrompt(action);
}

function requestCompareForMessage(messageId) {
  const prompt = getPromptForMessage(messageId);
  if (!prompt) {
    showToast("没找到这条回答对应的原始提问。");
    return;
  }
  const conversation = getConversation();
  const originalMessage = conversation.messages.find((item) => item.id === messageId);
  const baseModelId = (originalMessage && originalMessage.sourceModelId) || state.currentModelId;
  const compareModelIds = getCompareModelSet(baseModelId);
  state.compareModelIds = [...compareModelIds];
  conversation.messages.push(buildComparePayload(prompt, compareModelIds));
  render();
  showToast(`正在对比 ${getSelectedModels().map((model) => model.name).join(" + ")} 对同一个问题的回答。`);
}

function switchConversation(id) {
  state.currentConversationId = id;
  render();
  showToast("已经切换到这条对话。");
}

function createConversation() {
  const id = `conv-${Date.now()}`;
  state.conversations.unshift({
    id,
    title: "新任务对话",
    folder: "未归档",
    pinned: false,
    assets: [],
    messages: []
  });
  state.currentConversationId = id;
  render();
  refs.promptInput.focus();
  showToast("已新建一条对话。");
}

function applyActiveToolToInput() {
  if (!state.activeTool) return;
  setPromptInputValue(state.activeTool.invokeText || `${state.activeTool.title}`);
  if (window.HubitosI18n && typeof window.HubitosI18n.refresh === "function") window.HubitosI18n.refresh();
  refs.promptInput.focus();
  showToast(`已把“${state.activeTool.title}”带入输入框。`);
}

function applyActiveWorkflowToInput() {
  if (!state.activeWorkflow) return;
  setPromptInputValue(state.activeWorkflow.prompt || `${state.activeWorkflow.title}`);
  if (window.HubitosI18n && typeof window.HubitosI18n.refresh === "function") window.HubitosI18n.refresh();
  refs.promptInput.focus();
  showToast(`已把“${state.activeWorkflow.title}”带入输入框。`);
}

function toggleSkill(id) {
  state.skills = state.skills.map((skill) =>
    skill.id === id ? { ...skill, enabled: !skill.enabled } : skill
  );
  renderPanel();
}

function selectMessageOutput(messageId, format) {
  const conversation = getConversation();
  const message = conversation.messages.find((item) => item.id === messageId && item.role === "assistant");
  if (!message || !message.assetsByOutput?.[format]) return;

  message.selectedOutput = format;
  message.tags = (message.tags || []).map((tag) => (tag.startsWith("Output:") ? `Output: ${format}` : tag));

  conversation.assets = [
    ...message.assetsByOutput[format].map((asset, index) => ({
      id: `${message.id}-${format}-${index}`,
      icon: asset.icon,
      name: asset.title,
      meta: asset.subtitle
    })),
    ...conversation.assets.filter((asset) => !message.assetsByOutput[format].some((item) => item.title === asset.name))
  ].slice(0, 6);

  renderMessages();
  renderPanel();
  showToast(`${format} 文件已经出现在这条回复下面了。`);
}

function initEvents() {
  refs.modelPickerToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    if (refs.modelPickerMenu.classList.contains("open")) {
      closeModelPickerMenu();
      return;
    }
    openModelPickerMenu();
  });

  document.addEventListener("click", (event) => {
    if (!refs.modelPickerToggle.contains(event.target) && !refs.modelPickerMenu.contains(event.target)) {
      closeModelPickerMenu();
    }
  });

  refs.modelPickerMenu.addEventListener("click", (event) => {
    event.stopPropagation();
    const button = event.target.closest("[data-model-id]");
    if (!button) return;
    const modelId = button.dataset.modelId;
    if (state.compareModelIds.includes(modelId)) {
      if (state.compareModelIds.length === 1) return;
      state.compareModelIds = state.compareModelIds.filter((id) => id !== modelId);
    } else {
      state.compareModelIds = [...state.compareModelIds, modelId];
    }
    state.currentModelId = state.compareModelIds[state.compareModelIds.length - 1];
    renderPanel();
    renderModelPickerMenu();
    openModelPickerMenu();
    showToast(
      state.compareModelIds.length > 1
        ? `已进入对比模式：${getSelectedModels().map((model) => model.name).join(" + ")}`
        : `已切换到 ${getCurrentModel().name}`
    );
  });

  refs.modelPickerToggle.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown" && event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openModelPickerMenu();
  });

  refs.modelPickerMenu.addEventListener("keydown", (event) => {
    const options = Array.from(refs.modelPickerMenu.querySelectorAll("[data-model-id]"));
    const currentIndex = options.indexOf(document.activeElement);
    if (event.key === "Escape") {
      event.preventDefault();
      closeModelPickerMenu();
      refs.modelPickerToggle.focus();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = options[Math.min(currentIndex + 1, options.length - 1)] || options[0];
      if (next) next.focus();
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const previous = options[Math.max(currentIndex - 1, 0)] || options[0];
      if (previous) previous.focus();
    }
  });

  refs.attachedItems.addEventListener("click", (event) => {
    const button = event.target.closest("[data-attachment-id]");
    if (!button) return;
    removeAttachment(button.dataset.attachmentId);
  });

  refs.taskContextDetails.addEventListener("click", (event) => {
    const button = event.target.closest("[data-context-remove]");
    if (!button) return;
    const type = button.dataset.contextRemove;
    if (type === "attachment") {
      removeAttachment(button.dataset.contextId);
      showToast("已移除这个文件上下文。");
      return;
    }
    if (type === "tool") {
      const title = state.activeTool ? state.activeTool.title : "工具";
      saveActiveTool(null);
      render();
      showToast(`已移除“${title}”工具上下文。`);
      return;
    }
    if (type === "workflow") {
      const title = state.activeWorkflow ? state.activeWorkflow.title : "自动任务";
      saveActiveWorkflow(null);
      render();
      showToast(`已移除“${title}”自动任务上下文。`);
    }
  });

  refs.toggleContextDetailsBtn.addEventListener("click", () => {
    state.contextExpanded = !state.contextExpanded;
    renderTaskContext();
  });

  refs.sendBtn.addEventListener("click", () => submitPrompt(refs.promptInput.value));

  refs.promptInput.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      submitPrompt(refs.promptInput.value);
    }
  });

  refs.promptInput.addEventListener("input", () => {
    autoResizePrompt();
    renderTaskContext();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
    event.preventDefault();
    refs.promptInput.focus();
  });

  refs.historyList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-conversation-id]");
    if (!button) return;
    switchConversation(button.dataset.conversationId);
  });

  refs.messageList.addEventListener("click", (event) => {
    const compareButton = event.target.closest("[data-compare-pick]");
    if (compareButton) {
      const conversation = getConversation();
      const message = conversation.messages.find((item) => item.id === compareButton.dataset.comparePick);
      if (!message) return;
      message.selectedModelId = compareButton.dataset.modelChoice;
      state.currentModelId = message.selectedModelId;
      state.compareModelIds = [message.selectedModelId];
      render();
      showToast(`接下来会继续使用 ${getCurrentModel().name}，下一轮你也可以再重新对比。`);
      return;
    }
    const button = event.target.closest("[data-quick-action]");
    if (!button) return;
    handleQuickAction(button.dataset.quickAction);
  });

  refs.messageList.addEventListener("change", (event) => {
    const compareSelect = event.target.closest("[data-message-compare-select]");
    if (compareSelect && compareSelect.value) {
      const messageId = compareSelect.dataset.messageCompareSelect;
      const conversation = getConversation();
      const originalMessage = conversation.messages.find((item) => item.id === messageId);
      const baseModelId = (originalMessage && originalMessage.sourceModelId) || state.currentModelId;
      const compareModelIds = getCompareModelSet(baseModelId, compareSelect.value);
      state.compareModelIds = [...compareModelIds];
      conversation.messages.push(buildComparePayload(getPromptForMessage(messageId), compareModelIds));
      render();
      showToast(`正在对比 ${getSelectedModels().map((model) => model.name).join(" + ")} 对同一个问题的回答。`);
      return;
    }
    const select = event.target.closest("[data-message-select]");
    if (!select || !select.value) return;
    selectMessageOutput(select.dataset.messageSelect, select.value);
  });

  refs.toggleRoutingBtn.addEventListener("click", () => {
    state.routingEnabled = !state.routingEnabled;
    renderPanel();
    showToast(state.routingEnabled ? "已开启智能分配模型。" : "已切到手动选模型。");
  });

  refs.newConversationBtn.addEventListener("click", createConversation);
  refs.attachFileBtn.addEventListener("click", addAttachment);
  refs.applyToolBtn.addEventListener("click", applyActiveToolToInput);
  refs.clearToolBtn.addEventListener("click", () => {
    const title = state.activeTool ? state.activeTool.title : "工具";
    saveActiveTool(null);
    render();
    showToast(`已把“${title}”从当前对话里移除。`);
  });
  refs.applyWorkflowBtn.addEventListener("click", applyActiveWorkflowToInput);
  refs.clearWorkflowBtn.addEventListener("click", () => {
    const title = state.activeWorkflow ? state.activeWorkflow.title : "自动任务";
    saveActiveWorkflow(null);
    render();
    showToast(`已把“${title}”从当前对话里移除。`);
  });

  if (refs.skillPresetBtn) {
    refs.skillPresetBtn.addEventListener("click", () => showToast("已根据当前对话推荐一组更合适的技能。"));
  }
  if (refs.pinConversationBtn) {
    refs.pinConversationBtn.addEventListener("click", () => showToast("当前对话已置顶。"));
  }
  if (refs.saveTemplateBtn) {
    refs.saveTemplateBtn.addEventListener("click", () => showToast("当前对话已保存成模板。"));
  }

  if (refs.skillChips) {
    refs.skillChips.addEventListener("click", (event) => {
      const button = event.target.closest("[data-skill-id]");
      if (!button) return;
      toggleSkill(button.dataset.skillId);
    });
  }

  refs.homeStart.addEventListener("click", (event) => {
    const button = event.target.closest("[data-prompt]");
    if (!button) return;
    setPromptInputValue(button.dataset.prompt);
    if (window.HubitosI18n && typeof window.HubitosI18n.refresh === "function") window.HubitosI18n.refresh();
    refs.promptInput.focus();
  });

}

state.activeTool = loadActiveTool();
state.activeWorkflow = loadActiveWorkflow();
if (state.activeTool && !refs.promptInput.value) {
  setPromptInputValue(state.activeTool.invokeText || "");
}
if (state.activeWorkflow && !refs.promptInput.value) {
  setPromptInputValue(state.activeWorkflow.prompt || "");
}

hydratePromptFromQuery();
initEvents();
render();
autoResizePrompt();
if (window.HubitosI18n && typeof window.HubitosI18n.refresh === "function") window.HubitosI18n.refresh();
