# 📂 文件索引与使用指南

快速查找项目中的文件和它们的用途。

## 🎯 按用途查找

### 👤 如果你是**首次使用者**

1. 📖 先读：**`QUICKSTART.md`** - 5 分钟快速部署
2. 📖 再读：**`README.md`** - 项目功能概览
3. 🚀 开始：按 QUICKSTART.md 的步骤上传到 GitHub

### 🔧 如果你想**部署到 GitHub**

1. 📖 阅读：**`DEPLOYMENT_GUIDE.md`** - 完整部署步骤
2. 🔑 参考：`.github/workflows/` - 自动化工作流配置
3. 🚀 执行：按指南操作

### ⚙️ 如果你想**配置自动化**

1. 📖 阅读：**`AUTOMATION.md`** - 自动化流程详解
2. 🔍 查看：**`scripts/generate-weekly-brief.mjs`** - 数据生成脚本
3. ⚙️ 修改：编辑 `data/news.json` 中的 `sourceFeeds`

### 🎨 如果你想**修改样式**

1. 📖 阅读：**`ARCHITECTURE.md`** → 扩展点 5
2. 🎨 编辑：**`styles.css`** - 修改 `:root` 变量
3. 🌐 刷新：浏览器刷新查看效果

### 🏗️ 如果你想**了解架构**

1. 📖 阅读：**`ARCHITECTURE.md`** - 系统架构详解
2. 📊 查看：架构图和数据流程
3. 🔌 学习：扩展点说明

### ✅ 如果你想**验证项目**

1. 📋 检查：**`IMPLEMENTATION_CHECKLIST.md`** - 完成验证清单
2. 🧪 测试：本地测试步骤
3. 📊 对照：验证总结

---

## 📁 完整文件列表

### 🌐 前端文件

```
index.html
├─ 主页面骨架
├─ 导入 styles.css 和 scripts/
├─ 大小：~15 KB
└─ 用途：页面主体，无需修改
```

```
styles.css
├─ 样式表
├─ CSS 变量定义在 :root
├─ 响应式断点：768px, 1024px
├─ 大小：~25 KB
└─ 用途：页面样式，可修改 CSS 变量
```

```
scripts/render.js
├─ 前端渲染引擎
├─ 主要函数：render(), filterItems(), sortItems()
├─ 大小：~20 KB
└─ 用途：动态渲染与交互逻辑，无需修改
```

### 📊 数据文件

```
data/news.json
├─ 周报数据（JSON 格式）
├─ 由 generate-weekly-brief.mjs 自动生成
├─ 包含：16 条资讯、元数据、sourceFeeds 配置
├─ 大小：~100 KB
└─ 用途：前端数据来源，每周自动更新
```

```
data/news.js
├─ 周报数据（JavaScript 格式）
├─ 格式：window.__WEEKLY_BRIEF_DATA__ = {...}
├─ 作用：备用方案，当 news.json 加载失败时使用
├─ 大小：~100 KB
└─ 用途：本地兼容性，每周自动更新
```

### 🔧 自动化脚本

```
scripts/generate-weekly-brief.mjs
├─ 数据生成脚本（Node.js ES 模块）
├─ 职责：抓取RSS → 去重 → 分类 → 翻译 → 评分
├─ 入口：node scripts/generate-weekly-brief.mjs
├─ 大小：~45 KB
├─ 耗时：30-60 秒
└─ 用途：每周自动运行，无需手动操作
```

### 📦 项目配置

```
package.json
├─ Node.js 项目配置
├─ scripts: generate:weekly (执行数据生成)
├─ 大小：<1 KB
└─ 用途：脚本管理，无需修改
```

```
.gitignore
├─ Git 忽略规则
├─ 忽略：node_modules/, *.log, .env, 等
├─ 大小：<1 KB
└─ 用途：Git 版本控制，无需修改
```

### 🤖 GitHub Actions 工作流

