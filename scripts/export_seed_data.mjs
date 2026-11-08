import fs from 'node:fs'
import path from 'node:path'

const METHODS_DIR = path.resolve('data/methods')
const INDEX_DIR = path.resolve('indexes')
if (!fs.existsSync(METHODS_DIR)) fs.mkdirSync(METHODS_DIR, { recursive: true })
if (!fs.existsSync(INDEX_DIR)) fs.mkdirSync(INDEX_DIR, { recursive: true })

// 导出方法论
const methods = [
  {
    id: 'method_pdca',
    name: 'PDCA循环',
    aliases: ['戴明环', '质量环', 'Plan-Do-Check-Act'],
    domains: ['management', 'work_efficiency'],
    subDomains: ['process', 'perf_mgmt'],
    type: 'process',
    layer: 1,
    origin: {
      proposer: '威廉·爱德华兹·戴明 (W. Edwards Deming)',
      proposerBio: '美国统计学家、质量管理大师',
      year: 1950,
      sources: [{ id: 'src_pdca_1', title: 'Out of the Crisis', type: 'book', credibility: 'high' }]
    },
    content: {
      summary: '通过计划、执行、检查、行动四个阶段持续改进工作质量与流程的管理工具',
      coreIdea: '任何事物的发展与持续优化都不是一次性的，而是螺旋上升的闭环迭代过程。',
      principles: ['大环套小环，互相促进', '阶梯式上升', '基于数据决策'],
      mechanism: '周期性对照目标检视偏差，将成功经验标准化，沉淀组织认知。',
      scenarios: ['流程优化', '项目迭代', '个人效率提升'],
      conditions: ['可量化的预期目标', '真实的过程数据追踪'],
      steps: [
        { order: 1, title: 'Plan (计划)', description: '分析现状找出问题，制定目标与改善计划' },
        { order: 2, title: 'Do (执行)', description: '按照计划方案具体实施行动并采集过程数据' },
        { order: 3, title: 'Check (检查)', description: '对照预期目标检查实际执行效果并寻找原因' },
        { order: 4, title: 'Act (处理)', description: '将成功经验固化为标准，遗留问题纳入下一轮循环' }
      ],
      advantages: ['逻辑严谨，易于落地', '推动组织螺旋式成长'],
      limitations: ['极端不确定性探索中节奏略慢'],
      misconceptions: ['误以为是一次性的线性流程'],
      fullArticle: '# PDCA 循环深度报告\n\n戴明环是持续质量改善与敏捷运作的底层通用基石。'
    },
    evidence: { level: 'high', confidence: 96, notes: '全球五百强长期检验' },
    cases: [],
    relations: [],
    tags: ['管理', '质量管理', '持续改进', '通用模型'],
    status: 'active',
    stats: { viewCount: 128, practiceCount: 14, learningCount: 32, avgRating: 4.9 },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'method_first_principles',
    name: '第一性原理',
    aliases: ['First Principles Thinking', '第一原理思考'],
    domains: ['thinking', 'business'],
    subDomains: ['critical', 'decision'],
    type: 'principle',
    layer: 1,
    origin: {
      proposer: '亚里士多德 (Aristotle)',
      year: -330,
      sources: [{ id: 'src_fp_1', title: '形而上学 (Metaphysics)', type: 'book', credibility: 'high' }]
    },
    content: {
      summary: '回归事物最底层本质，从最基本的事实出发进行逻辑推导，而非基于类比与既有经验的思维方法',
      coreIdea: '打破思维定式，将问题分解为不可再分的基本真理，重新推演最优解。',
      principles: ['质疑一切既有假设', '拆解至物理底层事实', '从零逻辑重构方案'],
      mechanism: '剥离行业惯性溢价与沉没冗余，直接逼近价值/成本极限。',
      scenarios: ['重大颠覆式创新', '极限降本设计', '复杂系统突破'],
      conditions: ['掌握底层学科规律', '充足心智算力'],
      steps: [
        { order: 1, title: '识别并写下当前的核心假设', description: '审视人们习以为常的行规' },
        { order: 2, title: '下潜拆解至基本物理事实', description: '分解为不可再分的基本真理' },
        { order: 3, title: '从底层重新设计解决方案', description: '寻找全新的技术与工艺组合路径' }
      ],
      advantages: ['催生颠覆性创新', '发现被严重高估的成本结构'],
      limitations: ['日常琐碎决策计算成本过高'],
      misconceptions: ['误以为是全盘否定既往常识'],
      fullArticle: '# 第一性原理思维报告\n\n亚里士多德与马斯克的底层创新推演心法。'
    },
    evidence: { level: 'high', confidence: 95, notes: '物理学与高科技产业实践强力支撑' },
    cases: [],
    relations: [],
    tags: ['思维模型', '创新', '底层逻辑'],
    status: 'active',
    stats: { viewCount: 245, practiceCount: 22, learningCount: 48, avgRating: 5.0 },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'method_okr',
    name: 'OKR目标与关键结果',
    aliases: ['Objectives and Key Results', '目标与关键结果法'],
    domains: ['management', 'personal_growth'],
    subDomains: ['goal_mgmt'],
    type: 'framework',
    layer: 2,
    origin: {
      proposer: '安迪·格鲁夫 (Andy Grove) / 约翰·杜尔 (John Doerr)',
      year: 1975,
      sources: [{ id: 'src_okr_1', title: 'Measure What Matters', type: 'book', credibility: 'high' }]
    },
    content: {
      summary: '通过设定野心目标(O)与可量化关键结果(KR)，驱动组织协同与个人聚焦的敏捷目标管理系统',
      coreIdea: 'OKR 是激发自主协同的敏捷罗盘，而不是事后惩罚的绩效考核棍棒。',
      principles: ['目标定性富有鼓舞性，KR必须量化', '全员透明公开', '与薪酬考核解耦'],
      mechanism: '极限精简约束注意力，公开透明带来同侪激励。',
      scenarios: ['创新转型企业', '跨团队复杂协同', '个人重大目标攻坚'],
      conditions: ['鼓励创新的安全文化', '管理层透明公开'],
      steps: [
        { order: 1, title: '设定鼓舞人心的目标 (O)', description: '明确周期最想达成的突破' },
        { order: 2, title: '制定量化关键结果 (KR)', description: '设定 2-4 个数值化衡量标准' },
        { order: 3, title: '横向纵向协同对齐', description: '消除依赖阻塞' },
        { order: 4, title: '定期复盘与评分', description: '周同步进度，季度末反思打分' }
      ],
      advantages: ['战略高度聚焦', '打破跨部门壁垒'],
      limitations: ['需包容适度失败的组织文化土壤'],
      misconceptions: ['直接把 OKR 等同于奖金绩效考核'],
      fullArticle: '# OKR 目标管理全景指南\n\n驱动 Google 等顶尖科技巨头高速成长的协同框架。'
    },
    evidence: { level: 'high', confidence: 95, notes: '硅谷与全球科技行业主流标配' },
    cases: [],
    relations: [],
    tags: ['管理', '目标管理', 'OKR', '团队协同'],
    status: 'active',
    stats: { viewCount: 189, practiceCount: 19, learningCount: 42, avgRating: 4.8 },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'method_feynman',
    name: '费曼学习法',
    aliases: ['Feynman Technique', '以教促学'],
    domains: ['learning', 'thinking'],
    subDomains: ['active_learning'],
    type: 'process',
    layer: 2,
    origin: {
      proposer: '理查德·费曼 (Richard Feynman)',
      year: 1965,
      sources: [{ id: 'src_feynman_1', title: 'Surely You\'re Joking, Mr. Feynman!', type: 'book', credibility: 'high' }]
    },
    content: {
      summary: '通过用通俗易懂的极简语言向初学者讲授概念，精准定位理解漏洞并针对性补强的学习方法',
      coreIdea: '教是最好的学。真正的掌握源于直觉化还原与类比构建，而非生搬硬套专业术语。',
      principles: ['禁用一切晦涩行业黑话', '卡壳处即是认知盲区', '运用生活化类比'],
      mechanism: '强迫大脑从被动输入切换为高阶输出，激活概念解构回路。',
      scenarios: ['学习抽象复杂理论', '技术内训赋能', '个人知识梳理'],
      conditions: ['坦诚面对知识漏洞的心态'],
      steps: [
        { order: 1, title: '选择目标概念', description: '聚焦单一清晰的知识点' },
        { order: 2, title: '假装向外行/儿童传授', description: '用极简日常语言写出解释' },
        { order: 3, title: '定位卡点并回归原始资料', description: '精准补齐认知断层' },
        { order: 4, title: '简化语言并建立生动类比', description: '串联为生活化案例' }
      ],
      advantages: ['彻底击穿知识伪装', '形成的直觉理解长期稳固'],
      limitations: ['脑力消耗较大'],
      misconceptions: ['能背出定义就等于真正懂了'],
      fullArticle: '# 费曼学习法深度解析\n\n认知科学推崇的高阶学习心法。'
    },
    evidence: { level: 'high', confidence: 98, notes: '认知心理学实验验证有效' },
    cases: [],
    relations: [],
    tags: ['学习方法', '知识管理', '输入输出'],
    status: 'active',
    stats: { viewCount: 310, practiceCount: 29, learningCount: 56, avgRating: 5.0 },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'method_eisenhower',
    name: '艾森豪威尔矩阵',
    aliases: ['时间管理四象限', 'Eisenhower Matrix'],
    domains: ['work_efficiency', 'personal_growth'],
    subDomains: ['time_mgmt', 'prioritization'],
    type: 'tool',
    layer: 1,
    origin: {
      proposer: '德怀特·艾森豪威尔 (Dwight D. Eisenhower)',
      year: 1954,
      sources: [{ id: 'src_eis_1', title: 'The 7 Habits of Highly Effective People', type: 'book', credibility: 'high' }]
    },
    content: {
      summary: '依据“重要性”与“紧急性”两个维度将任务划分为四个象限，引导注意力投向长期价值创造的决策工具',
      coreIdea: '紧急的事情很少是重要的，重要的事情很少是极度紧急的。必须摆脱虚假紧急性的绑架。',
      principles: ['Q1重要且紧急马上做', 'Q2重要不紧急专注做', 'Q3紧急不重要授权做', 'Q4不紧急不重要坚决不做'],
      mechanism: '打碎大脑基于时间临近度的应激反应，建立理性长期价值筛选器。',
      scenarios: ['日程梳理', '管理者精力聚焦', '个人长期护城河建设'],
      conditions: ['对核心价值有清晰定义'],
      steps: [
        { order: 1, title: '列出所有待办清单', description: '清空大脑中的所有未竟事项' },
        { order: 2, title: '按重要与紧急分配象限', description: '审视一年后的长期真实价值' },
        { order: 3, title: '执行四象限策略', description: '重点捍卫第二象限深度工作时间' }
      ],
      advantages: ['直观易行', '极大降低无谓忙碌消耗'],
      limitations: ['需结合价值观判断重要性'],
      misconceptions: ['整日扑在第一象限救火以为很充实'],
      fullArticle: '# 艾森豪威尔四象限时间管理法\n\n从疲于奔命的救火员转变为长远布局的规划师。'
    },
    evidence: { level: 'high', confidence: 96, notes: '半个世纪全球数千万人践行' },
    cases: [],
    relations: [],
    tags: ['工作效率', '时间管理', '优先级'],
    status: 'active',
    stats: { viewCount: 220, practiceCount: 26, learningCount: 38, avgRating: 4.9 },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

for (const m of methods) {
  fs.writeFileSync(path.join(METHODS_DIR, `${m.id}.json`), JSON.stringify(m, null, 2), 'utf-8')
}

// 导出索引
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
fs.writeFileSync(path.join(INDEX_DIR, 'methods-index.json'), JSON.stringify(index, null, 2), 'utf-8')

console.log(`✅ 成功初始化并导出 ${methods.length} 个方法论 JSON 文件与全局索引！`)
