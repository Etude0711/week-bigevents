# 全球体育与健身行业周报

一个自动化的每周资讯聚合与展示平台，适合运营团队快速浏览全球体育产业、体育赛事、健身市场与品牌动态。

## 🌟 特点

- **自动周更**：每周一自动抓取 Google News RSS，生成最新资讯
- **多语言覆盖**：聚合中文、英文、西班牙文资讯
- **智能分类**：自动按产业、赛事、健身、品牌四大板块分类
- **优先级标记**：自动评分与优先级标记，高优先级内容突出展示
- **动态筛选**：支持按分类、地区、语言、关键词快速筛选
- **GitHub Pages 部署**：静态站点，可直接部署到 GitHub Pages

## 📂 项目结构

```
.
├── index.html                          # 主页面
├── styles.css                          # 样式
├── scripts/
│   ├── render.js                       # 前端渲染逻辑
│   └── generate-weekly-brief.mjs        # 每周数据生成脚本
├── data/
│   ├── news.json                       # 周报数据（JSON）
│   └── news.js                         # 周报数据（JavaScript 包装）
├── .github/workflows/
│   ├── weekly-refresh.yml              # 每周自动更新工作流
│   └── deploy-pages.yml                # GitHub Pages 部署工作流
├── package.json                        # 项目配置
└── README.md                           # 本文件
```

## 🚀 快速开始

### 本地开发

1. **克隆仓库**
   ```bash
   git clone <your-repo-url>
   cd <your-repo>
   ```

2. **本地预览**
   使用任意 HTTP 服务器打开 `index.html`，例如：
   ```bash
   npx serve
   ```
   或使用 Python：
   ```bash
   python -m http.server 8000
   ```

3. **手动生成周报数据**
   ```bash
   node scripts/generate-weekly-brief.mjs
   ```

### 部署到 GitHub Pages

1. **推送到 GitHub**
   ```bash
   git push origin main
   ```

2. **启用 GitHub Pages**
   - 进入仓库的 **Settings → Pages**
   - 选择 **Deploy from a branch**
   - 选择分支为 `main`（或其他默认分支）

3. **访问页面**
   页面将在 `https://<your-username>.github.io/<your-repo>/` 上线

## ⚙️ 自动化配置

### 每周自动更新

项目已预配置 GitHub Actions 工作流 `.github/workflows/weekly-refresh.yml`，将在每周一（UTC 01:00）自动执行以下步骤：

1. 拉取最新代码
2. 执行 `node scripts/generate-weekly-brief.mjs` 生成新数据
3. 自动提交与推送变更到 `main` 分支
4. GitHub Pages 自动部署最新内容

> 📝 **首次使用时需要手动触发一次工作流**：
> 1. 推送代码到 GitHub
> 2. 进入仓库的 **Actions** 标签
> 3. 选择 **Weekly Brief Refresh**
> 4. 点击 **Run workflow**

### 手动触发更新

也可以在任何时刻手动触发更新：
1. 进入仓库的 **Actions** 标签
2. 选择 **Weekly Brief Refresh**
3. 点击 **Run workflow**

## 📊 数据结构说明

`data/news.json` 包含的主要字段：

```json
{
  "title": "全球体育与健身行业周报",
  "weekLabel": "2026 第13周",
  "weekRange": { "start": "2026-03-17", "end": "2026-03-23" },
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
    }
    // ... 更多源配置
  ],
  "items": [
    {
      "id": "wk13-industry-001",
      "category": "sports-industry",
      "region": "global",
      "language": "en",
      "source": "Visual Capitalist",
      "sourceKind": "media",
      "titleOriginal": "Breaking Down the $417 Billion Sports Industry",
      "titleZh": "Visual Capitalist 拆解 4170 亿美元全球体育产业",
      "summaryZh": "从产业总规模切入，适合运营团队把握版权、赞助、装备和消费赛道的整体热度。",
      "publishedAt": "2026-03-16T18:19:21Z",
      "tags": ["产业规模", "赞助", "消费"],
      "priority": 1,
      "featured": true,
      "url": "https://..."
    }
    // ... 更多资讯项
  ]
}
```

## 🔧 自定义配置

### 修改信息源

编辑 `data/news.json` 中的 `sourceFeeds` 数组，调整以下参数：

| 参数 | 说明 | 例子 |
|------|------|------|
| `label` | 信息源标签 | `"体育产业 / 英文"` |
| `query` | Google News 搜索查询 | `"sports industry when:7d"` |
| `language` | 语言代码 | `"en"`, `"zh"`, `"es"` |
| `region` | 地区代码 | `"global"`, `"china"`, `"north-america"` |
| `focus` | 关注点描述 | `"宏观产业规模、技术应用与商业化"` |

### 调整生成参数

修改脚本环境变量或在 GitHub Actions 中配置（`.github/workflows/weekly-refresh.yml`）：

| 环境变量 | 说明 | 默认值 |
|---------|------|-------|
| `ITEMS_PER_FEED` | 每个 feed 保留条数 | `6` |
| `ITEMS_PER_CATEGORY` | 每个分类保留条数 | `4` |
| `FEATURED_LIMIT` | 精选条目数量 | `4` |

## 📝 工作流程

```
RSS Feed 抓取
    ↓
去重 & 分类 & 标签
    ↓
中文标题 & 摘要生成
    ↓
优先级评分
    ↓
精选标记
    ↓
生成 news.json & news.js
    ↓
提交到 Git
    ↓
GitHub Pages 自动部署
```

## 🛠️ 技术栈

- **前端**：HTML + CSS + JavaScript（ES6+）
- **数据处理**：Node.js 18+
- **自动化**：GitHub Actions
- **托管**：GitHub Pages
- **数据源**：Google News RSS

## ⚠️ 注意事项

1. **翻译服务**：自动生成的中文标题与摘要使用 Google Translate API（需要网络连接）
2. **RSS 抓取**：依赖 Google News RSS feed，如果服务不可用会导致生成失败
3. **频率限制**：Google Translate API 有频率限制，脚本已内置重试机制
4. **人工复核**：正式对外使用前建议运营团队进行一次人工复核和内容确认

## 📞 常见问题

### Q: 为什么某些资讯没有显示？
A: 可能原因：
- RSS Feed 中该周期没有新资讯
- 内容被重复去除
- 不符合分类规则

### Q: 如何更新信息源配置？
A: 编辑 `data/news.json` 中的 `sourceFeeds` 数组，保存后重新运行生成脚本或等待下次自动更新。

### Q: GitHub Actions 工作流失败怎么办？
A: 检查以下几点：
- 网络连接是否正常
- Google News RSS 是否可访问
- 检查 **Actions** 标签中的错误日志

### Q: 可以自定义页面样式吗？
A: 可以，编辑 `styles.css` 即可。所有颜色、字体、间距都已定义为 CSS 变量，修改 `:root` 部分可快速调整主题。

## 📄 许可证

MIT License

## 🙏 贡献

欢迎提交 Issue 和 Pull Request！

---

**最后更新**：2026-03-24
