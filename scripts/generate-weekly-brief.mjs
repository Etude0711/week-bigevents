import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const newsJsonPath = resolve(rootDir, "data", "news.json");
const newsJsPath = resolve(rootDir, "data", "news.js");

const userAgent = "Mozilla/5.0 (compatible; CatPawWeeklyBrief/1.0; +https://github.com/)";
const chinaOffsetMs = 8 * 60 * 60 * 1000;
const itemsPerFeed = Number(process.env.ITEMS_PER_FEED || 6);
const itemsPerCategory = Number(process.env.ITEMS_PER_CATEGORY || 4);
const featuredLimit = Number(process.env.FEATURED_LIMIT || 4);

const categoryOrder = ["sports-industry", "sports-events", "fitness-market", "brand-dynamics"];

const categoryLabels = {
  "sports-industry": "体育产业",
  "sports-events": "体育赛事",
  "fitness-market": "健身市场",
  "brand-dynamics": "品牌动态"
};

const categoryIdParts = {
  "sports-industry": "industry",
  "sports-events": "events",
  "fitness-market": "fitness",
  "brand-dynamics": "brand"
};

const categoryFallbackTags = {
  "sports-industry": ["产业观察", "商业化"],
  "sports-events": ["赛事运营", "赛历节点"],
  "fitness-market": ["健身消费", "渠道变化"],
  "brand-dynamics": ["品牌动作", "市场跟踪"]
};

const categorySummaryHints = {
  "sports-industry": "适合跟踪产业规模、资本和技术投入变化",
  "sports-events": "适合跟踪赛事运营、票务机制与城市联动节点",
  "fitness-market": "适合跟踪健身消费、设备渠道和健康管理趋势",
  "brand-dynamics": "适合跟踪品牌新品、供应链与区域扩张动作"
};

const sourceKindRules = {
  institution: [
    /government/i,
    /gov\b/i,
    /official/i,
    /committee/i,
    /association/i,
    /federation/i,
    /council/i,
    /government/i,
    /人民政府/,
    /政府/,
    /委员会/,
    /协会/,
    /联合会/
  ],
  brand: [
    /about nike/i,
    /storyhub/i,
    /nike/i,
    /adidas/i,
    /puma/i,
    /lululemon/i,
    /peloton/i,
    /technogym/i,
    /under armour/i,
    /garmin/i,
    /fitbit/i,
    /strava/i,
    /lenovo/i,
    /whoop/i,
    /barry/i
  ]
};

const brandTagRules = [
  { tag: "Nike", patterns: [/\bnike\b/i] },
  { tag: "Adidas", patterns: [/\badidas\b/i] },
  { tag: "Peloton", patterns: [/\bpeloton\b/i] },
  { tag: "Technogym", patterns: [/\btechnogym\b/i] },
  { tag: "On", patterns: [/sportswear brand on/i, /\bon\b.*factory/i] },
  { tag: "Barry's", patterns: [/barry/i] },
  { tag: "NVIDIA", patterns: [/\bnvidia\b/i] },
  { tag: "Lenovo", patterns: [/\blenovo\b/i] },
  { tag: "LA28", patterns: [/\bla28\b/i] }
];

