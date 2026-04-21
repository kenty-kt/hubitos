(function () {
  const defaultHistoryItems = [
    { title: "Market Research Plan", pinned: true },
    { title: "PRD Writing Discussion", pinned: false },
    { title: "Competitor Analysis Report", pinned: false }
  ];

  function renderHistoryItems(items) {
    return items
      .map(
        (item, index) => `
          <button class="history-item ${index === 0 ? "active" : ""}" type="button">
            <span class="history-label">${item.title}</span>
            <span class="history-delete">${item.pinned ? "📌" : "🗑"}</span>
          </button>
        `
      )
      .join("");
  }

  function renderSidebar(config) {
    const navItems = [
      { key: "chat", label: "对话", icon: "▤", href: config.chatHref || "#" },
      { key: "files", label: "文件", icon: "⌂", href: config.filesHref || "#" },
      { key: "agents", label: "智能体", icon: "✦", href: config.agentsHref || "#" },
      { key: "skills", label: "技能", icon: "⚡", href: config.skillsHref || "#" },
      { key: "mcp", label: "MCP", icon: "⎔", href: config.mcpHref || "#" },
      { key: "employees", label: "数字员工", icon: "◎", href: config.employeesHref || "#" },
      { key: "commerce", label: "商业", icon: "◫", href: config.commerceHref || "#" }
    ];

    const historyBlock = config.showHistory
      ? `
        <section class="hubitos-sidebar-section">
          <div class="hubitos-sidebar-title">${config.historyTitle || "历史对话"}</div>
          <div class="hubitos-sidebar-body history-list" id="${config.historyContainerId || "historyList"}">${renderHistoryItems(config.historyItems || defaultHistoryItems)}</div>
        </section>
      `
      : "";

    return `
      <aside class="hubitos-sidebar ${config.fixed ? "is-fixed" : ""}">
        <div>
          <div class="hubitos-brand-block">
            <div class="hubitos-brand-name">Hubitos</div>
            <div class="hubitos-brand-subtitle">Precision OS</div>
          </div>
          <nav class="hubitos-main-nav">
            ${navItems
              .map(
                (item) => `
                  <a class="hubitos-nav-item ${config.active === item.key ? "is-active" : ""}" href="${item.href}">
                    <span class="hubitos-nav-icon">${item.icon}</span>
                    <span>${item.label}</span>
                  </a>
                `
              )
              .join("")}
          </nav>
          ${historyBlock}
        </div>
        <div class="hubitos-sidebar-footer">
          <button ${config.primaryId ? `id="${config.primaryId}"` : ""} class="hubitos-primary-action" type="button">${config.primaryLabel || "+ 新建项目"}</button>
          <button ${config.settingsId ? `id="${config.settingsId}"` : ""} class="hubitos-settings-link" type="button">⚙ 设置</button>
        </div>
      </aside>
    `;
  }

  window.HubitosSidebar = {
    mount(targetSelector, config) {
      const target = document.querySelector(targetSelector);
      if (!target) return;
      target.innerHTML = renderSidebar(config || {});
    }
  };
})();
