const detailRefs = {
  configForm: document.getElementById("configForm"),
  saveDraftBtn: document.getElementById("saveDraftBtn"),
  launchBtn: document.getElementById("launchBtn"),
  authorizeXBtn: document.getElementById("authorizeXBtn"),
  authorizeMetaBtn: document.getElementById("authorizeMetaBtn"),
  authorizeLinkedinBtn: document.getElementById("authorizeLinkedinBtn"),
  approveAllBtn: document.getElementById("approveAllBtn"),
  bypassReviewToggle: document.getElementById("bypassReviewToggle"),
  resultEmpty: document.getElementById("resultEmpty"),
  resultContent: document.getElementById("resultContent"),
  resultSummary: document.getElementById("resultSummary"),
  resultStream: document.getElementById("resultStream"),
  orchestratorStatus: document.getElementById("orchestratorStatus"),
  generationStatus: document.getElementById("generationStatus"),
  publisherStatus: document.getElementById("publisherStatus"),
  deploymentFoot: document.getElementById("deploymentFoot"),
  tokenUsedValue: document.getElementById("tokenUsedValue"),
  tokenBudgetValue: document.getElementById("tokenBudgetValue"),
  tokenStageValue: document.getElementById("tokenStageValue"),
  tokenFoot: document.getElementById("tokenFoot"),
  toast: document.getElementById("toast")
};

const DETAIL_STORAGE_KEY = "hubitos-x-workflow-detail-draft";
const RESULT_STORAGE_KEY = "hubitos-x-workflow-detail-current-job";
const API_BASE = "http://127.0.0.1:8767/api/x-publisher";
const GENERATED_FIELD_VALUES = {
  objective: "提升海外产品账号关注增长，并为官网产品页带来高质量点击",
  topic: "AI agent 在真实团队协作中的落地方法",
  audience: "海外 SaaS 创始人、增长负责人和产品经理，关注自动化、效率提升、团队协作和可复制的增长方法。",
  sources: "抓取 5 个海外 AI 工具竞品账号、2 个行业 KOL 列表、官网博客文章、最近 30 天高互动收藏推文，以及产品知识库里的客户案例。",
  window: "09:30 / 13:30 / 20:00",
  tone: "专业、清晰、有观点，避免空泛宣传；多用真实场景和可执行建议，不要像模板文案。"
};

const detailState = {
  auth: { authorized: false, profile: null },
  currentJob: null,
  bypassReview: false,
  authPoller: null,
  authPopup: null
};

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function showToast(text) {
  detailRefs.toast.textContent = text;
  detailRefs.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => detailRefs.toast.classList.remove("show"), 1800);
}

function readFormData() {
  const fields = detailRefs.configForm.querySelectorAll("input[name], textarea[name], select[name]");
  return Array.from(fields).reduce((payload, field) => {
    if (field.type === "checkbox") {
      payload[field.name] = field.checked;
    } else {
      payload[field.name] = field.value;
    }
    return payload;
  }, {});
}

function setFieldValue(fieldName, value) {
  const field = detailRefs.configForm.querySelector(`[name="${fieldName}"]`);
  if (field) field.value = value;
}

function persistRenderedJob(job) {
  if (!job) {
    window.sessionStorage.removeItem(RESULT_STORAGE_KEY);
    return;
  }
  window.sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(job));
}

function restoreRenderedJob() {
  try {
    return JSON.parse(window.sessionStorage.getItem(RESULT_STORAGE_KEY) || "null");
  } catch (error) {
    window.sessionStorage.removeItem(RESULT_STORAGE_KEY);
    return null;
  }
}

function saveDraft() {
  const payload = {
    ...readFormData(),
    bypassReview: detailRefs.bypassReviewToggle.checked
  };
  window.localStorage.setItem(DETAIL_STORAGE_KEY, JSON.stringify(payload));
  showToast("已保存这个工作流草稿。");
}

function setButtonState(button, enabled, label) {
  button.disabled = !enabled;
  button.textContent = label;
}

function setPlatformPlaceholder(button, statusRef, label) {
  if (!button || !statusRef) return;
  statusRef.textContent = "暂未接入";
  statusRef.classList.remove("done");
  setButtonState(button, false, `${label} 即将支持`);
}

function getXStatusRef() {
  return document.getElementById("authStatusX");
}

