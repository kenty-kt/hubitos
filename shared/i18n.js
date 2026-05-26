(function () {
  const STORAGE_KEY = "hubitos-language";
  const DEFAULT_LANG = "en";
  const IGNORE_ATTR = "data-hubitos-i18n-ignore";
  const AI_CACHE_KEY = "hubitos-i18n-ai-cache-v1";
  const textNodeOriginals = new WeakMap();
  const attributeOriginals = new WeakMap();
  const aiTranslationCache = new Map();
  const pendingAiTranslations = new Map();
  const channels = [];
  let currentLang = readStoredLanguage();
  let observer = null;
  let translatorPromise = null;
  let aiCachePersistTimer = null;
  let aiRefreshTimer = null;

  const PAIRS = [
    ["Hubitos AI OS - 文件中心", "Hubitos AI OS - Files Center"],
    ["Hubitos AI OS - 技能市场", "Hubitos AI OS - Skills Marketplace"],
    ["Hubitos AI OS - 我的智能体", "Hubitos AI OS - My Agents"],
    ["Hubitos AI OS - 智能体详情", "Hubitos AI OS - Agent Details"],
    ["Hubitos AI OS - MCP 注册中心", "Hubitos AI OS - MCP Registry"],
    ["Hubitos Desktop Pages", "Hubitos Desktop Pages"],
    ["Hubitos Desktop PRD · MVP1", "Hubitos Desktop PRD · MVP1"],
    ["Hubitos AI OS 桌面端 MVP1 产品需求文档", "Hubitos AI OS Desktop MVP1 Product Requirements Document"],
    ["一句话定义", "One-Line Definition"],
    ["让用户以一次对话完成真实工作任务，并把结果沉淀成可管理、可导出、可继续编辑的云端资产。", "Enable users to complete real work through a single conversation and turn the result into cloud assets that are manageable, exportable, and editable."],
    ["MVP1 核心目标", "MVP1 Core Goals"],
    ["验证“对话即生产力”是否成立，而不是单纯聊天。", "Validate whether conversation can truly become productivity rather than just chat."],
    ["验证 AI 输出能稳定落到文档、图片、表格等工作产物。", "Validate that AI output can consistently land in real work artifacts such as documents, images, and spreadsheets."],
    ["验证用户愿意在桌面端持续回到同一个工作空间复用会话与资产。", "Validate that users are willing to return to the same desktop workspace to reuse conversations and assets."],
    ["为后续 MVP2 的 Skill / Agent 沉淀建立基础操作壳层和文件资产层。", "Lay the operational shell and file asset foundation for future Skill / Agent accumulation in MVP2."],
    ["01 · 成功标准", "01 · Success Criteria"],
    ["MVP1 目标与验收口径", "MVP1 Goals and Acceptance Criteria"],
    ["任务闭环", "Task Completion"],
    ["一次对话完成真实工作任务", "Complete real work in a single conversation"],
    ["用户可在同一会话中完成输入、生成、查看、继续编辑。", "Users can input, generate, review, and continue editing within the same conversation."],
    ["产物沉淀", "Output Retention"],
    ["生成结果进入文件中心", "Generated results enter the Files Center"],
    ["文档 / 表格 / 图片结果必须能在文件中心被查看、筛选与再次调用。", "Document, spreadsheet, and image outputs must be viewable, filterable, and reusable in the Files Center."],
    ["持续复用", "Repeat Usage"],
    ["回到历史会话继续工作", "Return to past conversations and continue working"],
    ["左侧历史对话和文件资产能够支撑用户继续追问与增量编辑。", "History in the left rail and file assets should support follow-up questions and incremental editing."],
    ["体验稳定", "Stable Experience"],
    ["核心路径无阻塞", "No blocking on the core path"],
    ["发送、切换模型、切换输出格式、上传附件、打开文件这几步必须稳定。", "Sending, switching models, changing output formats, uploading attachments, and opening files must all remain stable."],
    ["02 · 范围定义", "02 · Scope Definition"],
    ["MVP1 Feature List（按交付优先级）", "MVP1 Feature List (by delivery priority)"],
    ["03 · 页面截图", "03 · Page Screenshots"],
    ["当前 MVP1 原型截图 / 预览", "Current MVP1 Prototype Screenshots / Preview"],
    ["09 · 验收标准", "09 · Acceptance Criteria"],
    ["功能验收与版本门槛", "Feature Acceptance and Release Bar"],
    ["10 · 风险与缺口", "10 · Risks and Gaps"],
    ["当前原型到真实 MVP1 的主要差距", "Main Gaps Between the Current Prototype and the Real MVP1"],
    ["Hubitos Static Preview", "Hubitos Static Preview"],
    ["这是 Hubitos 桌面端原型的静态访问入口。打开首页后可以按模块进入当前已经整理好的主要页面，用于演示、评审、分享和远程访问。", "This is the static entry for the Hubitos desktop prototype. Open the home page to enter the main prepared pages by module for demos, reviews, sharing, and remote access."],
    ["推荐从这里开始：对话工作台", "Start Here: Chat Workspace"],
    ["这是当前 MVP1 的主工作流入口，包含历史对话、模型切换、输出格式、附件上传和右侧上下文面板。", "This is the main MVP1 workflow entry, including history, model switching, output formats, attachments, and the right-side context panel."],
    ["MVP1 核心", "MVP1 Core"],
    ["对话主链路", "Core Chat Flow"],
    ["可直接演示", "Demo Ready"],
    ["打开页面", "Open Page"],
    ["配套页面：文件中心", "Supporting Page: Files Center"],
    ["查看对话产物如何沉淀为云端文件资产，包括分类、标签筛选、预览、AI 编辑与回收站。", "See how chat outputs become cloud file assets, including categories, tag filters, previews, AI editing, and trash."],
    ["资产沉淀", "Asset Layer"],
    ["标签筛选", "Tag Filters"],
    ["预览详情", "Preview Detail"],
    ["页面导航", "Page Navigation"],
    ["MVP1 主链路", "MVP1 Core Flow"],
    ["当前最适合对外演示和讲解的页面组合，覆盖“对话生成内容”与“文件资产沉淀”两条核心路径。", "The most presentation-ready page combination right now, covering the two core flows: conversation-driven creation and file asset retention."],
    ["对话工作台", "Chat Workspace"],
    ["聊天主工作台、模型切换、输出格式、附件上传、右侧上下文面板。", "Main chat workspace, model switching, output formats, attachments, and the right-side context panel."],
    ["新频道原型：项目中心", "New Prototype: Projects Channel"],
    ["集中展示 GitHub 项目，一键触发本地部署、打开 localhost，并配置模型消耗走用户绑定账户。", "Show GitHub projects in one place, trigger local deployment with one click, open localhost, and route model usage through the user's linked account."],
    ["GitHub 项目", "GitHub Projects"],
    ["本地部署", "Local Deployment"],
    ["模型账户", "Model Account"],
    ["项目频道", "Projects Channel"],
    ["GitHub 项目列表、本地部署按钮、日志面板、打开本地地址与模型账户路由设置。", "GitHub project list, local deployment actions, log panel, localhost launch, and model-account routing settings."],
    ["文件中心", "Files Center"],
    ["云文件资产、分类筛选、标签筛选、预览详情、AI 编辑与回收站。", "Cloud file assets, category filters, tag filters, preview details, AI editing, and trash."],
    ["能力沉淀与扩展", "Capabilities and Expansion"],
    ["这些页面偏向 MVP2 及以后，但已经有较完整的原型可用于方向展示。", "These pages lean toward MVP2 and beyond, but the prototypes are already complete enough for direction demos."],
    ["智能体中心", "Agents Center"],
    ["我的智能体列表、标签筛选、卡片浏览和统一左导航。", "My agent list, tag filters, card browsing, and the unified left navigation."],
    ["智能体详情", "Agent Detail"],
    ["单个智能体详情页，适合功能讲解、产品说明与演示。", "A single agent detail page, suitable for feature walkthroughs, product explanation, and demos."],
    ["技能中心", "Skills Center"],
    ["技能市场、分类筛选、安装态和卡片式浏览体验。", "Skills marketplace, category filters, install states, and a card-based browsing experience."],
    ["MCP 中心", "MCP Center"],
    ["MCP 工具分类、标签筛选、搜索与卡片式工具管理。", "MCP tool categories, tag filters, search, and card-based tool management."],
    ["建议访问顺序：先看“对话工作台”，再看“文件中心”。如果需要展示平台能力延展，再继续看“智能体中心 / 技能中心 / MCP 中心”。", "Suggested viewing order: start with the Chat Workspace, then Files Center. If you want to show platform expansion, continue to Agents Center / Skills Center / MCP Center."],
    ["欢迎回来，开始今天的 AI 工作", "Welcome back. Start today's AI work."],
    ["开始任务", "Start Task"],
    ["最近对话", "Recent Conversations"],
    ["正在进行中的任务", "Active Tasks"],
    ["已产出文件", "Generated Files"],
    ["已发布30条推特，10次评论互动。", "30 tweets published and 10 comment interactions completed."],
    ["包含文档、图片和表格，已进入对应项目目录。", "Includes documents, images, and tables, already saved into the related project folders."],
    ["市场研究助理已归档竞品分析", "The market research assistant archived the competitor analysis."],
    ["竞品拆解与定位", "Competitor Breakdown and Positioning"],
    ["输出了竞品功能矩阵和价格对比，并同步到 Market Analysis 文件夹。", "Generated the competitor feature matrix and pricing comparison, then synced them to the Market Analysis folder."],
    ["12 分钟前", "12 minutes ago"],
    ["PRD Writing Assistant 生成了新的结构草案", "PRD Writing Assistant generated a new structural draft."],
    ["PRD 生成自动任务", "PRD Auto Task"],
    ["根据最近对话补齐了需求背景、功能结构和阶段目标。", "Filled in the requirement background, feature structure, and phase goals from recent conversations."],
    ["28 分钟前", "28 minutes ago"],
    ["首页视觉提案已准备好进入工作台继续编辑", "The homepage visual proposal is ready for further editing in the workspace."],
    ["首页视觉提案", "Homepage Visual Proposal"],
    ["建议从首页卡片直接进入聊天工作台，继续细化页面布局和模块细节。", "It's recommended to jump from the homepage card into the chat workspace and continue refining layout and module details."],
    ["刚刚", "Just now"],

    ["对话", "Chat"],
    ["文件", "Files"],
    ["项目", "Projects"],
    ["最近仓库", "Recent Repos"],
    ["自动任务记录", "Workflow History"],
    ["+ 导入仓库", "+ Import Repo"],
    ["+ 新建任务", "+ New Task"],
    ["Hubitos AI OS - 项目频道", "Hubitos AI OS - Projects Channel"],
    ["Hubitos AI OS - 项目详情", "Hubitos AI OS - Project Detail"],
    ["项目频道", "Projects Channel"],
    ["项目详情", "Project Detail"],
    ["项目列表与详情流转", "Project list and detail flow"],
    ["在这里浏览 GitHub 仓库，再进入独立详情页执行本地部署、校验和 AI 修复。", "Browse GitHub repositories here, then open a dedicated detail page for local deployment, verification, and AI repair."],
    ["打开详情", "Open Detail"],
    ["← 返回列表", "← Back to List"],
    ["部署、校验与自动修复", "Deploy, verify, and auto-repair"],
    ["该页面专门负责单个仓库的本地部署、校验策略、日志和 AI 辅助修复流程。", "This page is dedicated to local deployment, verification policies, logs, and AI-assisted repair flow for a single repository."],
    ["一键启动", "One-click Start"],
    ["一键部署", "One-click Deploy"],
    ["停止运行", "Stop Running"],
    ["删除本地副本", "Delete Local Copy"],
    ["打开本地页面", "Open Local Page"],
    ["本地删除", "Delete Local"],
    ["一键本地启动 GitHub 项目", "GitHub projects with one-click local launch"],
    ["导入仓库、模拟本地部署、打开 localhost，并将模型调用路由到每个用户绑定的账户。", "Import repositories, simulate local deployment, open localhost, and route model usage through each user's bound account."],
    ["同步 GitHub", "Sync GitHub"],
    ["+ 导入仓库", "+ Import Repository"],
    ["仓库队列", "Repository Queue"],
    ["项目列表", "Projects"],
    ["搜索仓库、所有者或框架...", "Search repo, owner, or framework..."],
    ["已选项目", "Selected Project"],
    ["框架", "Framework"],
    ["本地地址", "Local URL"],
    ["Token 模式", "Token Mode"],
    ["用户绑定账户", "Bound User Account"],
    ["本地部署", "Deploy Locally"],
    ["打开 localhost", "Open localhost"],
    ["复制克隆命令", "Copy Clone Command"],
    ["本地执行器", "Local Runner"],
    ["本地运行器", "Local Runner"],
    ["启动流程", "Launch Flow"],
    ["部署流水线", "Deployment Pipeline"],
    ["空闲", "Idle"],
    ["1. 克隆 / 拉取", "1. Clone / Pull"],
    ["使用 GitHub 远端和分支选择。", "Use GitHub remote and branch selection."],
    ["2. 安装", "2. Install"],
    ["检测包管理器并安装依赖。", "Detect package manager and install dependencies."],
    ["3. 启动", "3. Boot"],
    ["启动本地服务并将日志流回客户端。", "Launch local service and stream logs back to the client."],
    ["4. 校验", "4. Verify"],
    ["在暴露 localhost 之前运行冒烟检查并验证本地服务。", "Run smoke checks and validate the local service before exposing localhost."],
    ["5. AI 修复", "5. AI Repair"],
    ["当校验失败时，将日志和失败文件提交给编码模型。", "Submit logs and failing files to the coding model when verification breaks."],
    ["6. 重试", "6. Retry"],
    ["在应用 AI 生成的补丁后重新启动并再次校验。", "Restart and verify again after the AI-generated patch is applied."],
    ["仓库", "Repository"],
    ["默认命令", "Default command"],
    ["工作目录", "Workspace path"],
    ["最近一次部署", "Last deployment"],
    ["校验策略", "Verification policy"],
    ["自动修复策略", "Auto-fix strategy"],
    ["执行流", "Execution Feed"],
    ["部署日志", "Deploy Logs"],
    ["清空", "Clear"],
    ["LLM 运行时", "LLM Runtime"],
    ["绑定账户路由", "Bound Account Routing"],
    ["模型消耗记账到", "Charge model usage to"],
    ["首选编码模型", "Preferred coding model"],
    ["兜底模型", "Fallback model"],
    ["密钥存储", "Secret storage"],
    ["加密保存在本地代理中", "Encrypted in local agent"],
    ["API key 不会进入浏览器层。这个原型假设本地代理负责签名请求，并把 token 记账到用户已绑定的模型供应商账户。", "API keys never enter the browser layer. This prototype assumes a local agent signs requests and charges tokens against the user's linked provider account."],
    ["校验失败时自动修复", "Auto-repair on verification failure"],
    ["当部署校验失败时，本地代理会打包启动日志、失败检查和变更文件，然后请求编码模型自动打补丁并重试。", "When deploy validation fails, the local agent packages startup logs, failing checks, and changed files, then asks the coding model to patch and retry automatically."],
    ["修复模型", "Repair model"],
    ["上下文", "Context"],
    ["日志 + 失败文件 + 命令输出", "Logs + failing files + command output"],
    ["重试上限", "Retry limit"],
    ["查看路由策略", "Review routing policy"],
    ["导入流程", "Import Flow"],
    ["GitHub 接入", "GitHub Intake"],
    ["1. 关联仓库", "1. Link repository"],
    ["粘贴 owner/repo 和分支后保存到该频道。", "Paste owner/repo and branch, then save to the channel."],
    ["2. 识别技术栈", "2. Detect stack"],
    ["推断框架、安装命令和默认启动脚本。", "Infer framework, install command, and default boot script."],
    ["3. 本地启动", "3. Launch locally"],
    ["只有当本地代理报告端口 ready 后才打开浏览器。", "Open browser only after the local agent reports a ready port."],
    ["导入 GitHub 仓库", "Import GitHub Repository"],
    ["把项目加入该频道", "Add a project to this channel"],
    ["关闭", "Close"],
    ["仓库地址", "Repository"],
    ["分支", "Branch"],
    ["本地端口", "Local port"],
    ["使用示例值", "Use demo values"],
    ["保存项目", "Save project"],

    ["全部", "All"],
    ["在线", "Live"],
    ["构建中", "Building"],
    ["尚未部署", "Not deployed"],
    ["没有本地地址", "No local URL yet"],
    ["没有找到项目", "No projects found"],
    ["试试别的关键词，或者导入一个新的仓库到这个频道。", "Try another keyword or import a new repository into this channel."],
    ["健康检查 + /api/ping + 首页渲染", "Health check + /api/ping + homepage render"],
    ["Dashboard 路由冒烟测试 + 静态资源加载", "Smoke test dashboard route + asset load"],
    ["启动日志 + /healthz + 集成冒烟测试", "Boot logs + /healthz + integration smoke test"],
    ["失败校验时启用自动修复", "Auto-fix enabled for failed verification"],
    ["失败校验后需要人工介入", "Manual intervention required after failed verification"],
    ["健康检查 + 冒烟测试", "Health check + smoke test"],
    ["仅人工审核", "Manual review only"],
    ["部署中", "Deploying"],
    ["[system] 本地执行器已就绪，等待选择仓库。", "[system] Local runner ready. Waiting for repo selection."],
    ["[policy] Token 计费将使用每位用户绑定的模型供应商账户。", "[policy] Token billing is configured to use each user's bound provider account."],
    ["[deploy] 开始本地部署 ", "[deploy] Starting local deployment for "],
    ["[git] git clone --branch ", "[git] git clone --branch "],
    ["[install] 正在识别框架 ", "[install] Detecting framework "],
    [" 并准备依赖", " and preparing dependencies"],
    ["[runtime] 启动本地执行器并保留可用端口", "[runtime] Starting local runner and reserving an available port"],
    ["[verify] 正在运行 ", "[verify] Running "],
    ["[verify] 校验失败：启动冒烟测试发现运行时错误", "[verify] Verification failed: startup smoke test found a runtime error"],
    ["[repair] 正在发送日志、失败检查和变更文件到 ", "[repair] Sending logs, failing checks, and changed files to "],
    ["[repair] AI 已提出修复补丁：修正 import 路径、补上 env fallback，并重启本地执行器", "[repair] AI proposed a patch: fix import path, add env fallback, restart local runner"],
    ["[retry] 正在重启服务并再次运行校验", "[retry] Restarting service and running verification again"],
    ["[retry] AI 修复后校验通过", "[retry] Verification passed after AI repair"],
    ["[verify] 首次校验通过", "[verify] Verification passed on the first attempt"],
    ["[ready] 服务已可访问：", "[ready] Service is available at "],
    ["[policy] 该工作区的模型调用将通过用户绑定账户的密钥仓进行路由", "[policy] Model calls for this workspace are routed through the bound user account vault"],
    ["本地部署已完成：", "Local deployment ready at "],
    ["请先部署项目以获得本地地址。", "Deploy the project first to get a local URL."],
    ["[open] 正在本地浏览器中打开 ", "[open] Opening "],
    [" 在本地浏览器中", " in the local browser"],
    ["克隆命令已复制。", "Clone command copied."],
    ["请使用 owner/repo 格式。", "Use the format owner/repo."],
    ["从 GitHub 导入。等待本地代理识别包管理器、安装策略和启动命令。", "Imported from GitHub. Waiting for the local agent to detect package manager, install strategy, and boot command."],
    ["健康检查 + 冒烟测试 + 首页渲染", "Health check + smoke test + homepage render"],
    ["[import] 已将 ", "[import] Added "],
    [" 加入项目频道。首选本地端口：", " to the Projects channel. Preferred local port: "],
    ["仓库已导入频道。", "Repository imported into the channel."],
    ["[system] 日志流已清空。", "[system] Log stream cleared."],
    ["[policy] 已为失败部署校验开启自动修复", "[policy] Auto-repair enabled for failed deployment verification"],
    ["[policy] 已关闭自动修复。失败后将等待人工审查", "[policy] Auto-repair disabled. Failures now wait for manual review"],
    ["[routing] 已打开路由策略编辑器。后续版本会支持供应商优先级、配额限制和密钥轮换。", "[routing] Opened routing policy editor. Future version will allow provider priority, quota limits, and secret rotation."],
    ["当前原型中仅模拟路由策略查看。", "Routing policy review is mocked in this prototype."],
    ["[sync] 已加入 GitHub 同步队列。后续版本会抓取分支、PR 状态和技术栈元数据。", "[sync] GitHub sync queued. Future version will fetch branches, PR status, and stack metadata."],
    ["当前仅模拟 GitHub 同步。", "GitHub sync is simulated."],
    ["校验失败。开启自动修复后可提交给 AI 处理。", "Verification failed. Enable auto-repair to send it to AI."],
    ["当前没有正在运行的本地服务。", "No local service is running."],
    ["已停止本地服务。", "Local service stopped."],
    ["已删除本地工作区。", "Local workspace deleted."],
    ["本地已停止", "Stopped locally"],
    ["本地工作区已移除", "Local workspace removed"],
    ["[runtime] 本地服务已停止，并释放 localhost 端口", "[runtime] Local service stopped and localhost port released"],
    ["[cleanup] 已删除本地工作区：", "[cleanup] Removed local workspace for "],
    ["[cleanup] 本地 clone、安装缓存和运行状态已清理", "[cleanup] Local clone, install cache, and runtime state cleared"],
    ["智能体", "Agents"],
    ["自动任务", "Workflows"],
    ["技能", "Skills"],
    ["数字员工", "Digital Workers"],
    ["商业", "Commerce"],
    ["历史对话", "History"],
    ["+ 新对话", "+ New Chat"],
    ["+ 新建项目", "+ New Project"],
    ["设置", "Settings"],
    ["语言", "Language"],
    ["你的 AI 工作台", "Your AI Workspace"],
    ["最近", "Recent"],
    ["我的", "Mine"],
    ["全部智能体", "All Agents"],
    ["我的智能体", "My Agents"],
    ["已上线", "Live"],
    ["草稿", "Drafts"],
    ["市场研究计划", "Market Research Plan"],
    ["PRD 撰写讨论", "PRD Writing Discussion"],
    ["竞品分析报告", "Competitor Analysis Report"],

    ["当前模型", "Current Model"],
    ["剩余 Token", "Tokens Left"],
    ["已启用技能", "Enabled Skills"],
    ["推荐", "Recommended"],
    ["已生成资产", "Generated Assets"],
    ["最近使用的 Skills", "Recently Used Skills"],
    ["最近使用的 Agent", "Recently Used Agents"],
    ["输出格式：", "Output:"],
    ["默认", "Default"],
    ["＋ 上传文件", "+ Upload File"],
    ["让 Hubitos 完善草案、生成文件，或直接发起一个桌面端任务...", "Ask Hubitos to refine a draft, generate files, or start a desktop task directly..."],
    ["自动路由开关", "Auto routing toggle"],
    ["发送", "Send"],
    ["固定会话", "Pin conversation"],
    ["固定为模板", "Save as template"],
    ["切换模型", "Switch model"],
    ["精确 4.2 · 深度推理", "Precision 4.2 · Deep reasoning"],
    ["日常任务 · 极速响应", "Daily tasks · Ultra-fast response"],
    ["深度代理 · 执行计算", "Deep agent · Compute execution"],
    ["适合复杂Task · 思考更深入", "Best for complex tasks · Deeper reasoning"],
    ["适合深度执行 · Context更多", "Best for deep execution · More context"],
    ["适合日常Task · 响应更快", "Best for everyday tasks · Faster responses"],
    ["快速启用最近高频技能，直接套用到当前任务。", "Quickly enable recently used high-frequency skills and apply them to the current task."],
    ["以最近用过的 Agent 身份和流程直接开始执行。", "Start immediately with the persona and workflow of a recently used agent."],
    ["暂无资产，生成文档、图片或表格后会自动归档到这里。", "No assets yet. Generated docs, images, or tables will be archived here automatically."],
    ["会议纪要.docx", "Meeting Notes.docx"],
    ["参考海报.png", "Reference Poster.png"],
    ["需求清单.xlsx", "Requirements Checklist.xlsx"],
    ["竞品资料.pdf", "Competitor Material.pdf"],
    ["数据样本.csv", "Data Sample.csv"],
    ["未启用技能", "No skills enabled"],
    ["智能识别", "Smart detection"],
    ["新对话", "New Chat"],
    ["未归档", "Unfiled"],
    ["品牌策略", "Brand Strategy"],
    ["产品方案", "Product Strategy"],
    ["市场分析", "Market Analysis"],
    ["PRD 终稿.docx", "PRD Final.docx"],
    ["设计布局.png", "Design Layout.png"],
    ["研究样本.xlsx", "Research Sample.xlsx"],
    ["文档 | 已归档到品牌策略", "Document | Archived to Brand Strategy"],
    ["图片 | 已生成封面方向", "Image | Cover direction generated"],
    ["表格 | 已同步到云端", "Table | Synced to cloud"],
    ["Hubitos 请根据这份 PDF 内容继续完善 AI OS 桌面端的视觉风格，并整理成一份适合高执行力品牌的 PRD 设计说明文档。", "Hubitos, please continue refining the AI OS desktop visual style based on this PDF and turn it into a PRD design brief suitable for a high-execution brand."],
    ["我已经综合了您宣言中的设计原则。Precision Atelier 美学强调色调分层而非标准边框。我先整理出设计方向、结构模块和对应资产，并同步归档到品牌策略文件夹。", "I've integrated the design principles from your manifesto. The Precision Atelier aesthetic emphasizes tonal layering instead of standard borders. I'll first organize the design direction, structural modules, and related assets, then archive them to the Brand Strategy folder."],
    ["自动路由：Hubitos Pro", "Auto routing: Hubitos Pro"],
    ["自动路由：Hubitos Lite", "Auto routing: Hubitos Lite"],
    ["输出：默认", "Output: Default"],
    ["输出：Word", "Output: Word"],
    ["输出：Excel", "Output: Excel"],
    ["已归档到品牌策略", "Archived to Brand Strategy"],
    ["文档 | 已归档", "Document | Archived"],
    ["图片 | 已提交", "Image | Submitted"],
    ["继续追问", "Follow up"],
    ["转为 Skill", "Turn into Skill"],
    ["转为 Agent", "Turn into Agent"],
    ["Hubitos_PRD.md", "Hubitos_PRD.md"],
    ["Markdown | 待确认", "Markdown | Pending review"],
    ["请把对话整理成完整 PRD，补齐核心功能与商业模式。", "Please turn the conversation into a complete PRD and fill in the core features and business model."],
    ["我已经将内容拆分为项目概述、功能架构、业务流程、技术建议和分阶段路线图，接下来可以继续导出 Word 或沉淀为 Skill。", "I've split the content into project overview, feature architecture, business flow, technical suggestions, and a phased roadmap. Next, we can export Word or turn it into a Skill."],
    ["文档草稿已就绪", "Document draft is ready"],
    ["竞品分析.xlsx", "Competitor Analysis.xlsx"],
    ["Excel | 含功能对比", "Excel | Includes feature comparison"],
    ["把这几家竞品整理成功能对比表和定价分析。", "Organize these competitors into a feature comparison table and pricing analysis."],
    ["我已生成可继续扩展的竞品分析表格，并保留了关键引用链接，下一步可以补充视觉风格矩阵或导出最终版 Excel。", "I've generated an expandable competitor analysis sheet and kept the key reference links. Next we can add a visual style matrix or export the final Excel."],
    ["表格已同步", "Table synced"],
    ["文件搜索", "File Search"],
    ["查找文件", "File Search"],
    ["图片生成", "Image Generation"],
    ["生成图片", "Image Generation"],
    ["代码解释", "Code Explanation"],
    ["模板中心", "Template Library"],
    ["PRD 写作助手", "PRD Writing Assistant"],
    ["根据当前品牌方向生成一版红白主题视觉草图。", "Generate a red-and-white visual draft based on the current brand direction."],
    ["调用市场研究助理，输出竞品分析和建议摘要。", "Call the market research assistant and output competitor analysis with a recommendation summary."],
    ["市场研究助理", "Market Research Assistant"],
    ["市场调研整理", "Market Research Wrap-up"],
    ["品牌视觉顾问", "Brand Visual Advisor"],
    ["运营日报助手", "Operations Daily Assistant"],
    ["运营日报 Agent", "Operations Daily Agent"],
    ["调用品牌视觉顾问，给我桌面端首页的视觉提案。", "Call the brand visual advisor and draft a desktop homepage visual proposal."],
    ["调用运营日报 Agent，整理今天的关键数据和执行建议。", "Call the operations daily agent and organize today's key metrics with execution suggestions."],
    ["帮我把这份项目说明整理成一份完整 PRD，并产出 Word 和 Markdown。", "Help me organize this project brief into a complete PRD and output both Word and Markdown."],
    ["根据上传的 PDF 和图片，生成一版桌面客户端首页草图。", "Generate a desktop client homepage draft based on the uploaded PDF and images."],
    ["把这些资料整理成可复用工作流，并输出适合团队协作的执行方案。", "Organize these materials into a reusable workflow and output an execution plan suitable for team collaboration."],
    ["已上传 ${item.label}，系统会按格式自动识别", "Uploaded ${item.label}; the system will auto-detect the format"],
    ["先输入任务再发送", "Enter a task before sending"],
    ["请继续补充关键页面、交互细节和发布后的商业化闭环。", "Please continue by adding key pages, interaction details, and the commercialization loop after launch."],
    ["已将追问建议填入输入框", "Inserted the follow-up suggestion into the input box"],
    ["已加入 Skill 转化队列", "Added to the Skill conversion queue"],
    ["已加入 Agent 转化队列", "Added to the Agent conversion queue"],
    ["已切换会话", "Conversation switched"],
    ["新建任务会话", "New task conversation"],
    ["已新建会话", "Created a new conversation"],
    ["自动路由已开启", "Auto routing is on"],
    ["已切换为手动模型模式", "Switched to manual model mode"],
    ["已根据当前会话推荐技能组合", "Recommended a skill set based on the current conversation"],
    ["当前会话已固定", "Current conversation pinned"],
    ["当前会话已保存为模板", "Current conversation saved as a template"],

    ["全部文件", "All Files"],
    ["最近使用", "Recent"],
    ["生成记录", "Generated"],
    ["收藏", "Favorites"],
    ["回收站", "Trash"],
    ["搜索 AI 资产...", "Search AI assets..."],
    ["上传文件", "Upload File"],
    ["最近生成", "Recent Outputs"],
    ["清空回收站", "Empty Trash"],
    ["当前选中", "Selected"],
    ["品牌识别提案 v2.docx", "Brand Identity Proposal v2.docx"],
    ["已优化", "Optimized"],
    ["文档片段", "Document Snippet"],
    ["“即将开展的活动的视觉方向侧重于‘极简粗犷主义’，采用 Hubitos 深红和纯白的强对比色调。此版本根据创意总监关于间距的反馈进行了调整...”", "\"The visual direction for the upcoming campaign leans toward minimalist brutalism, using a sharp contrast between Hubitos deep red and pure white. This version has been adjusted based on the creative director's spacing feedback...\""],
    ["调用的 Skills / MCP", "Skills / MCP Used"],
    ["使用 AI 编辑", "Edit with AI"],
    ["我的资产", "My Assets"],
    ["草稿箱", "Drafts"],
    ["收藏夹", "Favorites"],
    ["文档", "Documents"],
    ["图片", "Images"],
    ["表格", "Tables"],
    ["上传", "Uploads"],
    ["Q4 市场分析 - 东京.pdf", "Q4 Market Analysis - Tokyo.pdf"],
    ["由智能体 X 生成", "Generated by Agent X"],
    ["智能体 X - 创意型", "Agent X - Creative"],
    ["Skill · 市场分析总结", "Skill · Market Analysis Summary"],
    ["Skill · 报告结构提炼", "Skill · Report Structure Refinement"],
    ["MCP · 云端文档导出", "MCP · Cloud Document Export"],
    ["来自对话 #102", "From Chat #102"],
    ["“即将开展的活动的视觉方向侧重于极简粗犷主义，采用 Hubitos 深红和纯白的强对比色调。此版本根据创意总监关于间距的反馈进行了调整。”", "\"The visual direction for the upcoming campaign leans toward minimalist brutalism, using a sharp contrast between Hubitos deep red and pure white. This version has been adjusted based on the creative director's spacing feedback.\""],
    ["Skill · PRD 写作助手", "Skill · PRD Writing Assistant"],
    ["Skill · 文档润色", "Skill · Document Polish"],
    ["MCP · Word 导出服务", "MCP · Word Export Service"],
    ["法律合规矩阵.xlsx", "Legal Compliance Matrix.xlsx"],
    ["通过技能合成", "Generated via Skill"],
    ["“表格已按风险等级、合规条线、责任部门进行结构化拆分，可继续导出 Excel 或汇总为周报。”", "\"The sheet has been structured by risk level, compliance line, and responsible team. It can be exported to Excel or summarized into a weekly report.\""],
    ["Skill · 表格结构整理", "Skill · Table Structuring"],
    ["Skill · 风险等级归类", "Skill · Risk Level Classification"],
    ["MCP · Excel 渲染器", "MCP · Excel Renderer"],
    ["原始竞争对手数据.csv", "Raw Competitor Data.csv"],
    ["外部上传", "External Upload"],
    ["手动上传", "Manual Upload"],
    ["“该 CSV 已导入云端，可继续用 AI 做清洗、分类、对比分析，并转为图表或报告。”", "\"This CSV has been imported to the cloud. You can continue with AI-powered cleaning, classification, comparative analysis, and convert it into charts or reports.\""],
    ["Skill · 数据清洗", "Skill · Data Cleaning"],
    ["Skill · 竞品对比生成", "Skill · Competitor Comparison Generation"],
    ["MCP · CSV 解析连接器", "MCP · CSV Parsing Connector"],
    ["PRD 已完成项目概述、功能架构、路线图与商业模式章节，可继续用 AI 编辑或导出 Word。", "The PRD already includes project overview, feature architecture, roadmap, and business model sections. You can keep editing with AI or export to Word."],
    ["Skill · PRD 扩写", "Skill · PRD Expansion"],
    ["Skill · 演示稿改写", "Skill · Deck Rewrite"],
    ["MCP · 文档存储连接器", "MCP · Document Storage Connector"],
    ["旧版市场摘要.pdf", "Legacy Market Summary.pdf"],
    ["回收站文件", "Trashed File"],
    ["旧版资产", "Legacy Asset"],
    ["“该文件已进入回收站，可恢复或彻底删除。”", "\"This file is in the trash and can be restored or permanently deleted.\""],
    ["Skill · 回收站恢复检查", "Skill · Trash Recovery Check"],
    ["MCP · 文件审计日志", "MCP · File Audit Log"],
    ["新建文件夹", "New Folder"],
    ["没有匹配到文件，试试调整标签、搜索词或切换到其他分类。", "No matching files found. Try adjusting the tag, search term, or switching categories."],
    ["收藏文件", "Favorite Files"],
    ["新文件夹", "New Folder"],
    ["今天, 刚刚", "Today, just now"],
    ["新上传文件已进入云端文件夹，可继续用 AI 做总结、改写、翻译或结构化输出。", "The newly uploaded file is now in the cloud folder. You can keep using AI for summarizing, rewriting, translating, or structuring the output."],
    ["总结内容", "Summarize content"],
    ["生成 PRD", "Generate PRD"],
    ["继续用 AI 编辑", "Continue with AI editing"],
    ["已将《", "Moved \""],
    ["》带入 AI 编辑流程。", "\" into the AI editing flow."],
    ["准备导出《", "Preparing to export \""],
    ["》。", "\"."],

    ["我的智能体", "My Agents"],
    ["导入", "Import"],
    ["新建智能体", "New Agent"],
    ["金融", "Finance"],
    ["研究", "Research"],
    ["工程", "Engineering"],
    ["已发布", "Published"],
    ["私有", "Private"],
    ["草稿", "Draft"],
    ["精准分析师 v2.4", "Precision Analyst v2.4"],
    ["市场研究助手", "Market Research Assistant"],
    ["代码架构师", "Code Architect"],
    ["内容审核专家", "Content Review Specialist"],
    ["高精度金融数据建模与预测性市场情绪分析引擎。", "High-precision financial data modeling and predictive market sentiment analysis engine."],
    ["面向零售行业的实时竞品情报与市场趋势综合分析。", "Real-time competitive intelligence and market-trend synthesis for retail sectors."],
    ["面向遗留企业代码库的自治式重构与架构审查能力。", "Autonomous refactoring and architectural oversight for legacy enterprise codebases."],
    ["面向多模态社区平台生成内容的高速合规审查引擎。", "High-speed policy compliance engine for multi-modal community platform generated content."],
    ["2 小时前", "2H AGO"],
    ["1 天前", "1D AGO"],
    ["3 天前", "3D AGO"],
    ["4 小时前", "4H AGO"],

    ["智能体配置", "Agent Configuration"],
    ["放弃", "Discard"],
    ["部署智能体", "Deploy Agent"],
    ["角色描述", "Role Description"],
    ["专注 Q3 市场波动的高级财务分析师", "Senior financial analyst focused on Q3 market volatility"],
    ["主要目标定义", "Primary Goal"],
    ["将实时 SEC 文件综合成可操作的见解", "Synthesize live SEC filings into actionable insights"],
    ["逻辑流编排", "Logic Flow Orchestration"],
    ["自动保存", "Auto Saved"],
    ["专注模型", "Focus Model"],
    ["激活技能", "Enabled Skills"],
    ["测试运行控制台", "Test Run Console"],
    ["测试运行智能体的台本", "Prompt script for test-running the agent"],
    ["输入测试查询...", "Enter a test query..."],
    ["网页检索", "Web Search"],
    ["大模型", "LLM"],
    ["触发器", "Trigger"],
    ["入站 API 请求", "Inbound API Request"],
    ["Webhook JSON 负载监听", "Webhook JSON payload listener"],
    ["托管器", "Orchestrator"],
    ["核心处理模块", "Core Processing Module"],
    ["Claude 3.5 Sonnet / 财务分析脚本", "Claude 3.5 Sonnet / Financial analysis script"],
    ["负责行业扫描、信号聚类与摘要生成的研究助理", "Research assistant focused on industry scans, signal clustering, and summary generation"],
    ["按行业和时间窗口输出竞争态势简报", "Output competitive briefings by industry and time window"],
    ["图表生成", "Chart Generation"],
    ["研究任务", "Research Task"],
    ["接收行业关键词", "Receive industry keywords"],
    ["按国家 / 行业过滤", "Filter by country / industry"],
    ["摘要器", "Summarizer"],
    ["形成竞争快照", "Build a competitive snapshot"],
    ["自动生成研究结论", "Auto-generate research conclusions"],
    ["审查复杂系统结构并提供重构计划的工程智能体", "Engineering agent that reviews complex system structures and proposes refactoring plans"],
    ["对遗留系统做架构拆解、风险识别与分步迁移", "Break down legacy systems, identify risks, and plan phased migrations"],
    ["代码解释", "Code Explanation"],
    ["MCP 调试", "MCP Debugging"],
    ["仓库接入", "Repository Intake"],
    ["分析代码结构", "Analyze code structure"],
    ["索引模块依赖关系", "Index module dependencies"],
    ["改造器", "Refactor Engine"],
    ["给出迁移路径", "Provide migration paths"],
    ["产出重构建议清单", "Output a refactoring recommendation list"],
    ["审核社区生成内容并标记风险因子的内容守门员", "Content gatekeeper that reviews community-generated content and flags risk factors"],
    ["识别高风险表达并给出可用改写建议", "Identify high-risk phrasing and provide usable rewrites"],
    ["敏感词审查", "Sensitive Word Review"],
    ["图像理解", "Image Understanding"],
    ["回执记录", "Receipt Logging"],
    ["输入队列", "Input Queue"],
    ["收集待审内容", "Collect items for review"],
    ["文本 / 图像 / 链接", "Text / Image / Link"],
    ["审核器", "Reviewer"],
    ["执行规则与模型评审", "Run rules and model review"],
    ["输出审核结论", "Output review conclusion"],
    ["[14:32:17] 接收测试输入。", "[14:32:17] Test input received."],
    ["[14:32:17] 日志：调用核心检索节点。", "[14:32:17] Log: calling core retrieval node."],
    ["[14:32:29] 用户：分析 LLM 竞品公司的财报。", "[14:32:29] User: analyze earnings reports of competing LLM companies."],
    ["[14:32:46] 节点输出：正在启动市场标签聚类...", "[14:32:46] Node output: starting market tag clustering..."],

    ["市场", "Marketplace"],
    ["我的安装", "Installed"],
    ["开发者中心", "Developer Center"],
    ["搜索全球 AI 技能...", "Search global AI skills..."],
    ["执行任务", "Run Task"],
    ["热门", "Popular"],
    ["写作", "Writing"],
    ["编程", "Coding"],
    ["数据分析", "Data Analysis"],
    ["视觉设计", "Visual Design"],
    ["效率工具", "Productivity"],
    ["排序: 最近更新", "Sort: Latest Updates"],
    ["排序: 最近使用", "Sort: Recently Used"],
    ["排序: 收益潜力", "Sort: Revenue Potential"],
    ["SEO 优化专家", "SEO Optimization Expert"],
    ["全自动分析关键词竞争度，并生成符合搜索算法的高转化内容结构。", "Automatically analyze keyword competition and generate high-conversion content structures that align with search algorithms."],
    ["关键词", "Keywords"],
    ["增长", "Growth"],
    ["内容策略", "Content Strategy"],
    ["编程助手", "Coding Assistant"],
    ["代码重构助手", "Code Refactoring Assistant"],
    ["自动检测代码坏味道并提供符合 SOLID 原则的重构建议和拆分计划。", "Automatically detect code smells and provide refactoring suggestions and decomposition plans aligned with SOLID principles."],
    ["重构", "Refactoring"],
    ["审查", "Review"],
    ["工程效率", "Engineering Efficiency"],
    ["财务金融", "Finance"],
    ["财务报表分析", "Financial Statement Analysis"],
    ["深入洞察现金流、资产负债表趋势，提供专业级别的财务异常识别。", "Deeply inspect cash flow and balance sheet trends, providing professional-grade financial anomaly detection."],
    ["财报", "Financial Reports"],
    ["趋势预测", "Trend Forecasting"],
    ["风控", "Risk Control"],
    ["多语言", "Multilingual"],
    ["本地化翻译官", "Localization Translator"],
    ["不仅是翻译，更能针对目标市场文化语境调整文本语气与转化表达。", "Not just translation. It also adapts tone and conversion language to fit the cultural context of the target market."],
    ["翻译", "Translation"],
    ["本地化", "Localization"],
    ["营销", "Marketing"],
    ["思维导图生成器", "Mind Map Generator"],
    ["从长篇文章或视频脚本中自动提取逻辑骨干并生成结构清晰的脑图。", "Automatically extract the logical backbone from long-form articles or video scripts and generate clearly structured mind maps."],
    ["总结", "Summary"],
    ["脑图", "Mind Map"],
    ["提纲", "Outline"],
    ["创意设计", "Creative Design"],
    ["UI 调色板大师", "UI Palette Master"],
    ["基于品牌调性自动生成符合 WCAG 无障碍标准的界面配色与组件建议。", "Automatically generate interface palettes and component suggestions aligned with brand tone and WCAG accessibility standards."],
    ["配色", "Color"],
    ["品牌", "Brand"],
    ["无障碍", "Accessibility"],
    ["数字营销", "Digital Marketing"],
    ["舆情监控哨兵", "Public Sentiment Sentinel"],
    ["全网实时监控品牌关键词，并对负面情绪进行 AI 聚类与应对建议输出。", "Monitor brand keywords across the web in real time and cluster negative sentiment with AI-powered response suggestions."],
    ["舆情", "Public Sentiment"],
    ["监控", "Monitoring"],
    ["法律政务", "Legal & Public Affairs"],
    ["合同合规扫描", "Contract Compliance Scan"],
    ["深度检测商业合同中的潜在法律风险与隐藏条款缺陷，形成审阅纪要。", "Deeply detect potential legal risks and hidden clause flaws in commercial contracts and turn them into a review memo."],
    ["合同", "Contract"],
    ["合规", "Compliance"],
    ["安装", "Install"],
    ["已安装", "Installed"],
    ["已移除", "Removed"],
    ["可从技能市场直接发起任务执行", "You can start tasks directly from the skills marketplace"],

    ["我的工具", "My Tools"],
    ["全部工具", "All Tools"],
    ["浏览器自动化", "Browser Automation"],
    ["搜索引擎接口", "Search APIs"],
    ["开发者套件", "Developer Suite"],
    ["金融与数据分析", "Finance & Data Analysis"],
    ["社交媒体同步", "Social Sync"],
    ["企业级安全", "Enterprise Security"],
    ["搜索服务、插件或开发者工具...", "Search services, plugins, or developer tools..."],
    ["托管服务", "Managed Service"],
    ["已启用", "Enabled"],
    ["本地节点", "Local Node"],
    ["Fetch 工具集", "Fetch Toolkit"],
    ["为智能代理提供高效的网页抓取与 Markdown 转换功能，支持动态渲染页面。", "Provide intelligent agents with efficient web scraping and Markdown conversion, including support for dynamically rendered pages."],
    ["MIT 认证", "MIT Certified"],
    ["使用", "Use"],
    ["查看文档", "View Docs"],
    ["Google Search 增强", "Google Search Enhanced"],
    ["实时接入全球搜索数据，具备自动去重与摘要生成功能，适合深度研究流。", "Access global search data in real time with built-in deduplication and summary generation, ideal for deep research workflows."],
    ["商业授权", "Commercial License"],
    ["实时同步", "Real-Time Sync"],
    ["运行日志", "Run Logs"],
    ["全双向数据同步，支持数据库批量操作与块级权限管理。一键导出工作区。", "Full bidirectional data sync with bulk database operations and block-level permission controls. Export the workspace in one click."],
    ["企业推荐", "Enterprise Recommended"],
    ["核心开发组件。支持代码审查辅助、Issue 自动分类以及 PR 合并建议生成。", "Core development components supporting code review assistance, automatic issue triage, and PR merge recommendations."],
    ["官方认证", "Officially Verified"],
    ["文档", "Documents"],
    ["集成全球汇率、加密货币实时数据及美股行情，支持自动报表生成。", "Integrates global FX rates, live crypto data, and U.S. equities market data with automated reporting support."],
    ["高频数据", "High-Frequency Data"],
    ["低延迟", "Low Latency"],
    ["本地敏感数据扫描与脱敏工具，确保智能代理在处理隐私信息时的安全性。", "Local sensitive-data scanning and masking tools that keep intelligent agents safe when handling private information."],
    ["隐私优先", "Privacy First"],
    ["零信任", "Zero Trust"],
    ["同步频道内容、管理群组消息队列，并把对话结果回写到 CRM 或自动化流程。", "Sync channel content, manage group message queues, and write conversation results back into CRM or automation flows."],
    ["营销自动化", "Marketing Automation"],
    ["内容分发", "Content Distribution"],
    ["面向复杂网页任务的自动执行节点，支持登录态复用、截图、DOM 提取与导出。", "Automated execution node for complex web tasks with login session reuse, screenshots, DOM extraction, and export."],
    ["截图", "Screenshots"],
    ["自动化", "Automation"],
    ["开始新对话", "Start a new chat"],
    ["系统设置面板已预留", "The system settings panel has been reserved"],
    ["首页", "Home"],
    ["例如：帮我把这个需求整理成 PRD，并给出首页结构草图", "For example: turn this request into a PRD and outline the homepage structure."],
    ["开始任务", "Start Task"],
    ["自动任务", "Workflows"],
    ["刷新", "Refresh"],
    ["社媒增长自动任务", "Social Media Growth Workflow"],
    ["推荐入口：自动任务页 · 打开就能用", "Recommended entry: Workflows page · Ready to use"],
    ["进入自动任务页，直接点击运行 Twitter / Facebook 模板，缺失信息由系统对话补齐。", "Open the workflows page and run Twitter / Facebook templates directly. Missing information will be completed through system dialogue."],
    ["高频任务", "High-Frequency Task"],
    ["从对话、附件和历史资料中抽取关键信息，自动生成适合评审和沉淀的 PRD 草案。", "Extract key information from conversations, attachments, and historical materials to generate a review-ready PRD draft."],
    ["推荐模型：Hubitos Pro · 可导出：Markdown / Word", "Recommended model: Hubitos Pro · Export: Markdown / Word"],
    ["设计执行", "Design Execution"],
    ["结合已有品牌素材，输出一版更适合桌面端的首页结构、模块优先级和视觉方向建议。", "Use existing brand materials to produce a desktop-friendly homepage structure, module priority, and visual direction proposal."],
    ["推荐模型：Hubitos Advanced · 可导出：图片 / PPT", "Recommended model: Hubitos Advanced · Export: Images / PPT"],
    ["分析任务", "Analysis Task"],
    ["把竞品资料拆成能力矩阵、价格策略和差异化机会点，适合市场和产品一起评审。", "Break competitor materials into capability matrices, pricing strategies, and differentiation opportunities for market and product review."],
    ["推荐模型：Hubitos Lite · 可导出：Excel / PDF", "Recommended model: Hubitos Lite · Export: Excel / PDF"],
    ["对话执行助手", "Conversation Execution Assistant"],
    ["适合接收你的任务、整理上下文，并继续在对话里一步步推进执行。", "Best for receiving your task, organizing context, and continuing execution step by step in chat."],
    ["工具编排助手", "Tool Orchestration Assistant"],
    ["帮你挑选合适的提示词、智能体和自动任务，并一键带入当前任务。", "Helps you choose the right prompts, agents, and workflows, then inject them into the current task in one click."],
    ["社媒运营助手", "Social Media Operations Assistant"],
    ["帮你直接运行 Twitter / Facebook 任务，信息不够时会边问边补，再自动开始执行。", "Runs Twitter / Facebook tasks directly, filling missing information through follow-up questions before execution starts automatically."],
    ["开发协作助手", "Development Collaboration Assistant"],
    ["帮你查看 GitHub 项目、启动本地环境，并继续跟进开发里的问题。", "Helps you inspect GitHub projects, launch local environments, and keep moving on development issues."],
    ["开始", "Start"],
    ["进入", "Enter"],
    ["已刷新最近动态。", "Recent activity refreshed."],
    ["Hubitos 自动任务", "Hubitos Workflows"],
    ["我的", "Mine"],
    ["执行面板", "Execution Panel"],
    ["右侧执行面板", "Right-side Execution Panel"],
    ["去对话里继续", "Continue in Chat"],
    ["还差 2 项即可运行", "2 items left before running"],
    ["需要授权的直接点击完成；需要补充的问题请在对应输入框中填写，全部内容会串联后一次提交给系统。", "For authorization, click to complete directly. For missing inputs, fill them in the corresponding fields and the system will submit everything together."],
    ["稍后补充", "Fill in Later"],
    ["提交并继续", "Submit and Continue"],
    ["内容已经准备好，可以发布", "Content is ready and can be published"],
    ["待发布 / 已发布内容", "Pending / Published Content"],
    ["评论互动与执行日志", "Comment Interaction & Execution Logs"],
    ["继续输入你要接管或调整的内容...", "Enter what you want to take over or adjust..."],
    ["关闭对话", "Close Chat"],
    ["我的", "Mine"],
    ["全部", "All"],
    ["已抓取内容", "Collected Content"],
    ["运行中", "Running"],
    ["补充设置", "Fill Settings"],
    ["立即使用", "Use Now"],
    ["现在就能运行", "Ready to Run"],
    ["已配置", "Configured"],
    ["需要补信息", "More Info Needed"],
    ["可直接运行", "Ready to Run"],
    ["配置中", "Configuring"],
    ["待启动", "Pending Start"],
    ["未接入", "Not Connected"],
    ["约 7 分钟", "About 7 min"],
    ["约 8 分钟", "About 8 min"],
    ["约 9 分钟", "About 9 min"],
    ["约 5 分钟", "About 5 min"],
    ["Twitter 热点抓取并自动发布", "Twitter Trend Capture & Auto Publish"],
    ["抓取目标主题的热点内容，生成 3 条适合品牌语气的推文，并自动排队发布。", "Capture trending content for the target topic, generate three tweets that match the brand voice, and queue them for publishing automatically."],
    ["帮我继续跟进这个 Twitter 热点抓取与自动发布工作流，优化内容并给出下一步建议。", "Help me continue this Twitter trend capture and auto-publish workflow, improve the content, and suggest next steps."],
    ["X 平台授权", "X Platform Authorization"],
    ["先完成 X 平台授权。授权后，系统才能抓取热点并安排自动发布。", "Complete X platform authorization first. After that, the system can capture trends and schedule auto publishing."],
    ["前往 X 授权", "Authorize X"],
    ["抓取主题", "Capture Topic"],
    ["这次希望围绕什么主题抓取热点内容？", "What topic should this round of trend capture focus on?"],
    ["例如：AI agent、独立开发、自动化增长", "For example: AI agent, indie hacking, automated growth"],
    ["抓取范围", "Capture Scope"],
    ["希望从哪些账号、列表、话题或关键词范围抓取内容？", "Which accounts, lists, topics, or keyword scopes should the content be captured from?"],
    ["例如：关注 5 个竞品账号、2 个行业 KOL、1 个热点关键词流", "For example: 5 competitor accounts, 2 industry KOLs, 1 trending keyword stream"],
    ["发布时间窗", "Publishing Window"],
    ["希望把自动发布安排在什么时间段？", "What time window should auto publishing be scheduled for?"],
    ["例如：每天 10:00 / 14:00 / 20:00", "For example: every day at 10:00 / 14:00 / 20:00"],
    ["品牌语气", "Brand Voice"],
    ["推文最终希望保持什么样的品牌语气？", "What kind of brand voice should the final tweets maintain?"],
    ["例如：专业、简洁、有观点，不要太营销", "For example: professional, concise, opinionated, not too salesy"],
    ["Twitter 评论互动与主动评论", "Twitter Comment Engagement & Proactive Replies"],
    ["围绕目标关键词自动发现相关帖子，生成评论并持续跟进评论区互动。", "Automatically discover posts around the target keywords, generate replies, and keep following the comment thread."],
    ["请基于这个 Twitter 评论互动自动任务，继续帮我梳理评论策略、互动节奏和风险边界。", "Based on this Twitter comment-engagement workflow, help me refine the comment strategy, engagement cadence, and risk boundaries."],
    ["先完成 X 平台授权。授权后，这个自动任务才能开始评论与主动互动。", "Complete X platform authorization first. Only then can this workflow start replying and proactively engaging."],
    ["目标关键词", "Target Keywords"],
    ["这次想围绕哪个 Twitter 关键词或主题去互动？", "Which Twitter keywords or topics should we engage around this time?"],
    ["例如：AI agent、自动化增长、创业工具", "For example: AI agent, automated growth, startup tools"],
    ["评论语气", "Reply Tone"],
    ["评论语气希望更专业、友好，还是更强观点输出？", "Should the replies sound more professional, more friendly, or more opinionated?"],
    ["例如：偏专业、友好，不要太营销，适度表达观点。", "For example: professional and friendly, not too salesy, with moderate opinions."],
    ["Facebook 社群内容抓取并自动发布", "Facebook Community Content Capture & Auto Publish"],
    ["从目标社群和页面抓取高价值内容，整理成更适合 Facebook 的长帖和配图说明。", "Capture high-value content from target communities and pages, then turn it into Facebook-friendly long posts and image captions."],
    ["请继续展开这个 Facebook 内容自动任务，补齐发布策略、帖子结构和评论引导方式。", "Continue developing this Facebook content workflow and complete the publishing strategy, post structure, and comment guidance."],
    ["Facebook 平台授权", "Facebook Platform Authorization"],
    ["先完成 Facebook 平台授权。授权后，系统才能抓取来源并安排自动发布。", "Complete Facebook platform authorization first. After that, the system can capture sources and schedule auto publishing."],
    ["前往 Facebook 授权", "Authorize Facebook"],
    ["抓取来源", "Capture Sources"],
    ["你希望从哪些 Facebook 页面、社群或话题来源抓内容？", "Which Facebook pages, communities, or topics should the content be captured from?"],
    ["例如：3 个目标社群、2 个竞品主页、1 个行业话题页", "For example: 3 target communities, 2 competitor pages, 1 industry topic page"],
    ["发布主题", "Publishing Topic"],
    ["这次生成内容的核心发布主题是什么？", "What is the core topic for this publishing run?"],
    ["例如：AI 自动任务如何提升团队执行效率", "For example: how AI workflows improve team execution efficiency"],
    ["Facebook 社群评论运营", "Facebook Community Comment Operations"],
    ["自动跟进已发布帖子的评论区，筛出需要重点回复的留言并生成互动建议。", "Automatically follow the comment threads of published posts, pick out the replies that need attention, and generate interaction suggestions."],
    ["请继续处理这个 Facebook 社群评论运营自动任务，并给我一份后续人工接管建议。", "Continue handling this Facebook community comment workflow and give me a follow-up handoff recommendation."],
    ["已扫描 26 条最新评论，标记 5 条高价值互动，2 条建议人工接管", "Scanned 26 recent comments, flagged 5 high-value interactions, and marked 2 for manual takeover."],
    ["识别 26 条近 24 小时内的最新评论", "Identified 26 recent comments from the last 24 hours."],
    ["高价值评论 5 条，负向风险评论 2 条", "5 high-value comments and 2 negative-risk comments."],
    ["发现 1 个适合继续追问的潜在客户讨论", "Found 1 potential customer discussion worth following up on."],
    ["自动回复 3 条标准咨询评论", "Automatically replied to 3 standard inquiry comments."],
    ["生成 2 条需要人工确认的回复草案", "Generated 2 reply drafts that need human confirmation."],
    ["输出 1 条社群管理员私信建议", "Produced 1 private-message suggestion for the community admin."],
    ["10:02 已抓取最新评论并完成情绪分类", "10:02 Captured recent comments and completed sentiment classification."],
    ["10:04 系统已生成推荐回复", "10:04 The system generated recommended replies."],
    ["10:06 已将 2 条高风险互动移交人工接管", "10:06 Handed 2 high-risk interactions over for manual takeover."],
    ["还差 ", ""],
    [" 项信息", " items missing"],
    ["已完成热点抓取发布配置，系统正在抓取候选内容并生成推文草案", "Trend capture and publishing settings are complete. The system is collecting candidates and generating tweet drafts."],
    ["已确认抓取主题：", "Confirmed capture topic: "],
    ["未填写", "Not provided"],
    ["已记录抓取范围：", "Recorded capture scope: "],
    ["开始从授权 X 账号对应的关注流、关键词流和目标账号中抓取候选内容", "Starting to capture candidate content from followed streams, keyword streams, and target accounts linked to the authorized X account."],
    ["将按时间窗执行发布：", "Publishing will follow this time window: "],
    ["按品牌语气生成 3 条推文草案：", "Generate 3 tweet drafts in this brand voice: "],
    ["生成 1 份待审核发布队列和 1 份备选热点角度清单", "Generate 1 publishing queue for review and 1 backup list of trending angles."],
    ["已完成 X 授权校验", "X authorization check completed."],
    ["已写入热点抓取与自动发布规则", "Trend capture and auto-publish rules have been written."],
    ["下一步将输出候选内容、推文草案与发布队列", "Next, the system will output candidate content, tweet drafts, and a publishing queue."],
    ["已补齐 ", "Completed "],
    [" 项信息，系统正在用最新上下文运行这个自动任务", " items. The system is now running this workflow with the latest context."],
    ["已记录自动任务关键信息：", "Recorded key workflow information: "],
    ["复用 ", "Reuse "],
    [" 已授权账号与品牌语气配置", " authorized account and brand voice settings."],
    ["开始抓取相关来源并生成候选内容池", "Start capturing related sources and generating a pool of candidate content."],
    ["生成 2 条待发布内容草案", "Generate 2 publish-ready content drafts."],
    ["生成 3 条可用于评论区互动的回复建议", "Generate 3 reply suggestions for comment-thread interaction."],
    ["输出 1 条推荐的人工作业接管说明", "Output 1 recommended manual takeover note."],
    ["系统已根据补充信息完成回填", "The system has backfilled the workflow using the provided information."],
    ["自动任务模板已自动挂载默认执行策略", "The workflow template has automatically loaded the default execution strategy."],
    ["下一步可进入聊天工作台继续细化结果", "Next, continue refining the result in the chat workspace."],
    ["已开始执行。", " has started running."],
    ["当前正在接管「", "You are now taking over \""],
    ["」的运行链路。你可以直接调整发布内容、评论策略或执行节奏。", "\". You can directly adjust publishing content, comment strategy, or execution cadence."],
    ["系统已经接入最近一次执行上下文，你可以继续补充策略、内容或节奏要求。", "The system has loaded the latest execution context. You can continue adding strategy, content, or cadence requirements."],
    ["已授权完成", "Authorized"],
    ["点击后模拟跳转到平台授权页，完成后会自动标记为已授权。", "Click to simulate the platform authorization flow. Once finished, it will be marked as authorized automatically."],
    ["请输入", "Please enter"],
    ["信息已补齐，提交后即可运行", "All information is complete. Submit to run."],
    ["补参面板", "Parameter Panel"],
    ["补齐信息", "Complete Information"],
    ["对话接管", "Chat Takeover"],
    ["右侧对话", "Right-side Chat"],
    ["当前执行结果", "Current Execution Result"],
    ["右侧工作面板", "Right-side Workspace Panel"],
    ["还缺少“", "Still missing \""],
    ["”，补齐后我再继续。", "\". Complete it and I’ll continue."],
    ["已保留这个自动任务，稍后可继续补充。", "This workflow has been saved and can be completed later."],
    ["已授权", "Authorized"],
    ["已跳转授权流程，并标记为授权完成。", "Authorization flow has been opened and marked complete."],
    ["先输入你要接管或调整的内容。", "Enter the content you want to take over or adjust first."],
    ["来源：用户接管输入", "Source: User Takeover Input"],
    ["已记录这条调整指令，系统会基于当前自动任务继续执行并同步右侧运行状态。", "This adjustment has been recorded. The system will continue the current workflow and sync the right-side execution state."],
    ["来源：自动任务执行编排器", "Source: Workflow Execution Orchestrator"],
    ["已写入当前自动任务对话链路。", "The current workflow conversation chain has been updated."],
    ["自动任务记录", "Workflow History"],
    ["+ 新建对话", "+ New Chat"],
    ["市场", "Marketplace"],
    ["我的安装", "Installed"],
    ["开发者中心", "Developer Center"],
    ["搜索全球 AI 技能...", "Search AI skills worldwide..."],
    ["执行任务", "Run Task"],
    ["热门", "Popular"],
    ["写作", "Writing"],
    ["编程", "Coding"],
    ["数据分析", "Data Analysis"],
    ["视觉设计", "Visual Design"],
    ["效率工具", "Productivity Tools"],
    ["排序: 收益潜力", "Sort: Revenue Potential"],
    ["市场", "Marketplace"],
    ["全部文件", "All Files"],
    ["AI 生成", "AI Generated"],
    ["收藏", "Favorites"],
    ["回收站", "Trash"],
    ["搜索文件、图片或 AI 产出...", "Search files, images, or AI outputs..."],
    ["上传文件", "Upload File"],
    ["最近产出", "Recent Outputs"],
    ["清空回收站", "Empty Trash"],
    ["当前查看", "Currently Viewing"],
    ["文档片段", "Document Snippet"],
    ["用到的技能 / MCP", "Skills / MCP Used"],
    ["用 AI 继续编辑", "Continue Editing with AI"],
    ["导出", "Export"],
    ["草稿箱", "Drafts"],
    ["通过技能生成", "Generated via Skill"],
    ["技能流程", "Skill Flow"],
    ["手动上传", "Uploaded Manually"],
    ["项目中心", "Projects Center"],
    ["搜索项目名、仓库名或技术栈...", "Search project name, repository, or tech stack..."],
    ["当前选中", "Currently Selected"],
    ["状态", "Status"],
    ["自动修复方式", "Auto-Repair Policy"],
    ["查看详情", "View Details"],
    ["填入示例", "Fill Demo Data"],
    ["运行中", "Running"],
    ["启动中", "Starting"],
    ["没找到项目", "No Projects Found"],
    ["换个关键词试试，或者先导入一个新项目。", "Try a different keyword, or import a new project first."],
    ["请按 owner/repo 的格式填写。", "Please use the owner/repo format."],
    ["已从 GitHub 导入，等待系统识别安装方式和启动命令。", "Imported from GitHub. Waiting for the system to identify the install method and launch command."],
    ["还没启动过", "Not started yet"],
    ["使用当前账号", "Use Current Account"],
    ["健康检查 + 基础可用性检查 + 首页是否能打开", "Health check + basic availability check + homepage availability"],
    ["检查失败时自动交给 AI 修复", "Send to AI automatically when checks fail"],
    ["授权后会显示已连接的服务商", "Connected providers will appear after authorization"],
    ["项目已经导入到列表里了。", "The project has been imported into the list."],
    ["这里先演示同步效果，暂时不会真的拉 GitHub。", "This only demonstrates the sync effect for now and won't actually pull from GitHub."],
    ["Hubitos 项目详情", "Hubitos Project Detail"],
    ["项目详情", "Project Detail"],
    ["启动、检查、自动修复", "Launch, Verify, and Auto-Repair"],
    ["这个页面用来处理单个项目的本地启动、检查规则、运行日志，以及 AI 自动修复流程。", "This page handles local launch, verification rules, execution logs, and the AI auto-repair flow for a single project."],
    ["当前项目", "Current Project"],
    ["本地目录", "Local Directory"],
    ["上次启动", "Last Launch"],
    ["还没启动", "Not Started Yet"],
    ["一键启动", "One-click Start"],
    ["删除本地副本", "Delete Local Copy"],
    ["打开本地页面", "Open Local Page"],
    ["本地运行器", "Local Runner"],
    ["启动流程", "Launch Flow"],
    ["Hubitos Home", "Hubitos Home"],
    ["本地副本已删除", "Local copy deleted"],
    ["把多个 Agent 当成一个可以直接调度的执行团队。", "Treat multiple agents as an execution team you can dispatch directly."],
    ["这个首页更接近内置 Agent 的入口感受：先看任务、Agent 编队、执行进度，再决定由谁接管下一步。", "This homepage feels closer to an embedded agent entry: first review tasks, agent squads, and execution progress, then decide who takes over next."],
    ["返回通用首页", "Back to General Home"],
    ["进入对话执行", "Enter Chat Execution"],
    ["给任务分配编队，而不是只发一条 prompt。", "Assign a squad to the task instead of just sending one prompt."],
    ["在这里你可以先定义目标，再组合研究、写作、设计、执行等 Agent，由系统自动分阶段协作，然后把结果推进到聊天工作台继续细化。", "Here you can define the goal first, then combine agents for research, writing, design, and execution. The system coordinates them by phase and pushes results into the chat workspace for further refinement."],
    ["当前推荐编队", "Recommended Squad"],
    ["输入任务后可直接进入聊天工作台，保留任务上下文", "After entering a task, go straight into the chat workspace while keeping the task context."],
    ["启动任务", "Launch Task"],
    ["执行概况", "Execution Overview"],
    ["可调用 Agent 编队", "Callable Agent Squads"],
    ["重新编排", "Rebalance"],
    ["任务编排流", "Task Orchestration Flow"],
    ["实时任务队列", "Live Task Queue"],
    ["刷新队列", "Refresh Queue"],
    ["Agent 会话", "Agent Sessions"],
    ["调用", "Invoke"],
    ["继续", "Continue"],
    ["已重新给任务推荐 Agent 编队。", "A new recommended agent squad has been prepared for the task."],
    ["实时任务队列已刷新。", "The live task queue has been refreshed."],
    ["当前工具", "Current Tool"],
    ["工具", "Tool"],
    ["可直接使用", "Ready to Use"],
    ["当前自动任务", "Current Workflow"],
    ["可以继续", "Can Continue"],
    ["同一个问题已经让多个模型回答了。选一个继续往下聊。", "The same question has already been answered by multiple models. Pick one to continue."],
    ["已选中", "Selected"],
    ["可选择", "Available"],
    ["继续用这个模型", "Continue with This Model"],
    ["选这个模型", "Choose This Model"],
    ["换个模型", "Switch Model"],
    ["请选择模型", "Please Select a Model"],
    ["新对话", "New Chat"],
    ["默认会把对话保存为skill ，可在工具-我的 中找到", "Conversations are saved as skills by default and can be found in Tools > Mine."],
    ["这里还没有内容。后面生成的文档、图片和表格会自动放到这里。", "Nothing is here yet. Generated documents, images, and spreadsheets will appear here automatically."],
    ["没有上传文件", "No Files Uploaded"],
    ["暂时没有启用技能", "No Skills Enabled Yet"],
    ["约 9 秒", "About 9s"],
    ["适合整理复杂信息，输出结构更完整", "Best for organizing complex information with more complete structure."],
    ["大纲 + 说明理由 + 下一步建议", "Outline + Rationale + Next-Step Suggestions"],
    ["会结合文件、当前文件夹和已启用技能一起回答", "Answers with the current files, folder, and enabled skills in context."],
    ["约 3 秒", "About 3s"],
    ["适合快速迭代，先给你能马上执行的版本", "Best for fast iteration and giving you something executable right away."],
    ["简短答案 + 执行清单", "Short Answer + Action Checklist"],
    ["文案更短，更适合立刻修改", "Shorter copy, better for immediate edits."],
    ["约 14 秒", "About 14s"],
    ["适合做规划、比较方案和处理复杂任务", "Best for planning, comparing approaches, and handling complex tasks."],
    ["更完整的建议 + 执行注意点", "More Complete Suggestions + Execution Notes"],
    ["会带更多上下文，覆盖更多决策情况", "Carries more context and covers more decision scenarios."],
    ["请先输入任务，再发送。", "Enter a task before sending."],
    ["没找到这条回答对应的原始提问。", "Could not find the original prompt for this answer."],
    ["已经切换到这条对话。", "Switched to this conversation."],
    ["已新建一条对话。", "A new conversation has been created."],
    ["已把“", "Added \""],
    ["”带入输入框。", "\" to the input box."],
    ["已开启智能分配模型。", "Smart model routing enabled."],
    ["已切到手动选模型。", "Switched to manual model selection."],
    ["已根据当前对话推荐一组更合适的技能。", "Recommended a more suitable set of skills for the current conversation."],
    ["当前对话已置顶。", "The current conversation has been pinned."],
    ["当前对话已保存成模板。", "The current conversation has been saved as a template."],
    ["进行中", "In Progress"],
    ["排队中", "Queued"],
    ["待确认", "Pending Confirmation"],
    ["在线 Agent", "Online Agents"],
    ["并行任务", "Parallel Tasks"],
    ["本日交付", "Today's Deliveries"],
    ["任务解析", "Task Parsing"],
    ["编队组装", "Squad Assembly"],
    ["并行执行", "Parallel Execution"],
    ["结果汇总", "Result Consolidation"],
    ["输入:", "Input:"],
    ["输出:", "Output:"],
    ["分钟前", "minutes ago"],
    ["当前推荐编队", "Recommended Squad"],
    ["重新编排", "Rebalance"],
    ["刷新队列", "Refresh Queue"],
    ["任务", "Task"],
    ["编队", "Squad"],
    ["继续推进", "Continue"],
    ["待确认", "Pending Confirmation"],
    ["对外文案", "External Copy"],
    ["阶段", "Phase"],
    ["交付物", "Deliverables"],
    ["继续", "Continue"],
    ["调用", "Invoke"],
    ["搜索智能体、技能、MCP 或标签...", "Search agents, skills, MCPs, or tags..."],
    ["内容写作", "Content Writing"],
    ["调研分析", "Research & Analysis"],
    ["编程开发", "Coding & Development"],
    ["设计体验", "Design & UX"],
    ["自动化运营", "Automation & Operations"],
    ["客服支持", "Customer Support"],
    ["把零散需求整理成结构清楚的 PRD，自动补上目标、范围、流程和验收标准。", "Turn scattered requirements into a clear PRD and automatically fill in goals, scope, process, and acceptance criteria."],
    ["请用 PRD 写作助手把这个需求整理成结构化 PRD，并补上目标、范围、关键流程和验收标准。", "Use the PRD Writing Assistant to turn this requirement into a structured PRD and fill in goals, scope, key flows, and acceptance criteria."],
    ["市场调研助手", "Market Research Assistant"],
    ["帮你分析竞品、整理定位差异，并输出对比表和策略建议。", "Analyze competitors, summarize positioning differences, and produce comparison tables and strategy suggestions."],
    ["请调用市场调研助手，继续这段对话，并输出竞品分析和建议总结。", "Invoke the Market Research Assistant to continue this conversation and produce competitor analysis plus a recommendation summary."],
    ["代码重构提示词", "Code Refactoring Prompt"],
    ["让模型帮你重构组件，同时保证原有功能不变，并说明取舍和风险。", "Ask the model to refactor components while keeping existing behavior unchanged, and explain trade-offs and risks."],
    ["请重构这个组件，保持原有功能不变，并在给代码前先说明取舍和可能的风险。", "Refactor this component, keep existing behavior unchanged, and explain trade-offs plus possible risks before giving the code."],
    ["Telegram 机器人助手", "Telegram Bot Assistant"],
    ["帮你管理 Telegram 机器人流程，识别消息类型，并按规则回复。", "Manage Telegram bot workflows, identify message types, and reply according to rules."],
    ["请调用 Telegram 机器人助手，帮我设计下一步机器人流程、消息分流和回复规则。", "Invoke the Telegram Bot Assistant to design the next bot workflow, message routing, and reply rules."],
    ["Zalo 客服助手", "Zalo Support Assistant"],
    ["处理 Zalo 上的客服对话，保持统一语气，并在把握不大时转给人工。", "Handle customer conversations on Zalo, keep a consistent tone, and hand over to humans when confidence is low."],
    ["请调用 Zalo 客服助手，帮我设计客服回复流程，并在需要时转人工。", "Invoke the Zalo Support Assistant to design the support reply workflow and escalate to humans when needed."],
    ["社媒自动任务入口", "Social Media Workflow Entry"],
    ["打开 Twitter 和 Facebook 的一键自动任务页面，缺的信息由系统边问边补齐。", "Open the one-click Twitter and Facebook workflow page, with missing information filled through follow-up questions."],
    ["请打开社媒自动任务入口，帮我直接运行一个 Twitter 或 Facebook 自动任务，不想手动配置。", "Open the social media workflow entry and run a Twitter or Facebook workflow directly without manual configuration."],
    ["多模型对比提示词", "Multi-Model Comparison Prompt"],
    ["让多个模型同时回答同一个问题，再从里面选一个更好的继续往下聊。", "Have multiple models answer the same question at once, then choose the best one to continue."],
    ["请进入多模型对比模式，让多个模型回答同一个问题，并帮我选一个继续。", "Enter multi-model comparison mode, let several models answer the same question, and help me pick one to continue."],
    ["SEO 优化专家", "SEO Optimization Expert"],
    ["自动分析关键词竞争度，并生成更适合搜索流量的内容结构。", "Automatically analyze keyword competition and generate content structures better suited for search traffic."],
    ["请调用 SEO 优化专家，帮我做关键词分析和内容结构建议。", "Invoke the SEO Optimization Expert to help with keyword analysis and content structure suggestions."],
    ["代码重构助手", "Code Refactoring Assistant"],
    ["自动发现代码坏味道，并给出更清楚的重构建议和拆分计划。", "Automatically detect code smells and provide clearer refactoring suggestions plus a decomposition plan."],
    ["请调用代码重构助手，帮我识别问题并给出重构建议。", "Invoke the Code Refactoring Assistant to identify problems and provide refactoring suggestions."],
    ["本地化翻译官", "Localization Translator"],
    ["不只翻译文字，还会按目标市场调整语气和表达方式。", "Not only translates text, but also adapts tone and phrasing for the target market."],
    ["请调用本地化翻译官，帮我按目标市场调整语气和表达。", "Invoke the Localization Translator to adapt tone and phrasing for the target market."],
    ["UI 调色板大师", "UI Palette Master"],
    ["根据品牌调性，生成更协调的界面配色和组件建议。", "Generate more coherent interface colors and component suggestions based on brand tone."],
    ["请调用 UI 调色板大师，帮我做配色和界面风格建议。", "Invoke the UI Palette Master to help with color and interface style suggestions."],
    ["线框图草稿助手", "Wireframe Draft Assistant"],
    ["根据需求说明快速整理页面结构、模块顺序和交互草图建议。", "Quickly organize page structure, module order, and interaction sketch suggestions from the requirement brief."],
    ["请调用线框图草稿助手，帮我整理页面结构和模块布局草图。", "Invoke the Wireframe Draft Assistant to organize page structure and module layout sketches."],
    ["体验评审助手", "UX Review Assistant"],
    ["帮你检查页面信息层级、按钮路径和关键操作是否顺手。", "Check whether the page information hierarchy, button paths, and key interactions feel smooth."],
    ["请调用体验评审助手，帮我检查当前页面的操作路径和体验问题。", "Invoke the UX Review Assistant to inspect the current page for interaction paths and experience issues."],
    ["请用 PRD 写作助手帮我整理这个需求，并输出完整的大纲。", "Use the PRD Writing Assistant to organize this requirement and output a complete outline."],
    ["请帮我搜索刚上传的文件，并提取里面的关键结论。", "Help me search the uploaded files and extract the key conclusions."],
    ["请根据当前品牌方向，生成一版红白主视觉草图。", "Generate a red-and-white key visual draft based on the current brand direction."],
    ["请调用运营日报助手，整理今天的关键数据和执行建议。", "Invoke the Operations Daily Assistant to organize today's key metrics and execution recommendations."],
    ["网页抓取工具箱", "Web Scraping Toolkit"],
    ["帮智能体抓网页内容、转成 Markdown，也支持动态渲染页面。", "Help agents scrape web content, convert it to Markdown, and handle dynamically rendered pages."],
    ["请调用网页抓取工具箱，帮我抓取网页并整理成可继续编辑的内容。", "Invoke the Web Scraping Toolkit to scrape a webpage and turn it into editable content."],
    ["GitHub 开发组件", "GitHub Dev Toolkit"],
    ["适合做代码审查、问题分类，以及给出 PR 合并建议。", "Useful for code review, issue triage, and PR merge suggestions."],
    ["请调用 GitHub 开发组件，帮我做代码审查和问题分类。", "Invoke the GitHub Dev Toolkit to help with code review and issue triage."],
    ["金融数据流", "Financial Data Stream"],
    ["接入汇率、加密货币和美股数据，也支持自动生成分析报告。", "Connect to FX, crypto, and U.S. stock data, and generate analysis reports automatically."],
    ["请调用金融数据流，帮我拉取数据并生成分析总结。", "Invoke the Financial Data Stream to fetch data and generate an analytical summary."],
    ["安全保护器", "Security Protector"],
    ["在本地扫描和打码敏感信息，保护智能体处理隐私内容时更安全。", "Scan and mask sensitive information locally to keep agents safer when handling private content."],
    ["请调用安全保护器，帮我检查并处理敏感信息。", "Invoke the Security Protector to inspect and handle sensitive information."],
    ["工单分流助手", "Ticket Routing Assistant"],
    ["自动识别用户问题类型，把咨询、投诉和售后请求分给合适的人处理。", "Automatically identify user issue types and route inquiries, complaints, and after-sales requests to the right people."],
    ["请调用工单分流助手，帮我把用户问题按类型分类并分配处理。", "Invoke the Ticket Routing Assistant to classify user issues by type and route them for handling."],
    ["客服回复润色", "Support Reply Polisher"],
    ["把原始回复改得更清楚、更礼貌，也更符合品牌语气。", "Polish raw replies to make them clearer, more polite, and more aligned with brand tone."],
    ["请调用客服回复润色，帮我把这段客服回复改得更清楚、更礼貌。", "Invoke Support Reply Polisher to make this support reply clearer and more polite."],
    ["最近对话", "Recent Conversations"],
    ["最近用过的技能", "Recently Used Skills"],
    ["最近用过的智能体", "Recently Used Agents"],
    ["常用提示词", "Prompt Library"],
    ["一键带入最近常用的技能，直接用到当前任务里。", "Insert recently used skills in one click and apply them directly to the current task."],
    ["直接复用最近常用的智能体角色和做事方式。", "Directly reuse the roles and workflows of recently used agents."],
    ["请把这份项目说明整理成完整 PRD，并同时输出 Word 和 Markdown。", "Turn this project brief into a complete PRD and output both Word and Markdown."],
    ["请根据我上传的 PDF 和图片，生成一版桌面客户端首页草图。", "Based on the uploaded PDF and images, generate a desktop client homepage draft."],
    ["请把这些资料整理成一个可复用的自动任务，并输出适合团队协作的执行方案。", "Turn these materials into a reusable workflow and produce an execution plan suitable for team collaboration."],
    ["带入输入框", "Insert into Input"],
    ["清除", "Clear"],
    ["请基于这个 Twitter 评论互动工作流，继续帮我梳理评论策略、互动节奏和风险边界。", "Based on this Twitter comment-engagement workflow, continue helping me refine comment strategy, engagement cadence, and risk boundaries."],
    ["设计说明.pdf", "Design-Brief.pdf"],
    ["品牌参考图.png", "Brand-Reference.png"],
    ["新任务对话", "New Task Conversation"],
    ["当前工具", "Current Tool"],
    ["工具", "Tool"],
    ["当前自动任务", "Current Workflow"],
    ["还差 ", ""],
    [" 项信息", " items missing"],
    ["可直接使用", "Ready to Use"],
    ["Ⅱ + 模型对比", "II + Model Compare"],
    ["同一个问题已经让多个模型回答了。选一个继续往下聊。", "Several models have already answered the same question. Pick one to continue."],
    ["已选中", "Selected"],
    ["可选择", "Available"],
    ["这里还没有内容。后面生成的文档、图片和表格会自动放到这里。", "Nothing is here yet. Generated documents, images, and spreadsheets will appear here automatically."],
    ["会议纪要.docx", "Meeting-Notes.docx"],
    ["参考海报.png", "Reference-Poster.png"],
    ["需求清单.xlsx", "Requirements-Checklist.xlsx"],
    ["竞品资料.pdf", "Competitor-Materials.pdf"],
    ["数据样例.csv", "Data-Sample.csv"],
    ["系统会自动识别文件类型。", "The system will automatically detect the file type."],
    ["我会按“高质量整理”的方式来处理这个任务。当前参考资料有：", "I will handle this task with a high-quality structuring approach. Current reference materials: "],
    ["我会先梳理设计方向、页面层级和判断标准，再把结果整理到“", "I will first organize the design direction, page hierarchy, and evaluation criteria, then sort the results into \""],
    ["”这条线里。当前启用的技能有：", "\". The currently enabled skills are: "],
    ["。输出会更偏结构化说明，方便你继续修改，也方便交接给下一个同事。", ". The output will be more structured, making it easier to revise and hand off."],
    ["我会用更直接、更省时间的方式来处理。结合这些资料：", "I will handle this more directly and efficiently. Based on these materials: "],
    ["，我会尽量给你一个更短、更好执行的版本。输出会更偏重点清单和下一步动作，让团队能马上接着干。", ", I will try to give you a shorter, easier-to-execute version. The output will focus more on key checklists and next actions so the team can move immediately."],
    ["我会把它当成一个更复杂的执行任务来处理。我会把 ", "I will treat this as a more complex execution task. I will take the context from "],
    [" 里的上下文一起考虑进去，先把关键取舍想清楚，再给你更完整的建议。你会看到更细的执行假设、边界情况和后续怎么落地的说明。", " into account, think through the key trade-offs first, and then give you more complete recommendations. You will see more detailed execution assumptions, edge cases, and implementation guidance."],
    ["请先对比，再选一个模型继续", "Compare first, then choose a model to continue"],
    ["我收到任务了。当前参考资料有：", "Task received. Current reference materials: "],
    ["。我会先判断这些文件适合怎么处理，再结合 ", ". I will first decide how these files should be handled, then combine them with "],
    [" 来准备结果，默认会保存到 ", " to prepare the result, which will be saved by default to "],
    ["。草稿准备好后，你可以在下面选择输出格式，对应文件也会直接出现在这条回复下面。", ". Once the draft is ready, you can choose an output format below, and the corresponding files will appear under this reply."],
    ["已保存到 ", "Saved to "],
    ["根据表格内容自动生成", "Auto-generated from spreadsheet content"],
    ["PDF｜表格结果快照", "PDF | Spreadsheet snapshot"],
    [" 因为检测到了表格文件，所以我会优先准备表格版结果。", " Since a spreadsheet file was detected, I will prioritize a spreadsheet-oriented result."],
    ["根据图片内容自动生成", "Auto-generated from image content"],
    ["PPT｜含视觉参考", "PPT | Includes visual references"],
    [" 因为检测到了图片文件，所以我会优先准备视觉版结果。", " Since an image file was detected, I will prioritize a visual result."],
    ["根据 PDF 自动生成", "Auto-generated from PDF"],
    ["Markdown｜可继续编辑", "Markdown | Editable"],
    [" 因为检测到了 PDF，所以我会优先准备可编辑的文档版结果。", " Since a PDF was detected, I will prioritize an editable document result."],
    ["Markdown｜结构化草稿已完成", "Markdown | Structured draft ready"],
    ["Word 文档｜可继续编辑", "Word Document | Editable"],
    ["表格｜已含结构化字段", "Spreadsheet | Structured fields included"],
    ["PDF｜已生成导出稿", "PDF | Export draft ready"],
    ["图片｜可继续修改", "Image | Editable"],
    [" 因为你没有指定输出格式，所以我先把多个常用格式都准备好了，方便你直接选。", " Since you did not specify an output format, I prepared several common formats first so you can choose directly."],
    ["输出格式：下方可选", "Output: Choose below"],
    ["继续帮我整理成下一版可直接执行的草稿。", "Continue refining this into the next execution-ready draft."],
    ["正在对比 ", "Comparing "],
    [" 对同一个问题的回答。", " on the same question."],
    ["已经切换到这条对话。", "Switched to this conversation."],
    ["接下来会继续使用 ", "Next, we will continue with "],
    ["，下一轮你也可以再重新对比。", ", and you can compare again in the next round."],
    [" 文件已经出现在这条回复下面了。", " file is now shown under this reply."],
    ["已进入对比模式：", "Entered compare mode: "],
    ["已切换到 ", "Switched to "],
    ["已把“", "Added \""],
    ["”从当前对话里移除。", "\" from the current conversation."],
    ["已上传 ", "Uploaded "]
  ];

  const zhToEnMap = new Map(PAIRS);
  const enToZhMap = new Map(PAIRS.map(([zh, en]) => [en, zh]));
  const zhSubstrings = Array.from(zhToEnMap.keys()).sort((a, b) => b.length - a.length);
  const enSubstrings = Array.from(enToZhMap.keys()).sort((a, b) => b.length - a.length);

  const zhToEnRules = [
    [/默认文件夹：(.+) \/ 输出：(.+)/g, "Default folder: $1 / Output: $2"],
    [/Auto Routing 已开启：当前任务会根据推理强度、输出格式和附件类型自动切换模型，当前使用 (.+)。/g, "Auto Routing is on: the current task will automatically switch models based on reasoning depth, output format, and attachment type. Current model: $1."],
    [/Auto Routing 已开启：当前任务会根据推理强度、输出格式和附件类型自动切换模型。/g, "Auto Routing is on: the current task will automatically switch models based on reasoning depth, output format, and attachment type."],
    [/当前为手动模型模式：已锁定 (.+)，系统不会自动切换模型。/g, "Manual model mode is on: $1 is locked and the system will not switch models automatically."],
    [/已启用 (\d+) 个技能/g, "$1 skills enabled"],
    [/已归档到 (.+)/g, "Archived to $1"],
    [/已归档到(.+)/g, "Archived to $1"],
    [/已切换到 (.+)/g, "Switched to $1"],
    [/(\d+(?:\.\d+)?) 项 •/g, "$1 items •"],
    [/(\d+(?:\.\d+)?) 安装/g, "$1 installs"],
    [/新文件夹 (\d+)/g, "New Folder $1"],
    [/上传文件_(\d+)\.pdf/g, "Uploaded_File_$1.pdf"],
    [/今天, 刚刚/g, "Today, just now"],
    [/(\d+)月(\d+)日, (\d+:\d+)/g, "$1/$2, $3"],
    [/用户：/g, "User: "],
    [/输出：/g, "Output: "],
    [/日志：/g, "Log: "],
    [/节点输出：/g, "Node output: "]
    ,[/已上传 (.+)，系统会自动识别文件类型。/g, "Uploaded $1. The system will automatically detect the file type."]
    ,[/已进入对比模式：(.+)/g, "Entered compare mode: $1"]
    ,[/已切换到 (.+)/g, "Switched to $1"]
    ,[/接下来会继续使用 (.+)，下一轮你也可以再重新对比。/g, "Next, continuing with $1. You can compare again in the next round."]
    ,[/(.+) 文件已经出现在这条回复下面了。/g, "$1 file is now shown under this reply."]
    ,[/已把“(.+)”从当前对话里移除。/g, "Removed \"$1\" from the current conversation."]
  ];

  const enToZhRules = [
    [/Default folder: (.+) \/ Output: (.+)/g, "默认文件夹：$1 / 输出：$2"],
    [/Auto Routing is on: the current task will automatically switch models based on reasoning depth, output format, and attachment type. Current model: (.+)./g, "Auto Routing 已开启：当前任务会根据推理强度、输出格式和附件类型自动切换模型，当前使用 $1。"],
    [/Auto Routing is on: the current task will automatically switch models based on reasoning depth, output format, and attachment type./g, "Auto Routing 已开启：当前任务会根据推理强度、输出格式和附件类型自动切换模型。"],
    [/Manual model mode is on: (.+) is locked and the system will not switch models automatically./g, "当前为手动模型模式：已锁定 $1，系统不会自动切换模型。"],
    [/(\d+) skills enabled/g, "已启用 $1 个技能"],
    [/Archived to (.+)/g, "已归档到 $1"],
    [/Switched to (.+)/g, "已切换到 $1"],
    [/(\d+(?:\.\d+)?) items •/g, "$1 项 •"],
    [/(\d+(?:\.\d+)?) installs/g, "$1 安装"],
    [/New Folder (\d+)/g, "新文件夹 $1"],
    [/Uploaded_File_(\d+)\.pdf/g, "上传文件_$1.pdf"],
    [/Today, just now/g, "今天, 刚刚"],
    [/(\d+)\/(\d+), (\d+:\d+)/g, "$1月$2日, $3"],
    [/User: /g, "用户："],
    [/Output: /g, "输出："],
    [/Log: /g, "日志："],
    [/Node output: /g, "节点输出："]
  ];

  function loadAiCache() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(AI_CACHE_KEY) || "{}");
      Object.entries(saved).forEach(([key, value]) => {
        if (typeof value === "string" && value) aiTranslationCache.set(key, value);
      });
    } catch (error) {
      // Ignore cache hydration failures.
    }
  }

  function scheduleAiCachePersist() {
    clearTimeout(aiCachePersistTimer);
    aiCachePersistTimer = setTimeout(() => {
      try {
        window.localStorage.setItem(AI_CACHE_KEY, JSON.stringify(Object.fromEntries(aiTranslationCache)));
      } catch (error) {
        // Ignore cache persistence failures.
      }
    }, 120);
  }

  function getAiCacheKey(text, targetLang) {
    return `${targetLang}::${text}`;
  }

  function getCachedAiTranslation(text, targetLang) {
    return aiTranslationCache.get(getAiCacheKey(text, targetLang)) || null;
  }

  function setCachedAiTranslation(text, targetLang, translated) {
    if (!translated || translated === text) return;
    aiTranslationCache.set(getAiCacheKey(text, targetLang), translated);
    scheduleAiCachePersist();
  }

  function readStoredLanguage() {
    try {
      const url = new URL(window.location.href);
      const queryLang = url.searchParams.get("lang");
      if (queryLang === "zh" || queryLang === "en") {
        window.localStorage.setItem(STORAGE_KEY, queryLang);
        return queryLang;
      }
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored === "zh" || stored === "en" ? stored : DEFAULT_LANG;
    } catch (error) {
      return DEFAULT_LANG;
    }
  }

  function writeStoredLanguage(lang) {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      return;
    }
  }

  function containsHan(value) {
    return /[\u3400-\u9fff]/.test(value);
  }

  function translateByMap(input, targetLang) {
    if (!input || typeof input !== "string") return input;
    const directMap = targetLang === "en" ? zhToEnMap : enToZhMap;
    const substrings = targetLang === "en" ? zhSubstrings : enSubstrings;
    const rules = targetLang === "en" ? zhToEnRules : enToZhRules;
    let output = directMap.get(input) || input;

    substrings.forEach((source) => {
      if (!source || source === output) return;
      if (output.includes(source)) {
        output = output.split(source).join(directMap.get(source));
      }
    });

    rules.forEach(([pattern, replacement]) => {
      output = output.replace(pattern, replacement);
    });

    return output;
  }

  function translateText(original, targetLang) {
    if (!original || typeof original !== "string") return original;
    if (targetLang === "en") {
      if (!containsHan(original)) return original;
      const mapped = translateByMap(original, "en");
      const cached = getCachedAiTranslation(original, "en");
      return cached || mapped;
    }
    return containsHan(original) ? original : translateByMap(original, "zh");
  }

  function canUseAiTranslation(targetLang) {
    return (
      targetLang === "en" &&
      currentLang === "en" &&
      window.isSecureContext &&
      typeof window.Translator !== "undefined"
    );
  }

  async function getAiTranslator(targetLang) {
    if (!canUseAiTranslation(targetLang)) return null;
    if (!translatorPromise) {
      translatorPromise = (async () => {
        try {
          const availability = await window.Translator.availability({
            sourceLanguage: "zh",
            targetLanguage: "en"
          });
          if (availability === "unavailable") return null;
          return window.Translator.create({
            sourceLanguage: "zh",
            targetLanguage: "en"
          });
        } catch (error) {
          return null;
        }
      })();
    }
    return translatorPromise;
  }

  function scheduleAiRefresh() {
    if (aiRefreshTimer || currentLang !== "en") return;
    aiRefreshTimer = window.setTimeout(() => {
      aiRefreshTimer = null;
      applyLanguage();
    }, 60);
  }

  function queueAiTranslation(original, targetLang) {
    if (!original || typeof original !== "string") return;
    if (!containsHan(original) || !canUseAiTranslation(targetLang)) return;
    const cacheKey = getAiCacheKey(original, targetLang);
    if (aiTranslationCache.has(cacheKey) || pendingAiTranslations.has(cacheKey)) return;

    const task = (async () => {
      const translator = await getAiTranslator(targetLang);
      if (!translator) return;
      try {
        const translated = await translator.translate(original);
        if (!translated || translated === original) return;
        setCachedAiTranslation(original, targetLang, translated);
        scheduleAiRefresh();
      } catch (error) {
        // Ignore individual translation failures and keep the map-based fallback.
      }
    })().finally(() => {
      pendingAiTranslations.delete(cacheKey);
    });

    pendingAiTranslations.set(cacheKey, task);
  }

  function storeAttributeOriginal(element, attr, value) {
    if (!attributeOriginals.has(element)) attributeOriginals.set(element, {});
    const record = attributeOriginals.get(element);
    if (!(attr in record)) record[attr] = value;
    return record[attr];
  }

  function getAttributeOriginal(element, attr) {
    const record = attributeOriginals.get(element);
    return record && attr in record ? record[attr] : element.getAttribute(attr);
  }

  function isTranslatableControl(element) {
    if (!element || !element.tagName) return false;
    const tag = element.tagName;
    if (tag === "TEXTAREA") return true;
    if (tag !== "INPUT") return false;
    const type = (element.getAttribute("type") || "text").toLowerCase();
    return ["text", "search", "email", "url", "tel"].includes(type);
  }

  function shouldSkipNode(node) {
    let current = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    while (current) {
      if (current.hasAttribute && current.hasAttribute(IGNORE_ATTR)) return true;
      const tag = current.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "CODE" || tag === "PRE") return true;
      current = current.parentElement;
    }
    return false;
  }

  function processTextNode(textNode) {
    if (!textNode || shouldSkipNode(textNode)) return;
    const currentValue = textNode.nodeValue;
    if (!textNodeOriginals.has(textNode)) {
      textNodeOriginals.set(textNode, currentValue);
    } else {
      const knownOriginal = textNodeOriginals.get(textNode);
      const renderedKnownValue = translateText(knownOriginal, currentLang);
      if (currentValue !== knownOriginal && currentValue !== renderedKnownValue) {
        textNodeOriginals.set(textNode, currentValue);
      }
    }
    const original = textNodeOriginals.get(textNode);
    const translated = translateText(original, currentLang);
    if (translated !== textNode.nodeValue) textNode.nodeValue = translated;
    queueAiTranslation(original, currentLang);
  }

  function processAttributes(element) {
    if (!element || shouldSkipNode(element)) return;
    ["title", "placeholder", "aria-label"].forEach((attr) => {
      if (!element.hasAttribute(attr)) return;
      const currentValue = element.getAttribute(attr);
      storeAttributeOriginal(element, attr, currentValue);
      const knownOriginal = getAttributeOriginal(element, attr);
      const renderedKnownValue = translateText(knownOriginal, currentLang);
      if (currentValue !== knownOriginal && currentValue !== renderedKnownValue) {
        const record = attributeOriginals.get(element);
        record[attr] = currentValue;
      }
      const original = getAttributeOriginal(element, attr);
      const translated = translateText(original, currentLang);
      if (translated !== element.getAttribute(attr)) element.setAttribute(attr, translated);
      queueAiTranslation(original, currentLang);
    });

    if (isTranslatableControl(element)) {
      const currentValue = element.value;
      if (currentValue) {
        storeAttributeOriginal(element, "value", currentValue);
        const knownOriginal = getAttributeOriginal(element, "value");
        const renderedKnownValue = translateText(knownOriginal, currentLang);
        if (currentValue !== knownOriginal && currentValue !== renderedKnownValue) {
          const record = attributeOriginals.get(element);
          record.value = currentValue;
        }
        const original = getAttributeOriginal(element, "value");
        const translated = translateText(original, currentLang);
        if (translated !== element.value) element.value = translated;
        queueAiTranslation(original, currentLang);
      }
    }
  }

  function processSubtree(root) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      processTextNode(root);
      return;
    }

    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;

    if (root.nodeType === Node.ELEMENT_NODE) processAttributes(root);

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let node = walker.currentNode;
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) processTextNode(node);
      if (node.nodeType === Node.ELEMENT_NODE) processAttributes(node);
      node = walker.nextNode();
    }
  }

  function applyLanguage() {
    document.documentElement.lang = currentLang === "en" ? "en" : "zh-CN";
    processSubtree(document.querySelector("title"));
    processSubtree(document.body);
    updateSettingsPanel();
    document.dispatchEvent(
      new CustomEvent("hubitos:languagechange", {
        detail: { lang: currentLang }
      })
    );
  }

  function injectStyles() {
    if (document.getElementById("hubitos-i18n-style")) return;
    const style = document.createElement("style");
    style.id = "hubitos-i18n-style";
    style.textContent = `
      .hubitos-lang-switch {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
        display: none;
        width: min(320px, calc(100vw - 32px));
        padding: 18px;
        border: 1px solid rgba(234, 215, 212, 0.92);
        border-radius: 24px;
        background: rgba(255, 253, 252, 0.98);
        box-shadow: 0 20px 48px rgba(118, 39, 27, 0.18);
        backdrop-filter: blur(18px);
      }

      .hubitos-lang-switch.is-open {
        display: grid;
        gap: 14px;
      }

      .hubitos-lang-overlay {
        position: fixed;
        inset: 0;
        z-index: 9998;
        display: none;
        background: rgba(20, 12, 11, 0.2);
        backdrop-filter: blur(4px);
      }

      .hubitos-lang-overlay.is-open {
        display: block;
      }

      .hubitos-lang-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .hubitos-lang-title {
        font: 700 18px/1.2 "Inter", "PingFang SC", "Microsoft YaHei", sans-serif;
        color: #2f201e;
      }

      .hubitos-lang-section-label {
        font: 600 12px/1.2 "Inter", "PingFang SC", "Microsoft YaHei", sans-serif;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: #8c7671;
      }

      .hubitos-lang-options {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .hubitos-lang-switch button {
        min-width: 0;
        min-height: 42px;
        padding: 0 14px;
        border: 0;
        border-radius: 16px;
        background: #f8efed;
        color: #6d5c58;
        cursor: pointer;
        font: 600 13px/1 "Inter", "PingFang SC", "Microsoft YaHei", sans-serif;
        transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
      }

      .hubitos-lang-switch button:hover {
        transform: translateY(-1px);
      }

      .hubitos-lang-switch button.is-active {
        background: linear-gradient(180deg, #d92d20 0%, #b91e13 100%);
        color: #ffffff;
      }

      @media (max-width: 768px) {
        .hubitos-lang-switch {
          width: calc(100vw - 24px);
          padding: 16px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureBroadcast() {
    if (!("BroadcastChannel" in window)) return;
    if (channels.length) return;
    const channel = new BroadcastChannel("hubitos-i18n");
    channel.addEventListener("message", (event) => {
      if (!event || !event.data || !event.data.lang || event.data.lang === currentLang) return;
      currentLang = event.data.lang;
      writeStoredLanguage(currentLang);
      applyLanguage();
    });
    channels.push(channel);
  }

  function broadcastLanguage(lang) {
    channels.forEach((channel) => channel.postMessage({ lang }));
  }

  function updateSettingsPanel() {
    const panel = document.getElementById("hubitosLangSwitch");
    if (!panel) return;
    const title = panel.querySelector("[data-role='settings-title']");
    const label = panel.querySelector("[data-role='language-label']");
    if (title) title.textContent = currentLang === "en" ? "Settings" : "设置";
    if (label) label.textContent = currentLang === "en" ? "Language" : "语言";
    panel.querySelectorAll("button[data-lang]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.lang === currentLang);
    });
  }

  function openSettingsPanel() {
    const overlay = document.getElementById("hubitosLangOverlay");
    const panel = document.getElementById("hubitosLangSwitch");
    if (!overlay || !panel) return;
    overlay.classList.add("is-open");
    panel.classList.add("is-open");
    updateSettingsPanel();
  }

  function closeSettingsPanel() {
    const overlay = document.getElementById("hubitosLangOverlay");
    const panel = document.getElementById("hubitosLangSwitch");
    if (!overlay || !panel) return;
    overlay.classList.remove("is-open");
    panel.classList.remove("is-open");
  }

  function ensureSettingsPanel() {
    if (document.getElementById("hubitosLangSwitch") || !document.body) return;
    const overlay = document.createElement("div");
    overlay.id = "hubitosLangOverlay";
    overlay.className = "hubitos-lang-overlay";
    overlay.setAttribute(IGNORE_ATTR, "true");
    overlay.addEventListener("click", closeSettingsPanel);

    const panel = document.createElement("div");
    panel.id = "hubitosLangSwitch";
    panel.className = "hubitos-lang-switch";
    panel.setAttribute(IGNORE_ATTR, "true");
    panel.innerHTML = `
      <div class="hubitos-lang-header">
        <div class="hubitos-lang-title" data-role="settings-title">Settings</div>
      </div>
      <div class="hubitos-lang-section">
        <div class="hubitos-lang-section-label" data-role="language-label">Language</div>
        <div class="hubitos-lang-options">
          <button type="button" data-lang="en">English</button>
          <button type="button" data-lang="zh">中文</button>
        </div>
      </div>
    `;
      panel.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-lang]");
        if (!button) return;
        const lang = button.dataset.lang === "zh" ? "zh" : "en";
        writeStoredLanguage(lang);
        const url = new URL(window.location.href);
        url.searchParams.set("lang", lang);
        window.location.href = url.toString();
      });
    document.addEventListener(
      "click",
      (event) => {
        const button = event.target.closest(".hubitos-settings-link");
        if (!button) return;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        if (panel.classList.contains("is-open")) {
          closeSettingsPanel();
          return;
        }
        openSettingsPanel();
      },
      true
    );
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeSettingsPanel();
    });
    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    updateSettingsPanel();
  }

  function setLanguage(lang, options) {
    const nextLang = lang === "zh" ? "zh" : "en";
    if (currentLang === nextLang && !(options && options.force)) return;
    currentLang = nextLang;
    writeStoredLanguage(currentLang);
    applyLanguage();
    if (!options || options.broadcast !== false) broadcastLanguage(currentLang);
  }

  function translateDeep(value, targetLang) {
    const lang = targetLang === "zh" || targetLang === "en" ? targetLang : currentLang;
    if (typeof value === "string") return translateText(value, lang);
    if (Array.isArray(value)) return value.map((item) => translateDeep(item, lang));
    if (value && typeof value === "object") {
      const next = {};
      Object.keys(value).forEach((key) => {
        next[key] = translateDeep(value[key], lang);
      });
      return next;
    }
    return value;
  }

  function observeDom() {
    if (observer || !document.body) return;
    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => processSubtree(node));
        }
        if (mutation.type === "characterData") {
          processTextNode(mutation.target);
        }
        if (
          mutation.type === "attributes" &&
          mutation.target &&
          mutation.target.nodeType === Node.ELEMENT_NODE
        ) {
          processAttributes(mutation.target);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["title", "placeholder", "aria-label"]
    });
  }

  function patchAlert() {
    if (window.__hubitosAlertPatched) return;
    window.__hubitosAlertPatched = true;
    const nativeAlert = window.alert.bind(window);
    window.alert = function (message) {
      nativeAlert(translateText(String(message), currentLang));
    };
  }

  function init() {
    loadAiCache();
    injectStyles();
    ensureBroadcast();
    ensureSettingsPanel();
    patchAlert();
    observeDom();
    applyLanguage();
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has("lang")) {
        url.searchParams.delete("lang");
        window.history.replaceState({}, "", url.toString());
      }
    } catch (error) {
      // Ignore URL normalization failures.
    }
    window.addEventListener("storage", (event) => {
      if (event.key !== STORAGE_KEY) return;
      const nextLang = event.newValue === "zh" ? "zh" : "en";
      if (nextLang === currentLang) return;
      currentLang = nextLang;
      applyLanguage();
    });
  }

  window.HubitosI18n = {
    getLanguage() {
      return currentLang;
    },
    setLanguage,
    refresh() {
      applyLanguage();
    },
    openSettings() {
      openSettingsPanel();
    },
    closeSettings() {
      closeSettingsPanel();
    },
    translate(text) {
      return translateText(String(text), currentLang);
    },
    translateDeep(value, targetLang) {
      return translateDeep(value, targetLang);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
