// AI 研究服务 - 负责驱动 AI 进行方法论研究、整理和分析

import type { Method, ResearchTask, ReviewItem, DiscoveredMethod } from '../types'
import { localAI, workerApi } from './api'
import { methodsDB } from './db'
import { v4 as uuidv4 } from 'uuid'

// ============================================================
// AI 提示词
// ============================================================

const SYSTEM_PROMPT_RESEARCHER = `你是一个专业的方法论研究员。你的职责是：
1. 深度研究方法论的理论来源、原理和实践证据
2. 将研究结果整理为标准化知识档案
3. 严格区分：原始理论、研究证据、实践经验、AI推断
4. 不虚构任何信息（提出者、来源、数据、案例）
5. 无法核实的信息必须明确标注

输出格式必须是合法的 JSON。`

const SYSTEM_PROMPT_ANALYZER = `你是一个知识体系分析专家。你的职责是：
1. 分析方法论之间的关联关系
2. 识别知识重复和冗余
3. 建立体系化的知识结构
4. 以中文为主，准确、简洁地表达

输出格式必须是合法的 JSON。`

// ============================================================
// 研究方法论
// ============================================================

export async function researchMethod(
  topic: string,
  existingMethods: Method[],
  options: {
    deepth?: 'basic' | 'standard' | 'deep'
    model?: string
    signal?: AbortSignal
  } = {}
): Promise<{ success: boolean; draft?: Partial<Method>; error?: string }> {
  const { deepth = 'standard', model, signal } = options

  const existingNames = existingMethods.map(m => m.name).join('、')

  const prompt = `请研究以下方法论并生成标准化档案：

**研究主题：** ${topic}

**现有知识库已有：** ${existingNames || '（暂无）'}

请按照以下 JSON 格式输出（所有字段必填，不确定的填 null 或空数组）：

\`\`\`json
{
  "name": "方法论标准中文名称",
  "aliases": ["其他名称1", "其他名称2"],
  "domains": ["management|personal_growth|thinking|work_efficiency|communication|learning|business|life 中选1-3个"],
  "type": "theory|model|tool|process|principle|framework|other 其中一个",
  "layer": 1,
  "origin": {
    "proposer": "提出者姓名（确定才写，否则null）",
    "proposerBio": "提出者简介",
    "year": null,
    "sources": [
      {
        "id": "src1",
        "title": "来源标题",
        "author": "作者",
        "type": "book|paper|article|speech|course|website|other",
        "credibility": "high|medium|low",
        "notes": "备注",
        "supportedClaims": []
      }
    ]
  },
  "content": {
    "summary": "一句话概述（30字以内）",
    "coreIdea": "核心思想（200字以内）",
    "principles": ["理论基础1", "理论基础2"],
    "mechanism": "为什么有效（100字以内）",
    "scenarios": ["适用场景1", "适用场景2", "适用场景3"],
    "conditions": ["适用前提1", "适用前提2"],
    "steps": [
      {"order": 1, "title": "步骤名称", "description": "详细说明", "tips": [], "warnings": []}
    ],
    "advantages": ["优点1", "优点2"],
    "limitations": ["局限1", "局限2"],
    "misconceptions": ["误区1", "误区2"],
    "fullArticle": "完整研究文章（Markdown格式，500-2000字）"
  },
  "evidence": {
    "level": "high|medium|low|unverified|disputed",
    "claims": [
      {
        "id": "c1",
        "type": "original|research|practice|ai_inference",
        "content": "声明内容",
        "reliability": "high|medium|low"
      }
    ],
    "confidence": 75,
    "notes": "证据说明"
  },
  "tags": ["标签1", "标签2"],
  "aiMeta": {
    "contentWarnings": ["注意事项（如：缺乏原始来源）"]
  }
}
\`\`\`

注意：
- fullArticle 必须是 Markdown 格式，包含：背景、核心思想、实施步骤、实际案例、优缺点、相关方法
- 严禁虚构任何来源、数据、案例
- 所有 AI 推断必须在 claims 中标注为 ai_inference
- 研究深度：${deepth}`

  const aiService = workerApi.isConfigured() ? workerApi : localAI
  if (!aiService.isConfigured()) {
    return { success: false, error: 'AI 服务未配置，请先设置 API Key' }
  }

  const result = await aiService.chat(
    [
      { role: 'system', content: SYSTEM_PROMPT_RESEARCHER },
      { role: 'user', content: prompt }
    ],
    model
  )

  if (!result.success || !result.content) {
    return { success: false, error: result.error ?? 'AI 请求失败' }
  }

  // 解析 JSON
  try {
    const jsonMatch = result.content.match(/```json\n([\s\S]*?)\n```/) ||
                     result.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { success: false, error: 'AI 返回格式错误' }
    }
    const jsonStr = jsonMatch[1] ?? jsonMatch[0]
    const draft = JSON.parse(jsonStr) as Partial<Method>
    
    // 添加元数据
    draft.id = `method_${uuidv4().replace(/-/g, '').slice(0, 12)}`
    draft.status = 'pending_review'
    draft.version = 1
    draft.versionHistory = []
    draft.createdAt = new Date().toISOString()
    draft.updatedAt = new Date().toISOString()
    draft.cases = []
    draft.relations = []
    draft.stats = { viewCount: 0, practiceCount: 0, learningCount: 0, avgRating: 0 }
    if (draft.aiMeta) {
      draft.aiMeta.researchedBy = model ?? 'unknown'
      draft.aiMeta.researchedAt = new Date().toISOString()
      draft.aiMeta.qualityScore = calculateQualityScore(draft)
    }

    return { success: true, draft }
  } catch (error) {
    return { success: false, error: `JSON 解析失败: ${(error as Error).message}` }
  }
}

