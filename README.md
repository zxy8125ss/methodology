# 《方法论》个人 AI 驱动的方法论知识管理与实践系统 (PWA)

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue.svg)](https://vitejs.dev/)
[![React 18](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Automated-green.svg)](https://github.com/features/actions)

> **版本**：V1.0  
> **核心原则**：AI 主导研究整理，用户负责审核、学习、应用和验证。  
> **支持平台**：iPhone (iOS PWA 安装)、Mac、iPad、PC 浏览器桌面端全适配。  
> **部署架构**：GitHub Pages 静态托管 + GitHub Actions 每周自动研究 + Cloudflare Workers 安全 API 代理。

---

## 🌟 核心特色与功能

```text
 发现 → 研究 → 整理 → 审核 → 入库 → 关联 → 学习 → 应用 → 验证 → 更新
  └────────── AI 自动化 ──────────┘   └────────── 人工闭环 ──────────┘
```

1. **综合工作台 (Dashboard)**
   - 知识资产统计大屏：收录方法论总量、八大领域分布图谱、待审核队列、活跃实践项目与今日学习任务。
   - AI 动态情境推荐：根据最近薄弱环节与实践反思推荐适用方法论。

2. **标准化方法论知识库 (Library)**
   - **三层知识架构**：通用方法论 (Layer 1)、专业领域方法论 (Layer 2)、跨领域关联 (Layer 3)。
   - **八大专业领域**：管理与组织、个人成长、思维模型、工作效率、沟通谈判、学习方法、商业经营、生活实用。
   - **完整档案结构**：包含提出者与渊源、一句话概述、核心思想、运行原理、适用场景/条件、SOP 操作步骤、优缺点局限与常见误区、证据可信度等级及完整 Markdown 论文级研究报告。
   - **数据自由迁移**：支持 JSON 完整数据一键导出与安全导入。

3. **AI 深度研究中心 (Research)**
   - **主动研究**：用户输入主题或系统自动识别探索未知方法论。
   - **多维度防伪去重**：严格区分原始理论、学术证据、实践经验与 AI 推断；与现有方法库语义去重。
   - **人工审核队列 (Human-in-the-loop)**：AI 研究完成进入审核队列，用户可一键批准入库、修改入库或退回重研。

4. **智能搜索与场景推荐 (Search & RAG)**
   - 支持关键词模糊检索与自然语言场景问题检索（如“团队执行力低下如何解决？”）。
   - **多方法论组合解法**：AI 针对复杂现实问题组合匹配多个方法论（如 OKR + PDCA + 费曼技巧），并给出详尽的组合逻辑与执行台阶。

5. **交互式知识图谱 (Knowledge Graph)**
   - 基于 D3.js 力导向图引擎构建。
   - 视觉化呈现方法论之间的 7 类语义关系：上下位、互补、相似、冲突、组合使用、演化、领域应用。
   - 支持按领域与类型实时过滤筛选，点击节点抽屉展开详情。

6. **实践与学习闭环 (Practice & Learning)**
   - **实践闭环**：绑定方法论 → 制定方案与预期目标 → 分步勾选打卡 → 记录过程反思日志 → 效果评价星级 → **AI 深度实践复盘**。
   - **学习中心**：四级掌握度体系（了解、理解、掌握、熟练应用），艾宾浩斯间隔复习到期提醒，每日学习任务流。

7. **PWA 极速离线能力**
   - 离线 Service Worker 缓存，断网状态下仍可毫秒级打开并查阅全部已缓存方法论、实践记录与图谱。

---

## 📁 目录结构说明

```text
methodology/
├── .github/
│   └── workflows/
│       ├── deploy.yml              # GitHub Pages 自动编译部署工作流
│       └── weekly-research.yml     # 每周一自动触发的 AI 深度研究工作流
├── data/                           # 结构化核心数据资产
│   ├── config.json                 # 系统与领域配置
│   ├── methods/                    # 每条方法论独立 JSON 档案
│   └── relations/                  # 关联关系数据
├── research/
│   ├── queue/                      # AI 每周研究待审核队列
│   └── reports/                    # 每周研究周报 (Markdown)
├── indexes/
│   └── methods-index.json          # 全局方法论轻量级快速索引
├── schemas/
│   └── method.schema.json          # 方法论 JSON Schema 强校验规约
├── scripts/
│   ├── weekly_research.mjs         # 每周 AI 研究 Node.js 调度器
│   └── export_seed_data.mjs        # 种子数据导出工具
├── workers/
│   ├── index.ts                    # Cloudflare Workers 安全 API 代理层
│   └── wrangler.toml               # Workers 部署配置文件
├── public/                         # PWA 静态资源 (Icon, Manifest, Robots)
├── src/
│   ├── components/                 # 通用组件 (Layout, Card, Modal, Badges, etc.)
│   ├── data/                       # 初始领域与核心种子数据
│   ├── pages/                      # 核心业务页面 (Dashboard, Library, Detail, etc.)
│   ├── services/                   # 数据层 (IndexedDB, GitHub API, AI Service, Search)
│   ├── stores/                     # 全局状态管理 (Zustand)
│   └── types/                      # 核心 TypeScript 类型定义
└── vite.config.ts                  # Vite + PWA 编译配置
```

---

## 🚀 本地开发与快速上手

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```
打开浏览器访问 `http://localhost:5173` 即可立即体验。

### 3. 构建生产版本与 PWA 产物
```bash
npm run build
```
编译产物位于 `dist/`，包含 `sw.js` 和 `manifest.webmanifest`。

---

## 🌐 部署与自动化配置指南

详细说明请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)。

### 极速部署至 GitHub Pages
1. 在 GitHub 上创建新仓库 `methodology`。
2. 推送当前代码到 `main` 分支：
   ```bash
   git remote add origin https://github.com/<你的用户名>/methodology.git
   git branch -M main
   git push -u origin main
   ```
3. 在 GitHub 仓库设置中开启 Pages：
   - 进入 **Settings** -> **Pages**。
   - **Source** 选择 **GitHub Actions**。
   - 推送代码后，`.github/workflows/deploy.yml` 会自动完成打包与发布，几分钟后即可通过 `https://<你的用户名>.github.io/methodology/` 访问。

### 配置自动化 AI 每周研究
在 GitHub 仓库中配置 Secret：
- 进入 **Settings** -> **Secrets and variables** -> **Actions**。
- 新增 `ANTHROPIC_API_KEY`（Claude）或 `DEEPSEEK_API_KEY`、`OPENAI_API_KEY`。
- 每周一上午 10:00 (北京时间)，Actions 将自动执行研究任务，生成报告并提交 Pull Request 审核队列。

---

## 🔒 安全与隐私设计

- **严禁泄露密钥**：API Key 绝不硬编码在前端打包产物中。
- **纯本地模式**：用户填入的 Key 仅保存在浏览器当前会话内存中，关闭页面即释放。
- **代理安全模式**：生产环境推荐部署自带密钥的 Cloudflare Workers，前端仅与代理端点通信，彻底隔绝密钥泄露风险。