const tagRules = [
  { tag: "AI", score: 3, patterns: [/\bai\b/i, /artificial intelligence/i, /inteligencia artificial/i, /人工智能/] },
  { tag: "体育科技", score: 2, patterns: [/technology/i, /tech/i, /nvidia/i, /数字化/, /科技/] },
  { tag: "营收", score: 2, patterns: [/revenue/i, /growth/i, /earnings/i, /sales/i, /营收/, /增长/] },
  { tag: "赞助", score: 2, patterns: [/sponsor/i, /sponsorship/i, /赞助/] },
  { tag: "消费", score: 1, patterns: [/consumer/i, /retail/i, /shopping/i, /消费/] },
  { tag: "世界杯", score: 3, patterns: [/world cup/i, /世界杯/] },
  { tag: "奥运会", score: 3, patterns: [/olympic/i, /奥运/] },
  { tag: "票务", score: 2, patterns: [/ticket/i, /票务/, /门票/] },
  { tag: "赛程", score: 1, patterns: [/schedule/i, /calendar/i, /fixture/i, /赛程/] },
  { tag: "马拉松", score: 2, patterns: [/marathon/i, /马拉松/] },
  { tag: "文旅联动", score: 1, patterns: [/tourism/i, /travel/i, /文旅/] },
  { tag: "商用健身", score: 2, patterns: [/commercial/i, /gym/i, /健身房/, /商用/] },
  { tag: "设备", score: 1, patterns: [/bike/i, /bikes/i, /treadmill/i, /equipment/i, /器材/, /设备/] },
  { tag: "精品工作室", score: 2, patterns: [/boutique/i, /studio/i, /工作室/] },
  { tag: "健康管理", score: 2, patterns: [/wellness/i, /health/i, /prevent/i, /prevention/i, /longevity/i, /健康/, /长寿/] },
  { tag: "供应链", score: 3, patterns: [/supply chain/i, /factory/i, /manufactur/i, /供应链/, /工厂/] },
  { tag: "自动化", score: 2, patterns: [/robot/i, /automation/i, /自动化/] },
  { tag: "法务", score: 3, patterns: [/lawsuit/i, /legal/i, /suit\b/i, /诉讼/, /法务/] },
  { tag: "知识产权", score: 2, patterns: [/patent/i, /stolen/i, /design/i, /copyright/i, /知识产权/] },
  { tag: "新品发布", score: 1, patterns: [/launch/i, /launches/i, /release/i, /debut/i, /发布/, /上市/] },
  { tag: "扩张", score: 1, patterns: [/expand/i, /expansion/i, /opening/i, /opens/i, /加码/, /扩张/] },
  { tag: "女性体育", score: 2, patterns: [/women/i, /female/i, /femenino/i, /女性/] },
  { tag: "投资回报", score: 2, patterns: [/invest/i, /return/i, /roi/i, /dollar/i, /投资/, /回报/] },
  { tag: "场馆升级", score: 2, patterns: [/stadium/i, /arena/i, /venue/i, /center/i, /场馆/, /中心/] },
  { tag: "大湾区", score: 1, patterns: [/greater bay/i, /guangdong/i, /大湾区/, /广东/] }
];

const localeMap = {
  zh: { hl: "zh-CN", ceidLang: "zh-Hans" },
  en: { hl: "en-US", ceidLang: "en" },
  es: { hl: "es-419", ceidLang: "es-419" }
};

const regionMap = {
  global: "US",
  china: "CN",
  "north-america": "US",
  europe: "GB",
  "latin-america": "MX",
  "asia-pacific": "SG"
};

const translationCache = new Map();

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  if (typeof fetch !== "function") {
    throw new Error("当前 Node.js 版本不支持 fetch，请使用 Node 18 或更高版本。");
  }

  const template = JSON.parse(await readFile(newsJsonPath, "utf8"));
  const reportWindow = getReportWindow(new Date());
  const feedEntries = await Promise.all(template.sourceFeeds.map((feed) => fetchFeedEntries(feed)));
  const dedupedItems = dedupeItems(feedEntries.flat());
  const selectedItems = selectItems(dedupedItems);
  const localizedItems = await Promise.all(selectedItems.map((item) => localizeItem(item)));
  const sortedItems = sortByCategoryAndPriority(localizedItems);
  const itemsWithIds = addIds(sortedItems, reportWindow.anchorDate);
  const finalItems = markFeatured(itemsWithIds);

  const nextData = {
    title: template.title,
    weekLabel: buildWeekLabel(reportWindow.anchorDate),
    weekRange: {
      start: formatChinaDate(reportWindow.startDate),
      end: formatChinaDate(reportWindow.endDate)
    },
    generatedAt: new Date().toISOString(),
    disclaimer:
      "当前页面已接入自动周更流程。资讯由 GitHub Actions 按 sourceFeeds 配置自动抓取 Google News RSS 生成，中文标题与摘要为程序化整理结果；正式对外使用前建议运营团队做一次人工复核。",
    briefHighlights: buildBriefHighlights(finalItems),
    automationSteps: [
      "GitHub Actions 每周定时执行生成脚本，按 sourceFeeds 配置抓取近 7 日 RSS 结果。",
      "脚本自动完成去重、分类、标签、优先级和精选标记，保持前端结构不变。",
      "对于非中文资讯，脚本优先尝试生成中文标题，并输出便于运营扫读的中文摘要。",
      "结果会同时写入 news.json 与 news.js，推送后 GitHub Pages 自动刷新展示页面。"
    ],
    sourceFeeds: template.sourceFeeds,
    items: finalItems
  };

  await writeFile(newsJsonPath, `${JSON.stringify(nextData, null, 2)}\n`, "utf8");
  await writeFile(newsJsPath, `window.__WEEKLY_BRIEF_DATA__ = ${JSON.stringify(nextData, null, 2)};\n`, "utf8");

  console.log(`Generated ${finalItems.length} items for ${nextData.weekLabel}.`);
}

