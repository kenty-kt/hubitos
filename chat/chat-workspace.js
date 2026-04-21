const state = {
  routingEnabled: true,
  currentConversationId: "conv-home",
  currentModelId: "pro",
  currentOutput: "",
  attachedItems: [
    { id: "asset-file-1", type: "file", label: "设计宣言.pdf" },
    { id: "asset-file-2", type: "file", label: "品牌参考图.png" }
  ],
  skills: [
    { id: "file-search", name: "文件搜索", enabled: true },
    { id: "image-gen", name: "图片生成", enabled: true },
    { id: "code-explain", name: "代码解释", enabled: false },
    { id: "template-pack", name: "模板中心", enabled: true }
  ],
  models: [
    { id: "pro", name: "Hubitos Pro", meta: "精确 4.2 · 深度推理", icon: "✦", tokenUsed: 14200, tokenTotal: 128000 },
    { id: "lite", name: "Hubitos Lite", meta: "日常任务 · 极速响应", icon: "⚡", tokenUsed: 4200, tokenTotal: 64000 },
    { id: "advanced", name: "Hubitos Advanced", meta: "深度代理 · 执行计算", icon: "◎", tokenUsed: 31800, tokenTotal: 256000 }
  ],
  recentSkills: [
    { id: "rs1", icon: "⚡", name: "PRD 写作助手", prompt: "用 PRD 写作助手整理这份需求，并生成完整章节结构。" },
    { id: "rs2", icon: "⌕", name: "文件搜索", prompt: "检索我上传的文件并提炼出关键结论。" },
    { id: "rs3", icon: "🖼", name: "图片生成", prompt: "根据当前品牌方向生成一版红白主题视觉草图。" }
  ],
  recentAgents: [
    { id: "ra1", icon: "✦", name: "市场研究助理", prompt: "调用市场研究助理，输出竞品分析和建议摘要。" },
    { id: "ra2", icon: "◎", name: "品牌视觉顾问", prompt: "调用品牌视觉顾问，给我桌面端首页的视觉提案。" },
    { id: "ra3", icon: "⚙", name: "运营日报 Agent", prompt: "调用运营日报 Agent，整理今天的关键数据和执行建议。" }
  ],
  recentPrompts: [
    "帮我把这份项目说明整理成一份完整 PRD，并产出 Word 和 Markdown。",
    "根据上传的 PDF 和图片，生成一版桌面客户端首页草图。",
    "把这些资料整理成可复用工作流，并输出适合团队协作的执行方案。"
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
      title: "市场研究计划",
      folder: "品牌策略",
      pinned: true,
      assets: [
        { id: "docx-1", icon: "▤", name: "PRD 终稿.docx", meta: "文档 | 已归档到品牌策略" },
        { id: "png-1", icon: "▧", name: "设计布局.png", meta: "图片 | 已生成封面方向" },
        { id: "xlsx-1", icon: "▦", name: "研究样本.xlsx", meta: "表格 | 已同步到云端" }
      ],
      messages: [
        {
          id: "m1",
          role: "user",
          text: "Hubitos 请根据这份 PDF 内容继续完善 AI OS 桌面端的视觉风格，并整理成一份适合高执行力品牌的 PRD 设计说明文档。"
        },
        {
          id: "m2",
          role: "assistant",
          text: "我已经综合了您宣言中的设计原则。Precision Atelier 美学强调色调分层而非标准边框。我先整理出设计方向、结构模块和对应资产，并同步归档到品牌策略文件夹。",
          tags: ["自动路由：Hubitos Pro", "输出：默认", "已启用 3 个技能"],
          status: "已归档到品牌策略",
          assets: [
            { icon: "📄", title: "PRD 终稿.docx", subtitle: "文档 | 已归档" },
            { icon: "🖼", title: "封面图_V1.png", subtitle: "图片 | 已提交" }
          ],
          actions: ["继续追问", "转为 Skill", "转为 Agent"]
        }
      ]
    },
    {
      id: "conv-prd",
      title: "PRD 撰写讨论",
      folder: "产品方案",
      pinned: false,
      assets: [
        { id: "prd-md", icon: "▤", name: "Hubitos_PRD.md", meta: "Markdown | 待确认" }
      ],
      messages: [
        { id: "p1", role: "user", text: "请把对话整理成完整 PRD，补齐核心功能与商业模式。" },
        {
          id: "p2",
          role: "assistant",
          text: "我已经将内容拆分为项目概述、功能架构、业务流程、技术建议和分阶段路线图，接下来可以继续导出 Word 或沉淀为 Skill。",
          tags: ["自动路由：Hubitos Pro", "输出：Word"],
          status: "文档草稿已就绪",
          actions: ["继续追问", "转为 Skill"]
        }
      ]
    },
    {
      id: "conv-report",
      title: "竞品分析报告",
      folder: "市场分析",
      pinned: false,
      assets: [
        { id: "report-xlsx", icon: "▦", name: "竞品分析.xlsx", meta: "Excel | 含功能对比" }
      ],
      messages: [
        { id: "r1", role: "user", text: "把这几家竞品整理成功能对比表和定价分析。" },
        {
          id: "r2",
          role: "assistant",
          text: "我已生成可继续扩展的竞品分析表格，并保留了关键引用链接，下一步可以补充视觉风格矩阵或导出最终版 Excel。",
          tags: ["自动路由：Hubitos Lite", "输出：Excel"],
          status: "表格已同步",
          actions: ["继续追问"]
        }
      ]
    }
  ]
};

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
  formatToggle: document.getElementById("formatToggle"),
  formatLabel: document.getElementById("formatLabel"),
  formatMenu: document.getElementById("formatMenu"),
  attachedItems: document.getElementById("attachedItems"),
  promptInput: document.getElementById("promptInput"),
  sendBtn: document.getElementById("sendBtn"),
  modelToggle: document.getElementById("modelToggle"),
  modelMenu: document.getElementById("modelMenu"),
  currentModelLogo: document.getElementById("currentModelLogo"),
  currentModelName: document.getElementById("currentModelName"),
  currentModelMeta: document.getElementById("currentModelMeta"),
  tokenSection: document.getElementById("tokenSection"),
  tokenValue: document.getElementById("tokenValue"),
  tokenProgress: document.getElementById("tokenProgress"),
  skillChips: document.getElementById("skillChips"),
  assetsSection: document.getElementById("assetsSection"),
  panelAssetList: document.getElementById("panelAssetList"),
  routeBanner: document.getElementById("routeBanner"),
  toggleRoutingBtn: document.getElementById("toggleRoutingBtn"),
  newConversationBtn: document.getElementById("newConversationBtn"),
  attachFileBtn: document.getElementById("attachFileBtn"),
  skillPresetBtn: document.getElementById("skillPresetBtn"),
  pinConversationBtn: document.getElementById("pinConversationBtn"),
  saveTemplateBtn: document.getElementById("saveTemplateBtn"),
  toast: document.getElementById("toast")
};

