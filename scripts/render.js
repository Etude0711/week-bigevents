const CATEGORY_META = {
  "sports-industry": {
    label: "体育产业",
    description: "聚焦产业规模、资本流向、科技能力、场馆升级与商业模式变化。"
  },
  "sports-events": {
    label: "体育赛事",
    description: "关注国际赛事赛历、票务、城市联动、场馆运营与大赛预热节点。"
  },
  "fitness-market": {
    label: "健身市场",
    description: "覆盖健身房、器材、精品工作室、AI 健身和健康管理新趋势。"
  },
  "brand-dynamics": {
    label: "品牌动态",
    description: "跟踪运动品牌、健身品牌的新品、供应链、合作和扩张动作。"
  }
};

const REGION_LABELS = {
  all: "全部地区",
  global: "全球",
  china: "中国",
  "north-america": "北美",
  europe: "欧洲",
  "latin-america": "拉美",
  "asia-pacific": "亚太"
};

const LANGUAGE_LABELS = {
  all: "全部语言",
  zh: "中文",
  en: "English",
  es: "Español"
};

const SOURCE_KIND_LABELS = {
  media: "媒体",
  brand: "品牌",
  institution: "机构"
};

const PRIORITY_LABELS = {
  1: "重点关注",
  2: "持续跟进",
  3: "观察池"
};

const SORTERS = {
  priority: (left, right) => {
    if (left.priority !== right.priority) {
      return left.priority - right.priority;
    }
    return new Date(right.publishedAt) - new Date(left.publishedAt);
  },
  newest: (left, right) => new Date(right.publishedAt) - new Date(left.publishedAt),
  source: (left, right) => left.source.localeCompare(right.source, "zh-CN")
};

const state = {
  category: "all",
  region: "all",
  language: "all",
  sort: "priority",
  search: ""
};

let briefData = null;

const elements = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  cacheElements();
  bindControls();

  try {
    briefData = await getBriefData();
    renderStaticShell();
    render();
  } catch (error) {
    renderLoadFailure(error);
  }
}

function cacheElements() {
  const ids = [
    "week-pill",
    "hero-summary",
    "hero-stats",
    "notice-card",
    "category-chips",
    "region-select",
    "language-select",
    "sort-select",
    "search-input",
    "results-hint",
    "featured-grid",
    "category-sections",
    "brief-highlights",
    "pipeline-list",
    "coverage-grid",
    "sources-summary",
    "feed-list",
    "reset-filters"
  ];

  ids.forEach((id) => {
    elements[toCamelCase(id)] = document.getElementById(id);
  });
}

function bindControls() {
  elements.regionSelect.addEventListener("change", (event) => {
    state.region = event.target.value;
    render();
  });

  elements.languageSelect.addEventListener("change", (event) => {
    state.language = event.target.value;
    render();
  });

  elements.sortSelect.addEventListener("change", (event) => {
    state.sort = event.target.value;
    render();
  });

  elements.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    render();
  });

  elements.resetFilters.addEventListener("click", () => {
    state.category = "all";
    state.region = "all";
    state.language = "all";
    state.sort = "priority";
    state.search = "";

    elements.regionSelect.value = "all";
    elements.languageSelect.value = "all";
    elements.sortSelect.value = "priority";
    elements.searchInput.value = "";

    render();
  });
}

async function getBriefData() {
  try {
    const response = await fetch("data/news.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`无法读取数据文件，状态码 ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (window.__WEEKLY_BRIEF_DATA__) {
      return window.__WEEKLY_BRIEF_DATA__;
    }

    throw error;
  }
}

function renderStaticShell() {
  elements.weekPill.textContent = `${briefData.weekLabel} · ${formatRange(
    briefData.weekRange.start,
    briefData.weekRange.end
  )}`;

  elements.noticeCard.innerHTML = `
    <div class="notice-copy">
      <p class="section-kicker">数据说明</p>
      <p>${safe(briefData.disclaimer)}</p>
    </div>
    <div class="notice-meta">
      <p class="meta-line">最近整理时间</p>
      <strong>${safe(formatDateTime(briefData.generatedAt))}</strong>
    </div>
  `;

  renderHighlights();
  renderPipeline();
  renderFeedCards();
  populateSelect(elements.regionSelect, REGION_LABELS, getOrderedValues(briefData.items, "region", Object.keys(REGION_LABELS)));
  populateSelect(
    elements.languageSelect,
    LANGUAGE_LABELS,
    getOrderedValues(briefData.items, "language", Object.keys(LANGUAGE_LABELS))
  );
}

