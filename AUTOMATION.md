# 自动化流程详解

本文档详细说明周报的自动化数据生成与部署流程。

## 🔄 核心流程

### 1. 数据抓取层（Collection Layer）

**文件**：`.github/workflows/weekly-refresh.yml`

每周一 UTC 01:00 自动触发，执行以下步骤：

```yaml
schedule:
  - cron: "0 1 * * 1"  # 每周一 01:00 UTC
```

**关键操作**：
- 检出代码库
- 设置 Node.js 环境
- 执行数据生成脚本
- 自动提交并推送变更

### 2. 数据生成脚本

**文件**：`scripts/generate-weekly-brief.mjs`

核心逻辑：

```mjs
// 生成周期
const reportWindow = getReportWindow(new Date());  // 获取当前周的时间范围

// 多线程抓取
const feedEntries = await Promise.all(
  template.sourceFeeds.map(feed => fetchFeedEntries(feed))
);

// 去重
const dedupedItems = dedupeItems(feedEntries.flat());

// 分类与选择
const selectedItems = selectItems(dedupedItems);

// 本地化（自动翻译、生成摘要）
const localizedItems = await Promise.all(
  selectedItems.map(item => localizeItem(item))
);

// 优先级与精选标记
const finalItems = markFeatured(localizedItems);

// 输出
await writeFile('data/news.json', JSON.stringify(nextData, null, 2));
await writeFile('data/news.js', `window.__WEEKLY_BRIEF_DATA__ = ${JSON.stringify(nextData, null, 2)};`);
```

### 3. 前端部署层

**文件**：`.github/workflows/deploy-pages.yml`

- 监听 `main` 分支的推送
- 自动部署整个仓库到 GitHub Pages
- 页面在 `https://<username>.github.io/<repo>/` 上线

## 📋 信息源配置（sourceFeeds）

每个信息源需要配置以下参数：

```json
{
  "label": "体育产业 / 英文",
  "query": "sports industry when:7d",
  "language": "en",
  "region": "global",
  "focus": "宏观产业规模、技术应用与商业化"
}
```

### 参数详解

| 参数 | 类型 | 说明 | 例子 |
|------|------|------|------|
| `label` | string | 信息源显示名称 | `"体育产业 / 英文"` |
| `query` | string | Google News 搜索条件，支持高级查询语法 | `"sports industry when:7d"` |
| `language` | string | 语言代码 | `"en"`, `"zh"`, `"es"` |
| `region` | string | 地区代码 | `"global"`, `"china"`, `"north-america"`, `"europe"`, `"latin-america"`, `"asia-pacific"` |
| `focus` | string | 关注点描述（用于生成摘要） | `"宏观产业规模、技术应用与商业化"` |

### 查询语法

Google News RSS 支持以下查询操作符：

```
when:7d         # 过去 7 天内
when:1m         # 过去 1 个月内
when:1y         # 过去 1 年内

site:example.com # 特定网站

"exact phrase"  # 精确短语

-keyword        # 排除关键词
```

**例子**：
```
sports industry -recruitment when:7d
Nike shoes "limited edition" when:7d
fitness market China when:7d
```

## 🎯 分类与标签规则

### 自动分类逻辑

脚本根据 feed 中的关键字自动映射分类：

```javascript
if (/品牌|brand|adidas|nike|sportswear/.test(text)) {
  return "brand-dynamics";
} else if (/赛事|world cup|olympic|marathon|世界杯/.test(text)) {
  return "sports-events";
} else if (/健身|fitness|gym|pilates|wellness/.test(text)) {
  return "fitness-market";
} else {
  return "sports-industry";
}
```

### 标签与优先级

脚本自动提取并评分标签，常见标签：

| 标签 | 分值 | 关键词 |
|------|------|-------|
| `AI` | 3 | "ai", "artificial intelligence", "人工智能" |
| `世界杯` | 3 | "World Cup", "世界杯" |
| `奥运会` | 3 | "Olympic", "奥运" |
| `供应链` | 3 | "supply chain", "factory", "供应链" |
| `法务` | 3 | "lawsuit", "legal", "诉讼" |
| `营收` | 2 | "revenue", "growth", "营收" |
| ... | ... | ... |

**优先级**：
- `priority: 1`（重点关注）：总分 ≥ 6
- `priority: 2`（持续跟进）：总分 3-5
- `priority: 3`（观察池）：总分 < 3

### 中文标题与摘要生成

对于非中文资讯，脚本自动：

1. **翻译标题**：使用 Google Translate API
   ```javascript
   const translated = await translateText(item.titleOriginal);
   ```

