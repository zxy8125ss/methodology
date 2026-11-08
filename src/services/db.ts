// IndexedDB 本地数据存储服务
import { openDB, IDBPDatabase } from 'idb'
import type {
  Method, Domain, Practice, LearningPlan, LearningTask,
  ResearchTask, ReviewItem, ModelConfig, SystemConfig,
  Source, MethodRelation, MasteryRecord
} from '../types'
import { INITIAL_DOMAINS } from '../data/initialData'
import { SEED_METHODS, SEED_RELATIONS } from '../data/seedMethods'

const DB_NAME = 'methodology-db'
const DB_VERSION = 1

type MethodologyDB = {
  methods: { key: string; value: Method; indexes: { 'by-domain': string[]; 'by-status': string; 'by-updated': string } }
  domains: { key: string; value: Domain }
  relations: { key: string; value: MethodRelation; indexes: { 'by-from': string; 'by-to': string } }
  sources: { key: string; value: Source }
  practices: { key: string; value: Practice; indexes: { 'by-status': string; 'by-updated': string } }
  learningPlans: { key: string; value: LearningPlan; indexes: { 'by-status': string } }
  learningTasks: { key: string; value: LearningTask; indexes: { 'by-plan': string; 'by-method': string; 'by-status': string } }
  researchTasks: { key: string; value: ResearchTask; indexes: { 'by-status': string; 'by-created': string } }
  reviewItems: { key: string; value: ReviewItem; indexes: { 'by-status': string; 'by-created': string } }
  modelConfigs: { key: string; value: ModelConfig }
  masteryRecords: { key: string; value: MasteryRecord; indexes: { 'by-method': string } }
  systemConfig: { key: string; value: SystemConfig }
  cache: { key: string; value: { data: unknown; expiresAt: number } }
}

let dbInstance: IDBPDatabase<MethodologyDB> | null = null

async function getDB(): Promise<IDBPDatabase<MethodologyDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<MethodologyDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Methods store
      const methodsStore = db.createObjectStore('methods', { keyPath: 'id' })
      methodsStore.createIndex('by-domain', 'domains', { multiEntry: true })
      methodsStore.createIndex('by-status', 'status')
      methodsStore.createIndex('by-updated', 'updatedAt')

      // Domains store
      db.createObjectStore('domains', { keyPath: 'id' })

      // Relations store
      const relationsStore = db.createObjectStore('relations', { keyPath: 'id' })
      relationsStore.createIndex('by-from', 'fromMethodId')
      relationsStore.createIndex('by-to', 'toMethodId')

      // Sources store
      db.createObjectStore('sources', { keyPath: 'id' })

      // Practices store
      const practicesStore = db.createObjectStore('practices', { keyPath: 'id' })
      practicesStore.createIndex('by-status', 'status')
      practicesStore.createIndex('by-updated', 'updatedAt')

      // Learning plans store
      const learningPlansStore = db.createObjectStore('learningPlans', { keyPath: 'id' })
      learningPlansStore.createIndex('by-status', 'status')

      // Learning tasks store
      const learningTasksStore = db.createObjectStore('learningTasks', { keyPath: 'id' })
      learningTasksStore.createIndex('by-plan', 'planId')
      learningTasksStore.createIndex('by-method', 'methodId')
      learningTasksStore.createIndex('by-status', 'status')

      // Research tasks store
      const researchTasksStore = db.createObjectStore('researchTasks', { keyPath: 'id' })
      researchTasksStore.createIndex('by-status', 'status')
      researchTasksStore.createIndex('by-created', 'createdAt')

      // Review items store
      const reviewItemsStore = db.createObjectStore('reviewItems', { keyPath: 'id' })
      reviewItemsStore.createIndex('by-status', 'status')
      reviewItemsStore.createIndex('by-created', 'createdAt')

      // Model configs store
      db.createObjectStore('modelConfigs', { keyPath: 'id' })

      // Mastery records store
      const masteryStore = db.createObjectStore('masteryRecords', { keyPath: 'id' })
      masteryStore.createIndex('by-method', 'methodId')

      // System config store
      db.createObjectStore('systemConfig', { keyPath: 'id' })

      // Cache store
      db.createObjectStore('cache', { keyPath: 'id' } as Parameters<typeof db.createObjectStore>[1])
    },
    blocked() {
      console.warn('DB blocked by older version')
    },
    blocking() {
      dbInstance?.close()
      dbInstance = null
    }
  })

  // 初始化领域数据
  await initializeDomains(dbInstance)
  // 初始化核心种子方法论
  await initializeSeedData(dbInstance)

  return dbInstance
}

async function initializeDomains(db: IDBPDatabase<MethodologyDB>) {
  const tx = db.transaction('domains', 'readwrite')
  for (const domain of INITIAL_DOMAINS) {
    const existing = await tx.store.get(domain.id)
    if (!existing) {
      await tx.store.put(domain)
    }
  }
  await tx.done
}

