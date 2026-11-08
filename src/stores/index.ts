// 全局应用状态管理（Zustand）
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  Method, Domain, Practice, LearningPlan, ResearchTask,
  ReviewItem, ModelConfig, SystemConfig, Notification,
  SearchResult, SearchQuery
} from '../types'
import { methodsDB, domainsDB, practicesDB, learningDB, researchDB, configDB } from '../services/db'
import { v4 as uuidv4 } from 'uuid'

// ============================================================
// 类型定义
// ============================================================

interface DashboardStats {
  totalMethods: number
  domainDistribution: Record<string, number>
  pendingReviews: number
  activePractices: number
  activeLearningPlans: number
  recentMethods: Method[]
}

interface AppStore {
  // ---- 状态 ----
  initialized: boolean
  loading: Record<string, boolean>
  notifications: Notification[]
  currentView: string
  
  // 数据
  domains: Domain[]
  recentMethods: Method[]
  pendingReviews: ReviewItem[]
  stats: DashboardStats | null
  systemConfig: SystemConfig | null
  modelConfigs: ModelConfig[]
  
  // 搜索
  searchResults: SearchResult | null
  searchQuery: string
  
  // ---- Actions ----
  initialize: () => Promise<void>
  setView: (view: string) => void
  setLoading: (key: string, value: boolean) => void
  
  // 通知
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  removeNotification: (id: string) => void
  
  // 领域
  loadDomains: () => Promise<void>
  updateDomain: (domain: Domain) => Promise<void>
  
  // 方法论
  saveMethod: (method: Method) => Promise<void>
  deleteMethod: (id: string) => Promise<void>
  loadRecentMethods: () => Promise<void>
  
  // 研究
  loadPendingReviews: () => Promise<void>
  approveReview: (reviewId: string) => Promise<void>
  rejectReview: (reviewId: string, reason: string) => Promise<void>
  
  // 仪表盘
  loadDashboardStats: () => Promise<void>
  
  // 搜索
  setSearchResults: (results: SearchResult | null) => void
  setSearchQuery: (query: string) => void
  
  // 配置
  loadConfig: () => Promise<void>
  saveSystemConfig: (config: SystemConfig) => Promise<void>
  saveModelConfig: (config: ModelConfig) => Promise<void>
  deleteModelConfig: (id: string) => Promise<void>
}

