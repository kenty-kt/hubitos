const BOARD_LAYOUT = {
  width: 1420,
  topY: 72,
  rowGap: 34,
  bottomPadding: 42,
  columns: {
    c1: 50,
    c2: 380,
    c3: 710,
    c4: 1040
  }
};

const NODE3_SAMPLE_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#effcf9"/>
      <stop offset="55%" stop-color="#e0f2fe"/>
      <stop offset="100%" stop-color="#fff7ed"/>
    </linearGradient>
    <linearGradient id="card" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f766e"/>
      <stop offset="100%" stop-color="#0891b2"/>
    </linearGradient>
  </defs>
  <rect width="960" height="640" rx="40" fill="url(#bg)"/>
  <circle cx="780" cy="120" r="90" fill="#ffffff" fill-opacity="0.7"/>
  <circle cx="160" cy="500" r="120" fill="#ffffff" fill-opacity="0.55"/>
  <rect x="84" y="88" width="792" height="464" rx="32" fill="#ffffff" fill-opacity="0.86" stroke="#cbd5e1"/>
  <rect x="132" y="138" width="220" height="220" rx="28" fill="url(#card)"/>
  <rect x="392" y="148" width="284" height="28" rx="14" fill="#0f172a" fill-opacity="0.12"/>
  <rect x="392" y="198" width="364" height="58" rx="18" fill="#0f172a" fill-opacity="0.92"/>
  <rect x="392" y="278" width="318" height="22" rx="11" fill="#64748b" fill-opacity="0.42"/>
  <rect x="392" y="316" width="288" height="22" rx="11" fill="#64748b" fill-opacity="0.32"/>
  <rect x="132" y="402" width="624" height="92" rx="24" fill="#f8fafc" stroke="#dbeafe"/>
  <rect x="156" y="426" width="180" height="18" rx="9" fill="#0f766e" fill-opacity="0.22"/>
  <rect x="156" y="456" width="276" height="18" rx="9" fill="#0891b2" fill-opacity="0.16"/>
  <text x="188" y="254" font-size="82" font-family="Arial, sans-serif" font-weight="700" fill="#ffffff">AI</text>
</svg>
`)}`;