async function initializeSeedData(db: IDBPDatabase<MethodologyDB>) {
  const tx = db.transaction(['methods', 'relations', 'domains'], 'readwrite')
  const methodsStore = tx.objectStore('methods')
  const domainsStore = tx.objectStore('domains')

  for (const m of SEED_METHODS) {
    const existing = await methodsStore.get(m.id)
    if (!existing) {
      await methodsStore.put(m)
      for (const dId of m.domains) {
        const dom = await domainsStore.get(dId)
        if (dom) {
          dom.methodCount = (dom.methodCount || 0) + 1
          await domainsStore.put(dom)
        }
      }
    } else {
      // 保持种子方法论别名与关键元数据同步更新
      let updated = false
      if (!existing.aliases || JSON.stringify(existing.aliases) !== JSON.stringify(m.aliases)) {
        existing.aliases = m.aliases
        updated = true
      }
      if (updated) {
        await methodsStore.put(existing)
      }
    }
  }

  const relsStore = tx.objectStore('relations')
  for (const rel of SEED_RELATIONS) {
    const existingRel = await relsStore.get(rel.id)
    if (!existingRel) {
      await relsStore.put(rel)
    }
  }

  await tx.done
}

// ============================================================
// Methods CRUD
// ============================================================

export const methodsDB = {
  async getAll(options?: { domain?: string; status?: string; limit?: number; offset?: number }) {
    const db = await getDB()
    let methods: Method[]

    if (options?.domain) {
      methods = await db.getAllFromIndex('methods', 'by-domain', options.domain as any)
    } else if (options?.status) {
      methods = await db.getAllFromIndex('methods', 'by-status', options.status)
    } else {
      methods = await db.getAll('methods')
    }

    // Sort by updatedAt desc
    methods.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    const total = methods.length
    if (options?.offset !== undefined) methods = methods.slice(options.offset)
    if (options?.limit !== undefined) methods = methods.slice(0, options.limit)

    return { items: methods, total }
  },

  async get(id: string): Promise<Method | undefined> {
    const db = await getDB()
    return db.get('methods', id)
  },

  async save(method: Method): Promise<void> {
    const db = await getDB()
    method.updatedAt = new Date().toISOString()
    await db.put('methods', method)
  },

  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('methods', id)
  },

  async count(): Promise<number> {
    const db = await getDB()
    return db.count('methods')
  },

  async countByStatus(status: string): Promise<number> {
    const db = await getDB()
    return db.countFromIndex('methods', 'by-status', status)
  },

  async getRecent(limit = 5): Promise<Method[]> {
    const db = await getDB()
    const all = await db.getAllFromIndex('methods', 'by-updated')
    return all.reverse().slice(0, limit)
  },

  async search(query: string, limit = 20): Promise<Method[]> {
    const db = await getDB()
    const all = await db.getAll('methods')
    const q = query.toLowerCase()
    return all
      .filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.aliases?.some(a => a.toLowerCase().includes(q)) ||
        m.content.summary?.toLowerCase().includes(q) ||
        m.tags?.some(t => t.toLowerCase().includes(q))
      )
      .slice(0, limit)
  }
}

// ============================================================
// Domains CRUD
// ============================================================

export const domainsDB = {
  async getAll(): Promise<Domain[]> {
    const db = await getDB()
    return db.getAll('domains')
  },

  async get(id: string): Promise<Domain | undefined> {
    const db = await getDB()
    return db.get('domains', id)
  },

  async save(domain: Domain): Promise<void> {
    const db = await getDB()
    domain.updatedAt = new Date().toISOString()
    await db.put('domains', domain)
  },

  async updateCount(domainId: string, delta: number): Promise<void> {
    const db = await getDB()
    const domain = await db.get('domains', domainId)
    if (domain) {
      domain.methodCount = Math.max(0, domain.methodCount + delta)
      domain.updatedAt = new Date().toISOString()
      await db.put('domains', domain)
    }
  }
}

// ============================================================
// Practices CRUD
// ============================================================

export const practicesDB = {
  async getAll(status?: string): Promise<Practice[]> {
    const db = await getDB()
    if (status) {
      return db.getAllFromIndex('practices', 'by-status', status)
    }
    const all = await db.getAll('practices')
    return all.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  },

  async get(id: string): Promise<Practice | undefined> {
    const db = await getDB()
    return db.get('practices', id)
  },

  async save(practice: Practice): Promise<void> {
    const db = await getDB()
    practice.updatedAt = new Date().toISOString()
    await db.put('practices', practice)
  },

  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('practices', id)
  },

  async count(): Promise<number> {
    const db = await getDB()
    return db.count('practices')
  }
}

// ============================================================
// Learning CRUD
// ============================================================

