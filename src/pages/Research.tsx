import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useResearchStore, useAppStore } from '../stores'
import { runResearchTask } from '../services/aiResearch'
import { researchDB } from '../services/db'
import { v4 as uuidv4 } from 'uuid'
import type { ResearchTask, ReviewItem } from '../types'
import ResearchTaskCard from '../components/ResearchTaskCard'
import ReviewItemCard from '../components/ReviewItemCard'
import Modal from '../components/Modal'

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
      addNotification({ type: 'success', title: '研究任务已创建', message: `将研究：${task.title}` })
      setTopicsText('')
      onCreated()
      onClose()

      // 异步启动研究
      startResearch(task)
    } catch (err) {
      addNotification({ type: 'error', title: '创建失败', message: (err as Error).message })
    } finally {
      setLoading(false)
    }
  }

  async function startResearch(task: ResearchTask) {
    const { saveTask, loadTasks } = useResearchStore.getState()
    const { addNotification: notify } = useAppStore.getState()

    try {
      // 更新为进行中
      await saveTask({ ...task, status: 'in_progress', progress: 5, updatedAt: new Date().toISOString() })

      const result = await runResearchTask(task, async (progress, _msg) => {
        await saveTask({ ...task, status: 'in_progress', progress, updatedAt: new Date().toISOString() })
        await loadTasks()
      })

      if (result.success && result.reviewItems && result.reviewItems.length > 0) {
        for (const item of result.reviewItems) {
          await researchDB.saveReview(item)
        }
        await saveTask({
          ...task,
          status: 'pending_review',
          progress: 100,
          updatedAt: new Date().toISOString(),
        })
        notify({
          type: 'success',
          title: '研究完成',
          message: `发现 ${result.reviewItems.length} 个方法论待审核`,
        })
      } else {
        await saveTask({
          ...task,
          status: result.success ? 'completed' : 'failed',
          progress: 100,
          error: result.error,
          updatedAt: new Date().toISOString(),
        })
        if (!result.success) {
          notify({ type: 'error', title: '研究失败', message: result.error })
        }
      }
      await loadTasks()
    } catch (err) {
      await saveTask({
        ...task,
        status: 'failed',
        progress: 0,
        error: (err as Error).message,
        updatedAt: new Date().toISOString(),
      })
      await useResearchStore.getState().loadTasks()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="发起新研究" size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            研究主题
            <span className="text-gray-500 font-normal ml-1">（每行一个主题）</span>
          </label>
          <textarea
            value={topicsText}
            onChange={(e) => setTopicsText(e.target.value)}
            rows={5}
            placeholder={'PDCA 循环\n第一性原理\nOKR 目标管理'}
            className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500 resize-none"
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-1">
            已输入 {topicsText.split('\n').filter((t) => t.trim()).length} 个主题
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">研究深度</label>
          <div className="flex gap-2">
            {(['basic', 'standard', 'deep'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setDepthLevel(level)}
                className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                  depthLevel === level
                    ? 'border-blue-500 bg-blue-900/40 text-blue-300'
                    : 'border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                {level === 'basic' ? '基础' : level === 'standard' ? '标准' : '深度'}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {depthLevel === 'basic' ? '快速概览，token 消耗少' : depthLevel === 'standard' ? '均衡深度与速度' : '深度研究，需要更多时间'}
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-600 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !topicsText.trim()}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
          >
            {loading ? '创建中...' : '开始研究'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ============================================================
// 任务详情模态框
// ============================================================

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
            <span className="text-gray-500">任务 ID</span>
            <p className="text-gray-300 font-mono text-xs mt-0.5 truncate">{task.id}</p>
          </div>
          <div>
            <span className="text-gray-500">研究深度</span>
            <p className="text-gray-300 mt-0.5">{task.config.depthLevel}</p>
          </div>
          <div>
            <span className="text-gray-500">使用模型</span>
            <p className="text-gray-300 mt-0.5 truncate">{task.config.model}</p>
          </div>
          <div>
            <span className="text-gray-500">优先级</span>
            <p className="text-gray-300 mt-0.5">{task.priority}</p>
          </div>
        </div>

        <div>
          <span className="text-gray-500">研究主题</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {task.targetTopics.map((t, i) => (
              <span key={i} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-md">
                {t}
              </span>
            ))}
          </div>
        </div>

        {task.error && (
          <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-3 text-red-300 text-xs">
            <strong>错误：</strong> {task.error}
          </div>
        )}

        {task.startedAt && (
          <div className="text-xs text-gray-500">
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
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* 页头 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">AI 深度研究中心</h1>
            <p className="text-gray-400 text-sm mt-1">自动化研究方法论，构建知识库</p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-900/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            发起新研究
          </button>
        </div>

        {/* 标签页 */}
        <div className="flex gap-1 p-1 bg-gray-800/60 rounded-xl mb-6 w-fit">
          {[
            { key: 'tasks', label: '研究任务', count: tasks.length },
            { key: 'review', label: '审核队列', count: pendingReviews.length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key as 'tasks' | 'review')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === key ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {label}
              {count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    tab === key ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
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
              <div className="text-center py-20 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p>还没有研究任务</p>
                <button
                  onClick={() => setShowNewModal(true)}
                  className="mt-3 text-blue-400 hover:text-blue-300 text-sm underline"
                >
                  发起第一个研究
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div>
            {/* 批量操作栏 */}
            {pendingItems.length > 0 && (
              <div className="flex items-center justify-between mb-4 bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-2.5">
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
                    className="accent-blue-500 w-4 h-4"
                  />
                  <span className="text-sm text-gray-400">
                    {selectedIds.size > 0 ? `已选 ${selectedIds.size} 条` : `共 ${pendingItems.length} 条待审核`}
                  </span>
                </div>
                {selectedIds.size > 0 && (
                  <button
                    onClick={handleBatchApprove}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    批量批准 ({selectedIds.size})
                  </button>
                )}
              </div>
            )}

            {/* 待审核 */}
            {pendingItems.length > 0 && (
              <div className="space-y-4 mb-8">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">待审核</h2>
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
            )}

            {/* 已处理 */}
            {processedItems.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">已处理</h2>
                {processedItems.map((item) => (
                  <ReviewItemCard
                    key={item.id}
                    item={item}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </div>
            )}

            {pendingItems.length === 0 && processedItems.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p>审核队列为空</p>
              </div>
            )}
          </div>
        )}
      </div>

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
