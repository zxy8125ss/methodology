// GitHub API 数据同步服务
// 负责将本地 IndexedDB 数据同步到 GitHub 仓库，以及从 GitHub 仓库读取数据

import type { Method, Domain, Practice, LearningPlan, ResearchTask, ReviewItem, SystemConfig } from '../types'

interface GitHubConfig {
  owner: string
  repo: string
  branch: string
  token: string  // 只在内存中存储，不持久化
}

interface GitHubFile {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string
  type: string
  content: string
  encoding: string
}

class GitHubService {
  private config: GitHubConfig | null = null
  private baseUrl = 'https://api.github.com'

  setConfig(config: GitHubConfig) {
    this.config = config
  }

  isConfigured(): boolean {
    return this.config !== null && this.config.token !== ''
  }

  private getHeaders(): HeadersInit {
    if (!this.config) throw new Error('GitHub 未配置')
    return {
      'Authorization': `token ${this.config.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    }
  }

  private getRepoUrl(): string {
    if (!this.config) throw new Error('GitHub 未配置')
    return `${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}`
  }

  // 获取文件内容
  async getFile(path: string): Promise<{ content: string; sha: string } | null> {
    if (!this.isConfigured()) return null
    try {
      const response = await fetch(
        `${this.getRepoUrl()}/contents/${path}?ref=${this.config!.branch}`,
        { headers: this.getHeaders() }
      )
      if (response.status === 404) return null
      if (!response.ok) throw new Error(`GitHub API 错误: ${response.status}`)
      const file: GitHubFile = await response.json()
      const content = atob(file.content.replace(/\n/g, ''))
      return { content, sha: file.sha }
    } catch (error) {
      console.error('获取 GitHub 文件失败:', path, error)
      return null
    }
  }

  // 写入文件
  async writeFile(path: string, content: string, message: string): Promise<boolean> {
    if (!this.isConfigured()) return false
    try {
      // 先获取现有文件的 sha（用于更新）
      const existing = await this.getFile(path)
      
      const body: Record<string, unknown> = {
        message,
        content: btoa(unescape(encodeURIComponent(content))),
        branch: this.config!.branch
      }
      if (existing?.sha) body.sha = existing.sha

      const response = await fetch(
        `${this.getRepoUrl()}/contents/${path}`,
        {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify(body)
        }
      )
      return response.ok
    } catch (error) {
      console.error('写入 GitHub 文件失败:', path, error)
      return false
    }
  }

  // 读取 JSON 数据
  async readJSON<T>(path: string): Promise<T | null> {
    const result = await this.getFile(path)
    if (!result) return null
    try {
      return JSON.parse(result.content) as T
    } catch {
      return null
    }
  }

  // 写入 JSON 数据
  async writeJSON(path: string, data: unknown, message: string): Promise<boolean> {
    return this.writeFile(path, JSON.stringify(data, null, 2), message)
  }

  // 同步方法论到 GitHub
  async syncMethod(method: Method): Promise<boolean> {
    const path = `data/methods/${method.id}.json`
    return this.writeJSON(path, method, `更新方法论: ${method.name}`)
  }

  // 从 GitHub 拉取所有方法论
  async fetchAllMethods(): Promise<Method[]> {
    if (!this.isConfigured()) return []
    try {
      const response = await fetch(
        `${this.getRepoUrl()}/contents/data/methods?ref=${this.config!.branch}`,
        { headers: this.getHeaders() }
      )
      if (!response.ok) return []
      const files: GitHubFile[] = await response.json()
      
      const methods: Method[] = []
      for (const file of files.filter(f => f.name.endsWith('.json'))) {
        const result = await this.getFile(file.path)
        if (result) {
          try {
            methods.push(JSON.parse(result.content) as Method)
          } catch {
            // 跳过解析失败的文件
          }
        }
      }
      return methods
    } catch {
      return []
    }
  }

  // 同步实践记录
  async syncPractice(practice: Practice): Promise<boolean> {
    const path = `data/practices/${practice.id}.json`
    return this.writeJSON(path, practice, `更新实践: ${practice.title}`)
  }

  // 同步系统配置（不含敏感信息）
  async syncConfig(config: Omit<SystemConfig, 'github'>): Promise<boolean> {
    return this.writeJSON('data/config.json', config, '更新系统配置')
  }

  // 更新索引文件
  async updateIndex(methods: Method[]): Promise<boolean> {
    const index = methods.map(m => ({
      id: m.id,
      name: m.name,
      aliases: m.aliases,
      domains: m.domains,
      type: m.type,
      layer: m.layer,
      summary: m.content.summary,
      status: m.status,
      updatedAt: m.updatedAt
    }))
    return this.writeJSON('indexes/methods-index.json', index, '更新方法论索引')
  }

  // 检查仓库访问权限
  async checkAccess(): Promise<{ ok: boolean; message: string }> {
    if (!this.config) return { ok: false, message: '未配置 GitHub' }
    try {
      const response = await fetch(this.getRepoUrl(), { headers: this.getHeaders() })
      if (response.ok) return { ok: true, message: '连接成功' }
      if (response.status === 401) return { ok: false, message: 'Token 无效或已过期' }
      if (response.status === 404) return { ok: false, message: '仓库不存在或无权访问' }
      return { ok: false, message: `连接失败: ${response.status}` }
    } catch {
      return { ok: false, message: '网络连接失败' }
    }
  }

  // 获取仓库信息
  async getRepoInfo(): Promise<{ stars: number; size: number; lastPush: string } | null> {
    if (!this.isConfigured()) return null
    try {
      const response = await fetch(this.getRepoUrl(), { headers: this.getHeaders() })
      if (!response.ok) return null
      const repo = await response.json()
      return {
        stars: repo.stargazers_count,
        size: repo.size,
        lastPush: repo.pushed_at
      }
    } catch {
      return null
    }
  }
}

// 单例
export const githubService = new GitHubService()

// ============================================================
// Worker API 服务（Cloudflare Workers 代理）
// 用于保护 AI API Key 安全
// ============================================================

class WorkerApiService {
  private baseUrl: string = ''

  setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, '')
  }

  isConfigured(): boolean {
    return this.baseUrl !== ''
  }

  async request<T>(
    endpoint: string,
    options: {
      method?: string
      body?: unknown
      signal?: AbortSignal
    } = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Worker API 未配置' }
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: options.method ?? 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: options.signal
      })

      const data = await response.json()
      if (!response.ok) {
        return { success: false, error: data.error ?? `HTTP ${response.status}` }
      }
      return { success: true, data: data as T }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return { success: false, error: 'Request aborted' }
      }
      return { success: false, error: (error as Error).message }
    }
  }

  // AI 对话
  async chat(messages: Array<{ role: string; content: string }>, model?: string): Promise<{ success: boolean; content?: string; error?: string }> {
    return this.request<{ content: string }>('/api/chat', {
      method: 'POST',
      body: { messages, model }
    }).then(r => ({ success: r.success, content: r.data?.content, error: r.error }))
  }

  // AI 研究任务
  async research(taskId: string, config: unknown): Promise<{ success: boolean; error?: string }> {
    return this.request('/api/research', {
      method: 'POST',
      body: { taskId, config }
    }).then(r => ({ success: r.success, error: r.error }))
  }

  // 知识检索
  async search(query: string, context: unknown): Promise<{ success: boolean; data?: unknown; error?: string }> {
    return this.request('/api/search', {
      method: 'POST',
      body: { query, context }
    })
  }

  // 健康检查
  async healthCheck(): Promise<boolean> {
    const r = await this.request('/health')
    return r.success
  }
}

export const workerApi = new WorkerApiService()

// ============================================================
// 本地 AI 服务（无 Worker 时的回退方案）
// 注意：此模式下 API Key 会在前端使用，仅适合个人私有部署
// ============================================================

class LocalAIService {
  private apiKey: string = ''
  private provider: string = ''

  // 警告：此方法仅用于开发环境或个人私有部署
  // 生产环境应使用 WorkerApiService
  setKey(key: string, provider: string) {
    this.apiKey = key
    this.provider = provider
  }

  isConfigured(): boolean {
    return this.apiKey !== ''
  }

  async chat(messages: Array<{ role: string; content: string }>, model?: string): Promise<{ success: boolean; content?: string; error?: string; usage?: { inputTokens: number; outputTokens: number } }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'AI 服务未配置' }
    }

    try {
      let url = ''
      let headers: Record<string, string> = {}
      let body: unknown = {}

      switch (this.provider) {
        case 'claude': {
          url = 'https://api.anthropic.com/v1/messages'
          headers = {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          }
          body = {
            model: model ?? 'claude-3-5-sonnet-20241022',
            max_tokens: 4096,
            messages: messages.filter(m => m.role !== 'system'),
            system: messages.find(m => m.role === 'system')?.content
          }
          break
        }
        case 'openai': {
          url = 'https://api.openai.com/v1/chat/completions'
          headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
          body = {
            model: model ?? 'gpt-4o',
            messages,
            max_tokens: 4096
          }
          break
        }
        case 'gemini': {
          url = `https://generativelanguage.googleapis.com/v1beta/models/${model ?? 'gemini-1.5-pro'}:generateContent?key=${this.apiKey}`
          headers = { 'Content-Type': 'application/json' }
          body = {
            contents: messages
              .filter(m => m.role !== 'system')
              .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
          }
          break
        }
        case 'deepseek': {
          url = 'https://api.deepseek.com/chat/completions'
          headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
          body = {
            model: model ?? 'deepseek-chat',
            messages,
            max_tokens: 4096
          }
          break
        }
        default:
          return { success: false, error: `不支持的 AI 提供商: ${this.provider}` }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        return { success: false, error: (err as Record<string, { message?: string }>).error?.message ?? `HTTP ${response.status}` }
      }

      const data = await response.json()
      let content = ''
      let usage = { inputTokens: 0, outputTokens: 0 }

      if (this.provider === 'claude') {
        content = (data as { content: Array<{ text: string }>; usage: { input_tokens: number; output_tokens: number } }).content[0]?.text ?? ''
        usage = { inputTokens: data.usage?.input_tokens ?? 0, outputTokens: data.usage?.output_tokens ?? 0 }
      } else if (this.provider === 'openai' || this.provider === 'deepseek') {
        content = (data as { choices: Array<{ message: { content: string } }>; usage: { prompt_tokens: number; completion_tokens: number } }).choices[0]?.message?.content ?? ''
        usage = { inputTokens: data.usage?.prompt_tokens ?? 0, outputTokens: data.usage?.completion_tokens ?? 0 }
      } else if (this.provider === 'gemini') {
        content = (data as { candidates: Array<{ content: { parts: Array<{ text: string }> } }> }).candidates[0]?.content?.parts[0]?.text ?? ''
      }

      return { success: true, content, usage }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }
}

export const localAI = new LocalAIService()

// 获取当前活跃的 AI 服务
export function getActiveAIService() {
  if (workerApi.isConfigured()) return workerApi
  if (localAI.isConfigured()) return localAI
  return null
}
