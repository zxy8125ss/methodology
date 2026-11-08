// 搜索服务 - 本地全文搜索 + AI 语义搜索
import Fuse from 'fuse.js'
import type { Method, SearchQuery, SearchResult, MethodSearchHit } from '../types'
import { methodsDB } from './db'
import { localAI, workerApi } from './api'

// ============================================================
// 本地全文搜索（Fuse.js）
// ============================================================

let fuseInstance: Fuse<Method> | null = null
let fuseLastUpdate = 0

async function getFuseInstance(methods?: Method[]): Promise<Fuse<Method>> {
  const now = Date.now()
  // 每5分钟重建索引
  if (!fuseInstance || (now - fuseLastUpdate) > 5 * 60 * 1000) {
    const allMethods = methods ?? (await methodsDB.getAll()).items
    fuseInstance = new Fuse(allMethods, {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'aliases', weight: 0.3 },
        { name: 'content.summary', weight: 0.3 },
        { name: 'content.coreIdea', weight: 0.2 },
        { name: 'content.scenarios', weight: 0.15 },
        { name: 'tags', weight: 0.1 },
        { name: 'origin.proposer', weight: 0.05 }
      ],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      useExtendedSearch: true
    })
    fuseLastUpdate = now
  }
  return fuseInstance
}

export function invalidateSearchIndex() {
  fuseInstance = null
  fuseLastUpdate = 0
}

// ============================================================
// 本地关键词搜索
// ============================================================

export async function localSearch(
  query: string,
  options: { limit?: number; domains?: string[] } = {}
): Promise<MethodSearchHit[]> {
  const { limit = 10, domains } = options
  const fuse = await getFuseInstance()
  
  const results = fuse.search(query, { limit: limit * 2 })
  
  return results
    .filter(r => !domains?.length || r.item.domains.some(d => domains.includes(d)))
    .slice(0, limit)
    .map(r => ({
      method: r.item,
      score: 1 - (r.score ?? 0),
      matchedFields: r.matches?.map(m => m.key ?? '') ?? [],
      snippet: r.item.content.summary,
      relevanceReason: `匹配字段：${r.matches?.map(m => m.key).join('、') ?? '标题'}`
    }))
}

// ============================================================
// AI 语义搜索和场景推荐
// ============================================================

export async function aiSearch(
  query: string,
  methods: Method[],
  signal?: AbortSignal
): Promise<{
  success: boolean
  hits?: MethodSearchHit[]
  analysis?: SearchResult['aiAnalysis']
  error?: string
}> {
  const aiService = workerApi.isConfigured() ? workerApi : localAI
  if (!aiService.isConfigured()) {
    return { success: false, error: 'AI 服务未配置' }
  }

  const methodList = methods.slice(0, 50).map(m =>
    `- ID:${m.id} | 名称:${m.name} | 领域:${m.domains.join('/')} | 描述:${m.content.summary}`
  ).join('\n')

  const result = await aiService.chat([
    {
      role: 'system',
      content: `你是一个方法论知识库智能搜索助手。
根据用户的问题，从知识库中找到最相关的方法论，并提供组合解决方案。
你必须只推荐知识库中存在的方法论（通过ID匹配）。
输出 JSON 格式。`
    },
    {
      role: 'user',
      content: `用户问题：${query}

**知识库方法论（部分）：**
${methodList}

请输出 JSON：
{
  "problemUnderstanding": "对用户问题的理解（50字以内）",
  "relevantMethodIds": ["method_id1", "method_id2", "method_id3"],
  "relevanceReasons": {
    "method_id1": "推荐原因",
    "method_id2": "推荐原因"
  },
  "recommendedCombination": "如何组合这些方法论（100字以内）",
  "combinationLogic": "组合逻辑说明（150字以内）",
  "executionSteps": [
    "第一步：...",
    "第二步：..."
  ],
  "precautions": ["注意事项1", "注意事项2"],
  "relatedCases": ["相关案例场景1"],
  "sources": ["知识来源说明"]
}`
    }
  ])

  if (!result.success || !result.content) {
    return { success: false, error: result.error }
  }

  try {
    const jsonMatch = result.content.match(/```json\n([\s\S]*?)\n```/) || result.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return { success: false, error: 'AI 返回格式错误' }
    
    const data = JSON.parse(jsonMatch[1] ?? jsonMatch[0]) as {
      problemUnderstanding: string
      relevantMethodIds: string[]
      relevanceReasons: Record<string, string>
      recommendedCombination: string
      combinationLogic: string
      executionSteps: string[]
      precautions: string[]
      relatedCases: string[]
      sources: string[]
    }
    
    const methodMap = new Map(methods.map(m => [m.id, m]))
    const hits: MethodSearchHit[] = (data.relevantMethodIds ?? [])
      .filter(id => methodMap.has(id))
      .map((id, index) => {
        const method = methodMap.get(id)!
        return {
          method,
          score: 1 - index * 0.1,
          matchedFields: ['ai_semantic'],
          snippet: method.content.summary,
          relevanceReason: data.relevanceReasons?.[id] ?? '相关',
          aiScore: 1 - index * 0.1
        }
      })

    return {
      success: true,
      hits,
      analysis: {
        problemUnderstanding: data.problemUnderstanding,
        recommendedCombination: data.recommendedCombination,
        combinationLogic: data.combinationLogic,
        executionSteps: data.executionSteps,
        precautions: data.precautions,
        relatedCases: data.relatedCases,
        sources: data.sources
      }
    }
  } catch (error) {
    return { success: false, error: `解析失败: ${(error as Error).message}` }
  }
}