// ============================================================
// 重复检测
// ============================================================

export async function detectDuplicates(
  draft: Partial<Method>,
  signal?: AbortSignal
): Promise<{
  isDuplicate: boolean
  similar: Array<{ methodId: string; name: string; similarity: number; reason: string }>
  recommendation: 'create_new' | 'merge_with' | 'supplement' | 'skip'
  recommendedMergeTarget?: string
}> {
  const { items: existing } = await methodsDB.getAll()

  if (existing.length === 0) {
    return { isDuplicate: false, similar: [], recommendation: 'create_new' }
  }

  // 本地快速检测（名称和别名匹配）
  const draftNameLower = (draft.name ?? '').toLowerCase()
  const draftAliases = (draft.aliases ?? []).map(a => a.toLowerCase())

  const exactMatch = existing.find(m => {
    const nameLower = m.name.toLowerCase()
    const aliasesLower = m.aliases.map(a => a.toLowerCase())
    return nameLower === draftNameLower || 
           draftAliases.includes(nameLower) ||
           aliasesLower.includes(draftNameLower) ||
           aliasesLower.some(a => draftAliases.includes(a))
  })

  if (exactMatch) {
    return {
      isDuplicate: true,
      similar: [{ methodId: exactMatch.id, name: exactMatch.name, similarity: 100, reason: '名称完全匹配' }],
      recommendation: 'supplement',
      recommendedMergeTarget: exactMatch.id
    }
  }

  // AI 语义去重（仅当有 AI 服务时）
  const aiService = workerApi.isConfigured() ? workerApi : localAI
  if (!aiService.isConfigured() || existing.length === 0) {
    return { isDuplicate: false, similar: [], recommendation: 'create_new' }
  }

  const existingSummary = existing.slice(0, 30).map(m => `- ${m.name}（${m.id}）: ${m.content.summary}`).join('\n')

  const result = await aiService.chat([
    { role: 'system', content: SYSTEM_PROMPT_ANALYZER },
    {
      role: 'user',
      content: `请判断新方法论是否与现有方法论重复或高度相似：

**新方法论：** ${draft.name}
**描述：** ${draft.content?.summary}

**现有方法论列表（部分）：**
${existingSummary}

请输出 JSON：
{
  "similar": [
    {
      "methodId": "方法论ID",
      "name": "方法论名称",
      "similarity": 85,
      "reason": "相似原因"
    }
  ],
  "recommendation": "create_new|merge_with|supplement|skip",
  "recommendedMergeTarget": "若建议合并，填写目标ID，否则null",
  "analysis": "判断说明"
}`
    }
  ])

  if (result.success && result.content) {
    try {
      const jsonMatch = result.content.match(/```json\n([\s\S]*?)\n```/) || result.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[1] ?? jsonMatch[0]) as {
          similar: Array<{ methodId: string; name: string; similarity: number; reason: string }>
          recommendation: 'create_new' | 'merge_with' | 'supplement' | 'skip'
          recommendedMergeTarget?: string
        }
        const hasHighSimilar = data.similar.some(s => s.similarity >= 80)
        return {
          isDuplicate: hasHighSimilar,
          similar: data.similar ?? [],
          recommendation: data.recommendation ?? 'create_new',
          recommendedMergeTarget: data.recommendedMergeTarget
        }
      }
    } catch {
      // 解析失败，返回默认值
    }
  }

  return { isDuplicate: false, similar: [], recommendation: 'create_new' }
}