// ============================================================
// Store
// ============================================================

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // ---- 初始状态 ----
      initialized: false,
      loading: {},
      notifications: [],
      currentView: 'dashboard',
      domains: [],
      recentMethods: [],
      pendingReviews: [],
      stats: null,
      systemConfig: null,
      modelConfigs: [],
      searchResults: null,
      searchQuery: '',

      // ---- 初始化 ----
      initialize: async () => {
        if (get().initialized) return
        try {
          await Promise.all([
            get().loadDomains(),
            get().loadRecentMethods(),
            get().loadPendingReviews(),
            get().loadDashboardStats(),
            get().loadConfig()
          ])
          set({ initialized: true })
        } catch (error) {
          console.error('初始化失败:', error)
          get().addNotification({ type: 'error', title: '初始化失败', message: (error as Error).message })
        }
      },

      setView: (view) => set({ currentView: view }),

      setLoading: (key, value) =>
        set(state => ({ loading: { ...state.loading, [key]: value } })),

      // ---- 通知 ----
      addNotification: (notification) => {
        const id = uuidv4()
        const newNotification: Notification = {
          ...notification,
          id,
          createdAt: new Date().toISOString()
        }
        set(state => ({ notifications: [newNotification, ...state.notifications.slice(0, 9)] }))
        
        // 自动清除
        const duration = notification.duration ?? (notification.type === 'error' ? 8000 : 4000)
        if (duration > 0) {
          setTimeout(() => get().removeNotification(id), duration)
        }
      },

      removeNotification: (id) =>
        set(state => ({ notifications: state.notifications.filter(n => n.id !== id) })),

      // ---- 领域 ----
      loadDomains: async () => {
        const domains = await domainsDB.getAll()
        set({ domains: domains.sort((a, b) => a.name.localeCompare(b.name)) })
      },

      updateDomain: async (domain) => {
        await domainsDB.save(domain)
        await get().loadDomains()
      },

      // ---- 方法论 ----
      saveMethod: async (method) => {
        await methodsDB.save(method)
        await Promise.all([
          get().loadRecentMethods(),
          get().loadDashboardStats()
        ])
      },

      deleteMethod: async (id) => {
        await methodsDB.delete(id)
        await Promise.all([
          get().loadRecentMethods(),
          get().loadDashboardStats()
        ])
        get().addNotification({ type: 'success', title: '已删除方法论' })
      },

      loadRecentMethods: async () => {
        const recent = await methodsDB.getRecent(8)
        set({ recentMethods: recent })
      },

      // ---- 研究审核 ----
      loadPendingReviews: async () => {
        const reviews = await researchDB.getAllReviews('pending')
        set({ pendingReviews: reviews })
      },

      approveReview: async (reviewId) => {
        const review = await researchDB.getReview(reviewId)
        if (!review) return

        if (review.type === 'new_method' && review.discoveredMethod?.draftMethod) {
          const draft = review.discoveredMethod.draftMethod
          const method: Method = {
            ...(draft as Method),
            id: draft.id ?? `method_${uuidv4().slice(0, 8)}`,
            status: 'active',
            version: 1,
            versionHistory: [],
            relations: draft.relations ?? [],
            cases: draft.cases ?? [],
            tags: draft.tags ?? [],
            stats: draft.stats ?? { viewCount: 0, practiceCount: 0, learningCount: 0, avgRating: 0 },
            createdAt: draft.createdAt ?? new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          await methodsDB.save(method)
          
          // 更新领域计数
          for (const domainId of method.domains) {
            await domainsDB.updateCount(domainId, 1)
          }
        }

        // 更新审核状态
        review.status = 'approved'
        review.reviewedAt = new Date().toISOString()
        await researchDB.saveReview(review)
        
        await Promise.all([
          get().loadPendingReviews(),
          get().loadDashboardStats(),
          get().loadRecentMethods()
        ])
        get().addNotification({ type: 'success', title: '已批准并入库' })
      },

      rejectReview: async (reviewId, reason) => {
        const review = await researchDB.getReview(reviewId)
        if (!review) return
        
        review.status = 'rejected'
        review.reviewedAt = new Date().toISOString()
        review.reviewNotes = reason
        await researchDB.saveReview(review)
        
        await get().loadPendingReviews()
        get().addNotification({ type: 'info', title: '已退回研究' })
      },

      // ---- 仪表盘统计 ----
      loadDashboardStats: async () => {
        try {
          const [domains, totalMethods, pendingCount, practices] = await Promise.all([
            domainsDB.getAll(),
            methodsDB.count(),
            researchDB.countPendingReviews(),
            practicesDB.getAll('in_progress')
          ])
          
          const { items: recent } = await methodsDB.getAll({ limit: 6 })
          const learningPlans = await learningDB.getAllPlans()
          const activePlans = learningPlans.filter(p => p.status === 'active')

          const domainDistribution: Record<string, number> = {}
          for (const domain of domains) {
            domainDistribution[domain.id] = domain.methodCount
          }

          set({
            stats: {
              totalMethods,
              domainDistribution,
              pendingReviews: pendingCount,
              activePractices: practices.length,
              activeLearningPlans: activePlans.length,
              recentMethods: recent
            }
          })
        } catch (error) {
          console.error('加载统计失败:', error)
        }
      },

      // ---- 搜索 ----
      setSearchResults: (results) => set({ searchResults: results }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      // ---- 配置 ----
      loadConfig: async () => {
        const [config, models] = await Promise.all([
          configDB.getSystemConfig(),
          configDB.getAllModelConfigs()
        ])
        set({
          systemConfig: config ?? getDefaultSystemConfig(),
          modelConfigs: models
        })
      },

      saveSystemConfig: async (config) => {
        await configDB.saveSystemConfig(config)
        set({ systemConfig: config })
        get().addNotification({ type: 'success', title: '配置已保存' })
      },

      saveModelConfig: async (config) => {
        await configDB.saveModelConfig(config)
        await get().loadConfig()
        get().addNotification({ type: 'success', title: 'AI 模型配置已保存' })
      },

      deleteModelConfig: async (id) => {
        await configDB.deleteModelConfig(id)
        await get().loadConfig()
      }
    }),
    {
      name: 'methodology-app-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentView: state.currentView,
        searchQuery: state.searchQuery
      })
    }
  )
)

// ---- 专用 store: 方法论列表 ----

interface MethodsStore {
  methods: Method[]
  total: number
  currentPage: number
  pageSize: number
  filterDomain: string | null
  filterStatus: string | null
  sortBy: 'updatedAt' | 'name' | 'createdAt'
  
  loadMethods: (options?: { domain?: string; status?: string; reset?: boolean }) => Promise<void>
  setFilter: (domain: string | null, status: string | null) => void
  setPage: (page: number) => void
}

export const useMethodsStore = create<MethodsStore>()((set, get) => ({
  methods: [],
  total: 0,
  currentPage: 1,
  pageSize: 20,
  filterDomain: null,
  filterStatus: 'active',
  sortBy: 'updatedAt',

  loadMethods: async (options = {}) => {
    const { domain, status, reset } = options
    const { pageSize } = get()
    const page = reset ? 1 : get().currentPage
    
    if (reset) set({ currentPage: 1 })

    const result = await methodsDB.getAll({
      domain: domain ?? get().filterDomain ?? undefined,
      status: status ?? get().filterStatus ?? undefined,
      limit: pageSize,
      offset: (page - 1) * pageSize
    })

    set({ methods: result.items, total: result.total })
  },

  setFilter: (domain, status) => {
    set({ filterDomain: domain, filterStatus: status, currentPage: 1 })
    get().loadMethods()
  },

  setPage: (page) => {
    set({ currentPage: page })
    get().loadMethods()
  }
}))

