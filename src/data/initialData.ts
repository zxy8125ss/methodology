// 初始领域数据
import type { Domain } from '../types'

export const INITIAL_DOMAINS: Domain[] = [
  {
    id: 'management',
    name: '管理与组织方法',
    nameEn: 'Management & Organization',
    description: '涵盖组织设计、团队管理、目标管理、绩效管理、领导力等方面的方法论',
    icon: '🏢',
    color: '#3b82f6',
    methodCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subDomains: [
      { id: 'org_design', domainId: 'management', name: '组织设计', description: '组织架构与设计方法', methodCount: 0 },
      { id: 'team_mgmt', domainId: 'management', name: '团队管理', description: '团队建设与管理方法', methodCount: 0 },
      { id: 'goal_mgmt', domainId: 'management', name: '目标管理', description: '目标设定与执行方法', methodCount: 0 },
      { id: 'perf_mgmt', domainId: 'management', name: '绩效管理', description: '绩效评估与改进方法', methodCount: 0 },
      { id: 'motivation', domainId: 'management', name: '激励机制', description: '激励理论与实践方法', methodCount: 0 },
      { id: 'leadership', domainId: 'management', name: '领导力', description: '领导风格与领导方法', methodCount: 0 },
      { id: 'talent', domainId: 'management', name: '人才培养', description: '人才发展与培训方法', methodCount: 0 },
      { id: 'process', domainId: 'management', name: '流程管理', description: '业务流程优化与管理', methodCount: 0 },
      { id: 'change', domainId: 'management', name: '组织变革', description: '变革管理与转型方法', methodCount: 0 },
      { id: 'conflict', domainId: 'management', name: '冲突管理', description: '冲突识别与解决方法', methodCount: 0 }
    ]
  },
  {
    id: 'personal_growth',
    name: '个人成长与自我管理',
    nameEn: 'Personal Growth & Self-Management',
    description: '涵盖时间管理、习惯养成、情绪管理、自我认知等个人发展方法论',
    icon: '🌱',
    color: '#10b981',
    methodCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subDomains: [
      { id: 'time_mgmt', domainId: 'personal_growth', name: '时间管理', description: '时间规划与高效利用', methodCount: 0 },
      { id: 'habit', domainId: 'personal_growth', name: '习惯养成', description: '习惯建立与维持方法', methodCount: 0 },
      { id: 'emotion', domainId: 'personal_growth', name: '情绪管理', description: '情绪调节与压力管理', methodCount: 0 },
      { id: 'self_awareness', domainId: 'personal_growth', name: '自我认知', description: '自我了解与评估方法', methodCount: 0 },
      { id: 'goal_setting', domainId: 'personal_growth', name: '目标设定', description: '个人目标规划方法', methodCount: 0 },
      { id: 'resilience', domainId: 'personal_growth', name: '心理韧性', description: '逆境应对与恢复方法', methodCount: 0 }
    ]
  },
  {
    id: 'thinking',
    name: '思维模型与认知方法',
    nameEn: 'Mental Models & Cognition',
    description: '涵盖批判性思维、系统思维、创造性思维、认知偏误等思维方法论',
    icon: '🧠',
    color: '#8b5cf6',
    methodCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subDomains: [
      { id: 'critical', domainId: 'thinking', name: '批判性思维', description: '分析与评估能力', methodCount: 0 },
      { id: 'systems', domainId: 'thinking', name: '系统思维', description: '整体与系统分析方法', methodCount: 0 },
      { id: 'creative', domainId: 'thinking', name: '创造性思维', description: '创新与创意方法', methodCount: 0 },
      { id: 'cognitive_bias', domainId: 'thinking', name: '认知偏误', description: '偏见识别与纠正方法', methodCount: 0 },
      { id: 'decision', domainId: 'thinking', name: '决策方法', description: '科学决策框架', methodCount: 0 },
      { id: 'problem_solving', domainId: 'thinking', name: '问题分析', description: '问题定义与解决方法', methodCount: 0 }
    ]
  },
  {
    id: 'work_efficiency',
    name: '工作方法与效率工具',
    nameEn: 'Work Methods & Efficiency',
    description: '涵盖项目管理、任务优先级、协作工具、工作流程等效率方法论',
    icon: '⚡',
    color: '#f59e0b',
    methodCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subDomains: [
      { id: 'project_mgmt', domainId: 'work_efficiency', name: '项目管理', description: '项目规划与执行方法', methodCount: 0 },
      { id: 'prioritization', domainId: 'work_efficiency', name: '任务优先级', description: '任务排序与聚焦方法', methodCount: 0 },
      { id: 'collaboration', domainId: 'work_efficiency', name: '协作方法', description: '团队协作与沟通工具', methodCount: 0 },
      { id: 'deep_work', domainId: 'work_efficiency', name: '深度工作', description: '专注与高质量工作方法', methodCount: 0 },
      { id: 'automation', domainId: 'work_efficiency', name: '流程自动化', description: '工作自动化与简化方法', methodCount: 0 }
    ]
  },
  {
    id: 'communication',
    name: '沟通、谈判与决策方法',
    nameEn: 'Communication, Negotiation & Decision',
    description: '涵盖有效沟通、谈判策略、影响力、集体决策等方法论',
    icon: '💬',
    color: '#ec4899',
    methodCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subDomains: [
      { id: 'effective_comm', domainId: 'communication', name: '有效沟通', description: '清晰表达与倾听方法', methodCount: 0 },
      { id: 'negotiation', domainId: 'communication', name: '谈判策略', description: '谈判技巧与原则', methodCount: 0 },
      { id: 'influence', domainId: 'communication', name: '影响力', description: '说服与影响方法', methodCount: 0 },
      { id: 'presentation', domainId: 'communication', name: '演讲表达', description: '公众演讲与展示方法', methodCount: 0 },
      { id: 'group_decision', domainId: 'communication', name: '集体决策', description: '团队决策与共识方法', methodCount: 0 }
    ]
  },
  {
    id: 'learning',
    name: '学习方法与知识管理',
    nameEn: 'Learning Methods & Knowledge Management',
    description: '涵盖高效学习、记忆技术、知识整理、读书方法等学习方法论',
    icon: '📚',
    color: '#06b6d4',
    methodCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subDomains: [
      { id: 'active_learning', domainId: 'learning', name: '主动学习', description: '提高学习效率的主动策略', methodCount: 0 },
      { id: 'memory', domainId: 'learning', name: '记忆技术', description: '记忆强化与保留方法', methodCount: 0 },
      { id: 'knowledge_org', domainId: 'learning', name: '知识整理', description: '知识结构化与管理方法', methodCount: 0 },
      { id: 'reading', domainId: 'learning', name: '阅读方法', description: '高效阅读与理解方法', methodCount: 0 },
      { id: 'skill_acquisition', domainId: 'learning', name: '技能习得', description: '快速掌握新技能的方法', methodCount: 0 }
    ]
  },
  {
    id: 'business',
    name: '商业、经营与赚钱方法',
    nameEn: 'Business & Commercial Methods',
    description: '涵盖商业模式、创业方法、营销策略、财务管理等商业方法论',
    icon: '💡',
    color: '#f97316',
    methodCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subDomains: [
      { id: 'business_model', domainId: 'business', name: '商业模式', description: '商业模式设计与创新', methodCount: 0 },
      { id: 'startup', domainId: 'business', name: '创业方法', description: '创业策略与执行方法', methodCount: 0 },
      { id: 'marketing', domainId: 'business', name: '营销策略', description: '市场营销与增长方法', methodCount: 0 },
      { id: 'finance', domainId: 'business', name: '财务管理', description: '财务规划与管理方法', methodCount: 0 },
      { id: 'strategy', domainId: 'business', name: '竞争策略', description: '竞争分析与战略方法', methodCount: 0 },
      { id: 'product', domainId: 'business', name: '产品方法', description: '产品开发与管理方法', methodCount: 0 }
    ]
  },
  {
    id: 'life',
    name: '生活中的实用方法论',
    nameEn: 'Practical Life Methods',
    description: '涵盖健康管理、人际关系、财务规划、家庭生活等实用方法论',
    icon: '🌟',
    color: '#84cc16',
    methodCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subDomains: [
      { id: 'health', domainId: 'life', name: '健康管理', description: '身心健康维护方法', methodCount: 0 },
      { id: 'relationships', domainId: 'life', name: '人际关系', description: '人际交往与维护方法', methodCount: 0 },
      { id: 'personal_finance', domainId: 'life', name: '个人理财', description: '个人财务规划方法', methodCount: 0 },
      { id: 'family', domainId: 'life', name: '家庭生活', description: '家庭管理与亲子方法', methodCount: 0 },
      { id: 'lifestyle', domainId: 'life', name: '生活方式', description: '生活质量提升方法', methodCount: 0 }
    ]
  }
]