function render() {
  if (!briefData) {
    return;
  }

  const chipItems = filterItems(briefData.items, { ignoreCategory: true });
  const filteredItems = sortItems(filterItems(briefData.items));

  renderCategoryChips(chipItems);
  renderHero(filteredItems);
  renderResultsHint(filteredItems);
  renderFeatured(filteredItems);
  renderSections(filteredItems);
  renderCoverage(filteredItems);
  renderSourceSummary(filteredItems);
}

function renderHero(items) {
  const sourceCount = uniqueCount(items.map((item) => item.source));
  const regionCount = uniqueCount(items.map((item) => item.region));
  const languageCount = uniqueCount(items.map((item) => item.language));
  const priorityCount = items.filter((item) => item.priority === 1).length;

  if (!items.length) {
    elements.heroSummary.textContent = "当前筛选条件下暂无资讯，请尝试切换地区、语言或清空关键词。";
  } else {
    elements.heroSummary.textContent = `当前视图共 ${items.length} 条资讯，覆盖 ${sourceCount} 家来源、${regionCount} 个地区与 ${languageCount} 种语言。`;
  }

  const statItems = [
    { label: "当前资讯", value: `${items.length}` },
    { label: "高优先级", value: `${priorityCount}` },
    { label: "来源数量", value: `${sourceCount}` },
    { label: "地区/语言", value: `${regionCount} / ${languageCount}` }
  ];

  elements.heroStats.innerHTML = statItems
    .map(
      (item) => `
        <div>
          <dt>${safe(item.label)}</dt>
          <dd>${safe(item.value)}</dd>
        </div>
      `
    )
    .join("");
}

