import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useResearchStore, useAppStore } from '../stores'
import { runResearchTask } from '../services/aiResearch'
import { v4 as uuidv4 } from 'uuid'
import type { ResearchTask, ReviewItem } from '../types'
import ResearchTaskCard from '../components/ResearchTaskCard'
import ReviewItemCard from '../components/ReviewItemCard'
import Modal from '../components/Modal'
import { Plus, Sparkles, CheckCheck } from 'lucide-react'

// ============================================================
// 新建研究模态框
// ============================================================

interface NewResearchModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

function NewResearchModal({ isOpen, onClose, onCreated }: NewResearchModalProps) {
  const [topicsText, setTopicsText] = useState('')
  const [depthLevel, setDepthLevel] = useState<'basic' | 'standard' | 'deep'>('standard')
  const [loading, setLoading] = useState(false)
  const { saveTask } = useResearchStore()
  const { addNotification, systemConfig } = useAppStore()

  const handleSubmit = async () => {
    const topics = topicsText
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean)

    if (topics.length === 0) {
      addNotification({ type: 'error', title: '请输入至少一个研究主题' })
      return
    }

    setLoading(true)
    try {
      const task: ResearchTask = {
        id: uuidv4(),
        title: topics.length === 1 ? topics[0] : `批量研究：${topics[0]} 等 ${topics.length} 个主题`,
        description: topics.join('、'),
        targetMethodIds: [],
        targetTopics: topics,
        domains: [],
        priority: 'medium',
        config: {
          model: systemConfig?.ai?.defaultModel ?? 'claude-3-5-sonnet-20241022',
          webSearch: false,
          maxSources: 10,
          depthLevel,
        },
        status: 'queued',
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isAutomatic: false,
      }

      await saveTask(task)
      addNotification({ type: 'success', title: '任务已创建并加入队列' })
      onCreated()
      onClose()

      // 后台触发执行
      runResearchTask(task).catch((err) => {
        console.error('Research task failed:', err)
      })
    } catch (err) {
      addNotification({ type: 'error', title: '创建失败', message: (err as Error).message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="发起 AI 深度研究任务">
      <div className="space-y-4">
        <div>
          <label className="label">研究主题（每行一个）</label>
          <textarea
            value={topicsText}
            onChange={(e) => setTopicsText(e.target.value)}
            placeholder="例如：&#10;第一性原理思维在组织管理中的应用&#10;PDCA 循环与 OKR 体系的结合实践&#10;费曼技巧与知识内化"
            rows={5}
            className="textarea w-full text-xs"
          />
        </div>

        <div>
          <label className="label">研究深度</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'basic', label: '基础梳理', desc: '提炼核心观点与步骤' },
              { id: 'standard', label: '标准研究', desc: '包含出处、案例与局限' },
              { id: 'deep', label: '深度探究', desc: '跨领域关联与去重审查' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDepthLevel(d.id as any)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  depthLevel === d.id
                    ? 'border-stone-900 bg-stone-900 text-white shadow-soft'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                }`}
              >
                <div className="font-semibold text-xs">{d.label}</div>
                <div className={`text-[10px] mt-0.5 ${depthLevel === d.id ? 'text-stone-300' : 'text-stone-500'}`}>
                  {d.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
          <button type="button" onClick={onClose} className="btn-secondary text-xs">
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary text-xs"
          >
            {loading ? '创建中...' : '立即启动'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function TaskDetailModal({
  task,
  onClose,
}: {
  task: ResearchTask | null
  onClose: () => void
}) {
  if (!task) return null

  return (
    <Modal isOpen={!!task} onClose={onClose} title="研究任务详情" size="lg">
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-stone-500 text-xs">任务 ID</span>
            <p className="text-stone-800 font-mono text-xs mt-0.5 truncate">{task.id}</p>
          </div>
          <div>
            <span className="text-stone-500 text-xs">研究深度</span>
            <p className="text-stone-800 mt-0.5">{task.config.depthLevel}</p>
          </div>
          <div>
            <span className="text-stone-500 text-xs">使用模型</span>
            <p className="text-stone-800 mt-0.5 truncate">{task.config.model}</p>
          </div>
          <div>
            <span className="text-stone-500 text-xs">优先级</span>
            <p className="text-stone-800 mt-0.5">{task.priority}</p>
          </div>
        </div>

        <div>
          <span className="text-stone-500 text-xs">研究主题</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {task.targetTopics.map((t, i) => (
              <span key={i} className="text-xs bg-stone-100 text-stone-700 border border-stone-200 px-2 py-1 rounded-md">
                {t}
              </span>
            ))}
          </div>
        </div>

        {task.error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-800 text-xs">
            <strong>错误：</strong> {task.error}
          </div>
        )}

        {task.startedAt && (
          <div className="text-xs text-stone-500">
            开始于：{new Date(task.startedAt).toLocaleString('zh-CN')}
            {task.completedAt && ` · 完成于：${new Date(task.completedAt).toLocaleString('zh-CN')}`}
          </div>
        )}
      </div>
    </Modal>
  )
}

// ============================================================
// 主页面
// ============================================================

export default function Research() {
  const [tab, setTab] = useState<'tasks' | 'review'>('tasks')
  const [showNewModal, setShowNewModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<ResearchTask | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const { tasks, allReviews, loadTasks, loadAllReviews } = useResearchStore()
  const { pendingReviews, approveReview, rejectReview, addNotification } = useAppStore()

  // 合并所有审核条目（待审核 + 已处理）
  const reviewItems: ReviewItem[] = tab === 'review' ? allReviews : []

  // 轮询任务状态（每 5 秒）
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    loadTasks()
    loadAllReviews()
    pollRef.current = setInterval(() => {
      const hasActive = useResearchStore.getState().tasks.some(
        (t) => t.status === 'in_progress' || t.status === 'queued'
      )
      if (hasActive) {
        loadTasks()
      }
    }, 5000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [loadTasks, loadAllReviews])

  const handleApprove = useCallback(
    async (id: string) => {
      await approveReview(id)
      await loadAllReviews()
    },
    [approveReview, loadAllReviews]
  )

  const handleReject = useCallback(
    async (id: string, reason: string) => {
      await rejectReview(id, reason)
      await loadAllReviews()
    },
    [rejectReview, loadAllReviews]
  )

  const handleBatchApprove = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    for (const id of ids) {
      await approveReview(id)
    }
    await loadAllReviews()
    setSelectedIds(new Set())
    addNotification({ type: 'success', title: `已批量批准 ${ids.length} 条` })
  }

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      checked ? next.add(id) : next.delete(id)
      return next
    })
  }

  const pendingItems = reviewItems.filter((r) => r.status === 'pending')
  const processedItems = reviewItems.filter((r) => r.status !== 'pending')

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500">Cogito · AI Research</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">AI 深度研究中心</h1>
          <p className="text-xs text-stone-500 mt-0.5">自动化挖掘经典与前沿方法论，建立标准化档案与证据链</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="btn-primary text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>发起新研究</span>
        </button>
      </div>

      {/* 标签页 */}
      <div className="flex gap-1 p-1 bg-stone-100 rounded-xl w-fit border border-stone-200">
        {[
          { key: 'tasks', label: '研究任务', count: tasks.length },
          { key: 'review', label: '审核队列', count: pendingReviews.length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key as 'tasks' | 'review')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tab === key
                ? 'bg-stone-900 text-white shadow-soft font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>{label}</span>
            {count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  tab === key ? 'bg-stone-800 text-stone-200' : 'bg-stone-200 text-stone-600'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ---- 研究任务 ---- */}
      {tab === 'tasks' && (
        <div>
          {tasks.length === 0 ? (
            <div className="text-center py-20 text-stone-500 card p-8">
              <Sparkles className="w-10 h-10 mx-auto mb-2 text-stone-400 opacity-60" />
              <p className="text-sm font-medium text-stone-800">暂无正在运行的研究任务</p>
              <p className="text-xs text-stone-500 mt-1">输入任意领域或具体问题，AI 将主动研究其源起、原理和实践步骤</p>
              <button
                onClick={() => setShowNewModal(true)}
                className="mt-4 btn-primary text-xs"
              >
                发起第一个研究
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {tasks.map((task) => (
                <ResearchTaskCard
                  key={task.id}
                  task={task}
                  onClick={() => setSelectedTask(task)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---- 审核队列 ---- */}
      {tab === 'review' && (
        <div className="space-y-4">
          {/* 批量操作栏 */}
          {pendingItems.length > 0 && (
            <div className="flex items-center justify-between card px-4 py-2.5">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.size === pendingItems.length && pendingItems.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(new Set(pendingItems.map((r) => r.id)))
                    } else {
                      setSelectedIds(new Set())
                    }
                  }}
                  className="accent-stone-900 w-4 h-4"
                />
                <span className="text-xs text-stone-600">
                  {selectedIds.size > 0 ? `已选 ${selectedIds.size} 条` : `共 ${pendingItems.length} 条待审核成果`}
                </span>
              </div>
              {selectedIds.size > 0 && (
                <button
                  onClick={handleBatchApprove}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>批量批准入库 ({selectedIds.size})</span>
                </button>
              )}
            </div>
          )}

          {/* 待审核 */}
          {pendingItems.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-stone-600 uppercase tracking-wider">待审核成果</h2>
              <div className="space-y-3">
                {pendingItems.map((item) => (
                  <ReviewItemCard
                    key={item.id}
                    item={item}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    selected={selectedIds.has(item.id)}
                    onSelect={toggleSelect}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 已处理 */}
          {processedItems.length > 0 && (
            <div className="space-y-3 pt-4">
              <h2 className="text-xs font-semibold text-stone-600 uppercase tracking-wider">历史审核记录</h2>
              <div className="space-y-3">
                {processedItems.map((item) => (
                  <ReviewItemCard
                    key={item.id}
                    item={item}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </div>
            </div>
          )}

          {pendingItems.length === 0 && processedItems.length === 0 && (
            <div className="text-center py-20 text-stone-500 card p-8">
              <Sparkles className="w-10 h-10 mx-auto mb-2 text-stone-400 opacity-60" />
              <p className="text-sm font-medium text-stone-800">审核队列已清空</p>
              <p className="text-xs text-stone-500 mt-1">AI 完成深度研究与查重校验后，将在此生成审核卡片</p>
            </div>
          )}
        </div>
      )}

      {/* 模态框 */}
      <NewResearchModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreated={() => { loadTasks(); loadAllReviews() }}
      />
      <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
    </div>
  )
}