// ============================================================
// 识别知识关联
// ============================================================

export async function identifyRelations(
  draft: Partial<Method>,
  existingMethods: Method[]
): Promise<Method['relations']> {
  if (existingMethods.length === 0) return []
  
  const aiService = workerApi.isConfigured() ? workerApi : localAI
  if (!aiService.isConfigured()) return []

  const existingList = existingMethods.slice(0, 20).map(m => `- ${m.name}（${m.id}）: ${m.content.summary}`).join('\n')

  const result = await aiService.chat([
    { role: 'system', content: SYSTEM_PROMPT_ANALYZER },
    {
      role: 'user',
      content: `请分析新方法论与现有方法论的关系：

**新方法论：** ${draft.name}
**核心思想：** ${draft.content?.coreIdea}

**现有方法论（部分）：**
${existingList}

关系类型：
- parent_child: 上下位关系（某方法是另一方法的子类/实例）
- complementary: 互补关系（配合使用效果更好）
- similar: 相似关系（解决相似问题的不同方法）
- conflicting: 冲突关系（观点或实施相互矛盾）
- combined_use: 组合使用（实践中常一起使用）
- evolved_from: 演化关系（某方法基于另一方法发展而来）
- applied_to: 应用关系（某方法在某领域的应用）

请输出 JSON 数组（最多5个最重要的关系）：
[
  {
    "toMethodId": "目标方法论ID",
    "type": "关系类型",
    "description": "关系说明（50字以内）",
    "strength": "strong|medium|weak"
  }
]`
    }
  ])

  if (result.success && result.content) {
    try {
      const jsonMatch = result.content.match(/```json\n([\s\S]*?)\n```/) || result.content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const relations = JSON.parse(jsonMatch[1] ?? jsonMatch[0]) as Array<{
          toMethodId: string
          type: Method['relations'][0]['type']
          description: string
          strength: 'strong' | 'medium' | 'weak'
        }>
        return relations.map(r => ({
          id: uuidv4(),
          fromMethodId: draft.id ?? '',
          toMethodId: r.toMethodId,
          type: r.type,
          description: r.description,
          strength: r.strength,
          createdAt: new Date().toISOString(),
          aiGenerated: true
        }))
      }
    } catch {
      return []
    }
  }
  return []
}

// ============================================================
// 生成 AI 审核摘要
// ============================================================

export async function generateReviewSummary(draft: Partial<Method>): Promise<string> {
  const warnings = draft.aiMeta?.contentWarnings ?? []
  const qualityScore = draft.aiMeta?.qualityScore ?? 0
  
  let summary = `## 审核摘要\n\n`
  summary += `**方法论：** ${draft.name}\n`
  summary += `**质量评分：** ${qualityScore}/100\n`
  summary += `**证据等级：** ${draft.evidence?.level}\n`
  summary += `**涉及领域：** ${draft.domains?.join('、')}\n\n`
  
  if (warnings.length > 0) {
    summary += `**⚠️ 注意事项：**\n${warnings.map(w => `- ${w}`).join('\n')}\n\n`
  }
  
  summary += `**新增价值：** 该方法论${draft.content?.summary}\n\n`
  summary += `**建议：** ${qualityScore >= 70 ? '质量较好，建议批准入库' : qualityScore >= 50 ? '质量一般，建议修改后入库' : '质量较低，建议退回重新研究'}`
  
  return summary
}

// ============================================================
// 完整研究流程
// ============================================================

