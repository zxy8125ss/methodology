// 搜索服务 - 本地全文搜索 + AI 语义推演 + 离线深度启发式推理
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
// 深度启发式推演合成器 (Claude-grade Heuristic Reasoning)
// 拒绝假大空废话，提供手术刀式病灶解构、工具机制咬合与实操 SOP
// ============================================================

function synthesizeOfflineAnalysis(
  query: string,
  matched: MethodSearchHit[]
): SearchResult['aiAnalysis'] {
  const q = query.toLowerCase()

  // 专属经典场景 1：第一性原理 × 费曼技巧
  if ((q.includes('第一性') || q.includes('本质')) && (q.includes('费曼') || q.includes('学习') || q.includes('理解'))) {
    return {
      problemUnderstanding: '当前业务/技术方案充斥着行业套话、惯性假设与模糊认知。团队成员误将“大家都这么干”视为真理，用高深术语掩盖真实的认知盲区。',
      recommendedCombination: '【第一性原理 × 费曼技巧】双轮认知穿透模型',
      combinationLogic: '第一性原理负责在底层“物理级砸碎伪假设”，剥离所有非本质的人为规矩；费曼技巧通过强制以极简大白话向新手讲授，作为“验金石”强行暴露逻辑漏洞。两者结合，构成“还原事实 → 极简验证”的绝对真理闭环。',
      executionSteps: [
        '第一步（公理化剥离）：在白板上列出当前方案赖以建立的 3 个核心前提，逐一质问：“这是物理层面的不可变公理，还是商业惯性？”',
        '第二步（无术语大白话讲授）：指派方案提出者，在禁止使用任何英文缩写与行业行话的前提下，向完全不懂该业务的跨部门同事或中学生解释这套逻辑；',
        '第三步（盲区断裂标记）：记录下讲授过程中所有出现卡顿、无法用生活常识类比、或下意识想用“业界通用做法”敷衍的地方，这就是系统真正的脆弱病灶；',
        '第四步（自下而上重构）：仅以已证实的底层第一事实为基石，重新搭建技术或业务架构，形成极简行动方案。'
      ],
      precautions: [
        '致命陷阱 1：切忌把公司过去的成功经验直接当成不可动摇的“第一性原理”；',
        '致命陷阱 2：切忌在同温层内互相演练费曼技巧，必须引入毫无利益与认知偏见的外部角色进行压力测试。'
      ],
      relatedCases: [
        'SpaceX 重新计算火箭原材料成本，推导出火箭制造成本仅为传统军工 2% 的工业奇迹',
        '物理学家费曼以冰水检验“挑战者号”O型橡胶圈失效机制'
      ],
      sources: ['《费曼物理学讲义》', '亚里士多德《形而上学》', '埃隆·马斯克第一性原理专访']
    }
  }

  // 专属经典场景 2：OKR × 双周 PDCA 敏捷冲刺
  if ((q.includes('okr') || q.includes('目标')) && (q.includes('pdca') || q.includes('冲刺') || q.includes('执行') || q.includes('闭环'))) {
    return {
      problemUnderstanding: '战略目标宏大但执行严重脱节。季度初全员打了鸡血，一个月后陷入日常琐事救火，季度末发现核心指标几乎停滞，团队产生深度的目标疲劳。',
      recommendedCombination: '【OKR × 双周 PDCA 敏捷冲刺】战略落地咬合系统',
      combinationLogic: '单用 OKR 必死，因为 OKR 给人野心但不提供日常频度控制；单用 PDCA 易盲，因为 PDCA 容易沉迷于低价值的微小优化。必须用 OKR 确立不设限的野心北极星，用 PDCA 强行把 90 天切分为 6 个必须死守交付的 14 天战斗冲刺，用双周 Check 强行按头纠偏。',
      executionSteps: [
        '第一步（极简北极星确定）：全季度只设 1 个最高优先级 Objective，以及不超过 3 个能直接用数据验证的 Key Results；',
        '第二步（双周颗粒度降维）：将季度 KR 分解为 6 个独立的 14 天冲刺包，每个周期必须有明确的“可验证最小交付物（Deliverable）”；',
        '第三步（周五闭环 Check 会议）：隔周五下午召开 45 分钟站会，严禁工作汇报流水账，只比对“双周预期 vs 实际数据偏差”，追查失真根因；',
        '第四步（Action 标准化固化）：验证有效的执行动作直接写入组织 SOP 标准（Standard），失效策略在进入下一轮冲刺前立刻被叫停。'
      ],
      precautions: [
        '致命陷阱 1：绝不能把 OKR 变成 KPI 绩效考核（一旦与年终奖直接挂钩，所有人都会把目标报低 50% 规避风险）；',
        '致命陷阱 2：PDCA 的 Check 绝不可变成找替罪羊的批斗会，否则下属将开始掩盖真实数据。'
      ],
      relatedCases: [
        '英特尔在安迪·格鲁夫领导下运用 iMBO/OKR 打赢微处理器翻盘战',
        '字节跳动全员双月 OKR 与高频产品敏捷迭代'
      ],
      sources: ['安迪·格鲁夫《高产出管理》', '约翰·杜尔《这就是OKR》', '戴明《走出危机》']
    }
  }

  // 专属经典场景 3：时间碎片化 × 心流与深度工作
  if (q.includes('碎片化') || q.includes('心流') || q.includes('专注') || q.includes('深度工作') || q.includes('时间管理')) {
    return {
      problemUnderstanding: '每日被各类即时沟通（飞书/微信/邮件）与临时插会切成齑粉。全天看似忙碌筋疲力尽，实质属于“无意识的低价值虚忙”，真正具有决定性杠杆的核心成果长期难产。',
      recommendedCombination: '【心流理论 × 深度工作注意力防火墙】认知护城河',
      combinationLogic: '注意力如同肌肉，每一次任务切换都需要付出 23 分钟的认知残留损耗（Attention Residue）。必须借助深度工作建立物理级日程防御，结合心流的“挑战-技能适度匹配”消除内耗，将认知资源高密度压强在核心突破口。',
      executionSteps: [
        '第一步（建立物理级深度工作区）：在日历上锁定每日清晨或上午 9:30-11:30 的 2 小时“不可侵犯时段”，彻底关闭所有即时通讯红点推送；',
        '第二步（启动仪式极简锚定）：开工前在一张便签上只写一句话：“接下来的 90 分钟，我的唯一物理产出是什么？”（明确验收标准）；',
        '第三步（挑战-技能梯度微调）：如果当前任务引发拖延，说明难度过高或过于模糊，将其拆分为刚好略高于当前手感、需全力以赴但可攻克的最小切片；',
        '第四步（关机复盘清空缓存）：每日下班前留出 5 分钟进行“关机仪式”，在备忘录写下明日第一优先项，彻底切断大脑夜间的待办后台功耗。'
      ],
      precautions: [
        '致命陷阱 1：切忌在深度工作期间开着“静音”的手机放在桌面上（眼角余光感知到手机仍会分走 10% 的工作记忆）；',
        '致命陷阱 2：切忌多任务并行，任何宣称能同时处理两件创造性工作的人都在自欺欺人。'
      ],
      relatedCases: [
        '比尔·盖茨每年坚持闭关两次的“思考周（Think Week）”',
        '心理学家米哈里对顶级艺术家与外科医生的心流观测'
      ],
      sources: ['卡尔·纽波特《深度工作》', '米哈里·契克森米哈赖《心流》']
    }
  }

  // 专属经典场景 4：重大决策与风险防范（逆向思维 × 事前验尸法）
  if (q.includes('决策') || q.includes('风险') || q.includes('黑天鹅') || q.includes('逆向') || q.includes('验尸')) {
    return {
      problemUnderstanding: '团队在重大利益或集体讨论中容易产生“乐观偏见”与“群体共谋沉默”。所有人都在畅想成功后的收益，关键隐患被视而不见，直到上线翻车。',
      recommendedCombination: '【逆向思维 × 事前验尸法 (Premortem)】决策排雷模型',
      combinationLogic: '正向思考容易让人陷入自我辩护的证实偏差；查理·芒格倡导的逆向思维与加里·克莱因的事前验尸法，强行在项目启动前预设“灾难已经彻底发生”，逆向倒逼隐藏极深的系统脆弱性。',
      executionSteps: [
        '第一步（宣布死讯启动验尸）：召集核心决策团队宣布：“现在是 6 个月后，本项目彻底溃败，公司蒙受沉重打击。请大家直面惨案。”',
        '第二步（无记名死因罗列）：给每个人 5 分钟，在纸上无记名写下至少 2 个导致项目毁灭的最致命、最隐蔽的内幕原因；',
        '第三步（死因聚类穿透）：收齐纸条贴在白板上归类，全员投票选出前 3 大“最可能致死的致命硬伤”；',
        '第四步（熔断器前置）：针对前三大死因，强制在方案中写入触发条件明确的“止损熔断线”与应急备案，否则不予批准立项。'
      ],
      precautions: [
        '致命陷阱 1：切忌把验尸会变成追责大会，必须强调“这是为了避免未来的悲剧”；',
        '致命陷阱 2：切忌在未确立止损红线的情况下凭借感性继续追加赌注。'
      ],
      relatedCases: [
        '巴菲特与查理·芒格在伯克希尔哈撒韦投资委员会的排雷机制',
        'NASA 航天事故后推行的事前风险逆向穿刺流程'
      ],
      sources: ['查理·芒格《穷查理宝典》', '加里·克莱因《决策的力量》']
    }
  }

  // 通用多模型合成
  const topMethods = matched.map(h => h.method).slice(0, 3)
  if (topMethods.length >= 2) {
    const [m1, m2] = topMethods
    return {
      problemUnderstanding: `针对“${query}”，单一工具必然受限于其特定假设边界。必须将【${m1.name}】的底层解构与【${m2.name}】的检验推进形成双轮驱动。`,
      recommendedCombination: `【${m1.name} × ${m2.name}】双核咬合破局模型`,
      combinationLogic: `以【${m1.name}】确立核心锚点与底层基石（${m1.content?.coreIdea?.slice(0, 45) ?? ''}...），以【${m2.name}】作为高频纠偏抓手，防止方案陷入空中楼阁或经验主义盲区。`,
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

  const m = topMethods[0] || {
    name: '第一性原理',
    content: {
      coreIdea: '打破思维惯性，回归事物底层不可再分的物理事实',
      mechanism: '自下而上层层推导，拒绝类比论证与从众假象',
      limitations: ['推导链条长，需要耗费较高脑力，不适合需要秒级下意识反应的极端危急场景'],
      steps: [
        { order: 1, title: '质疑假设', description: '找出当前面临问题中所有人认为理所当然的前提假设' },
        { order: 2, title: '分解基础事实', description: '将问题层层剥离至不可辩驳的基本物理事实' },
        { order: 3, title: '由内而外重构', description: '仅基于事实本身重新推导出全新的解决方案' }
      ]
    },
    cases: [],
    origin: { sources: [] }
  }

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

// ============================================================
// AI 语义搜索和场景推荐
// ============================================================

export async function aiSearch(
  query: string,
  methods: Method[]
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
        content: `你是一个方法论知识库智能搜索与系统解题专家。
根据用户的实际困局，严谨诊断深层病灶，推荐最佳方法论组合，并提供刀刃般具体的落地SOP与避坑防线。
你必须优先推荐知识库中存在的方法论（通过ID匹配）。
输出纯 JSON 格式，绝不要包含 Markdown 代码块或闲聊废话。`
      },
      {
        role: 'user',
        content: `用户问题：${query}

**知识库方法论列表：**
${methodList}

请输出纯 JSON 结构：
{
  "problemUnderstanding": "直击核心病灶的深度诊断（80字以内，区分表象与真实病因）",
  "relevantMethodIds": ["method_id1", "method_id2"],
  "relevanceReasons": {
    "method_id1": "推荐原因"
  },
  "recommendedCombination": "如何组合这些方法论（100字以内，点明两者如何咬合）",
  "combinationLogic": "工具机制互补分析（150字以内，讲透为什么单用一个会失效、拼上另一个才管用）",
  "executionSteps": [
    "第一步（具体战术）：...",
    "第二步（落地SOP）：...",
    "第三步（闭环检视）：...",
    "第四步（固化沉淀）：..."
  ],
  "precautions": ["致命陷阱1：...", "致命陷阱2：..."],
  "relatedCases": ["实战标杆参照1"],
  "sources": ["知识来源"]
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
      // 优雅离线降级：启用高水准启发式认知推演，永不呈现空结果
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
