# Desktop Client Pages

用于存放 Hubitos AI OS 桌面客户端已开发完成或开发中的页面代码。

目录约定：

- `home`：桌面首页、欢迎页、统一入口
- `hermes-agent-home`：偏 Agent 指挥台风格的首页原型
- `chat`：对话工作台相关页面
- `tools`：Prompt / Agent 工具中心相关页面
- `projects`：GitHub 项目频道、本地部署工作台相关页面
- `files`：文件中心相关页面
- `agents`：我的 Agent、Agent 商店、Agent 编辑页
- `skills`：我的 Skills、Skills 商店、Skill 编辑页
- `mcp`：MCP 管理、MCP 商店、MCP 配置页
- `digital-employees`：数字员工、任务编排、群控、日志、告警
- `commerce`：订阅、订单、收益、提现
- `settings`：设置中心页面
- `shared`：通用布局、壳层、共享页面模块

建议命名：

- 页面文件夹使用 kebab-case
- 一个页面一个独立目录
- 页面目录内至少包含入口文件、样式文件和说明文件

本地可运行能力：

- 竞品网站监控工作流已接入本地 API 原型服务，启动命令：`python3 scripts/competitor_workflow_server.py`
- 服务默认监听 `http://127.0.0.1:8765`，`workflows/workflows-home.html` 会直接调用这个地址
- 启动后，在“自动任务”页创建“竞品网站监控与周期报告”任务，系统会立即抓取首轮网站内容，并按设定周期继续生成报告
