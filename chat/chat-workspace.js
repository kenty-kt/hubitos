const state = {
  routingEnabled: true,
  currentConversationId: "conv-home",
  currentModelId: "pro",
  attachedItems: [
    { id: "asset-file-1", type: "file", label: "Design_Manifesto.pdf" },
    { id: "asset-file-2", type: "file", label: "Brand_Reference_Board.png" }
  ],
  skills: [
    { id: "file-search", name: "File Search", enabled: true },
    { id: "image-gen", name: "Image Generation", enabled: true },
    { id: "code-explain", name: "Code Explanation", enabled: false },
    { id: "template-pack", name: "Template Library", enabled: true }
  ],
  models: [
    { id: "pro", name: "Hubitos Pro", meta: "Precision 4.2 · Deep reasoning", icon: "✦", tokenUsed: 14200, tokenTotal: 128000 },
    { id: "lite", name: "Hubitos Lite", meta: "Daily tasks · Ultra-fast response", icon: "⚡", tokenUsed: 4200, tokenTotal: 64000 },
    { id: "advanced", name: "Hubitos Advanced", meta: "Deep agent · Compute execution", icon: "◎", tokenUsed: 31800, tokenTotal: 256000 }
  ],
  recentSkills: [
    { id: "rs1", icon: "⚡", name: "PRD Writing Assistant", prompt: "Use the PRD Writing Assistant to organize this request and produce a complete chapter outline." },
    { id: "rs2", icon: "⌕", name: "File Search", prompt: "Search the files I uploaded and extract the key conclusions." },
    { id: "rs3", icon: "🖼", name: "Image Generation", prompt: "Generate a red-and-white visual draft based on the current brand direction." }
  ],
  recentAgents: [
    { id: "ra1", icon: "✦", name: "Market Research Assistant", prompt: "Call the market research assistant and output competitor analysis with a recommendation summary." },
    { id: "ra2", icon: "◎", name: "Brand Visual Advisor", prompt: "Call the brand visual advisor and draft a desktop homepage visual proposal." },
    { id: "ra3", icon: "⚙", name: "Operations Daily Agent", prompt: "Call the operations daily agent and organize today's key metrics with execution suggestions." }
  ],
  recentPrompts: [
    "Help me organize this project brief into a complete PRD and output both Word and Markdown.",
    "Generate a desktop client homepage draft based on the uploaded PDF and images.",
    "Organize these materials into a reusable workflow and output an execution plan suitable for team collaboration."
  ],
  conversations: [
    {
      id: "conv-home",
      title: "New Chat",
      folder: "Unfiled",
      pinned: false,
      assets: [],
      messages: []
    },
    {
      id: "conv-market",
      title: "Market Research Plan",
      folder: "Brand Strategy",
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
          text: "Hubitos, please continue refining the AI OS desktop visual style based on this PDF and turn it into a PRD design brief suitable for a high-execution brand."
        },
        {
          id: "m2",
          role: "assistant",
          text: "I've integrated the design principles from your manifesto. The Precision Atelier aesthetic emphasizes tonal layering instead of standard borders. I'll first organize the design direction, structural modules, and related assets, then archive them to the Brand Strategy folder.",
          tags: ["Auto routing: Hubitos Pro", "Output: Word", "3 skills enabled"],
          status: "Archived to Brand Strategy",
          selectedOutput: "Word",
          assetsByOutput: {
            Word: [{ icon: "📄", title: "PRD_Final.docx", subtitle: "Document | Archived" }],
            Image: [{ icon: "🖼", title: "Cover_Concept_V1.png", subtitle: "Image | Submitted" }]
          },
          actions: ["Can you add the key page structure and interaction details next?"]
        }
      ]
    },
    {
      id: "conv-prd",
      title: "PRD Writing Discussion",
      folder: "Product Strategy",
      pinned: false,
      assets: [
        { id: "prd-md", icon: "▤", name: "Hubitos_PRD.md", meta: "Markdown | Pending review" }
      ],
      messages: [
        { id: "p1", role: "user", text: "Please turn the conversation into a complete PRD and fill in the core features and business model." },
        {
          id: "p2",
          role: "assistant",
          text: "I've split the content into project overview, feature architecture, business flow, technical suggestions, and a phased roadmap. Next, we can export Word or turn it into a Skill.",
          tags: ["Auto routing: Hubitos Pro", "Output: Word"],
          status: "Document draft is ready",
          selectedOutput: "Word",
          assetsByOutput: {
            Word: [{ icon: "📄", title: "Hubitos_PRD.docx", subtitle: "Word document | Ready for export" }],
            Markdown: [{ icon: "📝", title: "Hubitos_PRD.md", subtitle: "Markdown | Pending review" }]
          },
          actions: ["Can you expand this into milestones, risks, and launch metrics?"]
        }
      ]
    },
    {
      id: "conv-report",
      title: "Competitor Analysis Report",
      folder: "Market Analysis",
      pinned: false,
      assets: [
        { id: "report-xlsx", icon: "▦", name: "Competitor_Analysis.xlsx", meta: "Excel | Includes feature comparison" }
      ],
      messages: [
        { id: "r1", role: "user", text: "Organize these competitors into a feature comparison table and pricing analysis." },
        {
          id: "r2",
          role: "assistant",
          text: "I've generated an expandable competitor analysis sheet and kept the key reference links. Next we can add a visual style matrix or export the final Excel.",
          tags: ["Auto routing: Hubitos Lite", "Output: Excel"],
          status: "Table synced",
          selectedOutput: "Excel",
          assetsByOutput: {
            Excel: [{ icon: "▦", title: "Competitor_Analysis.xlsx", subtitle: "Excel | Includes feature comparison" }]
          },
          actions: ["Can you add a pricing comparison and highlight the biggest gaps?"]
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
  modelPickerToggle: document.getElementById("modelPickerToggle"),
  modelPickerLabel: document.getElementById("modelPickerLabel"),
  modelPickerMenu: document.getElementById("modelPickerMenu"),
  attachedItems: document.getElementById("attachedItems"),
  promptInput: document.getElementById("promptInput"),
  sendBtn: document.getElementById("sendBtn"),
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

const outputFormats = ["Markdown", "Word", "PPT", "Excel", "PDF", "Image"];

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
            <span class="recent-item-desc">Quickly enable recently used high-frequency skills and apply them to the current task.</span>
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
            <span class="recent-item-desc">Start immediately with the persona and workflow of a recently used agent.</span>
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
              <button type="button" data-attachment-id="${item.id}">×</button>
            </div>
          `
        )
        .join("")
    : "";
}

function renderModelPickerMenu() {
  const currentModel = getCurrentModel();
  refs.modelPickerLabel.textContent = `${currentModel.icon} ${currentModel.name}`;
  refs.modelPickerMenu.innerHTML = state.models
    .map((model) => {
      const selected = model.id === state.currentModelId;
      return `
        <button class="format-option ${selected ? "active" : ""}" type="button" data-model-id="${model.id}">
          <span class="format-option-main">
            <span class="format-option-icon">${escapeHtml(model.icon)}</span>
            <span class="format-option-copy">
            <span class="format-option-title">${escapeHtml(model.name)}</span>
            <span class="format-option-subtitle">${escapeHtml(model.meta)}</span>
            </span>
          </span>
          <span>${selected ? "✓" : ""}</span>
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
            <div class="message-meta-row compact">
              <label class="inline-output-control">
                <span class="inline-output-label">Output</span>
                <select class="inline-output-select" data-message-select="${message.id}">
                  <option value="">select output</option>
                  ${(Object.keys(message.assetsByOutput || {}).length
                    ? Object.keys(message.assetsByOutput)
                    : outputFormats)
                    .map(
                      (format) => `
                        <option value="${escapeHtml(format)}" ${message.selectedOutput === format ? "selected" : ""}>
                          ${escapeHtml(format)}
                        </option>
                      `
                    )
                    .join("")}
                </select>
              </label>
              <div class="assistant-status">${escapeHtml(message.status || "")}</div>
            </div>
            ${
              message.selectedOutput && message.assetsByOutput?.[message.selectedOutput]?.length
                ? `
                  <div class="asset-grid">
                    ${message.assetsByOutput[message.selectedOutput]
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
  refs.conversationTitle.textContent = conversation.messages.length ? conversation.title : "New Chat";
  refs.conversationMeta.textContent = `Default folder: ${conversation.folder} / Model: ${model.name}`;
  refs.routeBanner.textContent = state.routingEnabled
    ? `Auto Routing is on: the system will switch models automatically based on reasoning intensity and attachment type. Current model: ${model.name}.`
    : `Manual model mode is on: ${model.name} is locked and the system will not switch models automatically.`;
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
    : `<div class="empty-state">No assets yet. Generated docs, images, or tables will be archived here automatically.</div>`;
  refs.assetsSection.classList.toggle("hidden", conversation.assets.length === 0);
}

function render() {
  renderHistory();
  renderHomeStart();
  renderModelPickerMenu();
  renderAttachments();
  renderMessages();
  renderPanel();
  refs.homeStart.classList.toggle("hidden", getConversation().messages.length > 0);
  refs.chatScroll.scrollTop = refs.chatScroll.scrollHeight;
}

function addAttachment() {
  const candidates = ["Meeting_Notes.docx", "Reference_Poster.png", "Requirements_Checklist.xlsx", "Competitor_Material.pdf", "Data_Sample.csv"];
  const item = {
    id: `file-${Date.now()}`,
    type: "file",
    label: candidates[Math.floor(Math.random() * candidates.length)]
  };
  state.attachedItems.push(item);
  renderAttachments();
  showToast(`Uploaded ${item.label}; the system will auto-detect the format.`);
}

function removeAttachment(id) {
  state.attachedItems = state.attachedItems.filter((item) => item.id !== id);
  renderAttachments();
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

function buildAssistantPayload(prompt) {
  const conversation = getConversation();
  const attachments = state.attachedItems.map((item) => item.label).join(", ") || "no attachments";
  const enabledSkills = state.skills.filter((skill) => skill.enabled).map((skill) => skill.name);
  const skillText = enabledSkills.length ? enabledSkills.join(", ") : "no skills enabled";
  let text = `I've received the task. Referenced materials: ${attachments}. I'll first detect the right handling flow from the file formats, then use ${skillText} to prepare the result and archive it to ${conversation.folder} by default. After the draft is ready, you can choose the output format below and the corresponding file will appear under this reply.`;
  let assetsByOutput = {};
  let status = `Archived to ${conversation.folder}`;

  if (attachments.includes(".xlsx") || attachments.includes(".csv")) {
    assetsByOutput = {
      Excel: [{ icon: "▦", title: "Hubitos_Detected_Output.xlsx", subtitle: "Auto-generated from spreadsheet input" }],
      PDF: [{ icon: "📕", title: "Hubitos_Data_Report.pdf", subtitle: "PDF | Snapshot of spreadsheet result" }]
    };
    text += " Since spreadsheet files were detected, the spreadsheet version is prepared first.";
  } else if (attachments.includes(".png") || attachments.includes(".jpg")) {
    assetsByOutput = {
      Image: [{ icon: "🖼", title: "Hubitos_Visual_Extension.png", subtitle: "Auto-generated from image input" }],
      PPT: [{ icon: "📊", title: "Hubitos_Visual_Deck.pptx", subtitle: "PPT | Includes visual references" }]
    };
    text += " Since image files were detected, the visual version is prepared first.";
  } else if (attachments.includes(".pdf")) {
    assetsByOutput = {
      Word: [{ icon: "📄", title: "Hubitos_Extracted_Notes.docx", subtitle: "Auto-generated from PDF input" }],
      Markdown: [{ icon: "📝", title: "Hubitos_Extracted_Notes.md", subtitle: "Markdown | Editable outline" }]
    };
    text += " Since a PDF was detected, the editable document version is prepared first.";
  } else {
    assetsByOutput = {
      Markdown: [{ icon: "📝", title: "Hubitos_Output_Draft.md", subtitle: "Markdown | Structured output complete" }],
      Word: [{ icon: "📄", title: "Hubitos_Project_Brief.docx", subtitle: "Word document | Editable" }],
      PPT: [{ icon: "📊", title: "Hubitos_Proposal_Outline.pptx", subtitle: "PPT outline | Includes cover direction" }],
      Excel: [{ icon: "▦", title: "Hubitos_Task_Breakdown.xlsx", subtitle: "Spreadsheet | Structured fields included" }],
      PDF: [{ icon: "📕", title: "Hubitos_Report.pdf", subtitle: "PDF | Rendered and exported" }],
      Image: [{ icon: "🖼", title: "Hubitos_Concept_Poster.png", subtitle: "Image | Ready for iterative edits" }]
    };
    text += " No output format was forced, so multiple delivery formats are already ready for selection.";
  }

  return {
    id: `a-${Date.now()}`,
    role: "assistant",
    text,
    tags: [`Auto routing: ${getCurrentModel().name}`, "Output: Choose below", `${enabledSkills.length} skills enabled`],
    status,
    selectedOutput: "",
    assetsByOutput,
    actions: ["Can you continue and turn this into the next actionable draft?"]
  };
}

function submitPrompt(promptText) {
  const prompt = promptText.trim();
  if (!prompt) {
    showToast("Enter a task before sending.");
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
  submitPrompt(action);
}

function switchConversation(id) {
  state.currentConversationId = id;
  render();
  showToast("Conversation switched.");
}

function createConversation() {
  const id = `conv-${Date.now()}`;
  state.conversations.unshift({
    id,
    title: "New task conversation",
    folder: "Unfiled",
    pinned: false,
    assets: [],
    messages: []
  });
  state.currentConversationId = id;
  render();
  refs.promptInput.focus();
  showToast("Created a new conversation.");
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
  showToast(`${format} file is now available below the reply.`);
}

function initEvents() {
  refs.modelPickerToggle.addEventListener("click", () => {
    refs.modelPickerMenu.classList.toggle("open");
  });

  document.addEventListener("click", (event) => {
    if (!refs.modelPickerToggle.contains(event.target) && !refs.modelPickerMenu.contains(event.target)) {
      refs.modelPickerMenu.classList.remove("open");
    }
  });

  refs.modelPickerMenu.addEventListener("click", (event) => {
    const button = event.target.closest("[data-model-id]");
    if (!button) return;
    state.currentModelId = button.dataset.modelId;
    refs.modelPickerMenu.classList.remove("open");
    renderPanel();
    renderModelPickerMenu();
    showToast(`Switched to ${getCurrentModel().name}.`);
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

  refs.messageList.addEventListener("change", (event) => {
    const select = event.target.closest("[data-message-select]");
    if (!select || !select.value) return;
    selectMessageOutput(select.dataset.messageSelect, select.value);
  });

  refs.toggleRoutingBtn.addEventListener("click", () => {
    state.routingEnabled = !state.routingEnabled;
    renderPanel();
    showToast(state.routingEnabled ? "Auto routing is on." : "Switched to manual model mode.");
  });

  refs.newConversationBtn.addEventListener("click", createConversation);
  refs.attachFileBtn.addEventListener("click", addAttachment);

  refs.skillPresetBtn.addEventListener("click", () => showToast("Recommended a skill set based on the current conversation."));
  refs.pinConversationBtn.addEventListener("click", () => showToast("Current conversation pinned."));
  refs.saveTemplateBtn.addEventListener("click", () => showToast("Current conversation saved as a template."));

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
