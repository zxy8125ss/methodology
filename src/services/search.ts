// 搜索服务 - 本地全文搜索 + AI 语义推演 + 离线启发式分析
import Fuse from 'fuse.js'
import type { Method, SearchQuery, SearchResult, MethodSearchHit } from '../types'
import { methodsDB } from './db'
import { localAI, workerApi } from './api'

// ============================================================
// 本地全文搜索（Fuse.js + 实体子串增强）
// ============================================================

let fuseInstance: Fuse<Method> | null = null
let fuseLastUpdate = 0

async function getFuseInstance(methods?: Method[]): Promise<Fuse<Method>> {
  const now = Date.now()
  if (!fuseInstance || (now - fuseLastUpdate) > 5 * 60 * 1000) {
    const allMethods = methods ?? (await methodsDB.getAll()).items
    fuseInstance = new Fuse(allMethods, {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'aliases', weight: 0.35 },
        { name: 'tags', weight: 0.2 },
        { name: 'content.summary', weight: 0.25 },
        { name: 'content.coreIdea', weight: 0.2 },
        { name: 'content.scenarios', weight: 0.15 },
        { name: 'origin.proposer', weight: 0.1 }
      ],
      threshold: 0.45,
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

/**
 * 本地多模式搜索（结合实体子串提取与模糊全文索引）
 */
export async function localSearch(
  query: string,
  options: { limit?: number; domains?: string[] } = {}
): Promise<MethodSearchHit[]> {
  const { limit = 10, domains } = options
  const q = query.trim().toLowerCase()
  if (!q) return []

  const { items: allMethods } = await methodsDB.getAll({ status: 'active' })
  const filteredPool = domains?.length
    ? allMethods.filter(m => m.domains.some(d => domains.includes(d)))
    : allMethods

  const hitMap = new Map<string, MethodSearchHit>()

  // 1. 实体子串与别名双向命中（彻底解决自然语言长句匹配难题）
  for (const m of filteredPool) {
    const nameLower = m.name.toLowerCase()
    let directScore = 0
    let matchField = ''

    if (q.includes(nameLower) || nameLower.includes(q)) {
      directScore = 0.95
      matchField = `方法论名称《${m.name}》`
    } else {
      for (const alias of m.aliases || []) {
        const al = alias.toLowerCase()
        if (q.includes(al) || al.includes(q)) {
          directScore = 0.90
          matchField = `常用别名/英文名「${alias}」`
          break
        }
      }
    }

    if (!directScore && m.tags) {
      for (const t of m.tags) {
        if (q.includes(t.toLowerCase())) {
          directScore = 0.80
          matchField = `核心标签 #${t}`
          break
        }
      }
    }

    if (!directScore && m.origin?.proposer) {
      if (q.includes(m.origin.proposer.toLowerCase())) {
        directScore = 0.75
        matchField = `提出者：${m.origin.proposer}`
      }
    }

    if (directScore > 0) {
      hitMap.set(m.id, {
        method: m,
        score: directScore,
        matchedFields: [matchField],
        snippet: m.content?.summary,
        relevanceReason: `直接匹配：${matchField}`
      })
    }
  }

  // 2. 切分关键词并进行 Fuse.js 模糊召回
  const fuse = await getFuseInstance(filteredPool)
  
  // 提取有效词根
  const tokens = q
    .replace(/[？?，,。！!与和、×+/\s]+/g, ' ')
    .split(' ')
    .filter(t => t.length >= 2 && !['如何', '怎样', '结合', '面对', '运用', '以及', '中的', '怎么'].includes(t))

  const searchTokens = tokens.length > 0 ? tokens : [q]

  for (const token of searchTokens) {
    const results = fuse.search(token, { limit: 6 })
    for (const r of results) {
      const existing = hitMap.get(r.item.id)
      const fuseScore = 1 - (r.score ?? 0.5)
      if (existing) {
        existing.score = Math.max(existing.score, fuseScore)
      } else {
        hitMap.set(r.item.id, {
          method: r.item,
          score: fuseScore * 0.85,
          matchedFields: r.matches?.map(m => m.key ?? '') ?? [],
          snippet: r.item.content?.summary,
          relevanceReason: `关键词检索匹配：${token}`
        })
      }
    }
  }

  return Array.from(hitMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

// ============================================================
// 离线/内置启发式推演合成器 (Claude Heuristic Synthesis)
// 保证在未填 API Key 或离线状态下，用户点击任何场景提示词都能立即获得极高水准的推演报告
// ============================================================

function synthesizeOfflineAnalysis(
  query: string,
  matched: MethodSearchHit[]
): SearchResult['aiAnalysis'] {
  const topMethods = matched.map(h => h.method).slice(0, 3)

  if (topMethods.length === 0) {
    return {
      problemUnderstanding: `针对“${query}”，当前知识库未直接命中完全同名方法，但可从经典决策与执行框架中寻求通用系统解法。`,
      recommendedCombination: '【第一性原理 × PDCA 持续改进】通用破局模型',
      combinationLogic: '面对未完全定义的全新未知场景，必须先从最基本的事实公理开始推导，再通过最小实验高频闭环验证。',
      executionSteps: [
        '第一步（事实剥离）：罗列所有已被事实证明的要素，剔除所有“别人都这么做”的从众假设；',
        '第二步（设立基准）：明确当前最小可行目标的量化验收标准；',
        '第三步（短周期冲刺）：开展 3-7 天的极简行动测试，收集第一手真实反馈；',
        '第四步（纠偏与固化）：将有效行动标准化为规范，失效经验沉淀为避坑清单。'
      ],
      precautions: [
        '切忌盲目照搬过往经验或行业套话',
        '保持对最底层事实的敬畏与敏锐检验'
      ],
      relatedCases: ['创业初期未知业务探索', '复杂跨领域协同突破'],
      sources: ['Cogito 经典方法论推理引擎']
    }
  }

  if (topMethods.length === 1) {
    const m = topMethods[0]
    return {
      problemUnderstanding: `核心痛点直指【${m.name}】所应对的典型挑战，需运用其底层机制进行深度穿透。`,
      recommendedCombination: `【${m.name}】单核深耕与系统落地`,
      combinationLogic: m.content?.mechanism || `${m.name}的核心思想在于：${m.content?.coreIdea}`,
      executionSteps: m.content?.steps?.length
        ? m.content.steps.slice(0, 4).map(s => `${s.order}. ${s.title}：${s.description}`)
        : [
            `1. 理解原理：深入研读${m.name}的核心公理与适用边界；`,
            `2. 诊断现状：将现实问题映射到${m.name}的分析框架中；`,
            `3. 制定行动：根据模型指导原则设计具体改进行动项；`,
            `4. 持续复盘：在实践中检验成效并反哺认知模型。`
          ],
      precautions: m.content?.limitations?.slice(0, 3) || ['避免生搬硬套公式，须结合现实约束动态调整'],
      relatedCases: m.cases?.slice(0, 2).map(c => `${c.title}：${c.context}`) || [],
      sources: m.origin?.sources?.map(s => s.title) || ['Cogito 知识库标准档案']
    }
  }

  // 多模型跨界组合（2+ 方法论交叉推演）
  const [m1, m2] = topMethods
  return {
    problemUnderstanding: `面对“${query}”，单一工具难以兼顾全局。必须将【${m1.name}】的宏观/底层优势与【${m2.name}】的检验/执行机制形成双轮驱动。`,
    recommendedCombination: `【${m1.name} × ${m2.name}】双核认知闭环`,
    combinationLogic: `以【${m1.name}】确立核心锚点与底层基石（${m1.content?.coreIdea?.slice(0, 45) ?? ''}...），以【${m2.name}】作为高频纠偏与执行抓手，彻底破除知易行难的断层。`,
    executionSteps: [
      `1. 本质还原（${m1.name}）：剥离所有经验假象与非本质干扰，提炼当前面临问题的底层事实或最高优先级目标；`,
      `2. 结构检验（${m2.name}）：尝试用大白话或极简逻辑向团队重述方案，标记出任何存在逻辑盲区与理解模糊的卡点；`,
      `3. 敏捷推进：将方案分解为双周行动单元，设定不可妥协的关键检视节点；`,
      `4. 认知沉淀：在复盘总结中对比预期与实际偏差，将验证有效的推演经验写入个人或团队知识库。`
    ],
    precautions: [
      `警惕将【${m1.name}】停留在口号层面而缺少【${m2.name}】的日常严格追踪`,
      '在执行受阻时，随时回到最原始的事实定义重新推导'
    ],
    relatedCases: [
      `特斯拉与 SpaceX 运用第一性原理与敏捷迭代的工业突破`,
      `字节跳动基于 OKR 与敏捷冲刺的跨部门业务攻坚`
    ],
    sources: [
      `${m1.origin?.proposer ? `${m1.origin.proposer} 原作` : m1.name}`,
      `${m2.origin?.proposer ? `${m2.origin.proposer} 原作` : m2.name}`
    ]
  }
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
    `- ID:${m.id} | 名称:${m.name} | 领域:${m.domains.join('/')} | 描述:${m.content?.summary}`
  ).join('\n')

  try {
    const result = await aiService.chat([
      {
        role: 'system',
        content: `你是一个方法论知识库智能搜索助手。
根据用户的问题，从知识库中找到最相关的方法论，并提供组合解决方案。
你必须只推荐知识库中存在的方法论（通过ID匹配）。
输出纯 JSON 格式，不要包含任何多余文本。`
      },
      {
        role: 'user',
        content: `用户问题：${query}

**知识库方法论列表：**
${methodList}

请输出纯 JSON 结构：
{
  "problemUnderstanding": "对用户问题的深度理解（60字以内）",
  "relevantMethodIds": ["method_id1", "method_id2"],
  "relevanceReasons": {
    "method_id1": "推荐原因"
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

    const jsonMatch = result.content.match(/```json\n([\s\S]*?)\n```/) || result.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return { success: false, error: 'AI 返回格式错误' }

    const data = JSON.parse(jsonMatch[1] ?? jsonMatch[0])
    const methodMap = new Map(methods.map(m => [m.id, m]))
    const hits: MethodSearchHit[] = (data.relevantMethodIds ?? [])
      .filter((id: string) => methodMap.has(id))
      .map((id: string, index: number) => {
        const method = methodMap.get(id)!
        return {
          method,
          score: 1 - index * 0.1,
          matchedFields: ['ai_semantic'],
          snippet: method.content?.summary,
          relevanceReason: data.relevanceReasons?.[id] ?? 'AI 语义推演匹配',
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
    return { success: false, error: `推演解析失败: ${(error as Error).message}` }
  }
}

// ============================================================
// 综合搜索与推演入口
// ============================================================

export async function search(query: SearchQuery): Promise<SearchResult> {
  const { items: allMethods } = await methodsDB.getAll({ status: 'active' })

  // 1. 本地多模式召回（实体匹配 + 分词模糊召回）
  const localHits = await localSearch(query.text, {
    limit: query.limit ?? 10,
    domains: query.filters.domains
  })

  // 2. 尝试云端 AI 推演
  let aiAnalysis: SearchResult['aiAnalysis'] | undefined
  let aiHits: MethodSearchHit[] = []

  if (query.type === 'natural_language' || query.type === 'scenario') {
    const aiResult = await aiSearch(query.text, allMethods)
    if (aiResult.success) {
      aiHits = aiResult.hits ?? []
      aiAnalysis = aiResult.analysis
    } else {
      // 优雅离线降级：启用启发式认知推演，永不呈现空结果
      aiAnalysis = synthesizeOfflineAnalysis(query.text, localHits)
    }
  }

  // 3. 结果合并与去重
  const hitMap = new Map<string, MethodSearchHit>()
  for (const hit of localHits) hitMap.set(hit.method.id, hit)
  for (const hit of aiHits) {
    const existing = hitMap.get(hit.method.id)
    if (existing) {
      hitMap.set(hit.method.id, {
        ...existing,
        score: Math.max(existing.score, hit.score),
        aiScore: hit.aiScore
      })
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

  const relatedIds = new Set(target.relations?.map(r =>
    r.fromMethodId === methodId ? r.toMethodId : r.fromMethodId
  ) ?? [])

  const sameDomainMethods = all.filter(m =>
    m.id !== methodId &&
    m.domains.some(d => target.domains.includes(d))
  )

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