async function fetchFeedEntries(feed) {
  const url = buildGoogleNewsUrl(feed);
  const xml = await fetchText(url);
  const itemBlocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];

  return itemBlocks
    .slice(0, itemsPerFeed)
    .map((block, index) => normalizeFeedItem(block, feed, index))
    .filter(Boolean);
}

function normalizeFeedItem(block, feed, index) {
  const source = getTagValue(block, "source") || extractSourceFromTitle(getTagValue(block, "title"));
  const rawTitle = cleanTitle(getTagValue(block, "title"), source);
  const url = getTagValue(block, "link");
  const publishedAt = toIsoString(getTagValue(block, "pubDate"));

  if (!rawTitle || !url) {
    return null;
  }

  const category = resolveCategory(feed);
  const sourceKind = inferSourceKind(source, rawTitle, url);
  const scoring = scoreItem({ titleOriginal: rawTitle, feedFocus: feed.focus, source, sourceKind, category });

  return {
    key: buildSlug(`${rawTitle}-${source}-${publishedAt || index}`),
    category,
    region: feed.region,
    language: feed.language,
    source,
    sourceKind,
    titleOriginal: rawTitle,
    publishedAt: publishedAt || new Date().toISOString(),
    tags: scoring.tags,
    priority: scoring.priority,
    score: scoring.score,
    featured: false,
    url,
    searchQuery: `${rawTitle} ${source}`.trim(),
    feedLabel: feed.label,
    feedFocus: feed.focus
  };
}

function scoreItem(item) {
  const haystack = `${item.titleOriginal} ${item.feedFocus} ${item.source}`;
  const tags = [];
  let score = 0;

  for (const rule of brandTagRules) {
    if (rule.patterns.some((pattern) => pattern.test(haystack))) {
      tags.push(rule.tag);
      score += 1;
    }
  }

  for (const rule of tagRules) {
    if (rule.patterns.some((pattern) => pattern.test(haystack))) {
      tags.push(rule.tag);
      score += rule.score;
    }
  }

  if (item.sourceKind === "institution") {
    score += 1;
  }

  if (item.category === "sports-events" && /(world cup|olympic|marathon|赛事|票务)/i.test(haystack)) {
    score += 1;
  }

  if (item.category === "brand-dynamics" && /(launch|factory|supply chain|lawsuit|design)/i.test(haystack)) {
    score += 1;
  }

  const uniqueTags = unique(tags);
  const fallbackTags = categoryFallbackTags[item.category] || [];
  const finalTags = [...uniqueTags, ...fallbackTags].slice(0, 3);
  const priority = score >= 6 ? 1 : score >= 3 ? 2 : 3;

  return { score, priority, tags: finalTags };
}

function dedupeItems(items) {
  const deduped = new Map();

  for (const item of items) {
    const key = normalizeKey(item.titleOriginal, item.source);
    const current = deduped.get(key);

    if (!current || compareItems(item, current) < 0) {
      deduped.set(key, item);
    }
  }

  return [...deduped.values()];
}

function selectItems(items) {
  return categoryOrder.flatMap((category) => {
    return items
      .filter((item) => item.category === category)
      .sort(compareItems)
      .slice(0, itemsPerCategory);
  });
}

async function localizeItem(item) {
  const titleZh = await buildChineseTitle(item);
  const summaryZh = buildSummary(item);

  return {
    category: item.category,
    region: item.region,
    language: item.language,
    source: item.source,
    sourceKind: item.sourceKind,
    titleOriginal: item.titleOriginal,
    titleZh,
    summaryZh,
    publishedAt: item.publishedAt,
    tags: item.tags,
    priority: item.priority,
    featured: false,
    url: item.url,
    searchQuery: item.searchQuery
  };
}