```
.github/workflows/weekly-refresh.yml
├─ 每周数据更新工作流
├─ 触发：cron "0 1 * * 1"（每周一 01:00 UTC）
├─ 步骤：Checkout → Setup Node → Generate → Commit → Push
├─ 大小：<2 KB
└─ 用途：自动化数据生成，无需修改（除非调整时间）
```

```
.github/workflows/deploy-pages.yml
├─ GitHub Pages 部署工作流
├─ 触发：push to main
├─ 步骤：Checkout → Configure → Upload → Deploy
├─ 大小：<2 KB
└─ 用途：自动化部署，无需修改
```

### 📖 文档文件

| 文件 | 用途 | 阅读时间 | 优先级 |
|------|------|---------|--------|
| **QUICKSTART.md** | 5分钟快速上手 | 5 min | 🔴 必读 |
| **README.md** | 项目功能概览 | 10 min | 🔴 必读 |
| **DEPLOYMENT_GUIDE.md** | 详细部署步骤 | 15 min | 🔴 部署前必读 |
| **AUTOMATION.md** | 自动化流程详解 | 20 min | 🟡 了解配置 |
| **ARCHITECTURE.md** | 系统架构说明 | 25 min | 🟡 深入理解 |
| **PROJECT_SUMMARY.md** | 项目完成总结 | 10 min | 🟢 参考 |
| **IMPLEMENTATION_CHECKLIST.md** | 验证清单 | 5 min | 🟢 上线前检查 |
| **FILE_INDEX.md** | 本文件 | 5 min | 🟡 快速查找 |

---

## 🗂️ 按修改频率分类

### 🟢 无需修改（自动管理）

- ✅ `index.html` - 页面主体
- ✅ `scripts/render.js` - 前端引擎
- ✅ `scripts/generate-weekly-brief.mjs` - 数据生成脚本
- ✅ `data/news.json` - 自动生成
- ✅ `data/news.js` - 自动生成
- ✅ `.github/workflows/*.yml` - 自动化配置

### 🟡 可选修改（个性化）

- 📝 `styles.css` - 修改页面主题
  - 编辑 `:root` 中的 CSS 变量
  - 示例：`--accent`, `--bg`, `--radius-lg`

- 📝 `data/news.json` → `sourceFeeds` - 修改信息源
  - 添加或删除 feed 源
  - 修改查询条件和关注点
  - 示例：添加新的体育赛事源

### 🔴 一次性配置

- 🔑 `.github/workflows/weekly-refresh.yml` - 调整触发时间
  - 默认：每周一 01:00 UTC
  - 修改 cron 表达式以改变触发时间

---

## 🔍 按功能模块查找

### 🎨 UI/样式

| 需求 | 文件 | 位置 |
|------|------|------|
| 修改背景色 | `styles.css` | `:root` → `--bg` |
| 修改强调色 | `styles.css` | `:root` → `--accent` |
| 修改圆角 | `styles.css` | `:root` → `--radius-*` |
| 修改字体 | `styles.css` | `body` → `font-family` |

### 📱 前端交互

| 需求 | 文件 | 函数 |
|------|------|------|
| 修改筛选逻辑 | `scripts/render.js` | `filterItems()` |
| 修改排序方式 | `scripts/render.js` | `sortItems()` |
| 修改卡片显示 | `scripts/render.js` | `renderArticleCard()` |
| 修改分类标签 | `scripts/render.js` | `CATEGORY_META` |

### 📊 数据处理

| 需求 | 文件 | 函数 |
|------|------|------|
| 修改信息源 | `data/news.json` | `sourceFeeds[]` |
| 修改去重逻辑 | `scripts/generate-weekly-brief.mjs` | `dedupeItems()` |
| 修改分类规则 | `scripts/generate-weekly-brief.mjs` | `resolveCategory()` |
| 修改标签提取 | `scripts/generate-weekly-brief.mjs` | `scoreItem()` |
| 修改优先级计算 | `scripts/generate-weekly-brief.mjs` | `scoreItem()` |

### 🤖 自动化

