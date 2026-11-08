import React, { useState } from 'react'
import { useAppStore } from '../stores'
import { configDB } from '../services/db'
import { githubService, workerApi, localAI } from '../services/api'
import type { ModelConfig, AIProvider, AITask, SystemConfig } from '../types'
import { v4 as uuidv4 } from 'uuid'

type SettingsTab = 'ai' | 'github' | 'research' | 'about'

export default function Settings() {
  const { systemConfig, modelConfigs, saveSystemConfig, saveModelConfig, deleteModelConfig, addNotification } = useAppStore()
  const [activeTab, setActiveTab] = useState<SettingsTab>('ai')
  const [showAddModel, setShowAddModel] = useState(false)
  const [testingGitHub, setTestingGitHub] = useState(false)

  if (!systemConfig) return null

  const tabs: Array<{ id: SettingsTab; label: string; icon: string }> = [
    { id: 'ai', label: 'AI 配置', icon: '🤖' },
    { id: 'github', label: 'GitHub', icon: '🐙' },
    { id: 'research', label: '研究设置', icon: '🔬' },
    { id: 'about', label: '关于', icon: 'ℹ️' }
  ]

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#1F1E1B]">系统设置</h1>

      {/* 标签页 */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === t.id
                ? 'bg-[#CC785C] text-white shadow-soft font-semibold'
                : 'bg-white text-[#68645C] hover:text-[#1F1E1B] border border-[#EAE6DF]'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* AI 配置 */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          {/* 警告提示 */}
          <div className="bg-[#FAF4E8] border border-[#F3E5C6] rounded-2xl p-4">
            <div className="flex gap-3">
              <span className="text-xl">🛡️</span>
              <div>
                <div className="font-medium text-[#8C6415] text-xs mb-1">端侧安全隐私声明</div>
                <div className="text-xs text-[#57534D] leading-relaxed">
                  API Key 仅存储在本设备的本地存储中，不会上传到 GitHub 或任何服务器。
                  建议配置 Claude 官方 API 或 Cloudflare Workers 代理模式以获得最佳体验。
                </div>
              </div>
            </div>
          </div>

          {/* Worker 代理配置 */}
          <div className="card p-5">
            <h3 className="font-semibold text-stone-900 mb-4">🛡️ Cloudflare Workers 代理（推荐）</h3>
            <div className="space-y-3">
              <div>
                <label className="label">Worker URL</label>
                <input
                  type="url"
                  value={systemConfig.ai.defaultModel}
                  placeholder="https://your-worker.workers.dev"
                  className="input"
                  onChange={async e => {
                    if (e.target.value) {
                      workerApi.setBaseUrl(e.target.value)
                      const ok = await workerApi.healthCheck()
                      if (ok) addNotification({ type: 'success', title: 'Worker 连接成功' })
                      else addNotification({ type: 'error', title: 'Worker 连接失败' })
                    }
                  }}
                />
                <p className="text-xs text-muted mt-1">部署 workers/ 目录中的代码到 Cloudflare Workers</p>
              </div>
            </div>
          </div>

          {/* 本地直连配置 */}
          <div className="card p-5">
            <h3 className="font-semibold text-stone-900 mb-1">🔑 本地直连（开发/私有部署）</h3>
            <p className="text-xs text-muted mb-4">仅适合本地使用，API Key 存储在浏览器本地</p>

            <LocalAIConfig />
          </div>

          {/* 模型配置列表 */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-900">模型配置</h3>
              <button onClick={() => setShowAddModel(true)} className="btn-secondary text-sm">+ 添加模型</button>
            </div>

            {modelConfigs.length === 0 ? (
              <div className="text-center py-8 text-muted">
                <div className="text-2xl mb-2">🤖</div>
                <div>暂无模型配置</div>
              </div>
            ) : (
              <div className="space-y-3">
                {modelConfigs.map(model => (
                  <ModelConfigCard
                    key={model.id}
                    model={model}
                    onDelete={() => deleteModelConfig(model.id)}
                  />
                ))}
              </div>
            )}

            {showAddModel && (
              <AddModelForm
                onSave={async (config) => {
                  await saveModelConfig(config)
                  setShowAddModel(false)
                }}
                onCancel={() => setShowAddModel(false)}
              />
            )}
          </div>
        </div>
      )}

      {/* GitHub 配置 */}
      {activeTab === 'github' && (
        <GitHubSettings
          config={systemConfig}
          onSave={saveSystemConfig}
          onTest={async () => {
            setTestingGitHub(true)
            const result = await githubService.checkAccess()
            setTestingGitHub(false)
            if (result.ok) addNotification({ type: 'success', title: 'GitHub 连接成功', message: result.message })
            else addNotification({ type: 'error', title: '连接失败', message: result.message })
          }}
          testing={testingGitHub}
        />
      )}

      {/* 研究设置 */}
      {activeTab === 'research' && (
        <ResearchSettings config={systemConfig} onSave={saveSystemConfig} />
      )}

      {/* 关于 */}
      {activeTab === 'about' && <AboutSection />}
    </div>
  )
}