async function buildChineseTitle(item) {
  if (item.language === "zh") {
    return normalizeWhitespace(item.titleOriginal);
  }

  const translated = await translateText(item.titleOriginal);
  const cleaned = normalizeWhitespace(translated).replace(/\s+-\s+[^-]+$/, "").trim();

  if (cleaned && cleaned !== item.titleOriginal) {
    return cleaned;
  }

  return `${item.source}：${shortFocus(item.feedFocus)}`;
}

function buildSummary(item) {
  const hint = categorySummaryHints[item.category] || "适合纳入本周运营跟踪";
  const focus = item.feedFocus ? `当前信号更偏向${item.feedFocus}` : "建议结合原文判断具体影响";
  const tags = item.tags.length ? `可优先关注 ${item.tags.join("、")}` : "建议结合原文做二次研判";
  return `${item.source} 报道，${hint}；${focus}，${tags}。`;
}

function sortByCategoryAndPriority(items) {
  return [...items].sort((left, right) => {
    const categoryDiff = categoryOrder.indexOf(left.category) - categoryOrder.indexOf(right.category);
    if (categoryDiff !== 0) {
      return categoryDiff;
    }
    return compareItems(left, right);
  });
}

function addIds(items, anchorDate) {
  const { week } = getIsoWeekParts(anchorDate);
  const counters = new Map();

  return items.map((item) => {
    const counter = (counters.get(item.category) || 0) + 1;
    counters.set(item.category, counter);

    return {
      ...item,
      id: `wk${String(week).padStart(2, "0")}-${categoryIdParts[item.category]}-${String(counter).padStart(3, "0")}`
    };
  });
}

function markFeatured(items) {
  const featuredIds = new Set();
  const sorted = [...items].sort(compareItems);
  const usedCategories = new Set();

  for (const item of sorted) {
    if (featuredIds.size >= featuredLimit) {
      break;
    }

    if (item.priority === 1 && !usedCategories.has(item.category)) {
      featuredIds.add(item.id);
      usedCategories.add(item.category);
    }
  }

  for (const item of sorted) {
    if (featuredIds.size >= featuredLimit) {
      break;
    }

    featuredIds.add(item.id);
  }

  return items.map((item) => ({
    ...item,
    featured: featuredIds.has(item.id)
  }));
}

function buildBriefHighlights(items) {
  const sourceCount = unique(items.map((item) => item.source)).length;
  const regionCount = unique(items.map((item) => item.region)).length;
  const languageCount = unique(items.map((item) => item.language)).length;
  const priorityOneCount = items.filter((item) => item.priority === 1).length;
  const topSignals = getTopSignals(items).slice(0, 3);
  const signalsLine = topSignals.length ? topSignals.join("、") : "AI、赛事票务、供应链";

  return [
    `聚合近 7 日体育产业、体育赛事、健身市场、品牌动态共 ${items.length} 条资讯。`,
    `当前自动样例覆盖 ${sourceCount} 家来源、${regionCount} 个地区、${languageCount} 种语言。`,
    `高优先级条目 ${priorityOneCount} 条，重点信号包括 ${signalsLine}。`,
    "当前页面已适配 GitHub Actions 周更流程，前端继续复用同一份 news.json / news.js 数据结构。"
  ];
}

function getTopSignals(items) {
  const counts = new Map();

  for (const item of items) {
    for (const tag of item.tags) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "zh-CN"))
    .map(([tag]) => tag);
}

function buildGoogleNewsUrl(feed) {
  const locale = localeMap[feed.language] || localeMap.en;
  const region = regionMap[feed.region] || "US";
  const query = encodeURIComponent(feed.query);
  return `https://news.google.com/rss/search?q=${query}&hl=${locale.hl}&gl=${region}&ceid=${region}:${locale.ceidLang}`;
}

