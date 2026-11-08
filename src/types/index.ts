// ============================================================
// 核心数据类型定义
// ============================================================

// 领域分类
export interface Domain {
  id: string
  name: string
  nameEn: string
  description: string
  icon: string
  color: string
  subDomains: SubDomain[]
  methodCount: number
  createdAt: string
  updatedAt: string
}

export interface SubDomain {
  id: string
  domainId: string
  name: string
  description: string
  methodCount: number
}

// 方法论类型枚举
export type MethodType = 'theory' | 'model' | 'tool' | 'process' | 'principle' | 'framework' | 'other'
export type EvidenceLevel = 'high' | 'medium' | 'low' | 'unverified' | 'disputed'
export type MethodStatus = 'active' | 'pending_review' | 'draft' | 'deprecated' | 'disputed'
export type MasteryLevel = 'aware' | 'understand' | 'apply' | 'expert'

// 方法论核心结构
export interface Method {
  id: string
  name: string
  aliases: string[]
  domains: string[]          // domain ids
  subDomains: string[]       // subDomain ids
  type: MethodType
  layer: 1 | 2 | 3          // 三层知识架构
  
  origin: {
    proposer: string
    proposerBio?: string
    year?: number
    sources: Source[]
  }
  
  content: {
    summary: string          // 一句话概述（卡片用）
    coreIdea: string         // 核心思想
    principles: string[]     // 理论基础
    mechanism: string        // 运行原理
    scenarios: string[]      // 适用场景
    conditions: string[]     // 适用条件
    steps: Step[]            // 操作步骤
    advantages: string[]     // 优点
    limitations: string[]    // 缺点/局限
    misconceptions: string[] // 常见误区
    fullArticle?: string     // 完整研究文章（Markdown）
  }
  
  evidence: {
    level: EvidenceLevel
    claims: EvidenceClaim[]
    confidence: number | null  // 0-100
    notes: string
  }
  
  cases: Case[]
  relations: MethodRelation[]
  tags: string[]
  
  status: MethodStatus
  reviewNotes?: string
  
  stats: {
    viewCount: number
    practiceCount: number
    learningCount: number
    avgRating: number
  }
  
  aiMeta: {
    researchedBy: string    // AI 模型名称
    researchedAt: string
    qualityScore: number    // 0-100
    contentWarnings: string[]
  }
  
  version: number
  versionHistory: VersionRecord[]
  createdAt: string
  updatedAt: string
}

// 步骤
export interface Step {
  order: number
  title: string
  description: string
  tips?: string[]
  warnings?: string[]
}

// 证据声明
export interface EvidenceClaim {
  id: string
  type: 'original' | 'research' | 'practice' | 'ai_inference'
  content: string
  source?: string
  sourceUrl?: string
  reliability: 'high' | 'medium' | 'low'
}

// 资料来源
export interface Source {
  id: string
  title: string
  author: string
  institution?: string
  url?: string
  type: 'book' | 'paper' | 'article' | 'speech' | 'course' | 'website' | 'other'
  publishedAt?: string
  accessedAt?: string
  credibility: 'high' | 'medium' | 'low'
  notes?: string
  supportedClaims: string[]
}

// 真实案例
export interface Case {
  id: string
  title: string
  organization?: string
  industry?: string
  context: string
  application: string
  outcome: string
  lessons: string[]
  sourceUrl?: string
  verified: boolean
  aiGenerated: boolean
}

// 知识关联关系
export type RelationType = 
  | 'parent_child'    // 上下位
  | 'complementary'   // 互补
  | 'similar'         // 相似
  | 'conflicting'     // 冲突
  | 'combined_use'    // 组合使用
  | 'evolved_from'    // 演化
  | 'applied_to'      // 应用关系

export interface MethodRelation {
  id: string
  fromMethodId: string
  toMethodId: string
  type: RelationType
  description: string
  evidence?: string
  strength: 'strong' | 'medium' | 'weak'
  createdAt: string
  aiGenerated: boolean
}

// 版本记录
export interface VersionRecord {
  version: number
  changedAt: string
  changedBy: 'ai' | 'user'
  changes: string[]
  snapshot?: Partial<Method>
}

// ============================================================
// 研究相关类型
// ============================================================

export type ResearchStatus = 'queued' | 'in_progress' | 'completed' | 'failed' | 'pending_review' | 'approved' | 'rejected'
export type ResearchPriority = 'high' | 'medium' | 'low'

export interface ResearchTask {
  id: string
  title: string
  description: string
  targetMethodIds: string[]      // 研究目标（已有方法论）
  targetTopics: string[]          // 研究主题（新发现）
  domains: string[]
  priority: ResearchPriority
  