const state = {
  activeScreen: "editor",
  running: true,
  collapsedNodes: new Set(["node-1", "node-2", "node-3", "node-4", "node-5", "node-6"]),
  auth: {
    platform: "Twitter / X",
    appName: "X Publisher App",
    accountName: "@hubitos_ai",
    authorized: false
  },
  node2Form: {
    accountPositioning: "",
    style: "",
    assetPrompt: "",
    attachments: []
  },
  node2Submitted: false,
  node3Form: {
    prompt: ""
  },
  node3Submitted: false,
  workflowRunning: true,
  node4Form: {
    dailyPosts: "3",
    publishSlots: "09:30, 14:00, 20:30",
    nextPreview: "下一条将发布：\n“我们把社媒 AI 运营拆成了可复用的 6 节点闭环，内容、出图、发布、复盘都能串起来。”",
    stopped: false,
    previewExpanded: false
  },
  node5Data: {
    postId: "x-post-2048",
    capturedAt: "24h",
    impressions: "18.4k",
    ctr: "6.8%",
    likes: "426",
    bookmarks: "91",
    reposts: "38",
    comments: [
      "这个流程图很清楚，终于把内容运营闭环讲明白了。",
      "想看你们怎么把复盘结果真的写回下一条 prompt。",
      "这张图卡保存了，适合团队内部直接复用。"
    ]
  },
  node6Review: {
    report: "上一轮体检报告：内容在发布后 24 小时拿到 18.4k 曝光，点击率 6.8%，收藏率高于均值。评论反馈集中在“流程图清晰”“适合团队复用”，说明结构化表达和视觉卡片有效；但也有用户希望看到更具体的 prompt 演进过程。",
    nextPrompt: "下一轮 Prompt：围绕“AI 社媒运营闭环如何持续学习”生成一条更强调案例和演进过程的内容，保留清晰流程图视觉，增加 1 句关于 prompt 如何被自动优化的解释。"
  },
  dashboardFilters: {
    social: "x",
    range: "7d"
  },
  messages: [
    { role: "assistant", text: "把一条社媒内容的生成、出图、发布、回收和复盘串成一个可持续迭代的 AI workflow。" },
    { role: "user", text: "我希望这条流程最终能自己学会什么内容更容易被目标用户接受。" },
    { role: "assistant", text: "已经拆成 6 个节点，并保留一个自动回环，让下一轮创作直接接收复盘后的新 Prompt。" }
  ],
  editorMessages: [
    { role: "assistant", text: "当前画布已经按“授权 → 生成 → 出图 → 发布 → 回收 → 复盘”的闭环搭好。你可以继续补充平台规则或人工审核要求。" }
  ],
  nodes: [
    {
      id: "node-1",
      step: "节点 1",
      title: "授权账号",
      icon: "1",
      type: "auth",
      accent: "agent",
      row: "top",
      summary: "选择已授权社媒账号，当前以 Twitter / X 为主，后续可扩展多平台。",
      position: { x: BOARD_LAYOUT.columns.c1 },
      inputs: ["选择授权账号", "平台：Twitter / X"],
      body: [],
      outputs: []
    },
    {
      id: "node-2",
      step: "节点 2",
      title: "内容策略与图文生成",
      icon: "2",
      type: "strategy",
      accent: "task",
      row: "top",
      summary: "生成目标受众、文本风格、图片提示词，也支持上传图片反向推导提示词。",
      position: { x: BOARD_LAYOUT.columns.c2 },
      inputs: ["账户定位", "风格", "参考图片 / 图片提示词"],
      body: [],
      outputs: []
    },
    {
      id: "node-3",
      step: "节点 3",
      title: "AI 图片生成",
      icon: "3",
      type: "image",
      accent: "data",
      row: "top",
      summary: "接收节点 2 的图片提示词，指定风格与比例，生成可直接发布的图片。",
      position: { x: BOARD_LAYOUT.columns.c3 },
      inputs: ["生成单张图片", "Prompt 修改"],
      body: [],
      outputs: []
    },
    {
      id: "node-4",
      step: "节点 4",
      title: "自动排版发布",
      icon: "4",
      type: "publish",
      accent: "agent",
      row: "top",
      summary: "将文案与图片打包，检查平台限制，设定时间并自动发到授权社媒。",
      position: { x: BOARD_LAYOUT.columns.c4 },
      inputs: ["每日发布几条", "每天发布时段", "下一条发布预览"],
      body: [],
      outputs: []
    },
    {
      id: "node-5",
      step: "节点 5",
      title: "定时抓取回收数据",
      icon: "5",
      type: "metrics",
      accent: "data",
      row: "bottom",
      summary: "在发布后 24 小时或 72 小时定时抓取曝光、点击、互动和评论文本。",
      position: { x: BOARD_LAYOUT.columns.c4 },
      inputs: ["上一条发布内容返回的实际数据"],
      body: [],
      outputs: []
    },
    {
      id: "node-6",
      step: "节点 6",
      title: "归因分析与知识回写",
      icon: "6",
      type: "analysis",
      accent: "human",
      row: "bottom",
      summary: "归因表现原因，做情感挖掘，并自动修正下一轮内容创作 Prompt。",
      position: { x: BOARD_LAYOUT.columns.c3 },
      inputs: ["上一轮体检报告", "下一轮生成的 Prompt"],
      body: [],
      outputs: []
    }
  ],
  overviewStats: [
    { label: "节点数", value: "6" },
    { label: "闭环周期", value: "24h / 72h" },
    { label: "主平台", value: "X" },
    { label: "自动回写", value: "已启用" }
  ],
  feed: [
    { title: "画布已重构", copy: "6 个节点都改成可展开/收起的业务卡片。" },
    { title: "回流逻辑明确", copy: "24h / 72h 后自动抓取指标和评论，为复盘提供标准输入。" },
    { title: "下一轮自动触发", copy: "节点 6 会把结论写回节点 2 的内容创作规则。" }
  ],
  dashboardStats: [
    { label: "已发布内容", value: "18", note: "近 7 天已正式发布的图文内容" },
    { label: "平均互动率", value: "7.2%", note: "以点赞、收藏、评论、转发综合计算" },
    { label: "最高点击率", value: "9.4%", note: "来自流程图拆解类内容" },
    { label: "Agent 辅助率", value: "82%", note: "内容生产和复盘由 Agent 辅助完成" }
  ],
  agentAssistAgents: [
    { name: "内容策略 Agent", accent: "#7c3aed", screen: "策略规划", status: "工作中" },
    { name: "图片生成 Agent", accent: "#f97316", screen: "生成海报", status: "工作中" },
    { name: "发布编排 Agent", accent: "#14b8a6", screen: "发布排期", status: "待发布" },
    { name: "复盘回写 Agent", accent: "#22c55e", screen: "复盘总结", status: "分析中" }
  ],
  timeline: {
    x: {
      "7d": [
        { label: "05/26", value: 12400 },
        { label: "05/27", value: 15600 },
        { label: "05/28", value: 18200 },
        { label: "05/29", value: 16800 },
        { label: "05/30", value: 21400 },
        { label: "05/31", value: 19800 },
        { label: "06/01", value: 23600 }
      ],
      "30d": [
        { label: "第1周", value: 84200 },
        { label: "第2周", value: 91800 },
        { label: "第3周", value: 104000 },
        { label: "第4周", value: 112600 }
      ],
      "6m": [
        { label: "1月", value: 188000 },
        { label: "2月", value: 214000 },
        { label: "3月", value: 246000 },
        { label: "4月", value: 272000 },
        { label: "5月", value: 301000 },
        { label: "6月", value: 326000 }
      ]
    },
    facebook: {
      "7d": [
        { label: "05/26", value: 6200 },
        { label: "05/27", value: 7100 },
        { label: "05/28", value: 7600 },
        { label: "05/29", value: 7340 },
        { label: "05/30", value: 8450 },
        { label: "05/31", value: 8940 },
        { label: "06/01", value: 9320 }
      ],
      "30d": [
        { label: "第1周", value: 33200 },
        { label: "第2周", value: 34800 },
        { label: "第3周", value: 37200 },
        { label: "第4周", value: 40100 }
      ],
      "6m": [
        { label: "1月", value: 92000 },
        { label: "2月", value: 101000 },
        { label: "3月", value: 113000 },
        { label: "4月", value: 121000 },
        { label: "5月", value: 138000 },
        { label: "6月", value: 149000 }
      ]
    },
    instagram: {
      "7d": [
        { label: "05/26", value: 4800 },
        { label: "05/27", value: 5200 },
        { label: "05/28", value: 6100 },
        { label: "05/29", value: 5980 },
        { label: "05/30", value: 6840 },
        { label: "05/31", value: 7420 },
        { label: "06/01", value: 7880 }
      ],
      "30d": [
        { label: "第1周", value: 24400 },
        { label: "第2周", value: 25600 },
        { label: "第3周", value: 28100 },
        { label: "第4周", value: 30400 }
      ],
      "6m": [
        { label: "1月", value: 68000 },
        { label: "2月", value: 74000 },
        { label: "3月", value: 81500 },
        { label: "4月", value: 90200 },
        { label: "5月", value: 96400 },
        { label: "6月", value: 103000 }
      ]
    }
  },
  workload: [
    { label: "内容策略生成", value: 82 },
    { label: "图片生成辅助", value: 74 },
    { label: "自动发布执行", value: 59 },
    { label: "复盘与 Prompt 回写", value: 86 }
  ],
  records: [
    { title: "内容 #014 - AI 运营闭环拆解", copy: "18.4k 曝光 · 6.8% CTR · 426 点赞 · 91 收藏", status: "Published", url: "https://x.com/hubitos_ai/status/1880000014" },
    { title: "内容 #013 - 评论情绪复盘总结", copy: "12.6k 曝光 · 5.9% CTR · 评论区对流程回写最感兴趣", status: "Published", url: "https://x.com/hubitos_ai/status/1880000013" },
    { title: "内容 #012 - 图片风格实验对比", copy: "9.8k 曝光 · 收藏率最高，已回写为下一轮风格偏好", status: "Published", url: "https://x.com/hubitos_ai/status/1880000012" }
  ],
  assets: [
    { title: "高表现开头句模板", copy: "沉淀了更容易带来点击和收藏的开头句结构。", status: "Rule" },
    { title: "高收藏图片风格包", copy: "表现更好的版式、颜色和画面组织方式已归档。", status: "Prompt" },
    { title: "低表现内容警示", copy: "过长首段、过重术语和弱结论表达会明显拉低互动。", status: "Insight" }
  ]
};