async function fetchText(url) {
  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(url, {
        headers: {
          "user-agent": userAgent,
          accept: "application/rss+xml, application/xml, text/xml, text/plain;q=0.9, */*;q=0.8"
        },
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status} ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      lastError = error;
      await sleep(500 * attempt);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError;
}

async function translateText(text) {
  const normalizedText = normalizeWhitespace(text);

  if (!normalizedText) {
    return text;
  }

  if (translationCache.has(normalizedText)) {
    return translationCache.get(normalizedText);
  }

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=zh-CN&dt=t&q=${encodeURIComponent(
    normalizedText
  )}`;

  try {
    const raw = await fetchText(url);
    const parsed = JSON.parse(raw);
    const translated = Array.isArray(parsed?.[0])
      ? parsed[0]
          .map((part) => (Array.isArray(part) ? part[0] : ""))
          .join("")
          .trim()
      : "";

    const result = translated || normalizedText;
    translationCache.set(normalizedText, result);
    return result;
  } catch (error) {
    translationCache.set(normalizedText, normalizedText);
    return normalizedText;
  }
}

function getTagValue(block, tagName) {
  const pattern = new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const match = block.match(pattern);
  if (!match) {
    return "";
  }

  return decodeXml(match[1]).trim();
}

function cleanTitle(title, source) {
  let cleaned = normalizeWhitespace(title);

  if (source) {
    const sourceSuffix = new RegExp(`\\s-\\s${escapeRegExp(source)}$`, "i");
    cleaned = cleaned.replace(sourceSuffix, "");
  }

  return cleaned.trim();
}

function extractSourceFromTitle(title) {
  const parts = normalizeWhitespace(title).split(/\s-\s/);
  return parts.length > 1 ? parts[parts.length - 1].trim() : "Google News";
}

function inferSourceKind(source, title, url) {
  const haystack = `${source} ${title} ${url}`;

  if (sourceKindRules.institution.some((rule) => rule.test(haystack))) {
    return "institution";
  }

  if (sourceKindRules.brand.some((rule) => rule.test(haystack))) {
    return "brand";
  }

  return "media";
}

function resolveCategory(feed) {
  const text = `${feed.label} ${feed.query}`.toLowerCase();

  if (/品牌|brand|adidas|nike|sportswear/.test(text)) {
    return "brand-dynamics";
  }

  if (/赛事|world cup|olympic|marathon|世界杯/.test(text)) {
    return "sports-events";
  }

  if (/健身|fitness|gym|pilates|wellness/.test(text)) {
    return "fitness-market";
  }

  return "sports-industry";
}

function compareItems(left, right) {
  if (left.priority !== right.priority) {
    return left.priority - right.priority;
  }

  if ((right.score || 0) !== (left.score || 0)) {
    return (right.score || 0) - (left.score || 0);
  }

  return new Date(right.publishedAt) - new Date(left.publishedAt);
}

function normalizeKey(title, source) {
  return normalizeWhitespace(`${title} ${source}`)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function buildSlug(value) {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return normalized || `item-${Date.now()}`;
}

function shortFocus(value) {
  const normalized = normalizeWhitespace(value || "");
  if (!normalized) {
    return "本周值得关注的行业动态";
  }

  return normalized.replace(/、/g, " / ");
}

function toIsoString(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function decodeXml(value) {
  const withoutCdata = value.replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/, "$1");
  return withoutCdata
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function normalizeWhitespace(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function sleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function getReportWindow(now) {
  const chinaNow = new Date(now.getTime() + chinaOffsetMs);
  const chinaToday = new Date(Date.UTC(chinaNow.getUTCFullYear(), chinaNow.getUTCMonth(), chinaNow.getUTCDate()));
  const endDate = addDays(chinaToday, -1);
  const startDate = addDays(endDate, -6);
  return {
    anchorDate: endDate,
    startDate,
    endDate
  };
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function formatChinaDate(date) {
  return date.toISOString().slice(0, 10);
}

function buildWeekLabel(date) {
  const { year, week } = getIsoWeekParts(date);
  return `${year} 第${week}周`;
}

function getIsoWeekParts(date) {
  const workingDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNumber = workingDate.getUTCDay() || 7;
  workingDate.setUTCDate(workingDate.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(workingDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((workingDate - yearStart) / 86400000) + 1) / 7);
  return {
    year: workingDate.getUTCFullYear(),
    week
  };
}