function renderCategoryChips(items) {
  const allCount = items.length;
  const categoryCounts = items.reduce((accumulator, item) => {
    accumulator[item.category] = (accumulator[item.category] || 0) + 1;
    return accumulator;
  }, {});

  const chipDefinitions = [
    { value: "all", label: "全部资讯", count: allCount },
    ...Object.entries(CATEGORY_META).map(([key, meta]) => ({
      value: key,
      label: meta.label,
      count: categoryCounts[key] || 0
    }))
  ];

  elements.categoryChips.innerHTML = "";

  chipDefinitions.forEach((definition) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip-button${state.category === definition.value ? " is-active" : ""}`;
    button.innerHTML = `<span>${safe(definition.label)}</span><strong>${definition.count}</strong>`;
    button.addEventListener("click", () => {
      state.category = definition.value;
      render();
    });
    elements.categoryChips.appendChild(button);
  });
}

function renderResultsHint(items) {
  if (!items.length) {
    elements.resultsHint.textContent = "没有匹配结果。可以尝试清空关键词、切换语言或恢复默认筛选。";
    return;
  }

  const filters = [];

  if (state.category !== "all") {
    filters.push(CATEGORY_META[state.category].label);
  }
  if (state.region !== "all") {
    filters.push(REGION_LABELS[state.region]);
  }
  if (state.language !== "all") {
    filters.push(LANGUAGE_LABELS[state.language]);
  }
  if (state.search) {
    filters.push(`关键词“${state.search}”`);
  }

  const filterLabel = filters.length ? `当前条件：${filters.join(" / ")}。` : "当前条件：全部资讯。";
  const sourceCount = uniqueCount(items.map((item) => item.source));
  elements.resultsHint.textContent = `${filterLabel} 共展示 ${items.length} 条资讯，涉及 ${sourceCount} 家来源。`;
}

function renderFeatured(items) {
  const featuredItems = items.filter((item) => item.featured);
  const pickedItems = (featuredItems.length ? featuredItems : items).slice(0, 4);

  if (!pickedItems.length) {
    elements.featuredGrid.innerHTML = renderEmptyCard("当前筛选条件下没有可展示的精选资讯。");
    return;
  }

  elements.featuredGrid.innerHTML = pickedItems
    .map((item, index) => renderArticleCard(item, true, index === 0 && pickedItems.length > 2))
    .join("");
}

function renderSections(items) {
  const visibleCategories = state.category === "all" ? Object.keys(CATEGORY_META) : [state.category];
  const sections = [];

  visibleCategories.forEach((categoryKey) => {
    const sectionItems = items.filter((item) => item.category === categoryKey);

    if (!sectionItems.length && state.category === "all") {
      return;
    }

    const meta = CATEGORY_META[categoryKey];
    const body = sectionItems.length
      ? `<div class="news-grid">${sectionItems.map((item) => renderArticleCard(item, false, false)).join("")}</div>`
      : renderEmptyCard("当前分类下暂无符合条件的资讯。", true);

    sections.push(`
      <section class="news-section">
        <div class="section-meta">
          <div>
            <p class="section-kicker">${safe(meta.label)}</p>
            <h3>${safe(meta.label)}</h3>
          </div>
          <p>${safe(meta.description)} 当前共 ${sectionItems.length} 条。</p>
        </div>
        ${body}
      </section>
    `);
  });

  elements.categorySections.innerHTML = sections.length
    ? sections.join("")
    : renderEmptyCard("当前没有可展示的分类内容，请调整筛选条件后再试。", true);
}

function renderCoverage(items) {
  const metrics = [
    { label: "资讯条数", value: `${items.length}` },
    { label: "媒体来源", value: `${uniqueCount(items.map((item) => item.source))}` },
    { label: "覆盖地区", value: `${uniqueCount(items.map((item) => item.region))}` },
    { label: "覆盖语言", value: `${uniqueCount(items.map((item) => item.language))}` }
  ];

  elements.coverageGrid.innerHTML = metrics
    .map(
      (item) => `
        <div class="coverage-item">
          <p class="coverage-label">${safe(item.label)}</p>
          <p class="coverage-value">${safe(item.value)}</p>
        </div>
      `
    )
    .join("");
}

function renderSourceSummary(items) {
  if (!items.length) {
    elements.sourcesSummary.innerHTML = renderEmptyCard("当前视图下暂无来源分布。", true);
    return;
  }

  const counts = items.reduce((accumulator, item) => {
    if (!accumulator[item.source]) {
      accumulator[item.source] = {
        source: item.source,
        count: 0,
        language: item.language,
        kind: item.sourceKind
      };
    }

    accumulator[item.source].count += 1;
    return accumulator;
  }, {});

  const cards = Object.values(counts)
    .sort((left, right) => right.count - left.count || left.source.localeCompare(right.source, "zh-CN"))
    .slice(0, 8)
    .map(
      (item) => `
        <article class="source-card">
          <div class="source-head">
            <span class="feed-flag">${safe(LANGUAGE_LABELS[item.language] || item.language)}</span>
            <span class="source-count">${item.count} 条</span>
          </div>
          <h3 class="source-name">${safe(item.source)}</h3>
          <p class="meta-line">来源属性：${safe(SOURCE_KIND_LABELS[item.kind] || "媒体")}</p>
        </article>
      `
    );

  elements.sourcesSummary.innerHTML = cards.join("");
}

function renderHighlights() {
  elements.briefHighlights.innerHTML = briefData.briefHighlights
    .map((item) => `<li>${safe(item)}</li>`)
    .join("");
}

function renderPipeline() {
  elements.pipelineList.innerHTML = briefData.automationSteps
    .map((item) => `<li>${safe(item)}</li>`)
    .join("");
}

function renderFeedCards() {
  elements.feedList.innerHTML = briefData.sourceFeeds
    .map(
      (item) => `
        <article class="feed-card">
          <div class="feed-head">
            <p class="feed-title">${safe(item.label)}</p>
            <span class="feed-flag">${safe(LANGUAGE_LABELS[item.language] || item.language)}</span>
          </div>
          <code>${safe(item.query)}</code>
          <p class="feed-note">${safe(item.focus)} · 覆盖区域：${safe(REGION_LABELS[item.region] || item.region)}</p>
        </article>
      `
    )
    .join("");
}

function renderArticleCard(item, featured, spotlight) {
  const cardClass = featured ? `featured-card${spotlight ? " is-spotlight" : ""}` : "news-card";
  const titleClass = featured ? "featured-title" : "news-title";
  const articleUrl = getItemUrl(item);
  const originalLine = item.titleOriginal === item.titleZh
    ? ""
    : `<p class="original-title">原文标题：${safe(item.titleOriginal)}</p>`;

  return `
    <article class="${cardClass}">
      <div class="card-topline">
        <div class="meta-cluster">
          <span class="category-badge">${safe(CATEGORY_META[item.category].label)}</span>
          <span class="kind-badge">${safe(SOURCE_KIND_LABELS[item.sourceKind] || "媒体")}</span>
        </div>
        <span class="priority-badge priority-${item.priority}">${safe(PRIORITY_LABELS[item.priority] || "跟进")}</span>
      </div>

      <h3 class="${titleClass}">
        <a href="${safe(articleUrl)}" target="_blank" rel="noreferrer">${safe(item.titleZh)}</a>
      </h3>

      ${originalLine}
      <p class="news-summary">${safe(item.summaryZh)}</p>

      <div class="meta-row">
        <div class="meta-cluster">
          <span>${safe(item.source)}</span>
          <span>${safe(REGION_LABELS[item.region] || item.region)}</span>
          <span>${safe(LANGUAGE_LABELS[item.language] || item.language)}</span>
        </div>
        <span>${safe(formatDateTime(item.publishedAt))}</span>
      </div>

      <div class="card-footer">
        <div class="tag-list">
          ${item.tags.map((tag) => `<span class="tag">${safe(tag)}</span>`).join("")}
        </div>
        <a class="card-link" href="${safe(articleUrl)}" target="_blank" rel="noreferrer">查看报道</a>
      </div>
    </article>
  `;
}

function getItemUrl(item) {
  if (item.url) {
    return item.url;
  }

  const query = item.searchQuery || `${item.titleOriginal} ${item.source}`;
  return `https://news.google.com/search?q=${encodeURIComponent(query)}`;
}

function renderEmptyCard(message, compact = false) {
  return `<div class="empty-card${compact ? " compact" : ""}"><p>${safe(message)}</p></div>`;
}

function renderLoadFailure(error) {
  console.error(error);
  elements.weekPill.textContent = "加载失败";
  elements.heroSummary.textContent = "页面结构已就绪，但数据文件读取失败。";
  elements.noticeCard.innerHTML = `
    <div class="notice-copy">
      <p class="section-kicker">数据说明</p>
      <p>未能读取周报数据，请检查 <code>data/news.js</code> 或 <code>data/news.json</code> 是否存在。</p>
    </div>
    <div class="notice-meta">
      <p class="meta-line">错误信息</p>
      <strong>${safe(error.message || "未知错误")}</strong>
    </div>
  `;
  elements.heroStats.innerHTML = "";
  elements.resultsHint.textContent = "";
  elements.featuredGrid.innerHTML = renderEmptyCard("当前没有数据。", true);
  elements.categorySections.innerHTML = renderEmptyCard("当前没有数据。", true);
  elements.coverageGrid.innerHTML = "";
  elements.sourcesSummary.innerHTML = renderEmptyCard("当前没有数据。", true);
  elements.feedList.innerHTML = "";
}

function filterItems(items, options = {}) {
  const { ignoreCategory = false } = options;

  return items.filter((item) => {
    if (!ignoreCategory && state.category !== "all" && item.category !== state.category) {
      return false;
    }
    if (state.region !== "all" && item.region !== state.region) {
      return false;
    }
    if (state.language !== "all" && item.language !== state.language) {
      return false;
    }
    if (state.search && !matchSearch(item, state.search)) {
      return false;
    }
    return true;
  });
}

function sortItems(items) {
  const sorter = SORTERS[state.sort] || SORTERS.priority;
  return [...items].sort(sorter);
}

function matchSearch(item, search) {
  const haystack = [item.titleOriginal, item.titleZh, item.summaryZh, item.source, ...(item.tags || [])]
    .join(" ")
    .toLowerCase();

  return search
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => haystack.includes(token));
}

function populateSelect(select, labels, values) {
  select.innerHTML = values
    .map((value) => `<option value="${safe(value)}">${safe(labels[value] || value)}</option>`)
    .join("");
}

function getOrderedValues(items, key, order) {
  const foundValues = new Set(items.map((item) => item[key]));
  const values = ["all"];

  order.forEach((value) => {
    if (value !== "all" && foundValues.has(value)) {
      values.push(value);
    }
  });

  foundValues.forEach((value) => {
    if (!values.includes(value)) {
      values.push(value);
    }
  });

  return values;
}

function formatRange(start, end) {
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric"
  });

  return `${formatter.format(new Date(start))} - ${formatter.format(new Date(end))}`;
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(value));
}

function uniqueCount(values) {
  return new Set(values.filter(Boolean)).size;
}

function safe(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}