const refs = {
  homeScreen: document.getElementById("homeScreen"),
  editorScreen: document.getElementById("editorScreen"),
  dashboardScreen: document.getElementById("dashboardScreen"),
  navButtons: Array.from(document.querySelectorAll(".rail-btn[data-screen]")),
  homeStats: document.getElementById("homeStats"),
  copilotThread: document.getElementById("copilotThread"),
  homePromptInput: document.getElementById("homePromptInput"),
  homeOpenEditorBtn: document.getElementById("homeOpenEditorBtn"),
  homeViewDataBtn: document.getElementById("homeViewDataBtn"),
  homeBuildWorkflowBtn: document.getElementById("homeBuildWorkflowBtn"),
  homeCreateNodeBtn: document.getElementById("homeCreateNodeBtn"),
  homeOpenDataBtn: document.getElementById("homeOpenDataBtn"),
  homeTwitterPackageBtn: document.getElementById("homeTwitterPackageBtn"),
  homeNewPackageBtn: document.getElementById("homeNewPackageBtn"),
  feedList: document.getElementById("feedList"),
  packageStatus: document.getElementById("packageStatus"),
  expandWorkflowBtn: document.getElementById("expandWorkflowBtn"),
  autoLayoutBtn: document.getElementById("autoLayoutBtn"),
  collapseWorkflowBtn: document.getElementById("collapseWorkflowBtn"),
  canvasBoard: document.getElementById("canvasBoard"),
  boardLinks: document.getElementById("boardLinks"),
  nodesRow: document.getElementById("nodesRow"),
  dashboardOpenEditorBtn: document.getElementById("dashboardOpenEditorBtn"),
  dashboardSummaryGrid: document.getElementById("dashboardSummaryGrid"),
  agentStats: document.getElementById("agentStats"),
  socialFilterGroup: document.getElementById("socialFilterGroup"),
  rangeFilterGroup: document.getElementById("rangeFilterGroup"),
  timelineChart: document.getElementById("timelineChart"),
  workloadChart: document.getElementById("workloadChart"),
  recordList: document.getElementById("recordList"),
  studioMain: document.querySelector(".studio-main"),
  toast: document.getElementById("toast")
};

function showToast(message) {
  if (!refs.toast) return;
  refs.toast.textContent = message;
  refs.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => refs.toast.classList.remove("show"), 1800);
}

function switchScreen(screen) {
  state.activeScreen = screen;
  refs.homeScreen?.classList.toggle("active", screen === "home");
  refs.editorScreen?.classList.toggle("active", screen === "editor");
  refs.dashboardScreen?.classList.toggle("active", screen === "dashboard");
  refs.navButtons.forEach((button) => button.classList.toggle("active", button.dataset.screen === screen));
}

