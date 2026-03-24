# 项目架构详解

本文档描述自动化体育健身周报系统的整体架构、模块设计、数据流和扩展点。

## 🏗️ 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                     End User Browser                        │
│                  (index.html + styles.css)                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ├─ Fetch data/news.json
                       ├─ Fallback: window.__WEEKLY_BRIEF_DATA__ (from news.js)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  Frontend Engine (render.js)                │
│                                                             │
│  • Cache DOM elements                                      │
│  • Bind event listeners (filters, sorts)                  │
│  • Filter items (category, region, language, search)     │
│  • Sort items (priority, date, source)                    │
│  • Render dynamic HTML                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Renders
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Dynamic UI Components                          │
│                                                             │
│  • Category chips with counts                             │
│  • Featured articles (spotlight cards)                    │
│  • Category-grouped news cards                            │
│  • Coverage overview grid                                 │
│  • Source summary stats                                   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
GitHub Actions (Weekly Schedule)
        ↓
  Trigger workflow
        ↓
  Checkout code
        ↓
  Node.js setup
        ↓
┌───────────────────────────────────────┐
│  generate-weekly-brief.mjs            │
│                                       │
│  1. Get report window (start/end date)│
│  2. Fetch all RSS feeds (parallel)    │
│  3. Parse RSS XML → normalize items   │
│  4. Dedupe by title + source          │
│  5. Select top items per category     │
│  6. Translate titles (zh auto-gen)    │
│  7. Score & tag items                 │
│  8. Mark featured items               │
│  9. Add sequential IDs                │
│  10. Generate summaries               │
│  11. Build highlights                 │
└────────────┬────────────────────────┘
             ├─→ data/news.json
             └─→ data/news.js
        ↓
  Commit & push
        ↓
┌───────────────────────────────────────┐
│  GitHub Pages Deploy                  │
│  • Trigger: main branch push          │
│  • Upload artifact: entire repo       │
│  • Deploy: https://username.github.io/repo/
└───────────────────────────────────────┘
        ↓
  User accesses page in browser
        ↓
  Page loads → fetches news.json
        ↓
  Frontend renders with data
```

## 📦 核心模块

### 1. 前端展示层

**文件**：`index.html`, `styles.css`, `scripts/render.js`

**职责**：
- 渲染页面骨架
- 定义样式与布局
- 加载数据并动态渲染
- 处理用户交互

**关键组件**：

```javascript
// render.js 的核心函数

function init()                     // 初始化：缓存元素、绑定事件、加载数据
function render()                  // 核心渲染流程
  → renderCategoryChips()          // 分类选项卡
  → renderHero()                   // 顶部统计
  → renderFeatured()               // 精选卡片
  → renderSections()               // 分类区块
  → renderCoverage()               // 覆盖概览
  → renderSourceSummary()          // 来源统计

function filterItems()             // 按 category/region/language/search 过滤
function sortItems()               // 按 priority/date/source 排序
function renderArticleCard()       // 单条资讯卡片 HTML
```

**数据流向**：
```
getBriefData()
    ↓ 加载 news.json 或 news.js
    ↓
briefData = {...}
    ↓ filterItems()、sortItems()
    ↓
filteredItems = [...]
    ↓ renderArticleCard() × N
    ↓
HTML fragments 拼接
    ↓
DOM 更新
```

### 2. 数据生成层

**文件**：`scripts/generate-weekly-brief.mjs`

**职责**：
- 定时抓取 RSS feeds
- 去重与分类
- 本地化（翻译、摘要）
- 优先级与精选标记
- 输出标准数据格式

**关键函数**：

```javascript
async function fetchFeedEntries(feed)
  // 构建 Google News URL → fetch → 解析 XML → 标准化条目

function dedupeItems(items)
  // 按 normalizeKey(title, source) 去重，保留高分条目

function selectItems(items)
  // 按分类分组 → 各分类选取 top N（itemsPerCategory）

async function localizeItem(item)
  // 非中文：translateText() → buildChineseTitle()
  // 中文：直接使用 titleOriginal
  // 所有：buildSummary() 生成运营友好的摘要

function scoreItem(item)
  // 匹配品牌标签、主题标签 → 累加分值 → 计算优先级

function markFeatured(items)
  // 按优先级排序 → 选取高优先级 + 分类均衡 → 标记 featured=true