2. **生成摘要**：基于模板
   ```javascript
   const summaryZh = `${item.source} 报道，${hint}；${focus}，${tags}。`;
   ```

   示例：
   > "Visual Capitalist 报道，适合跟踪产业规模、资本和技术投入变化；当前信号更偏向宏观产业规模、技术应用与商业化，可优先关注 产业规模、赞助、消费。"

## 🔧 环境变量配置

可在 GitHub Actions 工作流中配置以下环境变量：

```yaml
env:
  ITEMS_PER_FEED: 6           # 每个 feed 保留条数
  ITEMS_PER_CATEGORY: 4       # 每个分类保留条数
  FEATURED_LIMIT: 4           # 精选条目数量
```

也可在本地运行时指定：

```bash
ITEMS_PER_FEED=10 ITEMS_PER_CATEGORY=5 node scripts/generate-weekly-brief.mjs
```

## 📊 数据输出格式

脚本同时输出 `data/news.json` 和 `data/news.js`：

### news.json

标准 JSON 格式，包含完整的周报数据：

```json
{
  "title": "全球体育与健身行业周报",
  "weekLabel": "2026 第13周",
  "weekRange": { "start": "2026-03-17", "end": "2026-03-23" },
  "generatedAt": "2026-03-24T06:12:18.560Z",
  "briefHighlights": ["..."],
  "automationSteps": ["..."],
  "sourceFeeds": [...],
  "items": [...]
}
```

### news.js

JavaScript 包装格式，支持直接在浏览器中加载（作为 `.json` 的备用方案）：

```javascript
window.__WEEKLY_BRIEF_DATA__ = {
  // ... 同上 ...
};
```

前端脚本优先从 `.json` 加载，失败时回退到 `.js`。

## 🐛 常见问题排查

### 问题：GitHub Actions 工作流执行失败

**可能原因**：
1. 网络连接问题 → 检查工作流日志中的网络错误
2. Google News RSS 不可用 → 稍后重试
3. 脚本错误 → 查看错误堆栈跟踪

**解决方案**：
```bash
# 本地测试脚本
node scripts/generate-weekly-brief.mjs

# 检查 RSS feed 可用性
curl -H "User-Agent: Mozilla/5.0" "https://news.google.com/rss/search?q=sports%20industry%20when:7d&hl=en-US&gl=US&ceid=US:en"
```

### 问题：翻译结果不准确

**可能原因**：
- Google Translate API 频率限制
- 特殊术语无法正确翻译

**解决方案**：
- 在 `data/news.json` 中手动修正 `titleZh` 和 `summaryZh`
- 重新运行脚本时，手动编辑后的内容不会被覆盖（如果保留 `id` 字段）

### 问题：某个 feed 的资讯总是为空

**可能原因**：
- 查询条件过于严格
- 该主题在该时间段无新资讯
- RSS feed 已不再更新

**解决方案**：
- 调整 `query` 中的关键字
- 修改 `when:7d` 为 `when:1m` 扩大时间范围
- 更换 feed 源

## 📈 扩展性设计

### 接入自定义数据源

修改 `scripts/generate-weekly-brief.mjs`，添加自定义 fetch 函数：

```javascript
async function fetchFeedEntriesFromCustomAPI(feed) {
  // 调用你的 API
  const response = await fetch(`https://your-api.com/news?topic=${feed.label}`);
  const data = await response.json();
  
  // 转换为内部格式
  return data.articles.map(article => ({
    category: resolveCategoryFromAPI(article),
    titleOriginal: article.title,
    source: article.source,
    // ... 其他字段
  }));
}
```

### 添加人工审核环节

在 GitHub Actions 工作流中添加 Pull Request 步骤：

```yaml
- name: Create Pull Request for Review
  uses: peter-evans/create-pull-request@v5
  with:
    commit-message: "chore: weekly brief data"
    title: "Weekly Brief Data - ${{ env.WEEK_LABEL }}"
    body: "Please review and merge after verification."
    branch: "weekly-brief/${{ env.WEEK_LABEL }}"
```

### 添加通知系统

在数据生成后发送通知（邮件、Slack 等）：

```yaml
- name: Send Notification
  if: always()
  run: |
    echo "Weekly brief generated: ${{ env.WEEK_LABEL }}"
    # 调用你的通知 webhook
```

## 📚 参考资料

- [Google News RSS Documentation](https://support.google.com/news)
- [GitHub Actions Cron Schedule](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
- [Node.js Fetch API](https://nodejs.org/api/fetch.html)

---

**最后更新**：2026-03-24