| 需求 | 文件 | 参数 |
|------|------|------|
| 改变触发时间 | `.github/workflows/weekly-refresh.yml` | `cron` 表达式 |
| 调整生成参数 | `.github/workflows/weekly-refresh.yml` | 环境变量 |
| 添加部署通知 | `.github/workflows/deploy-pages.yml` | 新增 step |

---

## 🚀 快速命令

### 本地开发

```bash
# 进入项目目录
cd "C:\Users\周登鸿\Documents\Catpaw\体育健身信息一周大事件"

# 启动本地服务器
npx serve

# 手动生成数据
node scripts/generate-weekly-brief.mjs

# 指定参数生成
ITEMS_PER_FEED=10 ITEMS_PER_CATEGORY=5 node scripts/generate-weekly-brief.mjs
```

### Git 操作

```bash
# 查看修改
git status

# 提交所有修改
git add .
git commit -m "描述修改"

# 推送到 GitHub
git push

# 查看日志
git log --oneline
```

### GitHub Actions

```bash
# 查看工作流状态
# → 访问 https://github.com/your-username/your-repo/actions

# 手动触发工作流
# → Actions 标签 → 选择工作流 → Run workflow
```

---

## 📞 常见问题快速查找

### 部署问题

- ❓ 页面无法访问？ → 查看 `DEPLOYMENT_GUIDE.md` → 常见问题 → Q1
- ❓ GitHub Pages 未启用？ → 查看 `DEPLOYMENT_GUIDE.md` → 步骤 4
- ❓ 如何自定义域名？ → 查看 `DEPLOYMENT_GUIDE.md` → 进阶部分

### 自动化问题

- ❓ 工作流失败？ → 查看 `AUTOMATION.md` → 常见问题排查
- ❓ 如何手动触发？ → 查看 `AUTOMATION.md` → 问题排查
- ❓ 如何改变触发时间？ → 查看 `AUTOMATION.md` → 环境变量配置

### 功能问题

- ❓ 如何添加新的 feed？ → 查看 `AUTOMATION.md` → 信息源配置
- ❓ 如何修改样式？ → 查看 `ARCHITECTURE.md` → 扩展点 5
- ❓ 如何接入自定义 API？ → 查看 `ARCHITECTURE.md` → 扩展点 2

---

## 📊 文件统计

| 类型 | 数量 | 总大小 |
|------|------|--------|
| 前端文件 | 3 | ~60 KB |
| 数据文件 | 2 | ~200 KB |
| 脚本文件 | 1 | ~45 KB |
| 配置文件 | 4 | <5 KB |
| 工作流 | 2 | <5 KB |
| 文档 | 8 | ~150 KB |
| **总计** | **20** | **~465 KB** |

---

## ✨ 推荐阅读顺序

**第一次使用者**（总耗时 20 分钟）：

```
1. 此文件（FILE_INDEX.md）  [5 min]
   ↓
2. QUICKSTART.md            [5 min]
   ↓
3. README.md                [10 min]
   ↓
4. 按 QUICKSTART 部署       [5 min]
```

**想要深入理解**（总耗时 60 分钟）：

```
1. README.md                [10 min]
2. DEPLOYMENT_GUIDE.md      [15 min]
3. AUTOMATION.md            [20 min]
4. ARCHITECTURE.md          [25 min]
```

**仅想快速上线**（总耗时 10 分钟）：

```
1. QUICKSTART.md            [5 min]
   ↓
2. 按步骤部署               [5 min]
```

---

## 🎯 快速导航

- 🏠 **项目主页**：README.md
- ⚡ **5分钟快速开始**：QUICKSTART.md
- 🚀 **详细部署指南**：DEPLOYMENT_GUIDE.md
- ⚙️ **自动化流程**：AUTOMATION.md
- 🏗️ **系统架构**：ARCHITECTURE.md
- ✅ **验证清单**：IMPLEMENTATION_CHECKLIST.md
- 📋 **项目总结**：PROJECT_SUMMARY.md
- 📂 **文件索引**：FILE_INDEX.md（本文件）

---

**最后更新**：2026-03-24  
**维护者**：CatPaw  
**文档版本**：1.0

祝你使用愉快！🎉