```

**输出数据结构**：

```json
{
  "title": "全球体育与健身行业周报",
  "weekLabel": "2026 第13周",
  "weekRange": { "start": "...", "end": "..." },
  "generatedAt": "2026-03-24T06:12:18.560Z",
  "disclaimer": "...",
  "briefHighlights": ["..."],
  "automationSteps": ["..."],
  "sourceFeeds": [
    {
      "label": "体育产业 / 英文",
      "query": "sports industry when:7d",
      "language": "en",
      "region": "global",
      "focus": "宏观产业规模、技术应用与商业化"
    },
    // ... 更多 feed
  ],
  "items": [
    {
      "id": "wk13-industry-001",
      "category": "sports-industry",
      "region": "global",
      "language": "en",
      "source": "Visual Capitalist",
      "sourceKind": "media|brand|institution",
      "titleOriginal": "Breaking Down the $417 Billion Sports Industry",
      "titleZh": "Visual Capitalist 拆解 4170 亿美元全球体育产业",
      "summaryZh": "从产业总规模切入，适合运营团队把握...",
      "publishedAt": "2026-03-16T18:19:21Z",
      "tags": ["产业规模", "赞助", "消费"],
      "priority": 1,
      "featured": true,
      "url": "https://news.google.com/rss/articles/..."
    },
    // ... 更多 items
  ]
}
```

### 3. 自动化编排层

**文件**：`.github/workflows/weekly-refresh.yml`, `.github/workflows/deploy-pages.yml`

**职责**：
- 按计划触发数据生成
- 自动提交与推送变更
- 自动部署到 GitHub Pages

**工作流 1: Weekly Refresh**

```yaml
trigger: schedule (cron: "0 1 * * 1")  # 每周一 01:00 UTC
steps:
  1. checkout@v4                       # 检出代码
  2. setup-node@v4 (v20)               # 设置 Node.js
  3. generate-weekly-brief.mjs          # 生成数据
  4. git config user.name              # 配置 Git
  5. git add/commit/push               # 提交变更
permissions: contents: write           # 需要写权限
```

**工作流 2: Deploy Pages**

```yaml
trigger: push to main                  # 监听 main 分支推送
steps:
  1. checkout@v4                       # 检出代码
  2. configure-pages@v5                # Pages 配置
  3. upload-pages-artifact@v3          # 上传构建物
  4. deploy-pages@v4                   # 部署
permissions:
  - pages: write
  - id-token: write
```

## 🔄 数据生命周期

```
Week Start (Monday)
     ↓
     ├─ 01:00 UTC: GitHub Actions 触发
     │
     ├─ Fetch: Google News RSS × 10 feeds
     │          (sports-industry, sports-events, fitness-market, brand-dynamics)
     │
     ├─ Parse: RSS XML → JSON items
     │         (extract title, link, pubDate, source)
     │
     ├─ Normalize: 清理标题、去除源后缀、UTC 转 ISO
     │
     ├─ Dedup: 按 `normalizeKey(title, source)` 去重
     │         (保留分值最高的重复条目)
     │
     ├─ Select: 按分类分组，各分类保留 top 4
     │
     ├─ Localize: 
     │   ├─ 中文: 直接使用 titleOriginal
     │   ├─ 其他: 调用 Google Translate → titleZh
     │   └─ 所有: buildSummary() → summaryZh
     │
     ├─ Score & Tag:
     │   ├─ 匹配品牌标签（Nike, Adidas, ...）
     │   ├─ 匹配主题标签（AI, 赞助, 票务, ...）
     │   ├─ 累加分值 → 计算 priority
     │   └─ 生成 tags 列表
     │
     ├─ Featured: 按 priority + 分类均衡 → 选 4 条精选
     │
     ├─ ID: 添加 `wk##-category-###` 形式 ID
     │
     ├─ Output:
     │   ├─ data/news.json (直接 JSON)
     │   └─ data/news.js (window.__WEEKLY_BRIEF_DATA__ = ...)
     │
     ├─ Commit: 
     │   git add data/
     │   git commit -m "chore: refresh weekly brief data"
     │   git push
     │
     ├─ Deploy:
     │   GitHub Pages 自动重新部署
     │
Week End (Next Monday)
     ↓
User Access
     ├─ Browser: fetch data/news.json
     ├─ Load: window.__WEEKLY_BRIEF_DATA__ (fallback)
     ├─ Render: 前端引擎动态渲染
     ├─ Filter/Sort: 用户交互
     ├─ Display: 更新 DOM
     └─ Done
```

## 🎯 分类系统

### 四大分类

```
sports-industry     体育产业
  - 产业规模、资本流向、技术应用、商业化
  - 示例：体育科技、产业政策、场馆升级
  
sports-events       体育赛事
  - 赛事运营、票务、城市联动、大赛预热
  - 示例：世界杯、奥运会、马拉松
  
fitness-market      健身市场
  - 健身房、器材、工作室、AI 健身、健康管理
  - 示例：健身消费趋势、设备创新、工作室扩张
  
brand-dynamics      品牌动态
  - 运动品牌、新品、供应链、合作、扩张
  - 示例：Nike 新品发布、Adidas 工厂、On 供应链