// ---- 本地 AI 配置 ----

function LocalAIConfig() {
  const { addNotification } = useAppStore()
  const [provider, setProvider] = useState<AIProvider>('claude')
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!apiKey.trim()) return
    // 只在内存中设置，不持久化到 localStorage
    localAI.setKey(apiKey.trim(), provider)
    setSaved(true)
    addNotification({ type: 'success', title: 'API Key 已设置（仅本次会话有效）' })
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="label">AI 提供商</label>
        <select value={provider} onChange={e => setProvider(e.target.value as AIProvider)} className="select">
          <option value="claude">Anthropic Claude</option>
          <option value="openai">OpenAI GPT</option>
          <option value="gemini">Google Gemini</option>
          <option value="deepseek">DeepSeek</option>
        </select>
      </div>
      <div>
        <label className="label">API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          placeholder={`输入 ${provider} API Key`}
          className="input"
        />
        <p className="text-xs text-muted mt-1">🔒 Key 只保存在内存中，刷新页面后需重新输入</p>
      </div>
      <button onClick={handleSave} className={saved ? 'btn-secondary' : 'btn-primary'}>
        {saved ? '✅ 已设置' : '保存 API Key'}
      </button>
    </div>
  )
}

// ---- GitHub 设置 ----

function GitHubSettings({ config, onSave, onTest, testing }: {
  config: SystemConfig | null
  onSave: (c: SystemConfig) => Promise<void>
  onTest: () => void
  testing: boolean
}) {
  if (!config) return null
  const [owner, setOwner] = useState(config.github.owner)
  const [repo, setRepo] = useState(config.github.repo)
  const [branch, setBranch] = useState(config.github.branch)
  const [token, setToken] = useState('')

  const handleSave = async () => {
    if (token) {
      githubService.setConfig({ owner, repo, branch, token })
    }
    await onSave({
      ...config,
      github: { ...config.github, owner, repo, branch, tokenConfigured: !!token || config.github.tokenConfigured }
    })
  }

  return (
    <div className="space-y-4">
      <div className="card border-blue-700/50 bg-blue-900/10 border p-4 text-sm text-blue-200">
        GitHub Token 仅存在内存中。请在 GitHub Settings &gt; Developer settings &gt; Personal access tokens 创建具有 <code>repo</code> 权限的 Token。
      </div>

      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-stone-900">仓库配置</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">GitHub 用户名 / 组织名</label>
            <input value={owner} onChange={e => setOwner(e.target.value)} className="input" placeholder="your-username" />
          </div>
          <div>
            <label className="label">仓库名</label>
            <input value={repo} onChange={e => setRepo(e.target.value)} className="input" placeholder="methodology-data" />
          </div>
        </div>
        <div>
          <label className="label">分支</label>
          <input value={branch} onChange={e => setBranch(e.target.value)} className="input" placeholder="main" />
        </div>
        <div>
          <label className="label">Personal Access Token（本次会话）</label>
          <input type="password" value={token} onChange={e => setToken(e.target.value)} className="input" placeholder="ghp_..." />
          <p className="text-xs text-muted mt-1">🔒 Token 仅保存在内存中，不会提交到任何地方</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSave} className="btn-primary">保存配置</button>
          <button onClick={onTest} disabled={testing} className="btn-secondary">
            {testing ? '测试中...' : '测试连接'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- 研究设置 ----

function ResearchSettings({ config, onSave }: {
  config: SystemConfig | null
  onSave: (c: SystemConfig) => Promise<void>
}) {
  if (!config) return null
  const [maxPerWeek, setMaxPerWeek] = useState(config.research.maxMethodsPerWeek)
  const [requireReview, setRequireReview] = useState(config.research.requireReview)
  const [autoThreshold, setAutoThreshold] = useState(config.research.autoApproveThreshold)
  const [prioritizeGeneral, setPrioritizeGeneral] = useState(config.research.prioritizeGeneral)

  const handleSave = async () => {
    await onSave({
      ...config,
      research: { ...config.research, maxMethodsPerWeek: maxPerWeek, requireReview, autoApproveThreshold: autoThreshold, prioritizeGeneral }
    })
  }

  return (
    <div className="card p-5 space-y-4">
      <h3 className="font-semibold text-stone-900">AI 研究参数</h3>

      <div>
        <label className="label">每周最多研究方法论数量</label>
        <input type="number" min={1} max={20} value={maxPerWeek} onChange={e => setMaxPerWeek(+e.target.value)} className="input" />
        <p className="text-xs text-muted mt-1">建议 3-10 个，质量优先于数量</p>
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" id="requireReview" checked={requireReview} onChange={e => setRequireReview(e.target.checked)} className="rounded" />
        <label htmlFor="requireReview" className="text-sm text-stone-700">入库前必须经过人工审核</label>
      </div>

      <div>
        <label className="label">自动批准质量阈值（{autoThreshold}/100）</label>
        <input type="range" min={50} max={100} value={autoThreshold} onChange={e => setAutoThreshold(+e.target.value)} className="w-full" />
        <p className="text-xs text-muted mt-1">仅在关闭人工审核时生效</p>
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" id="prioritizeGeneral" checked={prioritizeGeneral} onChange={e => setPrioritizeGeneral(e.target.checked)} className="rounded" />
        <label htmlFor="prioritizeGeneral" className="text-sm text-stone-700">优先研究通用方法论（第一层），再深化专业领域</label>
      </div>

      <button onClick={handleSave} className="btn-primary">保存研究配置</button>
    </div>
  )
}

// ---- 模型配置卡片 ----

function ModelConfigCard({ model, onDelete }: { model: ModelConfig; onDelete: () => void }) {
  const providerLabels: Record<string, string> = {
    claude: '🟣 Claude', openai: '🟢 OpenAI', gemini: '🔵 Gemini', deepseek: '🔷 DeepSeek'
  }
  return (
    <div className="bg-stone-50 rounded-lg p-3 flex items-center gap-3">
      <div className="flex-1">
        <div className="text-sm font-medium text-stone-800">{model.displayName}</div>
        <div className="text-xs text-muted">{providerLabels[model.provider] ?? model.provider} · {model.model}</div>
      </div>
      <div className="flex gap-2">
        {model.isDefault && <span className="badge-blue text-xs">默认</span>}
        <button onClick={onDelete} className="text-stone-400 hover:text-red-400 text-sm">删除</button>
      </div>
    </div>
  )
}

// ---- 添加模型表单 ----

function AddModelForm({ onSave, onCancel }: {
  onSave: (config: ModelConfig) => void
  onCancel: () => void
}) {
  const [provider, setProvider] = useState<AIProvider>('claude')
  const [model, setModel] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isDefault, setIsDefault] = useState(false)

  const MODEL_SUGGESTIONS: Record<string, string[]> = {
    claude: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-haiku-20240307'],
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    gemini: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash-exp'],
    deepseek: ['deepseek-chat', 'deepseek-reasoner']
  }

  const handleSubmit = () => {
    if (!model || !displayName) return
    onSave({
      id: uuidv4(),
      provider,
      model,
      displayName,
      contextLength: 128000,
      tasks: ['daily_qa', 'deep_research', 'content_organization'],
      isDefault,
      priority: 1,
      limits: {},
      stats: { totalTokensUsed: 0, totalCost: 0, requestCount: 0, errorCount: 0 },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  return (
    <div className="mt-4 border-t border-stone-200 pt-4 space-y-3">
      <h4 className="font-medium text-stone-800">添加新模型</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">提供商</label>
          <select value={provider} onChange={e => setProvider(e.target.value as AIProvider)} className="select">
            <option value="claude">Claude</option>
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
            <option value="deepseek">DeepSeek</option>
          </select>
        </div>
        <div>
          <label className="label">模型名称</label>
          <input value={model} onChange={e => setModel(e.target.value)} list="model-suggestions" className="input" placeholder="输入或选择" />
          <datalist id="model-suggestions">
            {(MODEL_SUGGESTIONS[provider] ?? []).map(m => <option key={m} value={m} />)}
          </datalist>
        </div>
      </div>
      <div>
        <label className="label">显示名称</label>
        <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="input" placeholder="如：Claude 3.5 Sonnet（主力研究）" />
      </div>
      <div className="flex items-center gap-3">
        <input type="checkbox" id="isDefault" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} />
        <label htmlFor="isDefault" className="text-sm text-stone-700">设为默认模型</label>
      </div>
      <div className="flex gap-3">
        <button onClick={handleSubmit} className="btn-primary">添加</button>
        <button onClick={onCancel} className="btn-ghost">取消</button>
      </div>
    </div>
  )
}

// ---- 关于 ----

function AboutSection() {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-2xl">方</div>
        <div>
          <h2 className="text-xl font-bold text-stone-900">方法论</h2>
          <p className="text-sm text-muted">个人 AI 驱动的方法论知识管理与实践系统</p>
          <p className="text-xs text-muted mt-0.5">版本 1.0.0 · PWA</p>
        </div>
      </div>
      <div className="divider" />
      <div className="space-y-2 text-sm text-stone-700">
        <p><strong className="text-stone-900">核心工作流：</strong>发现 → 研究 → 整理 → 审核 → 入库 → 关联 → 学习 → 应用 → 验证 → 更新</p>
        <p><strong className="text-stone-900">部署方案：</strong>PWA 前端 + GitHub 数据仓库 + GitHub Actions 自动任务 + Cloudflare Workers AI 代理</p>
        <p><strong className="text-stone-900">支持模型：</strong>Claude · OpenAI GPT · Google Gemini · DeepSeek</p>
      </div>
      <div className="divider" />
      <div className="text-xs text-muted">
        <p>数据存储：IndexedDB（本地）+ GitHub 仓库（云端备份）</p>
        <p>安全原则：API Key 不写入代码，不提交 GitHub，不出现在前端包中</p>
      </div>
    </div>
  )
}