// ============================================================
// 综合搜索入口
// ============================================================

export async function search(query: SearchQuery): Promise<SearchResult> {
  const { items: allMethods } = await methodsDB.getAll({ status: 'active' })
  
  // 1. 本地关键词搜索
  const localHits = await localSearch(query.text, {
    limit: query.limit ?? 10,
    domains: query.filters.domains
  })
  
  // 2. 自然语言 / 场景推荐时，增加 AI 搜索
  let aiAnalysis: SearchResult['aiAnalysis'] | undefined
  let aiHits: MethodSearchHit[] = []
  
  if (query.type === 'natural_language' || query.type === 'scenario') {
    const aiResult = await aiSearch(query.text, allMethods)
    if (aiResult.success) {
      aiHits = aiResult.hits ?? []
      aiAnalysis = aiResult.analysis
    }
  }
  
  // 3. 合并去重，AI 分数权重更高
  const hitMap = new Map<string, MethodSearchHit>()
  for (const hit of localHits) hitMap.set(hit.method.id, hit)
  for (const hit of aiHits) {
    const existing = hitMap.get(hit.method.id)
    if (existing) {
      hitMap.set(hit.method.id, { ...existing, score: Math.max(existing.score, hit.score), aiScore: hit.aiScore })
    } else {
      hitMap.set(hit.method.id, hit)
    }
  }
  
  const allHits = Array.from(hitMap.values())
    .sort((a, b) => (b.aiScore ?? b.score) - (a.aiScore ?? a.score))
    .slice(0, query.limit ?? 10)
  
  return {
    methods: allHits,
    total: allHits.length,
    aiAnalysis,
    query,
    searchedAt: new Date().toISOString()
  }
}

// ============================================================
// 相关方法论推荐
// ============================================================

export async function getRelatedMethods(methodId: string, limit = 5): Promise<Method[]> {
  const { items: all } = await methodsDB.getAll({ status: 'active' })
  const target = all.find(m => m.id === methodId)
  if (!target) return []
  
  // 1. 直接关联的方法论
  const relatedIds = new Set(target.relations?.map(r => 
    r.fromMethodId === methodId ? r.toMethodId : r.fromMethodId
  ) ?? [])
  
  // 2. 同领域方法论
  const sameDomainMethods = all.filter(m => 
    m.id !== methodId && 
    m.domains.some(d => target.domains.includes(d))
  )
  
  // 合并
  const related: Method[] = []
  for (const id of relatedIds) {
    const m = all.find(x => x.id === id)
    if (m) related.push(m)
  }
  
  for (const m of sameDomainMethods) {
    if (!relatedIds.has(m.id) && related.length < limit) {
      related.push(m)
    }
  }
  
  return related.slice(0, limit)
}