```

### 自动分类规则

```javascript
if (/品牌|brand|adidas|nike|sportswear/.test(feedLabel + query)) {
  return "brand-dynamics"
}
else if (/赛事|world cup|olympic|marathon|世界杯/.test(...)) {
  return "sports-events"
}
else if (/健身|fitness|gym|pilates|wellness/.test(...)) {
  return "fitness-market"
}
else {
  return "sports-industry"
}
```

## 🏷️ 标签与评分系统

### 标签类型

**品牌标签**：Nike, Adidas, Peloton, Technogym, On, Barry's, NVIDIA, Lenovo, LA28

**主题标签**：AI, 体育科技, 营收, 赞助, 消费, 世界杯, 奥运会, 票务, 赛程, 马拉松, ...

### 优先级计算

```
Base Score = 0

For each matching brand tag:
  Score += 1

For each matching topic tag:
  Score += tag.value (usually 1-3)

If sourceKind == "institution":
  Score += 1

If category == "sports-events" && (major_event OR ticket_related):
  Score += 1

If category == "brand-dynamics" && (launch OR supply_chain OR lawsuit):
  Score += 1

Priority = {
  1: "重点关注"     (Score >= 6)
  2: "持续跟进"     (Score 3-5)
  3: "观察池"       (Score < 3)
}
```

## 📊 前端状态管理

```javascript
const state = {
  category: "all",        // 分类筛选
  region: "all",          // 地区筛选
  language: "all",        // 语言筛选
  sort: "priority",       // 排序方式：priority|newest|source
  search: ""              // 关键词搜索
}

// 状态变化 → render() → 重新过滤、排序、渲染
```

## 🔌 扩展点

### 扩展点 1: 接入新的 RSS 源

在 `data/news.json` 中添加 `sourceFeeds` 条目：

```json
{
  "label": "足球 / 中文",
  "query": "足球联赛 when:7d",
  "language": "zh",
  "region": "china",
  "focus": "联赛动态、球队转会、赞助合作"
}
```

### 扩展点 2: 接入自定义 API

修改 `scripts/generate-weekly-brief.mjs`：

```javascript
async function fetchFeedEntries(feed) {
  // 检测 feed.source 类型
  if (feed.type === "rss") {
    return fetchFeedEntriesFromRss(feed);
  }
  else if (feed.type === "api") {
    return fetchFeedEntriesFromApi(feed);
  }
  else if (feed.type === "spider") {
    return fetchFeedEntriesFromSpider(feed);
  }
}

async function fetchFeedEntriesFromApi(feed) {
  const response = await fetch(`https://your-api.com/articles?topic=${feed.label}`);
  const data = await response.json();
  return data.articles.map(normalizeArticle);
}
```

### 扩展点 3: 添加人工审核

在 GitHub Actions 中添加审核环节：

```yaml
- name: Create Review PR
  run: |
    # 创建 draft PR，等待人工审核
    gh pr create --draft --title "Weekly Brief Review"
```

### 扩展点 4: 添加通知系统

```yaml
- name: Send Slack Notification
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "Weekly brief generated: ${{ env.WEEK_LABEL }}",
        "blocks": [...]
      }
```

### 扩展点 5: 自定义样式主题

在 `styles.css` 中修改 `:root` 变量：

```css
:root {
  --bg: #07111f;                    /* 背景色 */
  --accent: #7c9bff;                /* 强调色 */
  --radius-lg: 22px;                /* 圆角 */
  /* ... 更多变量 ... */
}
```

## 🧪 测试策略

### 本地测试

```bash
# 1. 生成测试数据
ITEMS_PER_FEED=3 ITEMS_PER_CATEGORY=2 node scripts/generate-weekly-brief.mjs

# 2. 验证输出
cat data/news.json | jq '.items | length'  # 应显示条数

# 3. 启动本地服务器
npx serve

# 4. 打开浏览器访问 http://localhost:3000
# 5. 验证页面加载、筛选、排序功能
```

### GitHub Actions 测试

```bash
# 推送到 GitHub 后，进入 Actions 标签
# 选择 Weekly Brief Refresh
# 查看运行日志

# 或手动触发
gh workflow run weekly-refresh.yml
```

## 📈 性能指标

- **数据生成时间**：~30-60 秒（含网络延迟）
- **部署时间**：~1-2 分钟
- **页面加载时间**：<1 秒（JSON 大小 ~100KB）
- **前端交互响应**：<100ms（过滤、排序）
- **RSS 爬取超时**：20 秒/feed

## 🔐 安全考虑

- ✅ 所有数据都是公开的（来自 Google News RSS）
- ✅ 没有敏感信息存储在代码或工作流中
- ⚠️ 如果接入第三方 API，不要在代码中硬编码 API Key
  - 改用 GitHub Secrets：`${{ secrets.API_KEY }}`
- ⚠️ Google Translate API 有频率限制，大规模使用需付费

## 📚 相关文档

- `README.md`：项目概览与快速开始
- `AUTOMATION.md`：自动化流程与配置详解
- `DEPLOYMENT_GUIDE.md`：部署到 GitHub Pages 完整指南
- `ARCHITECTURE.md`：本文档

---

**最后更新**：2026-03-24