export async function runResearchTask(
  task: ResearchTask,
  onProgress?: (progress: number, message: string) => void
): Promise<{ success: boolean; reviewItems?: ReviewItem[]; error?: string }> {
  const reviewItems: ReviewItem[] = []
  
  try {
    onProgress?.(10, '读取现有知识库...')
    const { items: existing } = await methodsDB.getAll()
    
    const topics = task.targetTopics.length > 0 
      ? task.targetTopics 
      : ['PDCA循环', '第一性原理', 'OKR', '费曼学习法', 'SWOT分析']
    
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i]
      const progress = 10 + Math.floor((i / topics.length) * 70)
      
      onProgress?.(progress, `研究中：${topic}...`)
      
      // 1. 研究方法论
      const researchResult = await researchMethod(topic, existing, {
        deepth: task.config.depthLevel,
        model: task.config.model
      })
      
      if (!researchResult.success || !researchResult.draft) continue
      
      // 2. 重复检测
      onProgress?.(progress + 5, `去重检测：${topic}...`)
      const dupResult = await detectDuplicates(researchResult.draft)
      
      if (dupResult.recommendation === 'skip') continue
      
      // 3. 识别关联
      const relations = await identifyRelations(researchResult.draft, existing)
      if (researchResult.draft) researchResult.draft.relations = relations
      
      // 4. 生成审核摘要
      const aiSummary = await generateReviewSummary(researchResult.draft)
      
      // 5. 创建审核条目
      const discoveredMethod: DiscoveredMethod = {
        tempId: researchResult.draft.id ?? uuidv4(),
        draftMethod: researchResult.draft,
        similarExisting: dupResult.similar,
        recommendation: dupResult.recommendation,
        recommendedMergeTarget: dupResult.recommendedMergeTarget,
        qualityScore: researchResult.draft.aiMeta?.qualityScore ?? 0,
        reviewSummary: aiSummary
      }

      reviewItems.push({
        id: uuidv4(),
        type: 'new_method',
        taskId: task.id,
        discoveredMethod,
        aiSummary,
        aiRecommendation: `建议操作：${
          dupResult.recommendation === 'create_new' ? '创建新档案' :
          dupResult.recommendation === 'merge_with' ? '合并到现有档案' :
          dupResult.recommendation === 'supplement' ? '补充现有档案' : '跳过'
        }`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        priority: 'medium'
      })
    }
    
    onProgress?.(90, '整理研究结果...')
    onProgress?.(100, '研究完成')
    
    return { success: true, reviewItems }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

// ============================================================
// AI 实践复盘
// ============================================================

export async function generatePracticeReview(
  practiceTitle: string,
  problem: string,
  methodNames: string[],
  executionSummary: string,
  result: string
): Promise<{ success: boolean; review?: string; error?: string }> {
  const aiService = workerApi.isConfigured() ? workerApi : localAI
  if (!aiService.isConfigured()) {
    return { success: false, error: 'AI 服务未配置' }
  }

  const response = await aiService.chat([
    {
      role: 'system',
      content: '你是一个方法论实践复盘专家，帮助用户分析实践效果，提供改进建议。输出 Markdown 格式。'
    },
    {
      role: 'user',
      content: `请对以下实践项目进行复盘分析：

**项目：** ${practiceTitle}
**要解决的问题：** ${problem}
**使用的方法论：** ${methodNames.join('、')}
**执行摘要：** ${executionSummary}
**实际结果：** ${result}

请按以下结构输出复盘报告（Markdown格式）：

## 一、方法论选择评估
（评估所选方法论是否适合解决该问题）

## 二、执行过程分析
（分析执行质量，哪些步骤发挥了作用）

## 三、效果归因
（分析影响结果的主要因素，是否存在其他解释）

## 四、改进建议
（下次如何改进）

## 五、知识库更新建议
（此次实践是否发现了方法论的新适用场景或局限性）`
    }
  ])

  return { success: response.success, review: response.content, error: response.error }
}

// ============================================================
// 质量评分
// ============================================================

function calculateQualityScore(draft: Partial<Method>): number {
  let score = 0
  
  if (draft.name) score += 10
  if (draft.origin?.proposer) score += 10
  if (draft.origin?.sources && draft.origin.sources.length > 0) score += 15
  if (draft.content?.coreIdea && draft.content.coreIdea.length > 50) score += 10
  if (draft.content?.steps && draft.content.steps.length >= 2) score += 10
  if (draft.content?.scenarios && draft.content.scenarios.length >= 2) score += 10
  if (draft.content?.limitations && draft.content.limitations.length >= 1) score += 5
  if (draft.content?.misconceptions && draft.content.misconceptions.length >= 1) score += 5
  if (draft.evidence?.level === 'high') score += 15
  else if (draft.evidence?.level === 'medium') score += 10
  else if (draft.evidence?.level === 'low') score += 5
  if (draft.content?.fullArticle && draft.content.fullArticle.length > 300) score += 10
  
  return Math.min(100, score)
}