function renderAuthState() {
  const statusRef = getXStatusRef();
  if (!statusRef) return;
  if (detailState.auth.authorized) {
    const username = detailState.auth.profile?.username ? ` @${detailState.auth.profile.username}` : "";
    statusRef.textContent = `已授权${username}`;
    statusRef.classList.add("done");
    setButtonState(detailRefs.authorizeXBtn, true, "重新授权 X");
  } else {
    statusRef.textContent = "未授权";
    statusRef.classList.remove("done");
    setButtonState(detailRefs.authorizeXBtn, true, "授权 X");
  }
}

function renderOperationalState() {
  detailRefs.orchestratorStatus.textContent = "运行中";
  detailRefs.orchestratorStatus.className = "deployment-status live";

  const hasFormConfig = Boolean(readFormData().objective || readFormData().topic || readFormData().sources);
  detailRefs.generationStatus.textContent = hasFormConfig ? "待生成" : "待命";
  detailRefs.generationStatus.className = "deployment-status standby";

  if (!detailState.auth.authorized) {
    detailRefs.publisherStatus.textContent = "等待授权";
    detailRefs.publisherStatus.className = "deployment-status pending";
    detailRefs.deploymentFoot.textContent = "请先完成 X 授权。授权成功后，系统才能排期并自动发布推文。";
    return;
  }

  const job = detailState.currentJob;
  if (!job || !job.items?.length) {
    detailRefs.publisherStatus.textContent = "已就绪";
    detailRefs.publisherStatus.className = "deployment-status live";
    detailRefs.deploymentFoot.textContent = "X 已授权，下一步可以生成待审核内容并写入定时发布队列。";
    return;
  }

  const published = job.stats?.published || 0;
  const scheduled = job.stats?.scheduled || 0;
  const failed = job.stats?.failed || 0;
  if (failed) {
    detailRefs.publisherStatus.textContent = "部分失败";
    detailRefs.publisherStatus.className = "deployment-status pending";
    detailRefs.deploymentFoot.textContent = `当前队列有 ${failed} 条发布失败，可点击“立即发布”重试。`;
  } else if (published === job.stats.total) {
    detailRefs.publisherStatus.textContent = "全部已发布";
    detailRefs.publisherStatus.className = "deployment-status live";
    detailRefs.deploymentFoot.textContent = `当前队列 ${published} 条内容都已发出。`;
  } else if (scheduled) {
    detailRefs.publisherStatus.textContent = "等待发布";
    detailRefs.publisherStatus.className = "deployment-status live";
    detailRefs.deploymentFoot.textContent = `当前有 ${scheduled} 条内容在队列中，服务会按时间自动发布。`;
  } else {
    detailRefs.publisherStatus.textContent = "等待审核";
    detailRefs.publisherStatus.className = "deployment-status pending";
    detailRefs.deploymentFoot.textContent = "当前内容已生成，审核通过后就会进入定时发布队列。";
  }
}

function renderTokenState() {
  const job = detailState.currentJob;
  const formData = readFormData();
  const filledCount = ["objective", "topic", "audience", "sources", "window", "tone"].filter((key) => Boolean(formData[key])).length;
  const baseUsage = filledCount * 120 + (detailState.auth.authorized ? 180 : 0);
  const generatedUsage = job?.items?.length ? 4200 : 0;
  const total = baseUsage + generatedUsage;

  detailRefs.tokenUsedValue.textContent = total.toLocaleString("en-US");
  detailRefs.tokenBudgetValue.textContent = "24,000";
  if (job?.stats?.published) {
    detailRefs.tokenStageValue.textContent = "发布中";
  } else if (job?.items?.length) {
    detailRefs.tokenStageValue.textContent = "生成完成";
  } else if (detailState.auth.authorized) {
    detailRefs.tokenStageValue.textContent = "配置中";
  } else {
    detailRefs.tokenStageValue.textContent = "待机中";
  }
  detailRefs.tokenFoot.textContent = job?.items?.length
    ? "本次已进入内容生成与发布排期阶段，token 已计入内容草案生成和队列规划。"
    : "授权和基础配置只会产生少量 token 消耗，生成发布方案后会明显增加。";
}

function statusLabel(item) {
  if (item.status === "published") return "已发布";
  if (item.status === "scheduled") return "待发布";
  if (item.status === "failed") return "发布失败";
  return item.approved ? "已审核" : "待审核";
}

function formatTimeLabel(item) {
  if (item.publishedAt) return `已发布 ${item.publishedAt.replace("T", " ")}`;
  if (item.scheduleLabel) return item.scheduleLabel;
  return item.scheduledAt ? item.scheduledAt.replace("T", " ") : "待排期";
}

