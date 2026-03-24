# ⚡ 快速开始指南

这是一份简明快速指南，帮助你在 5 分钟内启动周报系统。详细步骤请参考 `DEPLOYMENT_GUIDE.md`。

## 🎯 目标

将你的自动化体育健身周报部署到 GitHub Pages，让全球用户可以访问。

## ⏱️ 预计耗时：5 分钟

## 🚀 三步快速部署

### 1️⃣ GitHub 仓库初始化 (1 分钟)

```bash
cd "C:\Users\周登鸿\Documents\Catpaw\体育健身信息一周大事件"

# 初始化 Git 并连接到 GitHub
git init
git remote add origin https://github.com/YOUR-USERNAME/your-repo-name.git
git config user.name "Your Name"
git config user.email "your-email@example.com"
```

**获取你的 GitHub 链接**：
1. 登录 https://github.com/new
2. 填写 Repository name（例如 `sports-fitness-weekly`）
3. 选择 Public
4. 点击 Create repository
5. 复制 HTTPS URL

### 2️⃣ 提交代码到 GitHub (2 分钟)

```bash
# 添加所有文件
git add .

# 首次提交
git commit -m "chore: initial commit with weekly brief setup"

# 创建 main 分支并推送
git branch -M main
git push -u origin main
```

### 3️⃣ 启用 GitHub Pages (2 分钟)

1. 打开你的仓库页面 → **Settings**
2. 左侧菜单 → **Pages**
3. **Source** 选择 **Deploy from a branch**
4. **Branch** 选择 **main** / **(root)**
5. 点击 **Save**
6. 等待 1 分钟...

✅ **完成！** 页面在 https://YOUR-USERNAME.github.io/your-repo-name/

## 🔄 测试自动周更 (可选)

1. 进入仓库 → **Actions** 标签
2. 左侧选 **Weekly Brief Refresh**
3. 点 **Run workflow** 手动触发
4. 等待运行完成

> 🕐 **正式生产环境**：每周一 UTC 01:00（北京时间周一 09:00）自动运行

## 📋 核心文件一览

| 文件 | 用途 | 无需修改 |
|------|------|:----:|
| `index.html` | 网页主体 | ✅ |
| `styles.css` | 页面样式 | ✅ |
| `scripts/render.js` | 前端逻辑 | ✅ |
| `scripts/generate-weekly-brief.mjs` | 数据生成脚本 | ✅ |
| `data/news.json` | 周报数据 | 自动更新 |
| `data/news.js` | 数据备用 | 自动更新 |
| `.github/workflows/` | 自动化配置 | ✅ |
| `package.json` | 项目配置 | ✅ |

## ⚙️ 自定义（可选）

### 修改信息源

编辑 `data/news.json` 中的 `sourceFeeds` 数组，然后提交：

```bash
git add data/news.json
git commit -m "chore: update news sources"
git push
```

### 修改样式

编辑 `styles.css`，修改 `:root` 中的颜色变量：

```css
:root {
  --bg: #07111f;           /* 背景 */
  --accent: #7c9bff;       /* 强调色 */
  --text: #eff4ff;         /* 文字 */
  /* ... */
}
```

提交并推送：

```bash
git add styles.css
git commit -m "style: customize theme"
git push
```

## 🆘 常见问题

### Q: GitHub Pages 上看不到页面

A: 
1. 检查 Settings → Pages 是否选了 main 分支
2. 稍等 3-5 分钟后刷新
3. 检查 Actions 是否有错误

### Q: 数据好像没更新

A:
1. 检查 Actions → Weekly Brief Refresh 是否成功运行
2. 手动触发一次试试
3. 查看错误日志

### Q: 如何自定义域名？

A: 参考 `DEPLOYMENT_GUIDE.md` 的"进阶"部分

### Q: 想要每天更新怎么办？

A: 编辑 `.github/workflows/weekly-refresh.yml`，将：
```yaml
- cron: "0 1 * * 1"  # 每周一
```
改为：
```yaml
- cron: "0 1 * * *"  # 每天
```

## 📚 深入了解

想了解更多？查看这些文件：

| 文档 | 内容 |
|------|------|
| `README.md` | 项目概览与功能说明 |
| `DEPLOYMENT_GUIDE.md` | 详细部署步骤 |
| `AUTOMATION.md` | 自动化流程与配置 |
| `ARCHITECTURE.md` | 系统架构详解 |
| `PROJECT_SUMMARY.md` | 项目完成总结 |

## ✨ 完成清单

- [ ] GitHub 账号已准备
- [ ] 创建了新仓库
- [ ] 代码已推送到 GitHub
- [ ] GitHub Pages 已启用
- [ ] 页面可以访问
- [ ] 手动运行了一次周更测试
- [ ] 与团队分享链接

## 🎉 就这样！

你现在有了一个：
- ✅ 每周自动更新的周报
- ✅ 全球可访问的展示页面
- ✅ 零人工操作的自动系统
- ✅ 可部署到任何 GitHub 仓库

现在就去 GitHub 试试吧！🚀

---

**需要更多帮助？** 查看 `DEPLOYMENT_GUIDE.md` 的完整步骤。

**最后更新**：2026-03-24
