# 《方法论》系统部署、上线与日常维护手册

本文档指导如何将《方法论》系统部署至 GitHub Pages，并配置自动化任务、Cloudflare Workers 代理与手机 PWA 安装。

---

## 一、部署前准备

1. **GitHub 账号**：拥有一个 GitHub 个人或组织账号。
2. **AI 模型 API 密钥（二选一）**：
   - Anthropic Claude API Key (推荐 `claude-3-5-sonnet`)
   - DeepSeek API Key (推荐 `deepseek-chat`)
   - OpenAI GPT API Key (推荐 `gpt-4o`)
   - Google Gemini API Key
3. **Cloudflare 账号（可选但推荐）**：用于运行免费的 Cloudflare Workers 保护 API 密钥安全。

---

## 二、部署步骤 1：部署前端至 GitHub Pages

### 2.1 推送代码至 GitHub
```bash
cd /Users/doss/.gemini/antigravity/scratch/methodology

# 1. 提交本地所有源码与配置
git add .
git commit -m "feat: complete methodology V1.0 PWA system"

# 2. 关联你的 GitHub 远程仓库
git remote add origin https://github.com/<你的GitHub用户名>/methodology.git

# 3. 推送主分支
git branch -M main
git push -u origin main
```

### 2.2 开启 GitHub Pages
1. 在浏览器中打开你的 GitHub 仓库页面。
2. 点击仓库顶部的 **Settings**（设置）选项卡。
3. 在左侧菜单栏点击 **Pages**。
4. 在 **Build and deployment** 下方的 **Source** 下拉菜单中，选择 **GitHub Actions**。
5. 此时回到仓库的 **Actions** 页面，可以看到 `Deploy PWA to GitHub Pages` 工作流正在自动运行。
6. 构建完成后，GitHub Pages 会自动生成访问链接：
   `https://<你的GitHub用户名>.github.io/methodology/`

---

## 三、部署步骤 2：配置 GitHub Actions 每周自动研究

系统预设了 `.github/workflows/weekly-research.yml`，在每周一上午 02:00 UTC（北京时间 10:00）自动执行。

### 3.1 配置仓库 Secrets
1. 在 GitHub 仓库页面，点击 **Settings** -> **Secrets and variables** -> **Actions**。
2. 点击 **New repository secret** 按钮。
3. 添加至少一个 AI 密钥（名称需保持一致）：
   - `ANTHROPIC_API_KEY`: 填入你的 Claude API Key
   - `DEEPSEEK_API_KEY`: 填入你的 DeepSeek API Key
   - `OPENAI_API_KEY`: 填入你的 OpenAI API Key
4. 保存后，Actions 定时任务运行即可直接调用该密钥进行深度研究、去重分析并生成周报。

### 3.2 手动触发测试
进入 GitHub 仓库的 **Actions** 页面 -> 点击左侧 **Weekly AI Methodology Research** -> 点击右侧 **Run workflow** 按钮即可立即手动触发一次研究任务。

---

## 四、部署步骤 3：部署 Cloudflare Workers 安全代理（推荐）

为了避免在前端浏览器中保存 API Key，推荐部署极简的 Cloudflare Workers 代理。

### 4.1 安装 Wrangler 并部署
```bash
cd workers

# 全局安装 wrangler (若未安装)
npm install -g wrangler

# 登录 Cloudflare 账号
wrangler login

# 配置密钥（通过交互式输入，绝不写入代码）
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put DEEPSEEK_API_KEY

# 一键发布到 Cloudflare 全球边缘网络
wrangler deploy
```

部署完成后，控制台将输出你的 Worker 地址，例如：
`https://methodology-ai-proxy.<your-subdomain>.workers.dev`

### 4.2 在 PWA 前端绑定 Worker
1. 打开部署好的《方法论》网页。
2. 进入【设置】->【AI 配置】。
3. 在 **Worker URL** 输入框中填入该 Worker 地址，点击测试连接。
4. 提示连接成功后，所有的研究与问答请求均会经由 Workers 安全中转，不暴露任何私有密钥。

---

## 五、在移动设备上安装 PWA

系统原生支持标准的 Progressive Web App (PWA) 规范，能够以独立 App 模式运行在手机上。

### 5.1 iPhone / iPad (Safari)
1. 在 Safari 浏览器中打开网站 `https://<你的用户名>.github.io/methodology/`。
2. 点击浏览器底部正下方的 **分享** 按钮（方框带向上箭头）。
3. 向下滚动菜单，找到并点击 **添加到主屏幕** (Add to Home Screen)。
4. 确认应用名称为《方法论》，点击右上角 **添加**。
5. 返回桌面即可看到《方法论》独立图标，点击后以无地址栏全屏 Native 体验运行，并支持完整离线查阅。

### 5.2 Mac / PC (Chrome / Edge)
1. 在 Chrome 或 Edge 中打开网站。
2. 点击浏览器地址栏右侧出现的 **安装“方法论”** 图标（电脑加向下箭头）。
3. 点击确认安装，即可作为独立的桌面应用固定在程序坞或任务栏。

---

## 六、数据备份与迁移手册

### 6.1 手动一键导出
- 随时进入【方法论库】页面，点击右上角的 **导出** 按钮，系统会立即打包当前知识库中所有方法论为标准的 `.json` 文件并下载至本地磁盘。

### 6.2 迁移或恢复数据
- 在任意新设备上打开网页，进入【方法论库】，点击 **导入** 按钮，选择此前备份的 `.json` 文件，系统将自动执行校验并无损合并入库。

---

## 七、日常使用建议

1. **每周一检视审核队列**：GitHub Actions 自动完成研究后，用户每周仅需投入 5-10 分钟在【AI 研究中心】检视待审核档案，选择批准或补充。
2. **遇事调用多模型方案**：在【智能搜索】中输入实际遇到的团队管理、学习或决策卡点，借助 AI 自动进行方法论组合。
3. **真实实践闭环**：在【实践与学习】建立真实项目，通过真实打卡与日志，让 AI 进行针对性复盘，从而让系统随着时间推移越用越好用。