function renderGeneratedItems() {
  const items = detailState.currentJob?.items || [];
  detailRefs.resultStream.innerHTML = items.map((item) => {
    const approved = item.approved;
    const isPublished = item.status === "published";
    const canApprove = !approved || item.status === "failed";
    const canPublishNow = approved && item.status !== "published";
    const errorBlock = item.error ? `<div class="stream-chip">错误：${escapeHtml(item.error)}</div>` : "";
    return `
      <article class="stream-item">
        <div class="stream-meta">
          <div class="stream-tags">
            <span class="stream-tag">${escapeHtml(item.platform)}</span>
            <span class="stream-tag">${escapeHtml(item.type)}</span>
          </div>
          <div class="stream-side">
            <span class="stream-review-status ${approved ? "approved" : "pending"}">${escapeHtml(statusLabel(item))}</span>
            <span class="stream-time">${escapeHtml(formatTimeLabel(item))}</span>
          </div>
        </div>
        <div class="stream-title">${escapeHtml(item.title)}</div>
        <div class="stream-body">${escapeHtml(item.body)}</div>
        <div class="stream-footer">
          <span class="stream-chip">受众：${escapeHtml(item.audience)}</span>
          <span class="stream-chip">语气：${escapeHtml(item.tone)}</span>
          ${errorBlock}
        </div>
        <div class="stream-action-row">
          <button class="stream-approve-btn ${approved ? "approved" : ""}" type="button" data-approve-item="${escapeHtml(item.id)}" ${canApprove ? "" : "disabled"}>
            ${approved ? "已审核" : "审核通过"}
          </button>
          <button class="ghost-pill" type="button" data-publish-item="${escapeHtml(item.id)}" ${canPublishNow ? "" : "disabled"}>
            ${isPublished ? "已发布" : "立即发布"}
          </button>
        </div>
      </article>
    `;
  }).join("");

  const stats = detailState.currentJob?.stats || { total: 0, approved: 0, published: 0, scheduled: 0, failed: 0 };
  detailRefs.resultSummary.textContent = `当前共生成 ${stats.total} 条内容，其中 ${stats.approved} 条已审核，${stats.scheduled} 条待发布，${stats.published} 条已发布。`;
}

function clearJobRender() {
  detailState.currentJob = null;
  persistRenderedJob(null);
  detailRefs.resultStream.innerHTML = "";
  detailRefs.resultSummary.textContent = "";
  detailRefs.resultEmpty.classList.remove("hidden");
  detailRefs.resultContent.classList.add("hidden");
  renderOperationalState();
  renderTokenState();
}

function revealResultPanel() {
  detailRefs.resultEmpty.classList.add("hidden");
  detailRefs.resultContent.classList.remove("hidden");
}

function renderJob(job) {
  if (!job?.items?.length) {
    return false;
  }

  detailState.currentJob = job;
  persistRenderedJob(job);
  revealResultPanel();
  renderGeneratedItems();
  renderOperationalState();
  renderTokenState();
  return true;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }
  return data;
}

async function syncAuthStatus() {
  try {
    const auth = await requestJson(`${API_BASE}/auth/status`);
    detailState.auth = {
      authorized: Boolean(auth.authorized),
      profile: auth.profile || null
    };
    renderAuthState();
    renderOperationalState();
    renderTokenState();
    return auth;
  } catch (error) {
    renderAuthState();
    throw error;
  }
}

function startAuthPolling() {
  clearInterval(detailState.authPoller);
  detailState.authPoller = setInterval(async () => {
    const auth = await syncAuthStatus().catch(() => null);
    if (auth?.authorized) {
      clearInterval(detailState.authPoller);
      showToast("X 授权成功，现在可以生成发布方案了。");
    }
    if (detailState.authPopup && detailState.authPopup.closed) {
      clearInterval(detailState.authPoller);
      detailState.authPopup = null;
      await syncAuthStatus().catch(() => null);
    }
  }, 1500);
}

function authorizeX() {
  detailState.authPopup = window.open(`${API_BASE}/auth/start`, "hubitos-x-oauth", "width=680,height=820,noopener,noreferrer");
  if (!detailState.authPopup) {
    showToast("浏览器拦截了授权窗口，请允许弹窗后重试。");
    return;
  }
  try {
    detailState.authPopup.opener = null;
  } catch (error) {
    // Ignore browsers that block changing opener.
  }
  startAuthPolling();
}