// ---- 专用 store: 实践 ----

interface PracticesStore {
  practices: Practice[]
  currentPractice: Practice | null
  
  loadPractices: () => Promise<void>
  setPractice: (practice: Practice | null) => void
  savePractice: (practice: Practice) => Promise<void>
  deletePractice: (id: string) => Promise<void>
}

export const usePracticesStore = create<PracticesStore>()((set, get) => ({
  practices: [],
  currentPractice: null,

  loadPractices: async () => {
    const practices = await practicesDB.getAll()
    set({ practices })
  },

  setPractice: (practice) => set({ currentPractice: practice }),

  savePractice: async (practice) => {
    await practicesDB.save(practice)
    await get().loadPractices()
  },

  deletePractice: async (id) => {
    await practicesDB.delete(id)
    await get().loadPractices()
    if (get().currentPractice?.id === id) set({ currentPractice: null })
  }
}))

// ---- 专用 store: 学习 ----

interface LearningStore {
  plans: LearningPlan[]
  currentPlan: LearningPlan | null
  dueTasks: import('../types').LearningTask[]
  
  loadPlans: () => Promise<void>
  loadDueTasks: () => Promise<void>
  setPlan: (plan: LearningPlan | null) => void
  savePlan: (plan: LearningPlan) => Promise<void>
  deletePlan: (id: string) => Promise<void>
}

export const useLearningStore = create<LearningStore>()((set, get) => ({
  plans: [],
  currentPlan: null,
  dueTasks: [],

  loadPlans: async () => {
    const plans = await learningDB.getAllPlans()
    set({ plans: plans.filter(p => p.status !== 'completed') })
  },

  loadDueTasks: async () => {
    const tasks = await learningDB.getTasksByStatus('review_due')
    const pending = await learningDB.getTasksByStatus('pending')
    set({ dueTasks: [...tasks, ...pending.slice(0, 5)] })
  },

  setPlan: (plan) => set({ currentPlan: plan }),

  savePlan: async (plan) => {
    await learningDB.savePlan(plan)
    await get().loadPlans()
  },

  deletePlan: async (id) => {
    await learningDB.deletePlan(id)
    await get().loadPlans()
  }
}))

// ---- 研究 store ----

interface ResearchStore {
  tasks: ResearchTask[]
  allReviews: ReviewItem[]
  currentTask: ResearchTask | null
  
  loadTasks: () => Promise<void>
  loadAllReviews: () => Promise<void>
  saveTask: (task: ResearchTask) => Promise<void>
  setCurrentTask: (task: ResearchTask | null) => void
}

export const useResearchStore = create<ResearchStore>()((set, get) => ({
  tasks: [],
  allReviews: [],
  currentTask: null,

  loadTasks: async () => {
    const tasks = await researchDB.getAllTasks()
    set({ tasks })
  },

  loadAllReviews: async () => {
    const reviews = await researchDB.getAllReviews()
    set({ allReviews: reviews })
  },

  saveTask: async (task) => {
    await researchDB.saveTask(task)
    await get().loadTasks()
  },

  setCurrentTask: (task) => set({ currentTask: task })
}))

// ---- 默认系统配置 ----

function getDefaultSystemConfig(): SystemConfig {
  return {
    github: {
      owner: '',
      repo: '',
      branch: 'main',
      dataPath: 'data',
      tokenConfigured: false
    },
    ai: {
      defaultModel: 'claude-3-5-sonnet-20241022',
      taskModelMap: {
        deep_research: 'claude-3-5-sonnet-20241022',
        content_organization: 'claude-3-5-sonnet-20241022',
        classification: 'claude-3-haiku-20240307',
        deduplication: 'claude-3-5-sonnet-20241022',
        daily_qa: 'claude-3-5-sonnet-20241022',
        solution_composition: 'claude-3-5-sonnet-20241022',
        practice_review: 'claude-3-5-sonnet-20241022',
        quiz_generation: 'claude-3-haiku-20240307',
        learning_plan: 'claude-3-5-sonnet-20241022'
      },
      maxConcurrentRequests: 2,
      retryAttempts: 3,
      retryDelay: 1000
    },
    research: {
      enabled: false,
      weeklySchedule: false,
      maxMethodsPerWeek: 5,
      requireReview: true,
      autoApproveThreshold: 90,
      preferredDomains: [],
      prioritizeGeneral: true
    },
    ui: {
      theme: 'dark',
      language: 'zh-CN',
      defaultView: 'dashboard',
      showOnboarding: true
    },
    privacy: {
      shareAnonymousStats: false,
      publicLibrary: false,
      publicPractices: false
    },
    version: '1.0.0',
    updatedAt: new Date().toISOString()
  }
}
