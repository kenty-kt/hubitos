(function () {
  const mountedSidebars = new Map();
  let sidebarLanguageListenerBound = false;

  const defaultHistoryItems = [
    { title: "市场调研整理", pinned: true },
    { title: "PRD 撰写讨论", pinned: false },
    { title: "竞品分析汇总", pinned: false }
  ];

  function renderHistoryItems(items) {
    const translate = getTranslator();
    return items
      .map(
        (item, index) => `
          <button class="history-item ${index === 0 ? "active" : ""}" type="button">
            <span class="history-label">${translate(item.title)}</span>
            <span class="history-delete">${item.pinned ? "📌" : "🗑"}</span>
          </button>
        `
      )
      .join("");
  }

  function ensureSettingsStyles() {
    if (document.getElementById("hubitos-sidebar-settings-style")) return;
    const style = document.createElement("style");
    style.id = "hubitos-sidebar-settings-style";
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
      }

      .hubitos-lang-title {
        font-size: 18px;
        font-weight: 700;
        color: #241b1a;
      }

      .hubitos-lang-section-label {
        margin-bottom: 10px;
        font-size: 12px;
        font-weight: 700;
        color: #8a716c;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .hubitos-lang-options {
        display: grid;
        gap: 10px;
      }

      .hubitos-lang-switch button[data-lang] {
        min-height: 42px;
        border: 1px solid rgba(236, 214, 209, 0.96);
        border-radius: 16px;
        background: #fff;
        color: #352523;
        cursor: pointer;
        font: inherit;
      }

      .hubitos-lang-switch button[data-lang].is-active {
        border-color: rgba(217, 45, 32, 0.26);
        background: #fff1ed;
        color: #d92d20;
        font-weight: 700;
      }
    `;
    document.head.appendChild(style);
  }

  function getCurrentLanguage() {
    try {
      const url = new URL(window.location.href);
      const queryLang = url.searchParams.get("lang");
      if (queryLang === "zh" || queryLang === "en") return queryLang;
      const stored = window.localStorage.getItem("hubitos-language");
      return stored === "zh" ? "zh" : "en";
    } catch (error) {
      return "en";
    }
  }

  function getTranslator() {
    const lang = getCurrentLanguage();
    return function translate(text) {
      if (lang !== "en" || !text) return text;
      if (window.HubitosI18n && typeof window.HubitosI18n.translate === "function") {
        return window.HubitosI18n.translate(String(text));
      }
      return text;
    };
  }

  function updateSettingsPanel(panel) {
    if (!panel) return;
    const currentLang =
      window.HubitosI18n && typeof window.HubitosI18n.getLanguage === "function"
        ? window.HubitosI18n.getLanguage()
        : getCurrentLanguage();
    const title = panel.querySelector("[data-role='settings-title']");
    const label = panel.querySelector("[data-role='language-label']");
    if (title) title.textContent = currentLang === "en" ? "Settings" : "设置";
    if (label) label.textContent = currentLang === "en" ? "Language" : "语言";
    panel.querySelectorAll("button[data-lang]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.lang === currentLang);
    });
  }

  function ensureSettingsPanel() {
    if (!document.body) return null;
    ensureSettingsStyles();

    let overlay = document.getElementById("hubitosLangOverlay");
    let panel = document.getElementById("hubitosLangSwitch");

    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "hubitosLangOverlay";
      overlay.className = "hubitos-lang-overlay";
      overlay.addEventListener("click", closeSettingsPanel);
      document.body.appendChild(overlay);
    }

    if (!panel) {
      panel = document.createElement("div");
      panel.id = "hubitosLangSwitch";
      panel.className = "hubitos-lang-switch";
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
        window.localStorage.setItem("hubitos-language", lang);
        const url = new URL(window.location.href);
        url.searchParams.set("lang", lang);
        window.location.href = url.toString();
      });
      document.body.appendChild(panel);
    }

    if (!window.__hubitosSidebarSettingsEsc) {
      window.__hubitosSidebarSettingsEsc = true;
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeSettingsPanel();
      });
    }

    updateSettingsPanel(panel);

    return { overlay, panel };
  }

  function openSettingsPanel() {
    const parts = ensureSettingsPanel();
    if (!parts) return;
    updateSettingsPanel(parts.panel);
    parts.overlay.classList.add("is-open");
    parts.panel.classList.add("is-open");
  }

  function closeSettingsPanel() {
    const overlay = document.getElementById("hubitosLangOverlay");
    const panel = document.getElementById("hubitosLangSwitch");
    if (overlay) overlay.classList.remove("is-open");
    if (panel) panel.classList.remove("is-open");
  }

  function renderSidebar(config) {
    const translate = getTranslator();
    const navItems = [
      { key: "home", label: translate("首页"), icon: "⌂", href: config.homeHref || "../home/home.html" },
      { key: "chat", label: translate("对话"), icon: "◔", href: config.chatHref || "#" },
      { key: "tools", label: translate("智能体"), icon: "⌘", href: config.toolsHref || "#" },
      { key: "workflows", label: translate("自动任务"), icon: "↗", href: config.workflowsHref || "../workflows/workflows-home.html" },
      { key: "projects", label: translate("项目"), icon: "▣", href: config.projectsHref || "#" },
      { key: "files", label: translate("文件"), icon: "◫", href: config.filesHref || "#" },
      { key: "employees", label: translate("数字员工"), icon: "◎", href: config.employeesHref || "../agents/agents-workflow-editor.html?id=agent-private-growth" },
      { key: "commerce", label: translate("商业"), icon: "◇", href: config.commerceHref || "#" }
    ];
    const projectChildren = [
      {
        key: "competitor-analysis",
        label: translate("竞品分析"),
        href: config.competitorAnalysisHref || "../tools/coze-competitor-analysis.html"
      }
    ];

    const historyBlock = config.showHistory
      ? `
        <section class="hubitos-sidebar-section">
          <div class="hubitos-sidebar-title">${translate(config.historyTitle || "历史对话")}</div>
          <div class="hubitos-sidebar-body history-list" id="${config.historyContainerId || "historyList"}">${renderHistoryItems(config.historyItems || defaultHistoryItems)}</div>
        </section>
      `
      : "";

    const profileInitial = (config.profileInitial || "K").trim().charAt(0).toUpperCase() || "K";

    return `
      <aside class="hubitos-sidebar ${config.fixed ? "is-fixed" : ""}">
        <div>
          <div class="hubitos-brand-block">
            <div class="hubitos-brand-lockup">
              <span class="hubitos-brand-mark" aria-hidden="true">
                <span class="hubitos-brand-mark-core"></span>
              </span>
              <div class="hubitos-brand-copy">
                <div class="hubitos-brand-name">HUBITOS</div>
                <div class="hubitos-brand-subtitle">${translate("Your AI Workspace")}</div>
              </div>
            </div>
          </div>
          <nav class="hubitos-main-nav">
            ${navItems
              .map((item) => {
                const children = item.key === "projects" ? projectChildren : [];
                const parentActive =
                  config.active === item.key || children.some((child) => child.key === config.active);
                const childMarkup = children.length
                  ? `
                    <div class="hubitos-subnav">
                      ${children
                        .map(
                          (child) => `
                            <a class="hubitos-subnav-item ${config.active === child.key ? "is-active" : ""}" href="${child.href}">
                              <span class="hubitos-subnav-bullet"></span>
                              <span>${child.label}</span>
                            </a>
                          `
                        )
                        .join("")}
                    </div>
                  `
                  : "";

                return `
                  <div class="hubitos-nav-group ${parentActive ? "is-active-group" : ""}">
                    <a class="hubitos-nav-item ${parentActive ? "is-active" : ""}" href="${item.href}">
                      <span class="hubitos-nav-icon">${item.icon}</span>
                      <span>${item.label}</span>
                    </a>
                    ${childMarkup}
                  </div>
                `;
              })
              .join("")}
          </nav>
          ${historyBlock}
        </div>
        <div class="hubitos-sidebar-footer">
          <button ${config.primaryId ? `id="${config.primaryId}"` : ""} class="hubitos-primary-action" type="button">${translate(config.primaryLabel || "+ 新建项目")}</button>
          <div class="hubitos-sidebar-meta">
            <button ${config.settingsId ? `id="${config.settingsId}"` : ""} class="hubitos-settings-link" type="button">⚙ ${translate("设置")}</button>
            <button class="hubitos-profile-chip" type="button" aria-label="用户头像">
              <span class="hubitos-profile-avatar">${profileInitial}</span>
            </button>
          </div>
        </div>
      </aside>
    `;
  }

  window.HubitosSidebar = {
    mount(targetSelector, config) {
      const target = document.querySelector(targetSelector);
      if (!target) return;
      const resolvedConfig = config || {};
      mountedSidebars.set(targetSelector, resolvedConfig);
      target.innerHTML = renderSidebar(resolvedConfig);
      const settingsButton = target.querySelector(".hubitos-settings-link");
      if (settingsButton) {
        settingsButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          const panel = document.getElementById("hubitosLangSwitch");
          if (panel && panel.classList.contains("is-open")) {
            closeSettingsPanel();
            return;
          }
          openSettingsPanel();
        });
      }

      if (!sidebarLanguageListenerBound) {
        sidebarLanguageListenerBound = true;
        document.addEventListener("hubitos:languagechange", () => {
          mountedSidebars.forEach((storedConfig, selector) => {
            const sidebarTarget = document.querySelector(selector);
            if (!sidebarTarget) return;
            sidebarTarget.innerHTML = renderSidebar(storedConfig || {});
            const newSettingsButton = sidebarTarget.querySelector(".hubitos-settings-link");
            if (newSettingsButton) {
              newSettingsButton.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                const panel = document.getElementById("hubitosLangSwitch");
                if (panel && panel.classList.contains("is-open")) {
                  closeSettingsPanel();
                  return;
                }
                openSettingsPanel();
              });
            }
          });
        });
      }
    }
  };
})();