async function launchWorkflow(event) {
  event?.preventDefault();
  event?.stopPropagation();
  if (!detailState.auth.authorized) {
    showToast("请先完成 X 授权，再生成发布方案。");
    return;
  }
  const payload = {
    ...readFormData(),
    bypassReview: detailRefs.bypassReviewToggle.checked
  };
  try {
    saveDraft();
    const data = await requestJson(`${API_BASE}/jobs`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    const rendered = renderJob(data.job);
    if (!rendered) {
      revealResultPanel();
      detailRefs.resultSummary.textContent = "已收到发布方案返回，但前端未识别到内容结构。";
      detailRefs.resultStream.innerHTML = `<pre class="stream-item">${escapeHtml(JSON.stringify(data.job, null, 2))}</pre>`;
    }
    showToast("已生成这条 X 发布工作流，并写入定时发布队列。");
  } catch (error) {
    showToast(`生成发布方案失败：${error.message}`);
  }
}

async function approveItems(itemIds = []) {
  if (!detailState.currentJob?.id) {
    showToast("还没有可审核的内容。");
    return;
  }
  try {
    const data = await requestJson(`${API_BASE}/jobs/${detailState.currentJob.id}/approve`, {
      method: "POST",
      body: JSON.stringify({ itemIds })
    });
    renderJob(data.job);
    showToast(itemIds.length ? "这条内容已审核通过。" : "所有内容已审核通过。");
  } catch (error) {
    showToast(`审核失败：${error.message}`);
  }
}

async function publishNow(itemIds = []) {
  if (!detailState.currentJob?.id) return;
  try {
    const data = await requestJson(`${API_BASE}/jobs/${detailState.currentJob.id}/publish-now`, {
      method: "POST",
      body: JSON.stringify({ itemIds })
    });
    renderJob(data.job);
    showToast("已触发立即发布，请稍后查看结果。");
  } catch (error) {
    showToast(`立即发布失败：${error.message}`);
  }
}

function toggleBypassReview(checked) {
  detailState.bypassReview = checked;
}

function generateFieldValue(fieldName) {
  const value = GENERATED_FIELD_VALUES[fieldName];
  if (!value) return;
  setFieldValue(fieldName, value);
  renderOperationalState();
  renderTokenState();
  showToast(`已为「${fieldName}」生成模拟数据。`);
}

function loadDraft() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(DETAIL_STORAGE_KEY) || "{}");
    detailRefs.bypassReviewToggle.checked = Boolean(saved.bypassReview);
    detailState.bypassReview = Boolean(saved.bypassReview);
  } catch (error) {
    window.localStorage.removeItem(DETAIL_STORAGE_KEY);
  }
}

async function initializePage() {
  loadDraft();
  const restoredJob = restoreRenderedJob();
  setPlatformPlaceholder(detailRefs.authorizeMetaBtn, document.getElementById("authStatusMeta"), "Meta");
  setPlatformPlaceholder(detailRefs.authorizeLinkedinBtn, document.getElementById("authStatusLinkedin"), "LinkedIn");
  renderAuthState();
  if (restoredJob?.items?.length) {
    renderJob(restoredJob);
  } else {
    clearJobRender();
  }
  await syncAuthStatus().catch((error) => {
    showToast(`X 发布服务未启动：${error.message}`);
  });
}

function bindEvents() {
  detailRefs.saveDraftBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    saveDraft();
  });
  detailRefs.launchBtn.addEventListener("click", (event) => {
    launchWorkflow(event);
  });
  detailRefs.authorizeXBtn.addEventListener("click", authorizeX);
  detailRefs.approveAllBtn.addEventListener("click", () => approveItems());
  detailRefs.bypassReviewToggle.addEventListener("change", (event) => {
    toggleBypassReview(event.target.checked);
  });
  detailRefs.configForm.addEventListener("input", () => {
    renderOperationalState();
    renderTokenState();
  });
  detailRefs.configForm.addEventListener("click", (event) => {
    const button = event.target.closest("[data-generate-field]");
    if (!button) return;
    generateFieldValue(button.dataset.generateField);
  });
  detailRefs.resultStream.addEventListener("click", (event) => {
    const approveButton = event.target.closest("[data-approve-item]");
    if (approveButton) {
      approveItems([approveButton.dataset.approveItem]);
      return;
    }
    const publishButton = event.target.closest("[data-publish-item]");
    if (publishButton) {
      publishNow([publishButton.dataset.publishItem]);
    }
  });
  window.addEventListener("message", async (event) => {
    if (event.data?.type !== "hubitos-x-auth") return;
    await syncAuthStatus().catch(() => null);
    clearInterval(detailState.authPoller);
    showToast(event.data.success ? "X 授权成功。" : "X 授权失败，请重试。");
  });
}

bindEvents();
initializePage();