  config: {
    model: string
    webSearch: boolean
    maxSources: number
    depthLevel: 'basic' | 'standard' | 'deep'
  }
  
  status: ResearchStatus
  progress: number               // 0-100
  
  result?: ResearchResult
  error?: string
  
  scheduledAt?: string
  startedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
  
  isAutomatic: boolean           // 是否为自动任务
  weekNumber?: number
}

export interface ResearchResult {
  taskId: string
  
  discovered: DiscoveredMethod[]
  updated: UpdatedMethod[]
  
  qualityReport: {
    totalDiscovered: number
    totalUpdated: number
    duplicatesSkipped: number
    lowQualitySkipped: number
    warnings: string[]
  }
  
  report: string                 // Markdown 研究报告
  sources: Source[]
  tokensUsed: number
  estimatedCost: number
  
  createdAt: string
}

export interface DiscoveredMethod {
  tempId: string
  draftMethod: Partial<Method>
  similarExisting: Array<{ methodId: string; similarity: number; reason: string }>
  recommendation: 'create_new' | 'merge_with' | 'supplement' | 'skip'
  recommendedMergeTarget?: string
  qualityScore: number
  reviewSummary: string
}

export interface UpdatedMethod {
  methodId: string
  methodName: string
  changes: string[]
  updatedFields: string[]
  qualityImprovement: number
}

// 审核队列
export interface ReviewItem {
  id: string
  type: 'new_method' | 'update_method' | 'new_relation' | 'deprecate_method'
  taskId: string
  
  // 新方法论
  discoveredMethod?: DiscoveredMethod
  
  // 更新
  updatedMethod?: UpdatedMethod
  currentMethod?: Method
  
  // 关系
  newRelation?: MethodRelation
  
  aiSummary: string              // AI 给用户的审核摘要
  aiRecommendation: string       // AI 建议
  
  status: 'pending' | 'approved' | 'rejected' | 'modified' | 'merged'
  reviewedAt?: string
  reviewNotes?: string
  
  createdAt: string
  priority: ResearchPriority
}

// ============================================================
// 实践相关类型
// ============================================================

export type PracticeStatus = 'planning' | 'in_progress' | 'completed' | 'paused' | 'abandoned'

export interface Practice {
  id: string
  title: string
  problem: string
  methodIds: string[]
  
  planning: {
    goal: string
    expectedOutcome: string
    plan: string              // AI 辅助制定（Markdown）
    steps: PracticeStep[]
    startDate?: string
    endDate?: string
    estimatedCost: {
      time: string
      effort: string
          other?: string
    }
  }
  
  execution: {
    logs: PracticeLog[]
    actualStartDate?: string
    actualEndDate?: string
    actualCost?: {
      timeSpent: string
      notes: string
    }
  }
  
  evaluation: {
    goalCompletion: number      // 0-100
    processRating: number       // 1-5
    effectRating: number        // 1-5
    summary: string
    longTermTracking: LongTermRecord[]
  }
  
  aiReview?: AIReview
  
  status: PracticeStatus
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface PracticeStep {
  order: number
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'done' | 'skipped'
  completedAt?: string
  notes?: string
}

export interface PracticeLog {
  id: string
  date: string
  content: string
  mood?: 1 | 2 | 3 | 4 | 5
  obstacles?: string
  insights?: string
}

export interface LongTermRecord {
  id: string
  date: string
  indicator: string
  value: string
  notes?: string
}

export interface AIReview {
  methodSelection: string
  conditionsSatisfied: string
  executionQuality: string
  effectiveSteps: string[]
  influencingFactors: string[]
  alternativeExplanations: string
  improvements: string[]
  knowledgeBaseUpdate: boolean
  updateSuggestions: string
  generatedAt: string
  model: string
}

// ============================================================
// 学习相关类型
// ============================================================

export interface LearningPlan {
  id: string
  title: string
  description: string
  goal: LearningGoal
  methodIds: string[]
  tasks: LearningTask[]
  
  schedule: {
    type: 'daily' | 'weekly' | 'custom'
    dailyMinutes?: number
    weeklyDays?: number[]
  }
  
  progress: {
    totalTasks: number
    completedTasks: number
    masteryAvg: number
    streak: number
    lastStudiedAt?: string
  }
  
  status: 'active' | 'paused' | 'completed'
  createdAt: string
  updatedAt: string
}

export type LearningGoal = 
  | { type: 'domain'; domainId: string }
  | { type: 'topic'; topic: string }
  | { type: 'problem'; problem: string }
  | { type: 'method'; methodIds: string[] }

export interface LearningTask {
  id: string
  planId: string
  methodId: string
  
