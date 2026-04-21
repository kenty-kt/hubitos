(function () {
  const STORAGE_KEY = "hubitos-language";
  const DEFAULT_LANG = "en";
  const IGNORE_ATTR = "data-hubitos-i18n-ignore";
  const textNodeOriginals = new WeakMap();
  const attributeOriginals = new WeakMap();
  const channels = [];
  let currentLang = readStoredLanguage();
  let observer = null;

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

    ["对话", "Chat"],
    ["文件", "Files"],
    ["智能体", "Agents"],
    ["技能", "Skills"],
    ["数字员工", "Digital Workers"],
    ["商业", "Commerce"],
    ["历史对话", "History"],
    ["+ 新对话", "+ New Chat"],
    ["+ 新建项目", "+ New Project"],
    ["设置", "Settings"],
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
    ["图片生成", "Image Generation"],
    ["代码解释", "Code Explanation"],
    ["模板中心", "Template Library"],
    ["PRD 写作助手", "PRD Writing Assistant"],
    ["根据当前品牌方向生成一版红白主题视觉草图。", "Generate a red-and-white visual draft based on the current brand direction."],
    ["调用市场研究助理，输出竞品分析和建议摘要。", "Call the market research assistant and output competitor analysis with a recommendation summary."],
    ["市场研究助理", "Market Research Assistant"],
    ["品牌视觉顾问", "Brand Visual Advisor"],
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
    ["系统设置面板已预留", "The system settings panel has been reserved"]
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

  function readStoredLanguage() {
    try {
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
      return containsHan(original) ? translateByMap(original, "en") : original;
    }
    return containsHan(original) ? original : translateByMap(original, "zh");
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

  function shouldSkipNode(node) {
    let current = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    while (current) {
      if (current.hasAttribute && current.hasAttribute(IGNORE_ATTR)) return true;
      const tag = current.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "TEXTAREA" || tag === "CODE" || tag === "PRE") return true;
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
    });
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
      setLanguage(button.dataset.lang);
      closeSettingsPanel();
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
      nativeAlert(translateByMap(String(message), currentLang));
    };
  }

  function init() {
    injectStyles();
    ensureBroadcast();
    ensureSettingsPanel();
    patchAlert();
    observeDom();
    applyLanguage();
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
    translate(text) {
      return translateByMap(String(text), currentLang);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