// 预置核心方法论数据（种子数据）
export const SEED_METHODS_META = [
  {
    id: 'method_pdca',
    name: 'PDCA循环',
    domains: ['management', 'work_efficiency'],
    type: 'process' as const,
    layer: 1 as const,
    summary: '通过计划、执行、检查、行动四个阶段持续改进工作质量的管理工具'
  },
  {
    id: 'method_first_principles',
    name: '第一性原理',
    domains: ['thinking'],
    type: 'principle' as const,
    layer: 1 as const,
    summary: '回归事物本质，从基本事实出发进行推理，而非类比推导的思维方法'
  },
  {
    id: 'method_okr',
    name: 'OKR目标与关键结果',
    domains: ['management', 'personal_growth'],
    type: 'framework' as const,
    layer: 2 as const,
    summary: '通过设定目标（O）和可量化的关键结果（KR）来驱动组织和个人聚焦执行'
  },
  {
    id: 'method_feynman',
    name: '费曼学习法',
    domains: ['learning'],
    type: 'process' as const,
    layer: 2 as const,
    summary: '通过用简单语言向他人解释概念来深化理解和发现知识盲点的学习方法'
  },
  {
    id: 'method_swot',
    name: 'SWOT分析',
    domains: ['business', 'thinking'],
    type: 'framework' as const,
    layer: 1 as const,
    summary: '通过分析优势、劣势、机会和威胁四个维度评估战略情境的分析框架'
  },
  {
    id: 'method_systems_thinking',
    name: '系统思维',
    domains: ['thinking', 'management'],
    type: 'model' as const,
    layer: 1 as const,
    summary: '将问题置于更大系统中理解，关注要素之间相互关系和动态反馈的思维方式'
  },
  {
    id: 'method_eisenhower',
    name: '艾森豪威尔矩阵',
    domains: ['work_efficiency', 'personal_growth'],
    type: 'tool' as const,
    layer: 1 as const,
    summary: '按重要性和紧急性将任务分为四象限，帮助确定优先级的时间管理工具'
  },
  {
    id: 'method_nvc',
    name: '非暴力沟通',
    domains: ['communication', 'personal_growth'],
    type: 'process' as const,
    layer: 2 as const,
    summary: '通过观察、感受、需求、请求四步骤实现真诚有效沟通的方法'
  },
  {
    id: 'method_lean_startup',
    name: '精益创业',
    domains: ['business'],
    type: 'framework' as const,
    layer: 2 as const,
    summary: '通过构建-测量-学习循环快速验证商业假设、降低创业风险的方法论'
  },
  {
    id: 'method_spaced_repetition',
    name: '间隔重复',
    domains: ['learning'],
    type: 'tool' as const,
    layer: 2 as const,
    summary: '利用遗忘曲线，在最佳时间点复习知识以最大化长期记忆效果的学习技术'
  }
]
