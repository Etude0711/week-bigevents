# 部署到 GitHub Pages 完整指南

按照本指南，只需 5 分钟即可将周报部署到 GitHub Pages。

## 前置条件

- GitHub 账号（没有则先注册）
- Git 命令行工具（[下载](https://git-scm.com/download/win)）
- 项目文件夹已准备好

## 步骤 1：在 GitHub 创建仓库

### 1.1 创建新仓库

1. 登录 GitHub，进入 https://github.com/new
2. 填写 **Repository name**（例如 `sports-fitness-weekly-brief`）
3. 选择 **Public**（这样别人才能访问）
4. ✅ 勾选 **Add a README file**（可选，稍后我们会覆盖）
5. 点击 **Create repository**

### 1.2 复制仓库地址

创建成功后，点击绿色 **Code** 按钮，复制 HTTPS URL，例如：
```
https://github.com/your-username/sports-fitness-weekly-brief.git
```

## 步骤 2：本地初始化 Git

打开项目文件夹，进入命令行（PowerShell 或 Git Bash）：

```bash
# 进入项目目录
cd "C:\Users\周登鸿\Documents\Catpaw\体育健身信息一周大事件"

# 初始化 Git 仓库
git init

# 添加远程仓库（将下面的 URL 替换为你的）
git remote add origin https://github.com/your-username/sports-fitness-weekly-brief.git

# 配置 Git 用户名和邮箱（首次使用）
git config user.name "Your Name"
git config user.email "your-email@example.com"

# 或全局配置（可选）
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

## 步骤 3：提交并推送代码

```bash
# 添加所有文件到暂存区
git add .

# 创建首次提交
git commit -m "chore: initial commit with weekly brief setup"

# 推送到 GitHub（首次需要）
git branch -M main
git push -u origin main

# 后续推送（直接运行）
git push
```

## 步骤 4：启用 GitHub Pages

1. 进入你的仓库页面（GitHub 上）
2. 点击 **Settings** 标签
3. 在左侧找 **Pages**（或直接访问 `https://github.com/your-username/sports-fitness-weekly-brief/settings/pages`）
4. 在 **Build and deployment** 部分：
   - **Source** 选择 **Deploy from a branch**
   - **Branch** 选择 **main** 和 **/ (root)**
   - 点击 **Save**

5. 等待 1-2 分钟后，页面会显示：
   ```
   Your site is live at https://your-username.github.io/sports-fitness-weekly-brief/
   ```

## 步骤 5：验证部署

1. 访问上面显示的 URL
2. 确认页面正常加载，资讯显示完整
3. 尝试筛选、排序功能是否正常

## 步骤 6：自动周更设置

### 6.1 首次手动触发

1. 进入你的仓库
2. 点击 **Actions** 标签
3. 左侧选择 **Weekly Brief Refresh**
4. 点击 **Run workflow** → **Run workflow**
5. 等待 1-2 分钟，看是否成功

如果成功，你会看到：
- ✅ **All jobs succeeded**
- `data/news.json` 和 `data/news.js` 被自动更新
- GitHub Pages 自动重新部署

### 6.2 配置定时触发

工作流已配置为每周一 UTC 01:00（北京时间周一上午 9 点）自动运行。

如需修改触发时间，编辑 `.github/workflows/weekly-refresh.yml`：

```yaml
schedule:
  - cron: "0 1 * * 1"  # 修改这一行
```

常见的 cron 表达式：

| 表达式 | 含义 |
|--------|------|
| `0 1 * * 1` | 每周一 01:00 UTC |
| `0 9 * * 1` | 每周一 09:00 UTC（北京时间 17:00） |
| `0 0 * * *` | 每天 00:00 UTC |
| `0 12 * * 0` | 每周日 12:00 UTC |

修改后保存并推送到 GitHub：

```bash
git add .github/workflows/weekly-refresh.yml
git commit -m "chore: adjust weekly refresh schedule"
git push
```

## 常见问题排查

### ❌ GitHub Pages 没有上线

**症状**：页面显示 "404 - There isn't a GitHub Pages site here."

**解决**：
1. 检查 Settings → Pages 是否选对分支（应为 `main`）
2. 检查 **Actions** 是否有 Deploy Pages 工作流失败
3. 稍等 3-5 分钟后刷新

### ❌ 推送代码时要求输入密码

**症状**：`git push` 时要求输入 GitHub 密码

**解决**（推荐使用 Personal Access Token）：
1. 进入 GitHub 设置 → [Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. 点击 **Generate new token (classic)**
3. 勾选 `repo` 和 `workflow` 权限
4. 生成后复制 token
5. 推送时，用户名输入 `your-username`，密码粘贴 token

或者使用 SSH key（更推荐）：
```bash
# 生成 SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# 添加到 ssh-agent（macOS/Linux）
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Windows 上应该已自动添加

# 查看公钥
cat ~/.ssh/id_ed25519.pub

# 复制到 GitHub：Settings → SSH and GPG keys → New SSH key
```

改用 SSH 地址（GitHub 页面 Code 按钮中可选）：
```bash
git remote set-url origin git@github.com:your-username/sports-fitness-weekly-brief.git
git push
```

### ❌ 周更工作流总是失败

**常见原因**：

1. **Google News RSS 不可用**
   - 症状：日志显示网络超时
   - 解决：稍后重试，或手动运行检测是否是临时问题

2. **翻译 API 频率限制**
   - 症状：Translation API 返回 429 Too Many Requests
   - 解决：脚本已内置重试机制，一般会自动恢复

3. **权限问题**
   - 症状：Permission denied 或 403 Forbidden
   - 解决：检查 `.github/workflows/weekly-refresh.yml` 中 permissions 是否正确设置

**查看详细错误日志**：
1. 进入 **Actions** 标签
2. 选择失败的工作流运行
3. 点击 **Weekly Brief Refresh** 任务
4. 展开 **Generate weekly brief data** 查看错误

### ✅ 如何手动触发更新？

1. 进入 **Actions** 标签
2. 选择 **Weekly Brief Refresh**
3. 点击 **Run workflow** → **Run workflow**

或者本地手动生成并推送：

```bash
# 本地生成
node scripts/generate-weekly-brief.mjs

# 提交
git add data/
git commit -m "chore: manual weekly refresh"
git push
```

## 进阶：自定义域名

如果你有自己的域名，可以绑定到 GitHub Pages：

1. GitHub 仓库 Settings → Pages
2. 在 **Custom domain** 输入你的域名
3. 按提示在你的域名 DNS 中添加 CNAME 记录
4. 等待 DNS 生效（通常 5 分钟到 1 小时）

例如，如果你的域名是 `example.com`：
- 添加 CNAME 记录：`your-username.github.io`
- 或添加 A 记录指向 GitHub 的 IP

## 后续维护

### 定期检查

- 每周检查 **Actions** 工作流是否成功运行
- 偶尔查看 GitHub Pages 是否正常显示

### 更新信息源

编辑 `data/news.json` 中的 `sourceFeeds`，然后推送：

```bash
git add data/news.json
git commit -m "chore: update news feed sources"
git push
```

### 微调样式

编辑 `styles.css`，然后推送：

```bash
git add styles.css
git commit -m "style: improve layout"
git push
```

### 提交本地更改

```bash
# 查看变更
git status

# 添加所有文件
git add .

# 创建提交
git commit -m "描述你的修改"

# 推送
git push
```

## 🎉 完成！

你现在拥有一个：
- ✅ 自动每周更新的体育健身行业周报
- ✅ 全球可访问的展示页面（GitHub Pages）
- ✅ 完全自动化的数据生成流程
- ✅ 支持多语言、多地区、多分类的聚合

在 https://your-username.github.io/sports-fitness-weekly-brief/ 分享给你的团队吧！

---

**需要帮助？**
- GitHub 文档：https://docs.github.com/en/pages
- GitHub Actions 文档：https://docs.github.com/en/actions
- 本项目 AUTOMATION.md 有更详细的配置说明

**最后更新**：2026-03-24