function renderHome() {
  if (refs.homeStats) {
    refs.homeStats.innerHTML = state.overviewStats
      .map((item) => `<article class="stat-card"><div class="small-copy">${item.label}</div><strong>${item.value}</strong></article>`)
      .join("");
  }

  if (refs.copilotThread) {
    refs.copilotThread.innerHTML = state.messages
      .map(
        (item) => `
          <article class="home-msg ${item.role === "user" ? "user" : ""}">
            ${item.role === "assistant" ? "<strong>Copilot</strong>" : "<strong>You</strong>"}
            <span>${item.text}</span>
          </article>
        `
      )
      .join("");
  }

  if (refs.feedList) {
    refs.feedList.innerHTML = state.feed
      .map(
        (item) => `
          <article class="feed-item">
            <span class="action-icon data">•</span>
            <span><strong>${item.title}</strong><span>${item.copy}</span></span>
          </article>
        `
      )
      .join("");
  }
}

function getNode(id) {
  return state.nodes.find((node) => node.id === id);
}

function renderNodeInputs(node) {
  if (node.id === "node-2") {
    return `
      <div class="strategy-form">
        <label class="strategy-field">
          <span class="strategy-field-head"><span>账户定位</span><button class="field-generate-btn" type="button" data-node2-generate="accountPositioning">一键生成</button></span>
          <textarea data-node2-field="accountPositioning" rows="2" placeholder="例如：AI 工具创业账号，面向独立开发者与出海团队">${state.node2Form.accountPositioning}</textarea>
        </label>
        <label class="strategy-field">
          <span class="strategy-field-head"><span>风格</span><button class="field-generate-btn" type="button" data-node2-generate="style">一键生成</button></span>
          <input data-node2-field="style" type="text" placeholder="例如：专业、克制、轻增长感" value="${state.node2Form.style}" />
        </label>
        <label class="strategy-field">
          <span class="strategy-field-head"><span>参考图片 / 图片提示词</span><button class="field-generate-btn" type="button" data-node2-generate="assetPrompt">一键生成</button></span>
          <div class="strategy-attachment-box">
            <textarea data-node2-field="assetPrompt" rows="4" placeholder="可直接输入图片提示词，也可以先上传参考图片。\n例如：clean editorial poster, teal accent, futuristic dashboard, soft light">${state.node2Form.assetPrompt}</textarea>
            <div class="strategy-attachment-toolbar">
              <button class="strategy-attach-btn" type="button" data-node2-attach>+ 上传附件</button>
            </div>
            ${state.node2Form.attachments.length ? `
            <div class="strategy-attachment-list">
              ${state.node2Form.attachments.map((item) => `<span class="strategy-attachment-chip">${item}</span>`).join("")}
            </div>
            ` : ""}
          </div>
        </label>
        <div class="strategy-form-actions">
          <button class="field-generate-btn submit" type="button" data-node2-submit>提交</button>
        </div>
      </div>
    `;
  }

  if (node.id === "node-3") {
    return `
      <div class="strategy-form">
        <div class="strategy-image-preview">
          <img src="${NODE3_SAMPLE_IMAGE}" alt="AI 图片生成示例图" />
        </div>
        <label class="strategy-field">
          <span class="strategy-field-head"><span>生成单张图片</span><button class="field-generate-btn" type="button" data-node3-generate>一键生成</button></span>
          <textarea data-node3-field="prompt" rows="5" placeholder="可使用 prompt 输入修改图片生成要求。\n例如：clean editorial poster, teal accent, futuristic dashboard, premium product scene">${state.node3Form.prompt}</textarea>
        </label>
        <div class="strategy-form-actions">
          <button class="field-generate-btn icon-only" type="button" data-node3-regenerate aria-label="重新生成图片" title="重新生成图片">↻</button>
          <button class="field-generate-btn submit" type="button" data-node3-submit>提交</button>
        </div>
      </div>
    `;
  }

  if (node.id === "node-4") {
    return `
      <div class="strategy-form">
        <label class="strategy-field">
          <span>每日发布几条</span>
          <input data-node4-field="dailyPosts" type="text" placeholder="例如：3" value="${state.node4Form.dailyPosts}" />
        </label>
        <label class="strategy-field">
          <span>每天发布时段</span>
          <input data-node4-field="publishSlots" type="text" placeholder="例如：09:30, 14:00, 20:30" value="${state.node4Form.publishSlots}" />
        </label>
        <div class="strategy-field">
          <span>预览下一条要发布的内容</span>
          <div class="publish-preview-card ${state.node4Form.stopped ? "stopped" : ""}">
            <button class="publish-preview-image-btn" type="button" data-node4-preview-open aria-label="放大发布预览图">
              <img class="publish-preview-image" src="${NODE3_SAMPLE_IMAGE}" alt="下一条发布内容的图片缩略图" />
            </button>
            <pre>${state.node4Form.nextPreview}</pre>
            <div class="publish-preview-actions">
              <button class="field-generate-btn stop" type="button" data-node4-stop>${state.node4Form.stopped ? "已停止" : "停止"}</button>
            </div>
          </div>
          ${state.node4Form.previewExpanded ? `
          <div class="image-lightbox" data-node4-preview-close>
            <div class="image-lightbox-dialog" role="dialog" aria-modal="true" aria-label="发布预览大图">
              <button class="image-lightbox-close" type="button" data-node4-preview-close>关闭</button>
              <img src="${NODE3_SAMPLE_IMAGE}" alt="发布预览大图" />
            </div>
          </div>
          ` : ""}
        </div>
      </div>
    `;
  }

  if (node.id === "node-5") {
    return `
      <div class="strategy-form">
        <div class="strategy-field">
          <span>上一条发布内容返回的实际数据</span>
          <div class="metrics-dashboard">
            <div class="metrics-meta">
              <span>Post ID: ${state.node5Data.postId}</span>
              <span>回收时间点: ${state.node5Data.capturedAt}</span>
            </div>
            <div class="metrics-grid">
              <article class="metric-card"><strong>${state.node5Data.impressions}</strong><span>曝光量</span></article>
              <article class="metric-card"><strong>${state.node5Data.ctr}</strong><span>点击率</span></article>
              <article class="metric-card"><strong>${state.node5Data.likes}</strong><span>点赞</span></article>
              <article class="metric-card"><strong>${state.node5Data.bookmarks}</strong><span>收藏</span></article>
              <article class="metric-card"><strong>${state.node5Data.reposts}</strong><span>转发</span></article>
              <article class="metric-card"><strong>${state.node5Data.comments.length}</strong><span>评论数</span></article>
            </div>
            <div class="comments-panel">
              <div class="comments-title">最新评论</div>
              <ul>
                ${state.node5Data.comments.map((item) => `<li>${item}</li>`).join("")}
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (node.id === "node-6") {
    return `
      <div class="strategy-form">
        <div class="strategy-field">
          <span>上一轮的体检报告</span>
          <div class="review-card">
            <p>${state.node6Review.report}</p>
          </div>
        </div>
        <div class="strategy-field">
          <span>下一轮生成的 Prompt</span>
          <div class="review-card prompt">
            <p>${state.node6Review.nextPrompt}</p>
          </div>
        </div>
      </div>
    `;
  }

  if (node.id !== "node-1") {
    return `<div class="node-chip-list">${node.inputs.map((item) => `<span class="node-chip">${item}</span>`).join("")}</div>`;
  }

  const buttonLabel = state.auth.authorized ? "取消授权" : "立即授权";

  return `
    <div class="auth-input-panel">
      ${state.auth.authorized ? `
      <div class="auth-input-row">
        <div class="auth-app-card">
          <div class="auth-app-meta">
            <span class="auth-app-platform">${state.auth.platform}</span>
            <strong>${state.auth.appName}</strong>
            <span>${state.auth.accountName}</span>
          </div>
          <span class="auth-status-pill authorized">已授权</span>
        </div>
      </div>
      ` : ""}
      <div class="auth-input-row">
        <button class="auth-action-btn" type="button" data-auth-toggle="node-1">${buttonLabel}</button>
      </div>
    </div>
  `;
}

function renderNodeSections(node) {
  const sections = [
    `
      <div class="node-section">
        ${renderNodeInputs(node)}
      </div>
    `
  ];

  if (node.body?.length) {
    sections.push(`
      <div class="node-section">
        <div class="node-label">节点说明</div>
        <div class="node-copy">${node.body.map((line) => `<p>${line}</p>`).join("")}</div>
      </div>
    `);
  }

  if (node.outputs?.length) {
    sections.push(`
      <div class="node-section">
        <div class="node-label">节点输出</div>
        <ul class="node-output-list">${node.outputs.map((item) => `<li>${item}</li>`).join("")}</ul>
      </div>
    `);
  }

  return sections.join("");
}

function buildBoardLayout() {
  if (!refs.nodesRow) return null;
  const cards = Array.from(refs.nodesRow.querySelectorAll(".workflow-node-card"));
  if (!cards.length) return null;

  const topCards = cards.filter((card) => card.dataset.row === "top");
  const bottomCards = cards.filter((card) => card.dataset.row === "bottom");
  const topRowHeight = Math.max(...topCards.map((card) => card.offsetHeight), 0);
  const bottomY = BOARD_LAYOUT.topY + topRowHeight + BOARD_LAYOUT.rowGap;

  const layout = {};
  cards.forEach((card) => {
    const node = getNode(card.dataset.id);
    if (!node) return;
    const y = node.row === "top" ? BOARD_LAYOUT.topY : bottomY;
    layout[node.id] = {
      x: node.position.x,
      y,
      width: card.offsetWidth,
      height: card.offsetHeight
    };
  });

  const bottomRowHeight = Math.max(
    ...Object.entries(layout)
      .filter(([id]) => getNode(id)?.row === "bottom")
      .map(([, item]) => item.height),
    0
  );
  layout.__meta = {
    bottomY,
    boardHeight: bottomY + bottomRowHeight + BOARD_LAYOUT.bottomPadding
  };
  return layout;
}

function applyBoardLayout(layout) {
  if (!layout || !refs.nodesRow) return;
  state.nodes.forEach((node) => {
    const card = refs.nodesRow.querySelector(`[data-id="${node.id}"]`);
    const item = layout[node.id];
    if (!card || !item) return;
    card.style.left = `${item.x}px`;
    card.style.top = `${item.y}px`;
  });
  refs.nodesRow.style.height = `${layout.__meta.boardHeight}px`;
  if (refs.boardLinks) refs.boardLinks.style.height = `${layout.__meta.boardHeight + 24}px`;
  if (refs.canvasBoard) refs.canvasBoard.style.setProperty("--board-height", `${layout.__meta.boardHeight}px`);
}

function updateBoardScale() {
  if (!refs.canvasBoard) return;
  const availableWidth = refs.canvasBoard.clientWidth - 24;
  const scale = Math.min(1, Math.max(0.58, availableWidth / BOARD_LAYOUT.width));
  refs.canvasBoard.style.setProperty("--board-scale", String(scale));
}

function renderEditor() {
  if (refs.packageStatus) refs.packageStatus.textContent = state.running ? "Running" : "Ready";

  if (refs.nodesRow) {
    refs.nodesRow.innerHTML = state.nodes
      .map((node) => {
        const collapsed = state.collapsedNodes.has(node.id);
        return `
          <article
            class="workflow-node-card ${collapsed ? "collapsed" : ""}"
            data-id="${node.id}"
            data-row="${node.row}"
            data-accent="${node.accent}"
            style="left:${node.position.x}px; top:${BOARD_LAYOUT.topY}px;"
          >
            <div class="node-surface">
              <div class="node-topline">
                <span class="node-step">${node.step}</span>
                <button class="node-toggle" type="button" data-toggle-node="${node.id}">${collapsed ? "展开" : "收起"}</button>
              </div>
              <div class="node-header">
                <span class="node-badge">${node.icon}</span>
                <div>
                  <h3>${node.title}</h3>
                  <p>${node.summary}</p>
                </div>
              </div>
              <div class="node-payload">
                ${renderNodeSections(node)}
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  const layout = buildBoardLayout();
  applyBoardLayout(layout);
  updateBoardScale();
  renderLinks(layout);
}

function renderLinks(layout) {
  if (!refs.boardLinks || !layout) return;
  const paths = [
    { from: "node-1", to: "node-2" },
    { from: "node-2", to: "node-3" },
    { from: "node-3", to: "node-4" },
    { from: "node-4", to: "node-5" },
    { from: "node-5", to: "node-6" }
  ];

  refs.boardLinks.setAttribute("viewBox", `0 0 ${BOARD_LAYOUT.width} ${layout.__meta.boardHeight + 24}`);
  const rightEdge = (nodeId) => layout[nodeId].x + layout[nodeId].width;
  const leftEdge = (nodeId) => layout[nodeId].x;
  const centerX = (nodeId) => layout[nodeId].x + (layout[nodeId].width / 2);
  const centerY = (nodeId) => layout[nodeId].y + (layout[nodeId].height / 2);
  const bottomY = (nodeId) => layout[nodeId].y + layout[nodeId].height;
  const lineClass = (index, extra = "") => {
    const classes = ["board-link"];
    if (index > 2) classes.push("secondary");
    if (extra) classes.push(extra);
    if (!state.workflowRunning) classes.push("blocked");
    return classes.join(" ");
  };

  const lineSegments = paths
    .map((item, index) => {
      const from = layout[item.from];
      const to = layout[item.to];
      if (!from || !to) return "";
      if (from.x === to.x) {
        return `<path class="${lineClass(index)}" d="M ${centerX(item.from)} ${bottomY(item.from)} L ${centerX(item.to)} ${centerY(item.to)}" />`;
      }
      const forward = from.x < to.x;
      const startX = forward ? rightEdge(item.from) : leftEdge(item.from);
      const endX = forward ? leftEdge(item.to) : rightEdge(item.to);
      if (from.y === to.y) {
        return `<path class="${lineClass(index)}" d="M ${startX} ${centerY(item.from)} L ${endX} ${centerY(item.to)}" />`;
      }
      const elbowX = forward ? rightEdge(item.from) - 32 : leftEdge(item.from) + 32;
      return `<path class="${lineClass(index)}" d="M ${elbowX} ${bottomY(item.from)} L ${elbowX} ${centerY(item.to)} L ${endX} ${centerY(item.to)}" />`;
    })
    .join("");

  refs.boardLinks.innerHTML = `
    ${lineSegments}
    <path class="board-link loop${state.workflowRunning ? "" : " blocked"}" d="M ${leftEdge("node-6")} ${centerY("node-6")} L ${leftEdge("node-2") - 30} ${centerY("node-6")} L ${leftEdge("node-2") - 30} ${centerY("node-2")} L ${leftEdge("node-2")} ${centerY("node-2")}" />
    <text class="board-annotation" x="${BOARD_LAYOUT.columns.c4 + 44}" y="${centerY("node-4") - 10}">投放市场</text>
    <text class="board-annotation" x="${leftEdge("node-2") - 4}" y="${centerY("node-6") + 44}">触发新循环</text>
  `;
}

function generateNode2Field(field) {
  const samples = {
    accountPositioning: "面向 AI 创业者、独立开发者与增长团队的社媒账号，主打自动化运营、工作流实践与真实案例复盘。",
    style: "专业、清晰、可信，有轻增长感，避免过度营销和夸张表达。",
    assetPrompt: "clean editorial poster, teal accent, futuristic workflow dashboard, soft natural light, sharp typography, premium product composition"
  };
  state.node2Form[field] = samples[field] || "";
}

function generateNode3Prompt() {
  state.node3Form.prompt = "single premium social image, clean editorial composition, teal accent, modern product workflow dashboard, soft natural light, sharp typography, high clarity";
}

function renderAgentScreenThumb(item) {
  const thumbMap = {
    "内容策略 Agent": `
      <div class="agent-screen-ui strategy">
        <span class="ui-chip"></span>
        <span class="ui-line long"></span>
        <span class="ui-line"></span>
        <span class="ui-line short"></span>
      </div>
    `,
    "图片生成 Agent": `
      <div class="agent-screen-ui image">
        <span class="ui-frame"></span>
        <span class="ui-swatch"></span>
        <span class="ui-line short"></span>
      </div>
    `,
    "发布编排 Agent": `
      <div class="agent-screen-ui publish">
        <span class="ui-col"></span>
        <span class="ui-col active"></span>
        <span class="ui-col"></span>
        <span class="ui-line short"></span>
      </div>
    `,
    "复盘回写 Agent": `
      <div class="agent-screen-ui review">
        <span class="ui-line long"></span>
        <span class="ui-line"></span>
        <span class="ui-line"></span>
        <span class="ui-dot"></span>
      </div>
    `
  };
  return thumbMap[item.name] || `<div class="agent-screen-ui strategy"><span class="ui-line long"></span></div>`;
}

function renderDashboard() {
  refs.socialFilterGroup?.querySelectorAll("[data-social]").forEach((button) => {
    button.classList.toggle("active", button.dataset.social === state.dashboardFilters.social);
  });
  refs.rangeFilterGroup?.querySelectorAll("[data-range]").forEach((button) => {
    button.classList.toggle("active", button.dataset.range === state.dashboardFilters.range);
  });

  if (refs.dashboardSummaryGrid) {
    refs.dashboardSummaryGrid.innerHTML = state.dashboardStats
      .map(
        (item) => `
          <article class="agent-stat">
            <div class="small-copy">${item.label}</div>
            <strong>${item.value}</strong>
            <p class="small-copy">${item.note}</p>
          </article>
        `
      )
      .join("");
  }

  if (refs.agentStats) {
    refs.agentStats.innerHTML = `
      <div class="agent-mini-grid">
        ${state.agentAssistAgents
      .map(
        (item, index) => `
          <article class="agent-mini-pod">
            <div class="agent-mini-screen">
              ${renderAgentScreenThumb(item)}
            </div>
            <div class="agent-mini-desk">
              <div class="agent-mini-cat">
                <span class="agent-mini-ear left"></span>
                <span class="agent-mini-ear right"></span>
                <span class="agent-mini-body"></span>
                <span class="agent-mini-collar" style="background:${item.accent};"></span>
              </div>
            </div>
            <div class="agent-mini-meta">
              <strong>${item.name}</strong>
              <span>${item.status}</span>
              <span>Agent ${String(index + 1).padStart(2, "0")}</span>
            </div>
          </article>
        `
      )
      .join("")}
      </div>
    `;
  }

  if (refs.timelineChart) {
    const currentTimeline = state.timeline[state.dashboardFilters.social]?.[state.dashboardFilters.range] || [];
    const maxTimeline = Math.max(...currentTimeline.map((item) => item.value), 1);
    const svgWidth = 760;
    const svgHeight = 240;
    const paddingX = 26;
    const paddingTop = 18;
    const paddingBottom = 42;
    const chartHeight = svgHeight - paddingTop - paddingBottom;
    const chartWidth = svgWidth - paddingX * 2;
    const points = currentTimeline.map((item, index) => {
      const x = paddingX + (currentTimeline.length <= 1 ? chartWidth / 2 : (chartWidth / (currentTimeline.length - 1)) * index);
      const y = paddingTop + chartHeight - ((item.value / maxTimeline) * chartHeight);
      return { ...item, x, y };
    });
    const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");
    refs.timelineChart.innerHTML = `
      <div class="line-chart-shell">
        <svg class="line-chart-svg" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="none" aria-label="浏览量折线图">
          <line x1="${paddingX}" y1="${paddingTop + chartHeight}" x2="${svgWidth - paddingX}" y2="${paddingTop + chartHeight}" class="line-chart-axis" />
          ${points.map((point) => `<line x1="${point.x}" y1="${paddingTop}" x2="${point.x}" y2="${paddingTop + chartHeight}" class="line-chart-grid" />`).join("")}
          <polyline points="${polyline}" class="line-chart-line" />
          ${points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="5" class="line-chart-dot" />`).join("")}
          ${points.map((point) => `<text x="${point.x}" y="${point.y - 12}" text-anchor="middle" class="line-chart-value">${point.value >= 1000 ? `${(point.value / 1000).toFixed(1)}k` : point.value}</text>`).join("")}
          ${points.map((point) => `<text x="${point.x}" y="${svgHeight - 10}" text-anchor="middle" class="line-chart-label">${point.label}</text>`).join("")}
        </svg>
      </div>
    `;
  }

  if (refs.recordList) {
    refs.recordList.innerHTML = state.records
      .map(
        (item) => `
          <button class="record-item record-link" type="button" data-record-url="${item.url}">
            <span><strong>${item.title}</strong><span>${item.copy}</span></span>
            <span class="status-pill ready">${item.status}</span>
          </button>
        `
      )
      .join("");
  }

}

refs.navButtons.forEach((button) => {
  button.addEventListener("click", () => switchScreen(button.dataset.screen));
});

refs.homeOpenEditorBtn?.addEventListener("click", () => switchScreen("editor"));
refs.homeBuildWorkflowBtn?.addEventListener("click", () => switchScreen("editor"));
refs.homeCreateNodeBtn?.addEventListener("click", () => {
  state.editorMessages.push({ role: "assistant", text: "这条流程已经有 6 个核心节点。下一步更适合补人工审核、A/B 版本分支，或者新增知识库审批条件。" });
  renderEditor();
  switchScreen("editor");
});
refs.homeOpenDataBtn?.addEventListener("click", () => switchScreen("dashboard"));
refs.homeViewDataBtn?.addEventListener("click", () => switchScreen("dashboard"));
refs.homeTwitterPackageBtn?.addEventListener("click", () => switchScreen("editor"));
refs.homeNewPackageBtn?.addEventListener("click", () => showToast("当前页面已聚焦在社媒 AI 运营闭环。"));
refs.dashboardOpenEditorBtn?.addEventListener("click", () => switchScreen("editor"));
refs.socialFilterGroup?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-social]");
  if (!button) return;
  state.dashboardFilters.social = button.dataset.social;
  renderDashboard();
});
refs.rangeFilterGroup?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-range]");
  if (!button) return;
  state.dashboardFilters.range = button.dataset.range;
  renderDashboard();
});
refs.studioMain?.addEventListener("click", (event) => {
  const recordLink = event.target.closest("[data-record-url]");
  if (!recordLink) return;
  window.open(recordLink.dataset.recordUrl, "_blank", "noopener,noreferrer");
});
function expandAllNodes() {
  state.collapsedNodes.clear();
  renderEditor();
  showToast("所有节点已展开。");
}

refs.expandWorkflowBtn?.addEventListener("click", expandAllNodes);
refs.collapseWorkflowBtn?.addEventListener("click", () => {
  state.nodes.forEach((node) => state.collapsedNodes.add(node.id));
  renderEditor();
  showToast("所有节点已收起。");
});
refs.autoLayoutBtn?.addEventListener("click", () => {
  renderEditor();
  showToast("节点已重新整理成闭环画布。");
});
refs.nodesRow?.addEventListener("click", (event) => {
  const previewClose = event.target.closest("[data-node4-preview-close]");
  if (previewClose) {
    state.node4Form.previewExpanded = false;
    renderEditor();
    return;
  }
  const previewOpen = event.target.closest("[data-node4-preview-open]");
  if (previewOpen) {
    state.node4Form.previewExpanded = true;
    renderEditor();
    return;
  }
  const regenerateNode3Btn = event.target.closest("[data-node3-regenerate]");
  if (regenerateNode3Btn) {
    generateNode3Prompt();
    renderEditor();
    showToast("已重新生成图片。");
    return;
  }
  const generateNode3Btn = event.target.closest("[data-node3-generate]");
  if (generateNode3Btn) {
    generateNode3Prompt();
    renderEditor();
    showToast("已生成图片 Prompt。");
    return;
  }
  const submitNode3Btn = event.target.closest("[data-node3-submit]");
  if (submitNode3Btn) {
    state.node3Submitted = true;
    state.collapsedNodes.add("node-3");
    renderEditor();
    showToast("节点 3 已提交。");
    return;
  }
  const stopNode4Btn = event.target.closest("[data-node4-stop]");
  if (stopNode4Btn) {
    state.node4Form.stopped = !state.node4Form.stopped;
    renderEditor();
    showToast(state.node4Form.stopped ? "已停止下一条发布。" : "已恢复发布。");
    return;
  }
  const submitBtn = event.target.closest("[data-node2-submit]");
  if (submitBtn) {
    state.node2Submitted = true;
    state.collapsedNodes.add("node-2");
    renderEditor();
    showToast("节点 2 已提交，流程已推进到节点 3。");
    return;
  }
  const generateFieldBtn = event.target.closest("[data-node2-generate]");
  if (generateFieldBtn) {
    generateNode2Field(generateFieldBtn.dataset.node2Generate);
    renderEditor();
    showToast("已生成该输入项内容。");
    return;
  }
  const attachBtn = event.target.closest("[data-node2-attach]");
  if (attachBtn) {
    if (!state.node2Form.attachments.length) {
      state.node2Form.attachments = ["reference-image.png"];
      showToast("已添加示例附件。");
    } else {
      state.node2Form.attachments = [];
      showToast("已移除附件。");
    }
    renderEditor();
    return;
  }
  const authToggle = event.target.closest("[data-auth-toggle]");
  if (authToggle) {
    state.auth.authorized = !state.auth.authorized;
    renderEditor();
    showToast(state.auth.authorized ? "X App 已授权，可继续发布。" : "已取消授权。");
    return;
  }
  const toggle = event.target.closest("[data-toggle-node]");
  if (!toggle) return;
  const nodeId = toggle.dataset.toggleNode;
  if (state.collapsedNodes.has(nodeId)) state.collapsedNodes.delete(nodeId);
  else state.collapsedNodes.add(nodeId);
  renderEditor();
});
refs.nodesRow?.addEventListener("input", (event) => {
  const node4Field = event.target.closest("[data-node4-field]");
  if (node4Field) {
    state.node4Form[node4Field.dataset.node4Field] = node4Field.value;
    return;
  }
  const node3Field = event.target.closest("[data-node3-field]");
  if (node3Field) {
    state.node3Form[node3Field.dataset.node3Field] = node3Field.value;
    return;
  }
  const field = event.target.closest("[data-node2-field]");
  if (!field) return;
  state.node2Form[field.dataset.node2Field] = field.value;
});

window.addEventListener("resize", renderEditor);

renderHome();
renderEditor();
renderDashboard();
switchScreen("editor");
