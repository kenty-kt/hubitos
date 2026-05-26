const ACTIVE_WORKFLOW_KEY = "hubitos-active-workflow";
const COMPETITOR_API_BASE = "http://127.0.0.1:8765/api";
const X_DAILY_REPORT_API_BASE = "http://127.0.0.1:8766/api";
const ZALO_API_BASE = "http://127.0.0.1:8768/api";
const workflowLang = (() => {
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
const isWorkflowEnglish = workflowLang === "en";
const wt = (zh, en) => (isWorkflowEnglish ? en : zh);

const workflowState = {
  activeWorkflowId: null,
  activeBackendTaskId: null,
  activeReportUrl: "",
  panelWorkflowId: null,
  panelMode: "empty",
  scope: "mine",
  draftAnswers: {},
  chatMessages: [],
  authStatus: {
    "wf-x-daily-report": {
      authorized: false,
      checked: false,
      message: ""
    },
    "wf-zalo-agent": {
      authorized: false,
      checked: false,
      message: ""
    },
    "wf-zalo-group-chat": {
      authorized: false,
      checked: false,
      message: ""
    }
  },
  signals: [
    { label: wt("正在进行中的任务", "Active Tasks"), value: "07", note: wt("已发布30条推特，10次评论互动。", "30 tweets published and 10 comment interactions completed.") },
    { label: wt("已产出文件", "Generated Files"), value: "18", note: wt("包含文档、图片和表格，已进入对应项目目录。", "Includes documents, images, and tables, already saved into the related project folders.") }
  ],
  activities: [
    {
      title: wt("X 日报任务已生成今日 HTML 报告", "The X daily report workflow generated today's HTML report."),
      badge: wt("X 日报 HTML", "X Daily HTML"),
      copy: wt("已按自定义关键词和账号抓取 X 内容，并整理成一份可打开的日报页面。", "Fetched custom X content by keywords and accounts, then assembled it into an openable daily report page."),
      time: wt("8 分钟前", "8 minutes ago")
    },
    {
      title: wt("Zalo Agent 工作流已保存本地配置", "The Zalo agent workflow saved its local configuration."),
      badge: wt("Zalo 渠道接入", "Zalo Channel Setup"),
      copy: wt("已预留 OA 配置、欢迎语、人工接管和群聊策略位，下一步可联调 webhook。", "Prepared OA config, welcome scripts, human handoff rules, and group-chat strategy. Next step: wire up the webhook."),
      time: wt("3 分钟前", "3 minutes ago")
    },
    {
      title: wt("竞品监控任务已生成本周追踪摘要", "The competitor monitoring workflow generated this week's tracking summary."),
      badge: wt("竞品网站监控", "Competitor Website Monitoring"),
      copy: wt("已对 3 个竞品站点完成更新扫描，输出了功能变化、价格动态和营销动作摘要。", "Completed update scans for 3 competitor sites and generated a summary of feature changes, pricing moves, and marketing actions."),
      time: wt("5 分钟前", "5 minutes ago")
    },
    {
      title: wt("市场研究助理已归档竞品分析", "The market research assistant archived the competitor analysis."),
      badge: wt("竞品拆解与定位", "Competitor Breakdown and Positioning"),
      copy: wt("输出了竞品功能矩阵和价格对比，并同步到 Market Analysis 文件夹。", "Generated the competitor feature matrix and pricing comparison, then synced them to the Market Analysis folder."),
      time: wt("12 分钟前", "12 minutes ago")
    },
    {
      title: wt("PRD Writing Assistant 生成了新的结构草案", "PRD Writing Assistant generated a new structural draft."),
      badge: wt("PRD 生成自动任务", "PRD Auto Task"),
      copy: wt("根据最近对话补齐了需求背景、功能结构和阶段目标。", "Filled in the requirement background, feature structure, and phase goals from recent conversations."),
      time: wt("28 分钟前", "28 minutes ago")
    },
    {
      title: wt("首页视觉提案已准备好进入工作台继续编辑", "The homepage visual proposal is ready for further editing in the workspace."),
      badge: wt("首页视觉提案", "Homepage Visual Proposal"),
      copy: wt("建议从首页卡片直接进入聊天工作台，继续细化页面布局和模块细节。", "It's recommended to jump from the homepage card into the chat workspace and continue refining layout and module details."),
      time: wt("刚刚", "Just now")
    }
  ],
  workflows: [
    {
      id: "wf-competitor-monitoring",
      scope: "mine",
      title: wt("竞品网站监控与周期报告", "Competitor Website Monitoring & Scheduled Reports"),
      platform: wt("网站", "Web"),
      mode: wt("需要补信息", "More Info Needed"),
      eta: wt("约 4 分钟", "About 4 min"),
      badge: wt("新建", "New"),
      description: wt("输入竞争对手的网站和更新周期后，系统会定期抓取官网变化、梳理产品动作，并自动输出一份竞品分析报告。", "Enter competitor websites and an update cycle, and the system will periodically scan site changes, summarize product moves, and automatically produce a competitor analysis report."),
      tags: [wt("竞品监控", "Competitor Monitoring"), wt("周期更新", "Scheduled Updates"), wt("自动报告", "Auto Reports")],
      prompt: "请继续完善这个竞品网站监控自动任务，基于目标网站、更新周期和关注重点，输出持续更新的竞品分析机制。",
      required: [
        { key: "websites", type: "textarea", label: wt("竞争对手网站", "Competitor Websites"), question: wt("把要持续跟踪的竞争对手官网贴进来，一行一个或用逗号分隔。", "Paste the competitor websites to monitor continuously, one per line or comma-separated."), placeholder: wt("例如：https://www.notion.so\nhttps://www.clickup.com", "For example: https://www.notion.so\nhttps://www.clickup.com") },
        { key: "cycle", type: "text", label: wt("更新周期", "Update Cycle"), question: wt("希望系统按什么频率自动生成竞品报告？", "How often should the system automatically generate the competitor report?"), placeholder: wt("例如：每周一上午 9 点 / 每 3 天一次", "For example: Every Monday 9:00 AM / Once every 3 days") },
        { key: "focus", type: "textarea", label: wt("重点关注项", "Focus Areas"), question: wt("这份竞品报告最想盯哪些变化？", "Which changes should this report focus on most?"), placeholder: wt("例如：新功能上线、定价变化、首页文案、促销活动、案例更新", "For example: new features, pricing changes, homepage copy, campaigns, case study updates") }
      ]
    },
    {
      id: "wf-x-content-pipeline",
      scope: "mine",
      title: wt("AI 内容产出并发布到 X", "AI Content Production & Publishing for X"),
      platform: "X",
      mode: wt("查看详情", "View Details"),
      eta: wt("约 5 分钟配置", "About 5 min setup"),
      badge: wt("新建", "New"),
      description: wt("单独进入详情页配置 AI 产出、审核、排期与 X 发布，不影响现有工作流列表。", "Open a dedicated detail page to configure AI generation, review, scheduling, and X publishing without changing the current workflow list."),
      tags: [wt("独立详情页", "Dedicated Detail Page"), "X", wt("内容自动化", "Content Automation")],
      prompt: "请继续完善这个 X 平台的 AI 内容产出与自动发布工作流，补齐内容策略、发布节奏和互动建议。",
      required: [],
      detailHref: "./workflows-x-publisher-detail.html"
    },
    {
      id: "wf-x-daily-report",
      scope: "mine",
      title: wt("X 自定义抓取与固定时间 HTML 日报", "Custom X Scraping & Scheduled HTML Daily Report"),
      platform: "X",
      mode: wt("需要补信息", "More Info Needed"),
      eta: wt("约 6 分钟", "About 6 min"),
      badge: wt("新建", "New"),
      description: wt(
        "基于 x-daily-report Skill，按关键词或账号自定义抓取 X 内容，并在固定时间自动生成一份 HTML 日报；默认执行内容质量过滤、引流词过滤和高危链接过滤。",
        "Based on the x-daily-report Skill, scrape X by custom keywords or accounts and generate an HTML daily report on a fixed schedule; by default, apply quality, spam, and risky-link filters."
      ),
      tags: [wt("X 日报", "X Daily Report"), wt("固定时间", "Fixed Schedule"), wt("HTML 报告", "HTML Report")],
      prompt: wt(
        "请使用 x-daily-report Skill，基于我配置的关键词、账号和固定时间策略，持续抓取 X 内容并生成 HTML 日报。默认过滤规则：不抓回复、不抓含视频内容、过滤引流词、钱包地址、高危短链、纯链接、纯提及、过多 hashtag 与非目标语言内容。",
        "Use the x-daily-report Skill with my configured keywords, accounts, and schedule to continuously fetch X content and generate an HTML daily report. Default filters: exclude replies, posts with video, spam phrases, wallet addresses, risky short links, pure-link posts, pure mentions, excessive hashtags, and non-target languages."
      ),
      required: [
        { key: "auth", type: "auth", label: wt("X OAuth 授权", "X OAuth Authorization"), question: wt("先完成 X OAuth 2.0 授权，拿到 Access Token 后才能抓取内容。", "Complete X OAuth 2.0 authorization first. Access tokens are required before fetching content."), actionText: wt("前往 X 授权", "Authorize X") },
        { key: "prompt", type: "textarea", label: wt("抓取意图 / Prompt", "Fetch Intent / Prompt"), question: wt("你想通过日报跟踪什么？直接描述意图，系统会优先用 AI 从 prompt 中抽象出关键词，再去抓 X；如果 AI 不可用，则回退到本地规则提取。", "What do you want this daily report to track? Describe the intent directly and the system will first use AI to extract keywords from the prompt before fetching X, and fall back to local rule extraction if AI is unavailable."), placeholder: wt("例如：帮我跟踪 AI agent 领域的新项目、产品发布和重要 KOL 动态", "For example: Track new projects, product launches, and important KOL updates in the AI agent space") },
        { key: "accounts", type: "textarea", optional: true, label: wt("监控账号", "Accounts to Monitor"), question: wt("想跟踪哪些 X 账号？不用带 @。这项可留空。", "Which X accounts should be monitored? No @ needed. This field is optional."), placeholder: wt("例如：OpenAI, AnthropicAI, GoogleDeepMind", "For example: OpenAI, AnthropicAI, GoogleDeepMind") },
        { key: "schedule", type: "text", label: wt("固定时间", "Schedule"), question: wt("每天什么时候自动生成 HTML 日报？", "At what fixed time should the HTML daily report be generated?"), placeholder: wt("例如：每天 09:00 / 每晚 22:30", "For example: Every day 09:00 / Every night 22:30") },
        { key: "maxResults", type: "text", label: wt("每项抓取上限", "Max Results Per Query"), question: wt("每个关键词或账号最多抓多少条？", "How many tweets should be fetched per keyword or account?"), placeholder: wt("例如：10", "For example: 10") },
      ]
    },
    {
      id: "wf-zalo-agent",
      scope: "mine",
      title: wt("Zalo Agent 自主接待与群聊编排", "Zalo Agent Autopilot & Group Chat Orchestration"),
      platform: "Zalo",
      mode: wt("需要补信息", "More Info Needed"),
      eta: wt("约 7 分钟", "About 7 min"),
      badge: wt("新建", "New"),
      description: wt(
        "接入 Zalo OA 后，让 Agent 自动接待消息、生成回复、低置信度转人工，并预留群聊运营策略。",
        "Connect a Zalo OA so the agent can handle inbound messages, draft replies, hand off low-confidence cases to humans, and reserve a group-chat operations strategy."
      ),
      tags: [wt("Zalo OA", "Zalo OA"), wt("自动回复", "Auto Reply"), wt("人工接管", "Human Handoff"), wt("群聊预留", "Group Chat Ready")],
      prompt: wt(
        "请继续完善这个 Zalo Agent 工作流，基于 OA 配置、品牌语气和转人工规则，规划消息接待、自动回复和群聊运营边界。",
        "Continue refining this Zalo agent workflow. Based on the OA setup, brand voice, and handoff rules, define inbound handling, auto replies, and the boundaries for group-chat operations."
      ),
      required: [
        { key: "auth", type: "auth", label: wt("Zalo 本地配置", "Zalo Local Configuration"), question: wt("先保存 OA / App 基础配置。第一版会先记录本地配置和运行策略，后续再接真实 webhook。", "Save the OA / App basics first. The first version records local config and run policies before wiring a real webhook."), actionText: wt("保存本地配置", "Save Local Config") },
        { key: "oaId", type: "text", label: wt("OA / App 标识", "OA / App Identifier"), question: wt("这次工作流绑定哪个 Zalo OA 或 App？", "Which Zalo OA or app should this workflow bind to?"), placeholder: wt("例如：demo-oa / app-123456", "For example: demo-oa / app-123456") },
        { key: "goal", type: "textarea", label: wt("执行目标", "Execution Goal"), question: wt("这个 Agent 主要负责什么？", "What should this agent mainly handle?"), placeholder: wt("例如：接待咨询、输出欢迎语、识别高意向客户、低置信度转人工", "For example: welcome new leads, answer simple questions, identify high-intent users, and escalate low-confidence cases") },
        { key: "brandVoice", type: "textarea", label: wt("品牌语气", "Brand Voice"), question: wt("回复应该保持什么样的语气和边界？", "What tone and boundaries should the replies follow?"), placeholder: wt("例如：友好、克制、偏专业，不轻易承诺价格与库存", "For example: friendly, restrained, and professional. Avoid overpromising on price or inventory.") },
        { key: "handoffRule", type: "textarea", label: wt("转人工规则", "Human Handoff Rules"), question: wt("什么情况必须转给人工？", "Which cases must be handed to a human?"), placeholder: wt("例如：投诉、退款、价格异议、高价值客户、信息不明确", "For example: complaints, refunds, pricing disputes, high-value leads, or unclear intent") },
        { key: "groupStrategy", type: "textarea", optional: true, label: wt("群聊策略（预留）", "Group Strategy (Optional)"), question: wt("如果后续开放群聊能力，希望 Agent 在群内怎么说、怎么控频？", "If group-chat support is enabled later, how should the agent speak and how should rate limits be handled in groups?"), placeholder: wt("例如：只做欢迎和引导，不在群里报价；每 10 分钟最多自动发 1 条", "For example: only welcome and guide, never quote prices in-group; send at most 1 auto message every 10 minutes") }
      ]
    },
    {
      id: "wf-zalo-group-chat",
      scope: "mine",
      title: wt("Zalo 群聊运营与自动发言", "Zalo Group Operations & Auto Speaking"),
      platform: "Zalo",
      mode: wt("需要补信息", "More Info Needed"),
      eta: wt("约 6 分钟", "About 6 min"),
      badge: wt("新建", "New"),
      description: wt(
        "直接针对群聊场景配置群 ID、首条话术、回复策略和控频规则，先跑本地模拟，再逐步升级到真实群运营。",
        "Configure a group ID, opening line, reply strategy, and rate limits specifically for group-chat scenarios. Start with local simulation, then graduate to real group operations."
      ),
      tags: [wt("群聊", "Group Chat"), wt("自动发言", "Auto Speaking"), wt("控频", "Rate Limit"), wt("Zalo", "Zalo")],
      prompt: wt(
        "请继续完善这个 Zalo 群聊工作流，围绕群欢迎语、自动发言策略、人工接管边界和频率限制，输出可执行的群运营方案。",
        "Continue refining this Zalo group-chat workflow. Based on group welcome lines, auto-speaking strategy, handoff rules, and rate limits, produce an executable group-operations plan."
      ),
      required: [
        { key: "auth", type: "auth", label: wt("Zalo 本地配置", "Zalo Local Configuration"), question: wt("先保存 OA / App 基础配置，并开启群聊模式。", "Save the OA / app basics first and enable group-chat mode."), actionText: wt("保存本地配置", "Save Local Config") },
        { key: "oaId", type: "text", label: wt("OA / App 标识", "OA / App Identifier"), question: wt("这次群聊工作流绑定哪个 Zalo OA 或 App？", "Which Zalo OA or app should this group-chat workflow bind to?"), placeholder: wt("例如：community-oa", "For example: community-oa") },
        { key: "groupId", type: "text", label: wt("群组 ID", "Group ID"), question: wt("希望 Agent 先在哪个群里演练？", "Which group should the agent rehearse in first?"), placeholder: wt("例如：group-001", "For example: group-001") },
        { key: "openingMessage", type: "textarea", label: wt("首条话术", "Opening Message"), question: wt("Agent 在群里第一句应该怎么说？", "What should the agent say first in the group?"), placeholder: wt("例如：大家好，欢迎进群，我先给大家整理下本周重点。", "For example: Hi everyone, welcome to the group. I'll summarize this week's key points first.") },
        { key: "replyPolicy", type: "textarea", label: wt("群回复策略", "Group Reply Policy"), question: wt("希望 Agent 在群里怎么接话？", "How should the agent respond inside the group?"), placeholder: wt("例如：只回答 FAQ，不讨论价格；高风险问题转人工。", "For example: answer FAQs only, avoid price discussions, escalate risky questions to a human.") },
        { key: "frequencyLimit", type: "text", label: wt("控频规则", "Rate Limit"), question: wt("群里多久最多自动发一条？", "How often can the agent auto-post at most?"), placeholder: wt("例如：每 10 分钟最多 1 条", "For example: at most 1 message every 10 minutes") }
      ]
    },
    {
      id: "wf-twitter-engage",
      scope: "mine",
      title: wt("X 评论互动与主动评论", "X Comment Engagement & Proactive Replies"),
      platform: "X",
      mode: wt("需要补信息", "More Info Needed"),
      eta: wt("约 8 分钟", "About 8 min"),
      badge: wt("待启动", "Pending Start"),
      description: wt("围绕目标关键词自动发现相关帖子，生成评论并持续跟进评论区互动。", "Automatically discover posts around the target keywords, generate replies, and keep following the comment thread."),
      tags: ["评论互动", "主动评论", "增长"],
      prompt: "请基于这个 X 评论互动自动任务，继续帮我梳理评论策略、互动节奏和风险边界。",
      required: [
        { key: "auth", type: "auth", label: "X 平台授权", question: "先完成 X 平台授权。授权后，这个自动任务才能开始评论与主动互动。", actionText: "前往 X 授权" },
        { key: "keyword", type: "text", label: "目标关键词", question: "这次想围绕哪个 X 关键词或主题去互动？", placeholder: "例如：AI agent、自动化增长、创业工具" },
        { key: "tone", type: "textarea", label: "评论语气", question: "评论语气希望更专业、友好，还是更强观点输出？", placeholder: "例如：偏专业、友好，不要太营销，适度表达观点。" }
      ]
    },
    {
      id: "wf-facebook-publish",
      scope: "all",
      title: wt("Facebook 社群内容抓取并自动发布", "Facebook Community Content Capture & Auto Publish"),
      platform: "Facebook",
      mode: wt("需要补信息", "More Info Needed"),
      eta: wt("约 9 分钟", "About 9 min"),
      badge: wt("未接入", "Not Connected"),
      description: wt("从目标社群和页面抓取高价值内容，整理成更适合 Facebook 的长帖和配图说明。", "Capture high-value content from target communities and pages, then turn it into Facebook-friendly long posts and image captions."),
      tags: ["社群抓取", "长帖生成", "自动发布"],
      prompt: "请继续展开这个 Facebook 内容自动任务，补齐发布策略、帖子结构和评论引导方式。",
      required: [
        { key: "auth", type: "auth", label: "Facebook 平台授权", question: "先完成 Facebook 平台授权。授权后，系统才能抓取来源并安排自动发布。", actionText: "前往 Facebook 授权" },
        { key: "source", type: "textarea", label: "抓取来源", question: "你希望从哪些 Facebook 页面、社群或话题来源抓内容？", placeholder: "例如：3 个目标社群、2 个竞品主页、1 个行业话题页" },
        { key: "topic", type: "text", label: "发布主题", question: "这次生成内容的核心发布主题是什么？", placeholder: "例如：AI 自动任务如何提升团队执行效率" }
      ]
    },
    {
      id: "wf-facebook-engage",
      scope: "mine",
      title: wt("Facebook 社群评论运营", "Facebook Community Comment Operations"),
      platform: "Facebook",
      mode: wt("可直接运行", "Ready to Run"),
      eta: wt("约 5 分钟", "About 5 min"),
      badge: wt("运行中", "Running"),
      description: wt("自动跟进已发布帖子的评论区，筛出需要重点回复的留言并生成互动建议。", "Automatically follow the comment threads of published posts, pick out the replies that need attention, and generate interaction suggestions."),
      tags: ["评论运营", "人工接管", "社群活跃"],
      prompt: "请继续处理这个 Facebook 社群评论运营自动任务，并给我一份后续人工接管建议。",
      required: [],
      result: {
        title: "Facebook 社群评论运营",
        meta: "已扫描 26 条最新评论，标记 5 条高价值互动，2 条建议人工接管",
        status: "运行中",
        preview: {
          label: wt("已输出内容", "Generated Output"),
          title: wt("本轮评论运营摘要", "Current Comment Ops Summary"),
          body: wt(
            "系统已完成最新评论扫描，并优先挑出 5 条高价值互动与 2 条高风险评论。\n建议先人工接管其中 2 条高风险互动，其他标准咨询可继续沿用系统生成的回复草案。",
            "The system completed the latest comment scan and surfaced 5 high-value interactions plus 2 high-risk comments.\nHandle the 2 high-risk threads manually first, while standard inquiries can continue with the drafted system replies."
          )
        },
        collected: ["识别 26 条近 24 小时内的最新评论", "高价值评论 5 条，负向风险评论 2 条", "发现 1 个适合继续追问的潜在客户讨论"],
        generated: ["自动回复 3 条标准咨询评论", "生成 2 条需要人工确认的回复草案", "输出 1 条社群管理员私信建议"],
        logs: ["10:02 已抓取最新评论并完成情绪分类", "10:04 系统已生成推荐回复", "10:06 已将 2 条高风险互动移交人工接管"]
      }
    }
  ]
};

if (window.HubitosI18n && window.HubitosI18n.getLanguage() === "en") {
  const translated = window.HubitosI18n.translateDeep(workflowState, "en");
  Object.keys(workflowState).forEach((key) => {
    workflowState[key] = translated[key];
  });
}

const workflowRefs = {
  contentGrid: document.getElementById("contentGrid"),
  workflowTabs: document.getElementById("workflowTabs"),
  workflowGrid: document.getElementById("workflowGrid"),
  executionPanel: document.getElementById("executionPanel"),
  systemTimeLabel: document.getElementById("systemTimeLabel"),
  signalStack: document.getElementById("signalStack"),
  activityList: document.getElementById("activityList"),
  refreshFeedBtn: document.getElementById("refreshFeedBtn"),
  sidePanelKicker: document.getElementById("sidePanelKicker"),
  sidePanelTitle: document.getElementById("sidePanelTitle"),
  closePanelBtn: document.getElementById("closePanelBtn"),
  formCard: document.getElementById("formCard"),
  resultCard: document.getElementById("resultCard"),
  chatCard: document.getElementById("chatCard"),
  resultTitle: document.getElementById("resultTitle"),
  resultMeta: document.getElementById("resultMeta"),
  resultStatus: document.getElementById("resultStatus"),
  resultPreview: document.getElementById("resultPreview"),
  resultPreviewLabel: document.getElementById("resultPreviewLabel"),
  resultPreviewTitle: document.getElementById("resultPreviewTitle"),
  resultPreviewList: document.getElementById("resultPreviewList"),
  editResultBtn: document.getElementById("editResultBtn"),
  openReportBtn: document.getElementById("openReportBtn"),
  resultCollected: document.getElementById("resultCollected"),
  resultGenerated: document.getElementById("resultGenerated"),
  resultLogs: document.getElementById("resultLogs"),
  chatThread: document.getElementById("chatThread"),
  chatReplyInput: document.getElementById("chatReplyInput"),
  closeChatPanelBtn: document.getElementById("closeChatPanelBtn"),
  sendChatReplyBtn: document.getElementById("sendChatReplyBtn"),
  drawerBody: document.getElementById("drawerBody"),
  progressFill: document.getElementById("progressFill"),
  progressMeta: document.getElementById("progressMeta"),
  skipDrawerBtn: document.getElementById("skipDrawerBtn"),
  submitDrawerBtn: document.getElementById("submitDrawerBtn"),
  continueChatBtn: document.getElementById("continueChatBtn"),
  newChatBtn: document.getElementById("newChatBtn"),
  toast: document.getElementById("toast")
};

let activeTaskPollTimer = null;

function showToast(text) {
  workflowRefs.toast.textContent = text;
  workflowRefs.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => workflowRefs.toast.classList.remove("show"), 1800);
}

function escapeHtml(text) {
  return String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function renderSystemTime() {
  if (!workflowRefs.systemTimeLabel) return;
  const now = new Date();
  if (isWorkflowEnglish) {
    workflowRefs.systemTimeLabel.textContent = now.toLocaleString("en-US", {
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
  workflowRefs.systemTimeLabel.textContent = `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
}

function localizeWorkflowChrome() {
  document.title = wt("Hubitos 自动任务", "Hubitos Workflows");
  const recentKicker = document.querySelector(".workflow-activity-panel .panel-kicker");
  if (recentKicker) recentKicker.textContent = wt("最近", "Recent");
  if (workflowRefs.refreshFeedBtn) workflowRefs.refreshFeedBtn.textContent = wt("刷新", "Refresh");
  const workflowHeading = document.querySelector(".workflow-panel .panel-head h3");
  if (workflowHeading) workflowHeading.textContent = wt("自动任务", "Workflows");
  const scopeButtons = workflowRefs.workflowTabs.querySelectorAll("[data-scope]");
  if (scopeButtons[0]) scopeButtons[0].textContent = wt("我的", "Mine");
  if (scopeButtons[1]) scopeButtons[1].textContent = wt("全部", "All");
  if (workflowRefs.sidePanelKicker) workflowRefs.sidePanelKicker.textContent = wt("执行面板", "Execution Panel");
  if (workflowRefs.sidePanelTitle) workflowRefs.sidePanelTitle.textContent = wt("右侧执行面板", "Right-side Execution Panel");
  if (workflowRefs.continueChatBtn) workflowRefs.continueChatBtn.textContent = wt("去对话里继续", "Continue in Chat");
  if (workflowRefs.closePanelBtn) workflowRefs.closePanelBtn.textContent = wt("关闭", "Close");
  if (workflowRefs.skipDrawerBtn) workflowRefs.skipDrawerBtn.textContent = wt("稍后补充", "Fill in Later");
  if (workflowRefs.submitDrawerBtn) workflowRefs.submitDrawerBtn.textContent = wt("提交并继续", "Submit and Continue");
  if (workflowRefs.closeChatPanelBtn) workflowRefs.closeChatPanelBtn.textContent = wt("关闭对话", "Close Chat");
  if (workflowRefs.sendChatReplyBtn) workflowRefs.sendChatReplyBtn.textContent = wt("发送", "Send");
  if (workflowRefs.openReportBtn) workflowRefs.openReportBtn.textContent = wt("打开 HTML 报告", "Open HTML Report");
  if (workflowRefs.editResultBtn) workflowRefs.editResultBtn.textContent = wt("修改条件", "Edit Conditions");
}

function renderSignals() {
  if (!workflowRefs.signalStack) return;
  workflowRefs.signalStack.innerHTML = workflowState.signals
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

function renderActivities() {
  if (!workflowRefs.activityList) return;
  workflowRefs.activityList.innerHTML = workflowState.activities
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

function getWorkflow(id) {
  return workflowState.workflows.find((item) => item.id === id);
}

function visibleWorkflows() {
  return workflowState.workflows.filter((item) => workflowState.scope === "all" || item.scope === "mine");
}

function renderWorkflowCards() {
  workflowRefs.workflowTabs.querySelectorAll("[data-scope]").forEach((button) => {
    button.classList.toggle("active", button.dataset.scope === workflowState.scope);
  });
  workflowRefs.workflowGrid.innerHTML = visibleWorkflows().map((workflow) => `
    <article class="workflow-card">
      <div class="workflow-card-head">
        <div>
          <div class="workflow-pill">${escapeHtml(workflow.platform)} · ${escapeHtml(workflow.mode)}</div>
          <h3>${escapeHtml(workflow.title)}</h3>
        </div>
        <div class="workflow-card-head">
          ${workflowState.scope === "mine" ? `<span class="workflow-status-badge">${escapeHtml(workflow.badge || workflow.mode)}</span>` : ""}
          <div class="workflow-card-foot">${escapeHtml(workflow.eta)}</div>
        </div>
      </div>
      <p>${escapeHtml(workflow.description)}</p>
      <div class="workflow-card-meta">
        ${workflow.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
      </div>
      <div class="workflow-card-foot">
        <span>${workflow.detailHref ? wt("进入详情页配置", "Open Detail Page") : workflow.backendTaskId ? wt("已连接本地调度，可直接查看最新结果", "Connected to the local scheduler, latest results are ready") : workflow.required.length ? wt(`还差 ${workflow.required.length} 项信息`, `${workflow.required.length} items missing`) : wt("现在就能运行", "Ready to Run")}</span>
        <div class="workflow-card-actions">
          <button class="workflow-secondary" type="button" data-chat-workflow="${workflow.id}">${escapeHtml(wt("去对话里继续", "Continue in Chat"))}</button>
          <button class="workflow-action" type="button" data-run-workflow="${workflow.id}">${escapeHtml(workflow.detailHref ? wt("查看详情", "View Details") : workflow.backendTaskId ? wt("查看结果", "View Results") : workflowState.scope === "mine" ? wt("补充设置", "Configure") : wt("立即使用", "Use Now"))}</button>
        </div>
      </div>
    </article>
  `).join("");
}

function renderChatPanel() {
  workflowRefs.chatThread.innerHTML = workflowState.chatMessages
    .map(
      (item) => `
        <div class="chat-bubble ${item.role}">
          ${escapeHtml(item.text)}
          <span class="chat-bubble-meta">${escapeHtml(item.meta || "")}</span>
        </div>
      `
    )
    .join("");
  workflowRefs.chatThread.scrollTop = workflowRefs.chatThread.scrollHeight;
}

function renderResult(result) {
  workflowState.activeReportUrl = result.reportUrl || "";
  workflowRefs.resultTitle.textContent = result.title;
  workflowRefs.resultMeta.textContent = result.meta;
  workflowRefs.resultStatus.textContent = result.status;
  const preview = result.preview || {};
  const previewItems = Array.isArray(preview.items) && preview.items.length
    ? preview.items
    : [preview.body, ...(result.generated || [])].filter(Boolean);
  workflowRefs.resultPreview.classList.toggle("hidden", !previewItems.length);
  workflowRefs.resultPreviewLabel.textContent = preview.label || wt("已输出内容", "Generated Output");
  workflowRefs.resultPreviewTitle.textContent = preview.title || wt("本次运行摘要", "Run Summary");
  workflowRefs.resultPreviewList.innerHTML = previewItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  workflowRefs.openReportBtn.classList.toggle("hidden", !workflowState.activeReportUrl);
  workflowRefs.resultCollected.innerHTML = result.collected.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  workflowRefs.resultGenerated.innerHTML = result.generated.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  workflowRefs.resultLogs.innerHTML = result.logs.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

async function requestCompetitorApi(path, options = {}) {
  const response = await fetch(`${COMPETITOR_API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || wt("竞品监控服务请求失败", "Competitor workflow request failed"));
  }
  return payload;
}

async function requestXDailyReportApi(path, options = {}) {
  const response = await fetch(`${X_DAILY_REPORT_API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || wt("X 日报服务请求失败", "X daily report request failed"));
  }
  return payload;
}

async function requestZaloApi(path, options = {}) {
  const response = await fetch(`${ZALO_API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || wt("Zalo 工作流服务请求失败", "Zalo workflow request failed"));
  }
  return payload;
}

async function fetchXDailyReportAuthStatus() {
  return requestXDailyReportApi("/x-daily-report/oauth/status");
}

async function startXDailyReportAuth() {
  return requestXDailyReportApi("/x-daily-report/oauth/start", {
    method: "POST"
  });
}

async function fetchZaloAuthStatus() {
  return requestZaloApi("/zalo/auth/status");
}

async function startZaloAuth(payload) {
  return requestZaloApi("/zalo/auth/start", {
    method: "POST",
    body: JSON.stringify(payload || {})
  });
}

function applyCompetitorTaskToWorkflow(task) {
  const workflow = getWorkflow("wf-competitor-monitoring");
  if (!workflow || !task) return;
  workflow.backendTaskId = task.id;
  workflow.badge = task.status || wt("已排期", "Scheduled");
  workflow.mode = wt("已接入真实运行", "Running with Local API");
  workflow.eta = task.nextRunAt
    ? wt(`下次运行：${task.nextRunAt.replace("T", " ").slice(0, 16)}`, `Next run: ${task.nextRunAt.replace("T", " ").slice(0, 16)}`)
    : workflow.eta;
  workflow.description = wt(
    `已接入本地竞品监控服务，当前追踪 ${task.websites.length} 个网站，并按「${task.cycleLabel}」自动生成报告。`,
    `Connected to the local competitor monitoring service, currently tracking ${task.websites.length} sites and generating reports on the "${task.cycleLabel}" schedule.`
  );
  workflow.result = task.result;
}

async function createCompetitorTask(answers) {
  const payload = await requestCompetitorApi("/competitor-workflows", {
    method: "POST",
    body: JSON.stringify({
      websites: answers.websites,
      cycle: answers.cycle,
    })
  });
  return payload.task;
}

async function createXDailyReportJob(answers) {
  const payload = await requestXDailyReportApi("/x-daily-report/jobs", {
    method: "POST",
    body: JSON.stringify({
      prompt: answers.prompt || "",
      accounts: answers.accounts || "",
      schedule: answers.schedule || "",
      maxResults: answers.maxResults || "",
    })
  });
  return payload.job;
}

async function createZaloJob(answers) {
  const payload = await requestZaloApi("/zalo/jobs", {
    method: "POST",
    body: JSON.stringify({
      mode: answers.mode || "direct",
      oaId: answers.oaId || "",
      goal: answers.goal || "",
      brandVoice: answers.brandVoice || "",
      handoffRule: answers.handoffRule || "",
      groupStrategy: answers.groupStrategy || "",
      groupId: answers.groupId || "",
      openingMessage: answers.openingMessage || "",
      replyPolicy: answers.replyPolicy || "",
      frequencyLimit: answers.frequencyLimit || "",
    })
  });
  return payload.job;
}

async function runZaloJob(jobId, payload = {}) {
  const response = await requestZaloApi(`/zalo/jobs/${jobId}/run`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.job;
}

async function fetchXDailyReportJob(jobId) {
  const payload = await requestXDailyReportApi(`/x-daily-report/jobs/${jobId}`);
  return payload.job;
}

function applyXDailyReportJobToWorkflow(job) {
  const workflow = getWorkflow("wf-x-daily-report");
  if (!workflow || !job) return;
  workflow.backendTaskId = job.id;
  workflow.badge = job.status || wt("已排期", "Scheduled");
  workflow.mode = wt("已接入真实运行", "Running with Local API");
  workflow.eta = job.nextRunAt
    ? wt(`下次运行：${job.nextRunAt.replace("T", " ").slice(0, 16)}`, `Next run: ${job.nextRunAt.replace("T", " ").slice(0, 16)}`)
    : workflow.eta;
  workflow.description = wt(
    `已接入本地 X 日报服务，当前按「${job.schedule}」固定生成 HTML 日报。`,
    `Connected to the local X daily report service, currently generating HTML reports on the fixed schedule "${job.schedule}".`
  );
  workflow.result = job.result;
}

function applyZaloJobToWorkflow(job) {
  const targetWorkflowId = job.mode === "group" ? "wf-zalo-group-chat" : "wf-zalo-agent";
  const workflow = getWorkflow(targetWorkflowId);
  if (!workflow || !job) return;
  workflow.backendTaskId = job.id;
  workflow.badge = job.status || wt("已排期", "Scheduled");
  workflow.mode = wt("已接入真实运行", "Running with Local API");
  workflow.eta = job.updatedAt
    ? wt(`最近更新：${job.updatedAt.replace("T", " ").slice(0, 16)}`, `Updated: ${job.updatedAt.replace("T", " ").slice(0, 16)}`)
    : workflow.eta;
  workflow.description = wt(
    `已接入本地 Zalo 渠道服务，当前绑定 ${job.oaId || "未命名 OA"}，可继续联调 webhook、自动回复和人工接管规则。`,
    `Connected to the local Zalo channel service, currently bound to ${job.oaId || "an unnamed OA"}. You can now continue wiring the webhook, auto replies, and human handoff rules.`
  );
  workflow.result = job.result;
}

async function fetchCompetitorTask(taskId) {
  const payload = await requestCompetitorApi(`/competitor-workflows/${taskId}`);
  return payload.task;
}

async function fetchZaloJob(jobId) {
  const payload = await requestZaloApi(`/zalo/jobs/${jobId}`);
  return payload.job;
}

async function hydrateCompetitorWorkflowFromApi() {
  try {
    const payload = await requestCompetitorApi("/competitor-workflows");
    const latestTask = (payload.tasks || [])[0];
    if (!latestTask) return;
    applyCompetitorTaskToWorkflow(latestTask);
    renderWorkflowCards();
  } catch (error) {
    // Keep the static prototype usable even if the local runner isn't active.
  }
}

async function hydrateXDailyReportWorkflowFromApi() {
  try {
    const payload = await requestXDailyReportApi("/x-daily-report/jobs");
    const latestJob = (payload.jobs || [])[0];
    if (!latestJob) return;
    applyXDailyReportJobToWorkflow(latestJob);
    renderWorkflowCards();
  } catch (error) {
    // Keep the static prototype usable even if the local runner isn't active.
  }
}

async function hydrateZaloWorkflowFromApi() {
  try {
    const payload = await requestZaloApi("/zalo/jobs");
    const jobs = payload.jobs || [];
    const latestDirect = jobs.find((job) => job.mode !== "group");
    const latestGroup = jobs.find((job) => job.mode === "group");
    if (latestDirect) applyZaloJobToWorkflow(latestDirect);
    if (latestGroup) applyZaloJobToWorkflow(latestGroup);
    renderWorkflowCards();
  } catch (error) {
    // Keep the static prototype usable even if the local runner isn't active.
  }
}

function stopActiveTaskPolling() {
  if (!activeTaskPollTimer) return;
  window.clearInterval(activeTaskPollTimer);
  activeTaskPollTimer = null;
}

function startCompetitorTaskPolling(taskId) {
  stopActiveTaskPolling();
  if (!taskId) return;
  activeTaskPollTimer = window.setInterval(async () => {
    try {
      const task = await fetchCompetitorTask(taskId);
      applyCompetitorTaskToWorkflow(task);
      if (workflowState.panelWorkflowId === "wf-competitor-monitoring" && workflowState.panelMode === "result") {
        renderResult(task.result);
      }
      renderWorkflowCards();
    } catch (error) {
      stopActiveTaskPolling();
    }
  }, 20000);
}

function startXDailyReportPolling(jobId) {
  stopActiveTaskPolling();
  if (!jobId) return;
  activeTaskPollTimer = window.setInterval(async () => {
    try {
      const job = await fetchXDailyReportJob(jobId);
      applyXDailyReportJobToWorkflow(job);
      if (workflowState.panelWorkflowId === "wf-x-daily-report" && workflowState.panelMode === "result") {
        renderResult(job.result);
      }
      renderWorkflowCards();
    } catch (error) {
      stopActiveTaskPolling();
    }
  }, 20000);
}

function startZaloJobPolling(jobId) {
  stopActiveTaskPolling();
  if (!jobId) return;
  activeTaskPollTimer = window.setInterval(async () => {
    try {
      const job = await fetchZaloJob(jobId);
      applyZaloJobToWorkflow(job);
      if ((workflowState.panelWorkflowId === "wf-zalo-agent" || workflowState.panelWorkflowId === "wf-zalo-group-chat") && workflowState.panelMode === "result") {
        renderResult(job.result);
      }
      renderWorkflowCards();
    } catch (error) {
      stopActiveTaskPolling();
    }
  }, 20000);
}

function buildResultFromAnswers(workflow, answers) {
  if (workflow.id === "wf-x-daily-report") {
    const promptText = answers.prompt || ""
    const keywords = (answers.keywords || answers.prompt || "")
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
    const accounts = (answers.accounts || "")
      .split(/\n|,/)
      .map((item) => item.trim().replace(/^@/, ""))
      .filter(Boolean);
    const schedule = answers.schedule || wt("每天 09:00", "Every day 09:00");
    const maxResults = answers.maxResults || "10";
    return {
      title: workflow.title,
      meta: wt(
        `已配置 ${keywords.length} 个关键词、${accounts.length} 个账号，并将在「${schedule}」固定生成 HTML 日报`,
        `${keywords.length} keywords and ${accounts.length} accounts configured. HTML daily reports will be generated at "${schedule}"`
      ),
      status: wt("已排期", "Scheduled"),
      reportUrl: "./workflows-x-daily-report-report.html",
      preview: {
        label: wt("已输出内容", "Generated Output"),
        title: wt("X 日报运行摘要", "X Daily Report Run Summary"),
        items: [
          wt(`抓取意图：${promptText || "未设置"}`, `Fetch intent: ${promptText || "Not set"}`),
          wt(`运行方式：按固定时间「${schedule}」抓取 X 内容`, `Run mode: fetch X content on the fixed schedule "${schedule}"`),
          wt(`抓取意图：${promptText || "未设置"}`, `Fetch intent: ${promptText || "Not set"}`),
        wt(`抽取关键词：${keywords.join(" / ") || "未设置"}`, `Extracted keywords: ${keywords.join(" / ") || "Not set"}`),
          wt(`账号：${accounts.map((item) => `@${item}`).join(" / ") || "未设置"}`, `Accounts: ${accounts.map((item) => `@${item}`).join(" / ") || "Not set"}`),
          wt(`每项抓取上限：${maxResults}`, `Max results per query: ${maxResults}`),
        ]
      },
      collected: [
        wt(`抓取意图：${promptText || "未设置"}`, `Fetch intent: ${promptText || "Not set"}`),
        wt(`抽取关键词：${keywords.join(" / ") || "未设置"}`, `Extracted keywords: ${keywords.join(" / ") || "Not set"}`),
        wt(`账号：${accounts.map((item) => `@${item}`).join(" / ") || "未设置"}`, `Accounts: ${accounts.map((item) => `@${item}`).join(" / ") || "Not set"}`),
        wt(`固定时间：${schedule}`, `Schedule: ${schedule}`)
      ],
      generated: [
        wt("输出 1 份按日期命名的 HTML 日报", "Generate 1 date-stamped HTML daily report"),
        wt("报告内包含 Top 5 趋势卡片与分组推文列表", "Include Top 5 trending cards and grouped tweet lists"),
        wt("按抽取关键词和账号组织内容结构", "Organize report sections by extracted keywords and accounts"),
        wt("默认执行内容质量过滤、引流词过滤和高危链接过滤", "Apply quality, spam, and risky-link filters by default")
      ],
      logs: [
        wt("已挂载 x-daily-report Skill 配置", "Mounted x-daily-report Skill configuration"),
        wt("已记录 OAuth、抓取条件与固定时间", "Recorded OAuth, fetch conditions, and schedule"),
        wt("下一步可直接打开 HTML 日报页预览结构", "Next step: open the HTML daily report page to preview the structure")
      ]
    };
  }
  if (workflow.id === "wf-competitor-monitoring") {
    const websites = (answers.websites || "")
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
    const cycle = answers.cycle || wt("未设置", "Not set");
    const focus = answers.focus || wt("默认关注产品、定价与营销动作", "Default focus on product, pricing, and marketing moves");
    const nextRun = isWorkflowEnglish ? "Next run scheduled after the current cycle is saved" : "保存后将按设定周期自动执行下一轮扫描";
    return {
      title: workflow.title,
      meta: wt(`已录入 ${websites.length} 个竞品网站，系统会按「${cycle}」自动输出竞品报告`, `${websites.length} competitor sites added, reports will be generated on the "${cycle}" schedule`),
      status: wt("已排期", "Scheduled"),
      preview: {
        label: wt("已输出内容", "Generated Output"),
        title: wt("首版竞品报告摘要", "First Competitor Report Summary"),
        items: [
          wt(`监控站点数：${websites.length || 0}`, `Monitored sites: ${websites.length || 0}`),
          wt(`运行周期：${cycle}`, `Schedule: ${cycle}`),
          wt(`本轮重点：${focus}`, `Current focus: ${focus}`),
          wt("检测到变化时，会在报告中标出变化点、影响判断和建议动作。", "When changes are detected, the report will highlight change points, impact, and suggested actions.")
        ]
      },
      collected: [
        wt(`已建立监控站点清单：${websites.join(" / ") || "等待补充站点"}`, `Monitoring list created: ${websites.join(" / ") || "waiting for site input"}`),
        wt(`已记录分析重点：${focus}`, `Tracked focus areas: ${focus}`),
        nextRun
      ],
      generated: [
        wt("每个周期自动产出 1 份竞品分析报告", "Generate 1 competitor analysis report every cycle"),
        wt("报告内包含官网变化摘要、重点页面对比和动作提醒", "Each report includes site-change summaries, key page comparisons, and action alerts"),
        wt("当检测到明显变化时，附加高优先级提醒与建议跟进项", "Attach high-priority alerts and follow-up suggestions when major changes are detected")
      ],
      logs: [
        wt("监控任务已创建并绑定周期调度", "Monitoring workflow created and linked to its schedule"),
        wt("首轮将抓取首页、价格页和重点功能页面", "The first run will scan the homepage, pricing page, and key feature pages"),
        wt("后续报告可在对话工作台继续追问和补充结论", "Future reports can be refined further in the chat workspace")
      ]
    };
  }
  if (workflow.id === "wf-zalo-agent") {
    const oaId = answers.oaId || wt("未填写", "Not set");
    const goal = answers.goal || wt("未设置", "Not set");
    const brandVoice = answers.brandVoice || wt("未设置", "Not set");
    const handoffRule = answers.handoffRule || wt("低置信度转人工", "Low confidence -> human handoff");
    const groupStrategy = answers.groupStrategy || wt("暂不启用群内自动聊天", "Group chat autopilot disabled for now");
    return {
      title: workflow.title,
      meta: wt(
        `已绑定 ${oaId}，当前会先处理 1 对 1 接待与转人工，群聊策略作为下一阶段预留。`,
        `Bound to ${oaId}. The first version focuses on 1:1 reception and human handoff, while group-chat strategy stays reserved for the next phase.`
      ),
      status: wt("已配置", "Configured"),
      preview: {
        label: wt("已输出内容", "Generated Output"),
        title: wt("Zalo Agent 运行摘要", "Zalo Agent Run Summary"),
        items: [
          wt(`绑定 OA：${oaId}`, `Bound OA: ${oaId}`),
          wt(`执行目标：${goal}`, `Execution goal: ${goal}`),
          wt(`品牌语气：${brandVoice}`, `Brand voice: ${brandVoice}`),
          wt(`转人工规则：${handoffRule}`, `Handoff rule: ${handoffRule}`),
          wt(`群聊策略：${groupStrategy}`, `Group strategy: ${groupStrategy}`)
        ]
      },
      collected: [
        wt(`已记录 OA / App 标识：${oaId}`, `Recorded OA / app identifier: ${oaId}`),
        wt(`已记录执行目标：${goal}`, `Recorded execution goal: ${goal}`),
        wt("下一步可直接联调 webhook 和回消息接口。", "Next step: wire up the webhook and outbound reply endpoints.")
      ],
      generated: [
        wt("生成 1 条欢迎语模板", "Generated 1 welcome-message template"),
        wt("生成 1 套低置信度转人工规则", "Generated 1 low-confidence human handoff rule set"),
        wt("预留群聊运营与广播策略位", "Reserved group operations and broadcast strategy slots")
      ],
      logs: [
        wt("已保存本地 Zalo 配置", "Saved the local Zalo configuration"),
        wt("第一阶段先聚焦 OA webhook + 自动回复 + 转人工", "Phase 1 focuses on OA webhook + auto reply + human handoff"),
        wt("群聊能力需在确认官方权限后再正式开启", "Group-chat support should be enabled only after confirming official permissions")
      ]
    };
  }
  if (workflow.id === "wf-zalo-group-chat") {
    const oaId = answers.oaId || wt("未填写", "Not set");
    const groupId = answers.groupId || wt("未填写", "Not set");
    const openingMessage = answers.openingMessage || wt("未设置", "Not set");
    const replyPolicy = answers.replyPolicy || wt("未设置", "Not set");
    const frequencyLimit = answers.frequencyLimit || wt("未设置", "Not set");
    return {
      title: workflow.title,
      meta: wt(
        `已绑定 ${oaId}，目标群组 ${groupId}，当前先按「${frequencyLimit}」做自动发言与控频模拟。`,
        `Bound to ${oaId}, targeting group ${groupId}. The first version simulates auto-speaking and rate limits with "${frequencyLimit}".`
      ),
      status: wt("已配置", "Configured"),
      preview: {
        label: wt("已输出内容", "Generated Output"),
        title: wt("Zalo 群聊运行摘要", "Zalo Group Run Summary"),
        items: [
          wt(`绑定 OA：${oaId}`, `Bound OA: ${oaId}`),
          wt(`目标群组：${groupId}`, `Target group: ${groupId}`),
          wt(`首条话术：${openingMessage}`, `Opening line: ${openingMessage}`),
          wt(`回复策略：${replyPolicy}`, `Reply policy: ${replyPolicy}`),
          wt(`控频规则：${frequencyLimit}`, `Rate limit: ${frequencyLimit}`)
        ]
      },
      collected: [
        wt(`已记录群组 ID：${groupId}`, `Recorded group ID: ${groupId}`),
        wt(`已记录首条话术：${openingMessage}`, `Recorded opening message: ${openingMessage}`),
        wt("下一步可模拟一轮群内发言与回复。", "Next step: simulate one round of group speaking and replies.")
      ],
      generated: [
        wt("生成 1 条群欢迎话术", "Generated 1 group welcome line"),
        wt("生成 1 套群内回复边界规则", "Generated 1 set of in-group reply boundaries"),
        wt("生成 1 条控频建议", "Generated 1 rate-limit suggestion")
      ],
      logs: [
        wt("已保存群聊工作流配置", "Saved the group-chat workflow configuration"),
        wt("当前先用本地模拟模式演练群内自动发言", "Currently rehearsing in local simulation mode"),
        wt("真实群聊能力需确认官方权限与群接口边界", "Real group-chat support still depends on official permissions and group API boundaries")
      ]
    };
  }
  const values = Object.values(answers);
  return {
    title: workflow.title,
    meta: `已补齐 ${values.length} 项信息，系统正在用最新上下文运行这个自动任务`,
    status: "已配置",
    collected: [`已记录自动任务关键信息：${values.join(" / ")}`, `复用 ${workflow.platform} 已授权账号与品牌语气配置`, "开始抓取相关来源并生成候选内容池"],
    generated: ["生成 2 条待发布内容草案", "生成 3 条可用于评论区互动的回复建议", "输出 1 条推荐的人工作业接管说明"],
    logs: ["系统已根据补充信息完成回填", "自动任务模板已自动挂载默认执行策略", "下一步可进入聊天工作台继续细化结果"]
  };
}

function saveActiveWorkflow(workflow, answers = {}) {
  const payload = {
    id: workflow.id,
    backendTaskId: workflow.backendTaskId || workflowState.activeBackendTaskId || null,
    title: workflow.title,
    platform: workflow.platform,
    mode: workflow.mode,
    prompt: workflow.prompt,
    answers,
    missingCount: workflow.required.length - Object.keys(answers).length
  };
  window.localStorage.setItem(ACTIVE_WORKFLOW_KEY, JSON.stringify(payload));
}

function goToChatWithWorkflow(workflow, answers = {}) {
  saveActiveWorkflow(workflow, answers);
  window.location.href = `../chat/chat-workspace.html?prompt=${encodeURIComponent(workflow.prompt || workflow.title)}&source=workflow`;
}

function hydrateWorkflowFromQuery() {
  try {
    const url = new URL(window.location.href);
    const workflowId = url.searchParams.get("workflow");
    if (!workflowId) return;
    const workflow = getWorkflow(workflowId);
    if (!workflow) return;
    workflowState.panelWorkflowId = workflow.id;
    if (workflow.required.length) {
      workflowState.panelMode = "form";
      renderDrawer();
      renderSidePanel();
      return;
    }
    runWorkflow(workflow);
  } catch (error) {
    // Ignore malformed URLs.
  }
}

function runWorkflow(workflow, answers = {}) {
  if (workflow.detailHref) {
    window.location.href = workflow.detailHref;
    return;
  }
  workflowState.activeWorkflowId = workflow.id;
  workflowState.panelWorkflowId = workflow.id;
  workflowState.panelMode = "result";
  renderResult(workflow.result || buildResultFromAnswers(workflow, answers));
  renderSidePanel();
  saveActiveWorkflow(workflow, answers);
  showToast(`${workflow.title} 已开始执行。`);
}

function openFormPanel(workflow) {
  workflowState.panelWorkflowId = workflow.id;
  workflowState.panelMode = "form";
  workflowState.draftAnswers = {};
  renderDrawer();
  renderSidePanel();
  if (workflow.id === "wf-x-daily-report") {
    syncXDailyReportAuthStatus();
  }
  if (workflow.id === "wf-zalo-agent" || workflow.id === "wf-zalo-group-chat") {
    syncZaloAuthStatus();
  }
}

function openChatPanel(workflow) {
  workflowState.panelWorkflowId = workflow.id;
  workflowState.panelMode = "chat";
  workflowState.chatMessages = [
    { role: "system", text: `当前正在接管「${workflow.title}」的运行链路。你可以直接调整发布内容、评论策略或执行节奏。`, meta: `来源：${workflow.platform} 自动任务对话接管` },
    { role: "system", text: "系统已经接入最近一次执行上下文，你可以继续补充策略、内容或节奏要求。", meta: `来源：${workflow.platform} 自动任务上下文` }
  ];
  renderChatPanel();
  renderSidePanel();
}

function resetSidePanel() {
  stopActiveTaskPolling();
  workflowState.panelWorkflowId = null;
  workflowState.panelMode = "empty";
  workflowState.draftAnswers = {};
  workflowState.chatMessages = [];
  renderSidePanel();
}

function renderDrawer() {
  const workflow = getWorkflow(workflowState.panelWorkflowId);
  if (!workflow) return;
  const required = workflow.required;
  const authStatus = workflowState.authStatus[workflow.id] || {};
  workflowRefs.drawerBody.innerHTML = `
    <div class="drawer-form">
      ${required
        .map((field) => {
          const value = workflowState.draftAnswers[field.key] || "";
          if (field.type === "auth") {
            const authMessage = authStatus.checked
              ? authStatus.message || wt("已完成当前渠道的本地状态检查。", "Finished checking the local channel status.")
              : workflow.id === "wf-zalo-agent" || workflow.id === "wf-zalo-group-chat"
                ? wt("点击后会保存本地 OA / App 配置，并标记当前 Zalo 工作流为可联调状态。", "Click to save the local OA / app config and mark this Zalo workflow ready for integration testing.")
                : wt("点击后会检测本机 token；如果未授权，会尝试拉起本地 OAuth 流程。", "Click to check the local token. If none is found, a local OAuth flow will be started.");
            return `
              <section class="drawer-field">
                <div class="drawer-field-header">
                  <div>
                    <div class="drawer-field-label">${escapeHtml(field.label)}</div>
                    <div class="drawer-field-question">${escapeHtml(field.question)}</div>
                  </div>
                  <button class="drawer-auth-btn ${value ? "done" : ""}" type="button" data-auth-field="${field.key}">
                    ${value ? "已授权完成" : escapeHtml(field.actionText || "前往授权")}
                  </button>
                </div>
                <div class="drawer-field-meta">${escapeHtml(authMessage)}</div>
              </section>
            `;
          }

          if (field.type === "textarea") {
            return `
              <section class="drawer-field">
                <div class="drawer-field-label">${escapeHtml(field.label)}</div>
                <div class="drawer-field-question">${escapeHtml(field.question)}</div>
                <textarea class="drawer-textarea" data-input-field="${field.key}" placeholder="${escapeHtml(field.placeholder || "请输入")}">${escapeHtml(value)}</textarea>
              </section>
            `;
          }

          return `
            <section class="drawer-field">
              <div class="drawer-field-label">${escapeHtml(field.label)}</div>
              <div class="drawer-field-question">${escapeHtml(field.question)}</div>
              <input class="drawer-input" data-input-field="${field.key}" value="${escapeHtml(value)}" placeholder="${escapeHtml(field.placeholder || "请输入")}" />
            </section>
          `;
        })
        .join("")}
    </div>
  `;
  updateDrawerProgress();
}

function updateDrawerProgress() {
  const workflow = getWorkflow(workflowState.panelWorkflowId);
  if (!workflow) return;
  const required = workflow.required;
  const completedCount = required.filter((field) => {
    if (field.optional) return true;
    const value = workflowState.draftAnswers[field.key];
    return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
  }).length;
  const progress = required.length ? Math.round((completedCount / required.length) * 100) : 100;
  const requiredOnly = required.filter((field) => !field.optional);
  const remainingRequired = requiredOnly.filter((field) => {
    const value = workflowState.draftAnswers[field.key];
    return !(typeof value === "string" ? value.trim().length > 0 : Boolean(value));
  }).length;
  workflowRefs.progressFill.style.width = `${Math.max(progress, 10)}%`;
  workflowRefs.progressMeta.textContent = remainingRequired > 0 ? `还差 ${remainingRequired} 项即可运行` : "必填信息已补齐，提交后即可运行";
}

function renderSidePanel() {
  const workflow = getWorkflow(workflowState.panelWorkflowId);
  const mode = workflowState.panelMode;
  const showPanel = mode !== "empty";
  workflowRefs.executionPanel.classList.toggle("hidden", !showPanel);
  workflowRefs.contentGrid.classList.toggle("single-column", !showPanel);
  workflowRefs.formCard.classList.toggle("hidden", mode !== "form");
  workflowRefs.resultCard.classList.toggle("hidden", mode !== "result");
  workflowRefs.chatCard.classList.toggle("hidden", mode !== "chat");
  workflowRefs.continueChatBtn.classList.toggle("hidden", mode !== "result");
  workflowRefs.closePanelBtn.classList.toggle("hidden", mode === "empty");

  if (mode === "form" && workflow) {
    workflowRefs.sidePanelKicker.textContent = "补参面板";
    workflowRefs.sidePanelTitle.textContent = `${workflow.title} · 补齐信息`;
    return;
  }

  if (mode === "chat" && workflow) {
    workflowRefs.sidePanelKicker.textContent = "对话接管";
    workflowRefs.sidePanelTitle.textContent = `${workflow.title} · 右侧对话`;
    return;
  }

  if (mode === "result" && workflow) {
    workflowRefs.sidePanelKicker.textContent = "Execution Result";
    workflowRefs.sidePanelTitle.textContent = "当前执行结果";
    return;
  }

  workflowRefs.sidePanelKicker.textContent = "执行面板";
  workflowRefs.sidePanelTitle.textContent = "右侧工作面板";
}

async function submitDrawerAnswer() {
  const workflow = getWorkflow(workflowState.panelWorkflowId);
  if (!workflow) return;
  const nextAnswers = {};
  workflow.required.forEach((field) => {
    if (field.type === "auth") {
      nextAnswers[field.key] = workflowState.draftAnswers[field.key] || "";
      return;
    }
    const input = workflowRefs.drawerBody.querySelector(`[data-input-field="${field.key}"]`);
    nextAnswers[field.key] = input ? input.value.trim() : "";
  });

  const missingField = workflow.required.find((field) => {
    if (field.optional) return false;
    const value = field.type === "auth" ? workflowState.draftAnswers[field.key] : nextAnswers[field.key];
    return !value || !String(value).trim();
  });

  workflowState.draftAnswers = { ...workflowState.draftAnswers, ...nextAnswers };

  if (missingField) {
    renderDrawer();
    showToast(`还缺少“${missingField.label}”，补齐后我再继续。`);
    return;
  }

  if (workflow.id === "wf-competitor-monitoring") {
    workflowRefs.submitDrawerBtn.disabled = true;
    workflowRefs.submitDrawerBtn.textContent = wt("正在创建并首轮运行...", "Creating and running first scan...");
    try {
      const task = await createCompetitorTask(workflowState.draftAnswers);
      workflowState.activeBackendTaskId = task.id;
      workflow.backendTaskId = task.id;
      applyCompetitorTaskToWorkflow(task);
      workflowState.activeWorkflowId = workflow.id;
      workflowState.panelMode = "result";
      renderResult(task.result);
      renderSidePanel();
      renderWorkflowCards();
      saveActiveWorkflow(workflow, workflowState.draftAnswers);
      startCompetitorTaskPolling(task.id);
      showToast(wt("竞品监控任务已真实启动。", "Competitor monitoring is now running for real."));
    } catch (error) {
      showToast(
        wt(
          "本地竞品监控服务未启动。先运行 `python3 scripts/competitor_workflow_server.py`。",
          "The local competitor service is not running. Start it with `python3 scripts/competitor_workflow_server.py`."
        )
      );
    } finally {
      workflowRefs.submitDrawerBtn.disabled = false;
      workflowRefs.submitDrawerBtn.textContent = wt("提交并继续", "Submit and Continue");
    }
    return;
  }

  if (workflow.id === "wf-x-daily-report") {
    workflowRefs.submitDrawerBtn.disabled = true;
    workflowRefs.submitDrawerBtn.textContent = wt("正在创建并首轮运行...", "Creating and running first report...");
    try {
      const job = await createXDailyReportJob(workflowState.draftAnswers);
      workflowState.activeBackendTaskId = job.id;
      workflow.backendTaskId = job.id;
      applyXDailyReportJobToWorkflow(job);
      workflowState.activeWorkflowId = workflow.id;
      workflowState.panelMode = "result";
      renderResult(job.result);
      renderSidePanel();
      renderWorkflowCards();
      saveActiveWorkflow(workflow, workflowState.draftAnswers);
      startXDailyReportPolling(job.id);
      showToast(wt("X 日报任务已真实启动。", "X daily report workflow is now running for real."));
    } catch (error) {
      showToast(error.message || wt("X 日报任务启动失败。", "Failed to start the X daily report workflow."));
    } finally {
      workflowRefs.submitDrawerBtn.disabled = false;
      workflowRefs.submitDrawerBtn.textContent = wt("提交并继续", "Submit and Continue");
    }
    return;
  }

  if (workflow.id === "wf-zalo-agent") {
    workflowRefs.submitDrawerBtn.disabled = true;
    workflowRefs.submitDrawerBtn.textContent = wt("正在创建并初始化...", "Creating and initializing...");
    try {
      const job = await createZaloJob(workflowState.draftAnswers);
      workflowState.activeBackendTaskId = job.id;
      workflow.backendTaskId = job.id;
      applyZaloJobToWorkflow(job);
      workflowState.activeWorkflowId = workflow.id;
      workflowState.panelMode = "result";
      renderResult(job.result);
      renderSidePanel();
      renderWorkflowCards();
      saveActiveWorkflow(workflow, workflowState.draftAnswers);
      startZaloJobPolling(job.id);
      showToast(wt("Zalo Agent 工作流已真实创建。", "The Zalo agent workflow has been created for real."));
    } catch (error) {
      showToast(
        error.message || wt(
          "本地 Zalo 服务未启动。先运行 `python3 scripts/zalo_channel_server.py`。",
          "The local Zalo service is not running. Start it with `python3 scripts/zalo_channel_server.py`."
        )
      );
    } finally {
      workflowRefs.submitDrawerBtn.disabled = false;
      workflowRefs.submitDrawerBtn.textContent = wt("提交并继续", "Submit and Continue");
    }
    return;
  }
  if (workflow.id === "wf-zalo-group-chat") {
    workflowRefs.submitDrawerBtn.disabled = true;
    workflowRefs.submitDrawerBtn.textContent = wt("正在创建并模拟群聊...", "Creating and simulating group chat...");
    try {
      const payload = { ...workflowState.draftAnswers, mode: "group", groupStrategy: workflowState.draftAnswers.replyPolicy || "" };
      const job = await createZaloJob(payload);
      workflowState.activeBackendTaskId = job.id;
      workflow.backendTaskId = job.id;
      applyZaloJobToWorkflow(job);
      const executed = await runZaloJob(job.id, {
        mode: "group",
        groupId: workflowState.draftAnswers.groupId || "",
        text: workflowState.draftAnswers.openingMessage || "",
      });
      applyZaloJobToWorkflow(executed);
      workflowState.activeWorkflowId = workflow.id;
      workflowState.panelMode = "result";
      renderResult(executed.result);
      renderSidePanel();
      renderWorkflowCards();
      saveActiveWorkflow(workflow, workflowState.draftAnswers);
      startZaloJobPolling(job.id);
      showToast(wt("Zalo 群聊工作流已开始模拟运行。", "The Zalo group-chat workflow is now running in simulation mode."));
    } catch (error) {
      showToast(
        error.message || wt(
          "Zalo 群聊工作流启动失败，请确认本地服务已启动。",
          "Failed to start the Zalo group-chat workflow. Confirm the local service is running."
        )
      );
    } finally {
      workflowRefs.submitDrawerBtn.disabled = false;
      workflowRefs.submitDrawerBtn.textContent = wt("提交并继续", "Submit and Continue");
    }
    return;
  }

  runWorkflow(workflow, workflowState.draftAnswers);
}

function initWorkflowEvents() {
  document.addEventListener("click", (event) => {
    const navBtn = event.target.closest("[data-nav-target]");
    if (navBtn) {
      window.location.href = navBtn.dataset.navTarget;
      return;
    }
    const runBtn = event.target.closest("[data-run-workflow]");
    if (runBtn) {
      const workflow = getWorkflow(runBtn.dataset.runWorkflow);
      if (!workflow) return;
      if (workflow.id === "wf-competitor-monitoring" && workflow.backendTaskId && workflow.result) {
        workflowState.activeBackendTaskId = workflow.backendTaskId;
        workflowState.activeWorkflowId = workflow.id;
        workflowState.panelWorkflowId = workflow.id;
        workflowState.panelMode = "result";
        renderResult(workflow.result);
        renderSidePanel();
        startCompetitorTaskPolling(workflow.backendTaskId);
        return;
      }
      if (workflow.id === "wf-x-daily-report" && workflow.backendTaskId && workflow.result) {
        workflowState.activeBackendTaskId = workflow.backendTaskId;
        workflowState.activeWorkflowId = workflow.id;
        workflowState.panelWorkflowId = workflow.id;
        workflowState.panelMode = "result";
        renderResult(workflow.result);
        renderSidePanel();
        startXDailyReportPolling(workflow.backendTaskId);
        return;
      }
      if ((workflow.id === "wf-zalo-agent" || workflow.id === "wf-zalo-group-chat") && workflow.backendTaskId && workflow.result) {
        workflowState.activeBackendTaskId = workflow.backendTaskId;
        workflowState.activeWorkflowId = workflow.id;
        workflowState.panelWorkflowId = workflow.id;
        workflowState.panelMode = "result";
        renderResult(workflow.result);
        renderSidePanel();
        startZaloJobPolling(workflow.backendTaskId);
        return;
      }
      if (workflow.required.length) openFormPanel(workflow);
      else runWorkflow(workflow);
      return;
    }
    const chatBtn = event.target.closest("[data-chat-workflow]");
    if (chatBtn) {
      const workflow = getWorkflow(chatBtn.dataset.chatWorkflow);
      if (!workflow) return;
      if (workflowState.scope === "mine") {
        openChatPanel(workflow);
      } else {
        goToChatWithWorkflow(workflow);
      }
    }
  });
  workflowRefs.workflowTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-scope]");
    if (!button) return;
    workflowState.scope = button.dataset.scope;
    renderWorkflowCards();
  });

  if (workflowRefs.refreshFeedBtn) {
    workflowRefs.refreshFeedBtn.addEventListener("click", () => {
      showToast("已刷新最近动态。");
    });
  }

  workflowRefs.closePanelBtn.addEventListener("click", resetSidePanel);
  workflowRefs.closeChatPanelBtn.addEventListener("click", resetSidePanel);
  workflowRefs.skipDrawerBtn.addEventListener("click", () => {
    resetSidePanel();
    showToast("已保留这个自动任务，稍后可继续补充。");
  });
  workflowRefs.submitDrawerBtn.addEventListener("click", submitDrawerAnswer);
  workflowRefs.drawerBody.addEventListener("input", (event) => {
    const input = event.target.closest("[data-input-field]");
    if (!input) return;
    workflowState.draftAnswers[input.dataset.inputField] = input.value;
    updateDrawerProgress();
  });
  workflowRefs.drawerBody.addEventListener("click", (event) => {
    const button = event.target.closest("[data-auth-field]");
    if (!button) return;
    const fieldKey = button.dataset.authField;
    if (workflowState.panelWorkflowId === "wf-x-daily-report") {
      handleXDailyReportAuth(fieldKey);
      return;
    }
    if (workflowState.panelWorkflowId === "wf-zalo-agent" || workflowState.panelWorkflowId === "wf-zalo-group-chat") {
      handleZaloAuth(fieldKey);
      return;
    }
    workflowState.draftAnswers[fieldKey] = "已授权";
    renderDrawer();
    showToast("已跳转授权流程，并标记为授权完成。");
  });
  workflowRefs.continueChatBtn.addEventListener("click", () => {
    const workflow = getWorkflow(workflowState.activeWorkflowId) || workflowState.workflows[0];
    goToChatWithWorkflow(workflow, workflowState.draftAnswers);
  });
  workflowRefs.sendChatReplyBtn.addEventListener("click", () => {
    const text = workflowRefs.chatReplyInput.value.trim();
    if (!text) {
      showToast("先输入你要接管或调整的内容。");
      return;
    }
    workflowState.chatMessages.push({ role: "user", text, meta: "来源：用户接管输入" });
    workflowState.chatMessages.push({ role: "system", text: "已记录这条调整指令，系统会基于当前自动任务继续执行并同步右侧运行状态。", meta: "来源：自动任务执行编排器" });
    workflowRefs.chatReplyInput.value = "";
    renderChatPanel();
    showToast("已写入当前自动任务对话链路。");
  });
  workflowRefs.openReportBtn.addEventListener("click", () => {
    if (!workflowState.activeReportUrl) {
      showToast(wt("这次运行还没有可打开的 HTML 报告。", "There is no HTML report available for this run yet."));
      return;
    }
    window.open(workflowState.activeReportUrl, "_blank", "noopener,noreferrer");
  });
  workflowRefs.editResultBtn.addEventListener("click", () => {
    const workflow = getWorkflow(workflowState.panelWorkflowId);
    if (!workflow) return;
    workflowState.panelMode = "form";
    renderDrawer();
    renderSidePanel();
  });
  workflowRefs.newChatBtn.addEventListener("click", () => {
    window.location.href = "../chat/chat-workspace.html?source=workflow";
  });
}

async function syncXDailyReportAuthStatus() {
  try {
    const status = await fetchXDailyReportAuthStatus();
    workflowState.authStatus["wf-x-daily-report"] = {
      authorized: Boolean(status.authorized),
      checked: true,
      message: status.message || ""
    };
    workflowState.draftAnswers.auth = status.authorized ? "已授权" : "";
    if (workflowState.panelWorkflowId === "wf-x-daily-report" && workflowState.panelMode === "form") {
      renderDrawer();
    }
  } catch (error) {
    workflowState.authStatus["wf-x-daily-report"] = {
      authorized: false,
      checked: true,
      message: wt("无法检测 X OAuth 状态，请确认本地服务已启动。", "Unable to check X OAuth status. Confirm that the local service is running.")
    };
    if (workflowState.panelWorkflowId === "wf-x-daily-report" && workflowState.panelMode === "form") {
      renderDrawer();
    }
  }
}

async function handleXDailyReportAuth(fieldKey) {
  try {
    const status = await fetchXDailyReportAuthStatus();
    workflowState.authStatus["wf-x-daily-report"] = {
      authorized: Boolean(status.authorized),
      checked: true,
      message: status.message || ""
    };
    if (status.authorized) {
      workflowState.draftAnswers[fieldKey] = "已授权";
      renderDrawer();
      showToast(status.message || wt("已检测到 X 授权。", "Detected an existing X authorization."));
      return;
    }

    const result = await startXDailyReportAuth();
    workflowState.draftAnswers[fieldKey] = "";
    workflowState.authStatus["wf-x-daily-report"].message = result.message || wt("已尝试拉起 X OAuth 流程。", "Attempted to start the X OAuth flow.");
    renderDrawer();
    showToast(result.message || wt("已尝试拉起 X OAuth 流程。", "Attempted to start the X OAuth flow."));
  } catch (error) {
    workflowState.draftAnswers[fieldKey] = "";
    workflowState.authStatus["wf-x-daily-report"] = {
      authorized: false,
      checked: true,
      message: error.message || wt("X OAuth 拉起失败。", "Failed to start the X OAuth flow.")
    };
    renderDrawer();
    showToast(error.message || wt("X OAuth 拉起失败。", "Failed to start the X OAuth flow."));
  }
}

async function syncZaloAuthStatus() {
  const workflowKey = workflowState.panelWorkflowId === "wf-zalo-group-chat" ? "wf-zalo-group-chat" : "wf-zalo-agent";
  try {
    const status = await fetchZaloAuthStatus();
    workflowState.authStatus[workflowKey] = {
      authorized: Boolean(status.authorized),
      checked: true,
      message: status.message || ""
    };
    workflowState.draftAnswers.auth = status.authorized ? "已授权" : "";
    if (status.oaId && !workflowState.draftAnswers.oaId) {
      workflowState.draftAnswers.oaId = status.oaId;
    }
    if ((workflowState.panelWorkflowId === "wf-zalo-agent" || workflowState.panelWorkflowId === "wf-zalo-group-chat") && workflowState.panelMode === "form") {
      renderDrawer();
    }
  } catch (error) {
    workflowState.authStatus[workflowKey] = {
      authorized: false,
      checked: true,
      message: wt("无法检测 Zalo 本地服务状态，请确认本地服务已启动。", "Unable to check the local Zalo service status. Confirm that the local service is running.")
    };
    if ((workflowState.panelWorkflowId === "wf-zalo-agent" || workflowState.panelWorkflowId === "wf-zalo-group-chat") && workflowState.panelMode === "form") {
      renderDrawer();
    }
  }
}

async function handleZaloAuth(fieldKey) {
  const workflowKey = workflowState.panelWorkflowId === "wf-zalo-group-chat" ? "wf-zalo-group-chat" : "wf-zalo-agent";
  const payload = {
    oaId: workflowState.draftAnswers.oaId || "",
    appId: workflowState.draftAnswers.oaId || "",
    groupMessagingEnabled: Boolean((workflowState.draftAnswers.groupStrategy || workflowState.draftAnswers.groupId || "").trim())
  };
  try {
    const result = await startZaloAuth(payload);
    const authorized = Boolean(result.authorized);
    workflowState.draftAnswers[fieldKey] = authorized ? "已授权" : "";
    workflowState.authStatus[workflowKey] = {
      authorized,
      checked: true,
      message: result.message || wt("已保存本地 Zalo 配置。", "Saved the local Zalo configuration.")
    };
    if (result.authUrl) {
      window.open(result.authUrl, "hubitos-zalo-oauth", "width=720,height=880,noopener,noreferrer");
    }
    renderDrawer();
    showToast(result.message || wt("已保存本地 Zalo 配置。", "Saved the local Zalo configuration."));
  } catch (error) {
    workflowState.draftAnswers[fieldKey] = "";
    workflowState.authStatus[workflowKey] = {
      authorized: false,
      checked: true,
      message: error.message || wt("保存本地 Zalo 配置失败。", "Failed to save the local Zalo configuration.")
    };
    renderDrawer();
    showToast(error.message || wt("保存本地 Zalo 配置失败。", "Failed to save the local Zalo configuration."));
  }
}

localizeWorkflowChrome();
renderSystemTime();
renderSignals();
renderActivities();
renderWorkflowCards();
renderSidePanel();
initWorkflowEvents();
hydrateCompetitorWorkflowFromApi();
hydrateXDailyReportWorkflowFromApi();
hydrateZaloWorkflowFromApi();
hydrateWorkflowFromQuery();
setInterval(renderSystemTime, 1000);