export const learningDB = {
  async getAllPlans(): Promise<LearningPlan[]> {
    const db = await getDB()
    return db.getAll('learningPlans')
  },

  async getPlan(id: string): Promise<LearningPlan | undefined> {
    const db = await getDB()
    return db.get('learningPlans', id)
  },

  async savePlan(plan: LearningPlan): Promise<void> {
    const db = await getDB()
    plan.updatedAt = new Date().toISOString()
    await db.put('learningPlans', plan)
  },

  async deletePlan(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('learningPlans', id)
  },

  async getTasksByPlan(planId: string): Promise<LearningTask[]> {
    const db = await getDB()
    return db.getAllFromIndex('learningTasks', 'by-plan', planId)
  },

  async getTasksByStatus(status: string): Promise<LearningTask[]> {
    const db = await getDB()
    return db.getAllFromIndex('learningTasks', 'by-status', status)
  },

  async saveTask(task: LearningTask): Promise<void> {
    const db = await getDB()
    await db.put('learningTasks', task)
  },

  async getMasteryRecord(methodId: string): Promise<MasteryRecord | undefined> {
    const db = await getDB()
    const records = await db.getAllFromIndex('masteryRecords', 'by-method', methodId)
    return records[0]
  },

  async saveMasteryRecord(record: MasteryRecord): Promise<void> {
    const db = await getDB()
    await db.put('masteryRecords', record)
  }
}

// ============================================================
// Research CRUD
// ============================================================

export const researchDB = {
  async getAllTasks(status?: string): Promise<ResearchTask[]> {
    const db = await getDB()
    if (status) {
      return db.getAllFromIndex('researchTasks', 'by-status', status)
    }
    const all = await db.getAll('researchTasks')
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async getTask(id: string): Promise<ResearchTask | undefined> {
    const db = await getDB()
    return db.get('researchTasks', id)
  },

  async saveTask(task: ResearchTask): Promise<void> {
    const db = await getDB()
    task.updatedAt = new Date().toISOString()
    await db.put('researchTasks', task)
  },

  async getAllReviews(status?: string): Promise<ReviewItem[]> {
    const db = await getDB()
    if (status) {
      return db.getAllFromIndex('reviewItems', 'by-status', status)
    }
    const all = await db.getAll('reviewItems')
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async getReview(id: string): Promise<ReviewItem | undefined> {
    const db = await getDB()
    return db.get('reviewItems', id)
  },

  async saveReview(item: ReviewItem): Promise<void> {
    const db = await getDB()
    await db.put('reviewItems', item)
  },

  async countPendingReviews(): Promise<number> {
    const db = await getDB()
    return db.countFromIndex('reviewItems', 'by-status', 'pending')
  }
}

// ============================================================
// Config
// ============================================================

export const configDB = {
  async getSystemConfig(): Promise<SystemConfig | undefined> {
    const db = await getDB()
    return db.get('systemConfig', 'main')
  },

  async saveSystemConfig(config: SystemConfig): Promise<void> {
    const db = await getDB()
    config.updatedAt = new Date().toISOString()
    await db.put('systemConfig', { ...config, id: 'main' } as SystemConfig & { id: string })
  },

  async getAllModelConfigs(): Promise<ModelConfig[]> {
    const db = await getDB()
    return db.getAll('modelConfigs')
  },

  async saveModelConfig(config: ModelConfig): Promise<void> {
    const db = await getDB()
    config.updatedAt = new Date().toISOString()
    await db.put('modelConfigs', config)
  },

  async deleteModelConfig(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('modelConfigs', id)
  }
}

// ============================================================
// Relations
// ============================================================

export const relationsDB = {
  async getByMethod(methodId: string): Promise<MethodRelation[]> {
    const db = await getDB()
    const from = await db.getAllFromIndex('relations', 'by-from', methodId)
    const to = await db.getAllFromIndex('relations', 'by-to', methodId)
    return [...from, ...to]
  },

  async getAll(): Promise<MethodRelation[]> {
    const db = await getDB()
    return db.getAll('relations')
  },

  async save(relation: MethodRelation): Promise<void> {
    const db = await getDB()
    await db.put('relations', relation)
  },

  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('relations', id)
  }
}

// ============================================================
// 通用缓存
// ============================================================

export const cacheDB = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await getDB()
      const item = await db.get('cache', key) as { data: T; expiresAt: number } | undefined
      if (!item) return null
      if (item.expiresAt < Date.now()) {
        await db.delete('cache', key)
        return null
      }
      return item.data
    } catch {
      return null
    }
  },

  async set<T>(key: string, data: T, ttlSeconds = 300): Promise<void> {
    try {
      const db = await getDB()
      await db.put('cache', {
        id: key,
        data,
        expiresAt: Date.now() + ttlSeconds * 1000
      } as { data: T; expiresAt: number } & { id: string })
    } catch {
      // 缓存失败不影响主流程
    }
  },

  async clear(): Promise<void> {
    const db = await getDB()
    await db.clear('cache')
  }
}

export { getDB }