const outputFormats = ["", "Markdown", "Word", "PPT", "Excel", "PDF", "Image"];

function getConversation() {
  return state.conversations.find((item) => item.id === state.currentConversationId);
}

function getCurrentModel() {
  return state.models.find((item) => item.id === state.currentModelId);
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
            <span class="recent-item-desc">快速启用最近高频技能，直接套用到当前任务。</span>
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
            <span class="recent-item-desc">以最近用过的 Agent 身份和流程直接开始执行。</span>
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

function renderFormatMenu() {
  refs.formatLabel.textContent = state.currentOutput || "默认";
  refs.formatMenu.innerHTML = outputFormats
    .map(
      (format) => `
        <button class="format-option ${format === state.currentOutput ? "active" : ""}" data-format="${format}" type="button">
          <span>${format || "默认"}</span>
          <span>${format === state.currentOutput ? "✓" : ""}</span>
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
              <button type="button" data-attachment-id="${item.id}">×</button>
            </div>
          `
        )
        .join("")
    : "";
}

function renderModelMenu() {
  refs.modelMenu.innerHTML = state.models
    .map((model) => {
      const selected = model.id === state.currentModelId;
      return `
        <button class="model-option ${selected ? "selected" : ""}" type="button" data-model-id="${model.id}">
          <span class="option-left">
            <span class="option-logo ${selected ? "red" : ""}">${model.icon}</span>
            <span>
              <span class="option-title">${escapeHtml(model.name)}</span>
              <span class="option-subtitle">${escapeHtml(model.meta)}</span>
            </span>
          </span>
          <span class="${selected ? "option-check" : "option-tag neutral"}">${selected ? "✓" : model.id === "lite" ? "免费版" : "高级版"}</span>
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

      return `
        <div class="message-row assistant-row">
          <div class="assistant-head">
            <div class="assistant-badge">✦</div>
            <div class="assistant-name">Ⅱ + HUBITOS PRO</div>
          </div>
          <div class="assistant-card">
            <div class="assistant-text">${escapeHtml(message.text)}</div>
            <div class="message-meta-row">
              <div class="assistant-tags">
                ${(message.tags || []).map((tag) => `<span class="assistant-tag">${escapeHtml(tag)}</span>`).join("")}
              </div>
              <div class="assistant-status">${escapeHtml(message.status || "")}</div>
            </div>
            ${
              message.assets && message.assets.length
                ? `
                  <div class="asset-grid">
                    ${message.assets
                      .map(
                        (asset) => `
                          <div class="asset-card">
                            <div class="asset-icon">${asset.icon}</div>
                            <div>
                              <div class="asset-title">${escapeHtml(asset.title)}</div>
                              <div class="asset-subtitle">${escapeHtml(asset.subtitle)}</div>
                            </div>
                          </div>
                        `
                      )
                      .join("")}
                  </div>
                `
                : ""
            }
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
  refs.currentModelLogo.textContent = model.icon;
  refs.currentModelName.textContent = model.name;
  refs.currentModelMeta.textContent = model.meta;
  refs.tokenValue.textContent = `${(model.tokenUsed / 1000).toFixed(1)}k / ${(model.tokenTotal / 1000).toFixed(0)}k`;
  refs.tokenProgress.style.width = `${Math.min((model.tokenUsed / model.tokenTotal) * 100, 100)}%`;
  refs.tokenSection.classList.toggle("hidden", model.id === "lite");
  refs.conversationTitle.textContent = conversation.messages.length ? conversation.title : "新对话";
  refs.conversationMeta.textContent = `默认文件夹：${conversation.folder} / 输出：${state.currentOutput || "默认"}`;
  refs.routeBanner.textContent = state.routingEnabled
    ? `Auto Routing 已开启：当前任务会根据推理强度、输出格式和附件类型自动切换模型，当前使用 ${model.name}。`
    : `当前为手动模型模式：已锁定 ${model.name}，系统不会自动切换模型。`;
  refs.toggleRoutingBtn.classList.toggle("active", state.routingEnabled);

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
    : `<div class="empty-state">暂无资产，生成文档、图片或表格后会自动归档到这里。</div>`;
  refs.assetsSection.classList.toggle("hidden", conversation.assets.length === 0);
}

function render() {
  renderHistory();
  renderHomeStart();
  renderFormatMenu();
  renderAttachments();
  renderModelMenu();
  renderMessages();
  renderPanel();
  refs.homeStart.classList.toggle("hidden", getConversation().messages.length > 0);
  refs.chatScroll.scrollTop = refs.chatScroll.scrollHeight;
}

function addAttachment() {
  const candidates = ["会议纪要.docx", "参考海报.png", "需求清单.xlsx", "竞品资料.pdf", "数据样本.csv"];
  const item = {
    id: `file-${Date.now()}`,
    type: "file",
    label: candidates[Math.floor(Math.random() * candidates.length)]
  };
  state.attachedItems.push(item);
  renderAttachments();
  showToast(`已上传 ${item.label}，系统会按格式自动识别`);
}

function removeAttachment(id) {
  state.attachedItems = state.attachedItems.filter((item) => item.id !== id);
  renderAttachments();
}

function chooseAutoModel(prompt) {
  const lower = prompt.toLowerCase();
  const attachmentLabels = state.attachedItems.map((item) => item.label.toLowerCase()).join(" ");

  if (
    lower.includes("图") ||
    lower.includes("海报") ||
    state.currentOutput === "Image" ||
    attachmentLabels.includes(".png") ||
    attachmentLabels.includes(".jpg")
  ) {
    return "advanced";
  }

  if (
    lower.includes("表") ||
    state.currentOutput === "Excel" ||
    attachmentLabels.includes(".xlsx") ||
    attachmentLabels.includes(".csv")
  ) {
    return "lite";
  }

  return "pro";
}

function buildAssistantPayload(prompt) {
  const conversation = getConversation();
  const attachments = state.attachedItems.map((item) => item.label).join("、") || "无附件";
  const enabledSkills = state.skills.filter((skill) => skill.enabled).map((skill) => skill.name);
  const skillText = enabledSkills.length ? enabledSkills.join("、") : "未启用技能";
  const outputLabel = state.currentOutput || "智能识别";

  let text = `我已接收任务，并会基于 ${outputLabel} 继续处理。当前引用资料包括：${attachments}。我会先根据文件格式自动识别处理方式，再调用 ${skillText} 完成产出，并把结果默认归档到 ${conversation.folder}。`;
  let assets = [];
  let status = `已归档到 ${conversation.folder}`;

  if (state.currentOutput === "Word") {
    assets = [{ icon: "📄", title: "Hubitos_方案说明.docx", subtitle: "Word 文档 | 可再次编辑" }];
    text += " 文档会按章节结构输出，并保留便于后续修改的模板块。";
  } else if (state.currentOutput === "PPT") {
    assets = [{ icon: "📊", title: "Hubitos_提案结构.pptx", subtitle: "PPT 提纲 | 含封面方向" }];
    text += " 我还会附上页级提纲，方便继续生成封面和视觉参考。";
  } else if (state.currentOutput === "Excel") {
    assets = [{ icon: "▦", title: "Hubitos_任务拆解.xlsx", subtitle: "表格 | 含结构字段" }];
    text += " 数据会优先结构化为表格，便于筛选、统计和二次处理。";
  } else if (state.currentOutput === "PDF") {
    assets = [{ icon: "📕", title: "Hubitos_汇报版.pdf", subtitle: "PDF | 已渲染导出" }];
    text += " 我会同时保留可追溯的原始结构，避免纯 PDF 难以修改。";
  } else if (state.currentOutput === "Image") {
    assets = [{ icon: "🖼", title: "Hubitos_概念海报.png", subtitle: "图片 | 可继续图生图" }];
    text += " 图片生成将引用当前对话上下文和品牌偏好，保证红白主题一致。";
    status = "图片已进入历史版本管理";
  } else if (attachments.includes(".xlsx") || attachments.includes(".csv")) {
    assets = [{ icon: "▦", title: "Hubitos_识别输出.xlsx", subtitle: "由上传表格自动识别生成" }];
    text += " 由于检测到表格类文件，我优先采用结构化表格方式返回结果。";
  } else if (attachments.includes(".png") || attachments.includes(".jpg")) {
    assets = [{ icon: "🖼", title: "Hubitos_视觉延展.png", subtitle: "由上传图片自动识别生成" }];
    text += " 由于检测到图片类文件，我会结合视觉参考做图像方向延展。";
  } else if (attachments.includes(".pdf")) {
    assets = [{ icon: "📄", title: "Hubitos_整理纪要.docx", subtitle: "由 PDF 自动识别生成" }];
    text += " 由于检测到 PDF，我优先提取文本结构并输出可编辑文档。";
  } else {
    assets = [{ icon: "📝", title: "Hubitos_输出草稿.md", subtitle: "Markdown | 结构化完成" }];
    text += " 当前未强制指定输出格式，我默认返回结构化文本，便于继续转 Word、PRD 或知识库。";
  }

  conversation.assets = [
    ...assets.map((asset, index) => ({
      id: `${Date.now()}-${index}`,
      icon: asset.icon,
      name: asset.title,
      meta: asset.subtitle
    })),
    ...conversation.assets
  ].slice(0, 6);

  return {
    id: `a-${Date.now()}`,
    role: "assistant",
    text,
    tags: [`自动路由：${getCurrentModel().name}`, `输出：${outputLabel}`, `已启用 ${enabledSkills.length} 个技能`],
    status,
    assets,
    actions: ["继续追问", "转为 Skill", "转为 Agent"]
  };
}

function submitPrompt(promptText) {
  const prompt = promptText.trim();
  if (!prompt) {
    showToast("先输入任务再发送");
    return;
  }

  const conversation = getConversation();
  conversation.messages.push({
    id: `u-${Date.now()}`,
    role: "user",
    text: prompt
  });

  if (state.routingEnabled) {
    state.currentModelId = chooseAutoModel(prompt);
  }

  conversation.messages.push({
    id: `typing-${Date.now()}`,
    role: "typing"
  });

  refs.promptInput.value = "";
  render();

  setTimeout(() => {
    conversation.messages = conversation.messages.filter((item) => item.role !== "typing");
    conversation.messages.push(buildAssistantPayload(prompt));
    render();
  }, 900);
}

function handleQuickAction(action) {
  const conversation = getConversation();

  if (action === "继续追问") {
    refs.promptInput.value = "请继续补充关键页面、交互细节和发布后的商业化闭环。";
    refs.promptInput.focus();
    showToast("已将追问建议填入输入框");
    return;
  }

  if (action === "转为 Skill") {
    showToast("已加入 Skill 转化队列");
    return;
  }

  if (action === "转为 Agent") {
    showToast("已加入 Agent 转化队列");
    return;
  }

}

function switchConversation(id) {
  state.currentConversationId = id;
  render();
  showToast("已切换会话");
}

function createConversation() {
  const id = `conv-${Date.now()}`;
  state.conversations.unshift({
    id,
    title: "新建任务会话",
    folder: "未归档",
    pinned: false,
    assets: [],
    messages: []
  });
  state.currentConversationId = id;
  render();
  refs.promptInput.focus();
  showToast("已新建会话");
}

function toggleSkill(id) {
  state.skills = state.skills.map((skill) =>
    skill.id === id ? { ...skill, enabled: !skill.enabled } : skill
  );
  renderPanel();
}

function initEvents() {
  refs.modelToggle.addEventListener("click", () => {
    refs.modelMenu.classList.toggle("open");
    refs.formatMenu.classList.remove("open");
  });

  refs.formatToggle.addEventListener("click", () => {
    refs.formatMenu.classList.toggle("open");
    refs.modelMenu.classList.remove("open");
  });

  document.addEventListener("click", (event) => {
    if (!refs.modelToggle.contains(event.target) && !refs.modelMenu.contains(event.target)) {
      refs.modelMenu.classList.remove("open");
    }
    if (!refs.formatToggle.contains(event.target) && !refs.formatMenu.contains(event.target)) {
      refs.formatMenu.classList.remove("open");
    }
  });

  refs.modelMenu.addEventListener("click", (event) => {
    const button = event.target.closest("[data-model-id]");
    if (!button) return;
    state.currentModelId = button.dataset.modelId;
    refs.modelMenu.classList.remove("open");
    renderPanel();
    renderModelMenu();
    showToast(`已切换到 ${getCurrentModel().name}`);
  });

  refs.formatMenu.addEventListener("click", (event) => {
    const button = event.target.closest("[data-format]");
    if (!button) return;
    state.currentOutput = button.dataset.format;
    refs.formatMenu.classList.remove("open");
    renderFormatMenu();
    renderPanel();
  });

  refs.attachedItems.addEventListener("click", (event) => {
    const button = event.target.closest("[data-attachment-id]");
    if (!button) return;
    removeAttachment(button.dataset.attachmentId);
  });

  refs.sendBtn.addEventListener("click", () => submitPrompt(refs.promptInput.value));

  refs.promptInput.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      submitPrompt(refs.promptInput.value);
    }
  });

  refs.historyList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-conversation-id]");
    if (!button) return;
    switchConversation(button.dataset.conversationId);
  });

  refs.messageList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-quick-action]");
    if (!button) return;
    handleQuickAction(button.dataset.quickAction);
  });

  refs.toggleRoutingBtn.addEventListener("click", () => {
    state.routingEnabled = !state.routingEnabled;
    renderPanel();
    showToast(state.routingEnabled ? "自动路由已开启" : "已切换为手动模型模式");
  });

  refs.newConversationBtn.addEventListener("click", createConversation);
  refs.attachFileBtn.addEventListener("click", addAttachment);

  refs.skillPresetBtn.addEventListener("click", () => showToast("已根据当前会话推荐技能组合"));
  refs.pinConversationBtn.addEventListener("click", () => showToast("当前会话已固定"));
  refs.saveTemplateBtn.addEventListener("click", () => showToast("当前会话已保存为模板"));

  refs.skillChips.addEventListener("click", (event) => {
    const button = event.target.closest("[data-skill-id]");
    if (!button) return;
    toggleSkill(button.dataset.skillId);
  });

  refs.homeStart.addEventListener("click", (event) => {
    const button = event.target.closest("[data-prompt]");
    if (!button) return;
    refs.promptInput.value = button.dataset.prompt;
    refs.promptInput.focus();
  });

}

initEvents();
render();