  objective: string
  materials: string[]        // Markdown 学习材料
  keyPoints: string[]
  
  quiz?: Quiz
  
  mastery: MasteryLevel | null
  
  scheduledAt: string
  completedAt?: string
  timeSpent?: number          // minutes
  
  reviewDates: string[]       // 间隔复习日期
  nextReviewAt?: string
  
  status: 'pending' | 'in_progress' | 'completed' | 'review_due'
}

export interface Quiz {
  id: string
  questions: QuizQuestion[]
  attempts: QuizAttempt[]
  bestScore: number
}

export interface QuizQuestion {
  id: string
  type: 'single_choice' | 'multiple_choice' | 'open_ended'
  question: string
  options?: string[]
  correctAnswer: string | string[]
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface QuizAttempt {
  id: string
  answers: Record<string, string | string[]>
  score: number               // 0-100
  feedback: string
  attemptedAt: string
  timeSpent: number
}

export interface MasteryRecord {
  id: string
  methodId: string
  userId: string
  mastery: MasteryLevel
  evidence: string[]
  updatedAt: string
}

// ============================================================
// AI 配置相关
// ============================================================

export type AIProvider = 'claude' | 'openai' | 'gemini' | 'deepseek' | 'custom'
export type AITask = 
  | 'deep_research'
  | 'content_organization'
  | 'classification'
  | 'deduplication'
  | 'daily_qa'
  | 'solution_composition'
  | 'practice_review'
  | 'quiz_generation'
  | 'learning_plan'

export interface ModelConfig {
  id: string
  provider: AIProvider
  model: string
  displayName: string
  contextLength: number
  
  tasks: AITask[]             // 承担的任务类型
  isDefault: boolean
  priority: number            // 同任务多模型时的优先级
  
  limits: {
    dailyTokens?: number
    dailyCost?: number        // USD
    weeklyTokens?: number
    weeklyCost?: number
  }
  
  stats: {
    totalTokensUsed: number
    totalCost: number
    requestCount: number
    errorCount: number
    lastUsedAt?: string
  }
  
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SystemConfig {
  // GitHub 配置
  github: {
    owner: string
    repo: string
    branch: string
    dataPath: string
    tokenConfigured: boolean    // 是否已配置（不存储token本身）
  }
  
  // AI 配置
  ai: {
    defaultModel: string
    taskModelMap: Record<AITask, string>
    maxConcurrentRequests: number
    retryAttempts: number
    retryDelay: number
  }
  
  // 研究配置
  research: {
    enabled: boolean
    weeklySchedule: boolean
    maxMethodsPerWeek: number
    requireReview: boolean
    autoApproveThreshold: number  // 质量分>=此值可自动通过
    preferredDomains: string[]
    prioritizeGeneral: boolean
  }
  
  // 界面配置
  ui: {
    theme: 'light' | 'dark' | 'system'
    language: 'zh-CN'
    defaultView: 'dashboard' | 'library' | 'search'
    showOnboarding: boolean
  }
  
  // 隐私配置
  privacy: {
    shareAnonymousStats: boolean
    publicLibrary: boolean
    publicPractices: boolean
  }
  
  version: string
  updatedAt: string
}

// ============================================================
// 知识图谱类型
// ============================================================

export interface GraphNode {
  id: string
  type: 'method' | 'domain' | 'person' | 'theory' | 'case' | 'practice'
  label: string
  description?: string
  x?: number
  y?: number
  radius?: number
  color?: string
  data?: any
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  type: RelationType
  label: string
  strength: 'strong' | 'medium' | 'weak'
  data?: any
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
  metadata: {
    totalNodes: number
    totalEdges: number
    generatedAt: string
  }
}

// ============================================================
// 搜索相关类型
// ============================================================

export interface SearchQuery {
  text: string
  type: 'keyword' | 'natural_language' | 'scenario' | 'related'
  filters: {
    domains?: string[]
    types?: MethodType[]
    evidenceLevels?: EvidenceLevel[]
    hasSteps?: boolean
    hasCases?: boolean
  }
  limit?: number
  offset?: number
}

export interface SearchResult {
  methods: MethodSearchHit[]
  total: number
  aiAnalysis?: {
    problemUnderstanding: string
    recommendedCombination?: string
    combinationLogic?: string
    executionSteps?: string[]
    precautions?: string[]
    relatedCases?: string[]
    sources?: string[]
  }
  query: SearchQuery
  searchedAt: string
}

export interface MethodSearchHit {
  method: Method
  score: number
  matchedFields: string[]
  snippet: string
  relevanceReason: string
  aiScore?: number
}

// ============================================================
// 通用类型
// ============================================================

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: { label: string; onClick: () => void }
  createdAt: string
}
