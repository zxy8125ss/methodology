import React, { useEffect, useState } from 'react'
import {
  Target, BookOpen, Plus, Play, CheckCircle2, Clock, Calendar,
  TrendingUp, Award, Sparkles, MessageSquare, ChevronRight, X, AlertCircle, RefreshCw
} from 'lucide-react'
import { usePracticesStore, useLearningStore, useAppStore } from '../stores'
import { methodsDB } from '../services/db'
import { generatePracticeReview } from '../services/aiResearch'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import MarkdownRenderer from '../components/MarkdownRenderer'
import type { Practice, PracticeLog, LearningPlan, LearningTask, MasteryLevel, Method } from '../types'
import { v4 as uuidv4 } from 'uuid'

type MainTab = 'practice' | 'learning'

export default function PracticeAndLearning() {
  const [activeTab, setActiveTab] = useState<MainTab>('practice')
  const { practices, currentPractice, loadPractices, setPractice, savePractice, deletePractice } = usePracticesStore()
  const { plans, dueTasks, loadPlans, loadDueTasks, savePlan, deletePlan } = useLearningStore()
  const { addNotification } = useAppStore()

  // 模态框状态
  const [showNewPracticeModal, setShowNewPracticeModal] = useState(false)
  const [showNewPlanModal, setShowNewPlanModal] = useState(false)
  const [allMethods, setAllMethods] = useState<Method[]>([])

  useEffect(() => {
    loadPractices()
    loadPlans()
    loadDueTasks()
    methodsDB.getAll().then(res => setAllMethods(res.items))
  }, [loadPractices, loadPlans, loadDueTasks])

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 顶部标签切换 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">实践与学习中心</h1>
          <p className="text-sm text-zinc-400 mt-1">
            将方法论转化为真实行动与长效复利认知资产
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/80 flex items-center">
            <button
              onClick={() => setActiveTab('practice')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'practice'
                  ? 'bg-white text-zinc-950 font-semibold shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>实践闭环 ({practices.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('learning')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'learning'
                  ? 'bg-white text-zinc-950 font-semibold shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>学习计划 ({plans.length})</span>
            </button>
          </div>

          {activeTab === 'practice' ? (
            <button
              onClick={() => setShowNewPracticeModal(true)}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>发起实践</span>
            </button>
          ) : (
            <button
              onClick={() => setShowNewPlanModal(true)}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>制定计划</span>
            </button>
          )}
        </div>
      </div>

      {/* 选项卡内容 */}
      {activeTab === 'practice' ? (
        <PracticeSection
          practices={practices}
          currentPractice={currentPractice}
          onSelectPractice={setPractice}
          onSavePractice={savePractice}
          onDeletePractice={deletePractice}
          allMethods={allMethods}
        />
      ) : (
        <LearningSection
          plans={plans}
          dueTasks={dueTasks}
          onSavePlan={savePlan}
          allMethods={allMethods}
        />
      )}

      {/* 新建实践模态框 */}
      {showNewPracticeModal && (
        <NewPracticeModal
          isOpen={showNewPracticeModal}
          onClose={() => setShowNewPracticeModal(false)}
          allMethods={allMethods}
          onCreated={async (newP) => {
            await savePractice(newP)
            setPractice(newP)
            setShowNewPracticeModal(false)
            addNotification({ type: 'success', title: '实践项目已创建' })
          }}
        />
      )}

      {/* 新建学习计划模态框 */}
      {showNewPlanModal && (
        <NewPlanModal
          isOpen={showNewPlanModal}
          onClose={() => setShowNewPlanModal(false)}
          allMethods={allMethods}
          onCreated={async (newPlan) => {
            await savePlan(newPlan)
            setShowNewPlanModal(false)
            addNotification({ type: 'success', title: '学习计划已开启' })
          }}
        />
      )}
    </div>
  )
}

// ============================================================
// 实践中心子组件
// ============================================================

interface PracticeSectionProps {
  practices: Practice[]
  currentPractice: Practice | null
  onSelectPractice: (p: Practice | null) => void
  onSavePractice: (p: Practice) => Promise<void>
  onDeletePractice: (id: string) => Promise<void>
  allMethods: Method[]
}

function PracticeSection({
  practices,
  currentPractice,
  onSelectPractice,
  onSavePractice,
  onDeletePractice,
  allMethods
}: PracticeSectionProps) {
  const [reviewingAI, setReviewingAI] = useState(false)
  const [newLogContent, setNewLogContent] = useState('')
  const [evalOutcome, setEvalOutcome] = useState('')
  const [evalCompletion, setEvalCompletion] = useState<number>(80)
  const [evalProcessRating, setEvalProcessRating] = useState<number>(4)
  const [evalEffectRating, setEvalEffectRating] = useState<number>(4)

  const methodMap = new Map(allMethods.map(m => [m.id, m]))

  // 触发 AI 复盘
  const handleGenerateAIReview = async (practice: Practice) => {
    setReviewingAI(true)
    try {
      const methodNames = practice.methodIds.map(id => methodMap.get(id)?.name || id)
      const logsSummary = practice.execution?.logs?.map(l => `${l.date}: ${l.content}`).join('; ') || '无日志'
      const resultText = practice.evaluation?.summary || evalOutcome || '项目已完成'

      const res = await generatePracticeReview(
        practice.title,
        practice.problem,
        methodNames,
        logsSummary,
        resultText
      )

      if (res.success && res.review) {
        const updated: Practice = {
          ...practice,
          aiReview: {
            methodSelection: 'AI 综合评估',
            conditionsSatisfied: '已分析',
            executionQuality: '已分析',
            effectiveSteps: [],
            influencingFactors: [],
            alternativeExplanations: '',
            improvements: [],
            knowledgeBaseUpdate: false,
            updateSuggestions: res.review,
            generatedAt: new Date().toISOString(),
            model: 'Claude-3.5-Sonnet / Gemini'
          }
        }
        await onSavePractice(updated)
        onSelectPractice(updated)
      }
    } finally {
      setReviewingAI(false)
    }
  }

  // 勾选完成步骤
  const toggleStep = async (stepIdx: number) => {
    if (!currentPractice) return
    const nextSteps = [...(currentPractice.planning.steps || [])]
    const cur = nextSteps[stepIdx]
    nextSteps[stepIdx] = {
      ...cur,
      status: cur.status === 'done' ? 'in_progress' : 'done',
      completedAt: cur.status === 'done' ? undefined : new Date().toISOString()
    }

    const doneCount = nextSteps.filter(s => s.status === 'done').length
    const completionRate = Math.round((doneCount / nextSteps.length) * 100)

    const updated: Practice = {
      ...currentPractice,
      planning: { ...currentPractice.planning, steps: nextSteps },
      evaluation: { ...currentPractice.evaluation, goalCompletion: completionRate }
    }
    await onSavePractice(updated)
    onSelectPractice(updated)
  }

  // 记录新日志
  const handleAddLog = async () => {
    if (!currentPractice || !newLogContent.trim()) return
    const newLog: PracticeLog = {
      id: uuidv4(),
      date: new Date().toISOString().slice(0, 10),
      content: newLogContent.trim()
    }
    const updated: Practice = {
      ...currentPractice,
      execution: {
        ...currentPractice.execution,
        logs: [newLog, ...(currentPractice.execution?.logs || [])]
      }
    }
    await onSavePractice(updated)
    onSelectPractice(updated)
    setNewLogContent('')
  }

  // 保存评价
  const handleSaveEvaluation = async () => {
    if (!currentPractice) return
    const updated: Practice = {
      ...currentPractice,
      status: 'completed',
      evaluation: {
        ...currentPractice.evaluation,
        goalCompletion: evalCompletion,
        processRating: evalProcessRating,
        effectRating: evalEffectRating,
        summary: evalOutcome
      }
    }
    await onSavePractice(updated)
    onSelectPractice(updated)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 左侧实践列表 */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
          实践项目列表 ({practices.length})
        </div>

        {practices.length === 0 ? (
          <div className="card p-6 text-center text-zinc-500 text-sm">
            暂无实践项目，点击右上角“发起实践”建立第一个闭环。
          </div>
        ) : (
          <div className="space-y-2">
            {practices.map((p) => {
              const isSelected = currentPractice?.id === p.id
              const doneSteps = p.planning?.steps?.filter(s => s.status === 'done').length || 0
              const totalSteps = p.planning?.steps?.length || 0

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectPractice(p)}
                  className={`card p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-zinc-900/90 shadow-md shadow-blue-500/10'
                      : 'hover:border-zinc-700 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-zinc-100 text-sm line-clamp-1">{p.title}</h3>
                    <span className={`badge text-[10px] ${
                      p.status === 'completed' ? 'badge-green' :
                      p.status === 'in_progress' ? 'badge-blue' : 'badge-slate'
                    }`}>
                      {p.status === 'completed' ? '已完成' : p.status === 'in_progress' ? '进行中' : '计划中'}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{p.problem}</p>

                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {p.methodIds.map(id => {
                      const m = methodMap.get(id)
                      return (
                        <span key={id} className="badge bg-zinc-800/80 text-zinc-300 text-[10px]">
                          {m?.name || id}
                        </span>
                      )
                    })}
                  </div>

                  {totalSteps > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                        <span>执行进度</span>
                        <span>{doneSteps}/{totalSteps} 步骤 ({p.evaluation?.goalCompletion || 0}%)</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all"
                          style={{ width: `${p.evaluation?.goalCompletion || 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 右侧实践详情与闭环操作 */}
      <div className="lg:col-span-2">
        {!currentPractice ? (
          <div className="card p-12 text-center text-zinc-500">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-400" />
            <h3 className="text-zinc-300 font-medium mb-1">请选择左侧的实践项目</h3>
            <p className="text-xs text-zinc-500">查看执行步骤、记录过程日志、开展效果评价与 AI 复盘</p>
          </div>
        ) : (
          <div className="card p-6 space-y-6">
            {/* 项目头部 */}
            <div className="flex items-start justify-between gap-4 border-b border-zinc-800/60 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-zinc-100">{currentPractice.title}</h2>
                  <span className={`badge text-xs ${
                    currentPractice.status === 'completed' ? 'badge-green' : 'badge-blue'
                  }`}>
                    {currentPractice.status === 'completed' ? '已完成' : '进行中'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  <strong>解决问题：</strong> {currentPractice.problem}
                </p>
              </div>

              <button
                onClick={() => onDeletePractice(currentPractice.id)}
                className="text-xs text-zinc-500 hover:text-red-400"
              >
                删除项目
              </button>
            </div>

            {/* 关联方法论与方案 */}
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60 space-y-3">
              <div className="text-xs font-semibold text-blue-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>关联方法论与预期目标</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentPractice.methodIds.map(id => {
                  const m = methodMap.get(id)
                  return (
                    <span key={id} className="badge badge-blue text-xs">
                      {m?.name || id}
                    </span>
                  )
                })}
              </div>
              <div className="text-xs text-zinc-300">
                <strong>预期目标：</strong> {currentPractice.planning?.goal || currentPractice.planning?.expectedOutcome}
              </div>
            </div>

            {/* 执行步骤清单 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zinc-200 flex items-center justify-between">
                <span>执行步骤 ({currentPractice.planning?.steps?.filter(s => s.status === 'done').length || 0}/{currentPractice.planning?.steps?.length || 0})</span>
                <span className="text-xs font-normal text-zinc-400">点击勾选完成</span>
              </h3>

              <div className="space-y-2">
                {currentPractice.planning?.steps?.map((step, idx) => {
                  const isDone = step.status === 'done'
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isDone
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-zinc-400 line-through'
                          : 'bg-zinc-900/50 border-zinc-800 text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-blue-600"
                      />
                      <div className="flex-1 text-xs">
                        <div className="font-medium text-zinc-200">{step.title}</div>
                        {step.description && <div className="text-zinc-400 mt-0.5">{step.description}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 过程日志记录 */}
            <div className="space-y-3 pt-2 border-t border-zinc-800/60">
              <h3 className="text-sm font-semibold text-zinc-200">执行过程日志</h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLogContent}
                  onChange={(e) => setNewLogContent(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddLog()}
                  placeholder="记录今日执行进展、遇到的阻碍或关键发现..."
                  className="input text-xs flex-1"
                />
                <button onClick={handleAddLog} className="btn-secondary text-xs">
                  记录日志
                </button>
              </div>

              {currentPractice.execution?.logs && currentPractice.execution.logs.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {currentPractice.execution.logs.map(log => (
                    <div key={log.id} className="text-xs p-2.5 rounded bg-zinc-950/50 border border-zinc-900 flex justify-between gap-3">
                      <span className="text-zinc-300">{log.content}</span>
                      <span className="text-[10px] text-zinc-500 whitespace-nowrap">{log.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 效果评价与总结 */}
            <div className="space-y-3 pt-2 border-t border-zinc-800/60">
              <h3 className="text-sm font-semibold text-zinc-200">效果评价与反思</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-zinc-400 block mb-1">目标达成度 ({evalCompletion}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={evalCompletion}
                    onChange={(e) => setEvalCompletion(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">过程评价 ({evalProcessRating} / 5 星)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={evalProcessRating}
                    onChange={(e) => setEvalProcessRating(Number(e.target.value))}
                    className="input text-xs py-1"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">实际效果 ({evalEffectRating} / 5 星)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={evalEffectRating}
                    onChange={(e) => setEvalEffectRating(Number(e.target.value))}
                    className="input text-xs py-1"
                  />
                </div>
              </div>

              <div>
                <textarea
                  rows={2}
                  value={evalOutcome}
                  onChange={(e) => setEvalOutcome(e.target.value)}
                  placeholder="总结实际取得的效果、未达预期的原因与个人反思..."
                  className="textarea text-xs"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={handleSaveEvaluation}
                  className="btn-secondary text-xs"
                >
                  保存评价为已完成
                </button>

                <button
                  onClick={() => handleGenerateAIReview(currentPractice)}
                  disabled={reviewingAI}
                  className="btn bg-purple-600/30 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 text-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{reviewingAI ? 'AI 正在复盘...' : 'AI 深度实践复盘'}</span>
                </button>
              </div>
            </div>

            {/* AI 复盘报告 */}
            {currentPractice.aiReview?.updateSuggestions && (
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-3">
                <div className="flex items-center gap-2 text-purple-300 text-xs font-semibold">
                  <Sparkles className="w-4 h-4" />
                  <span>AI 智能实践复盘报告</span>
                </div>
                <div className="text-xs text-zinc-300">
                  <MarkdownRenderer content={currentPractice.aiReview.updateSuggestions} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// 学习中心子组件
// ============================================================

interface LearningSectionProps {
  plans: LearningPlan[]
  dueTasks: LearningTask[]
  onSavePlan: (plan: LearningPlan) => Promise<void>
  allMethods: Method[]
}

function LearningSection({ plans, dueTasks, onSavePlan, allMethods }: LearningSectionProps) {
  const methodMap = new Map(allMethods.map(m => [m.id, m]))

  return (
    <div className="space-y-6">
      {/* 顶部学习指标卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-xs text-zinc-400">进行中计划</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">{plans.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-zinc-400">待学习/复习任务</div>
          <div className="text-2xl font-bold text-yellow-400 mt-1">{dueTasks.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-zinc-400">知识掌握度</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">熟练应用</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-zinc-400">连续学习</div>
          <div className="text-2xl font-bold text-purple-400 mt-1">7 天</div>
        </div>
      </div>

      {/* 学习计划列表 */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-300">我的学习计划</h3>
        {plans.length === 0 ? (
          <div className="card p-8 text-center text-zinc-500 text-sm">
            暂无学习计划，点击右上角“制定计划”启动系统学习。
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map(plan => (
              <div key={plan.id} className="card p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-zinc-100 text-base">{plan.title}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{plan.description}</p>
                  </div>
                  <span className="badge badge-blue text-xs">
                    {plan.schedule.type === 'daily' ? '每日学习' : '专题学习'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {plan.methodIds.map(id => (
                    <span key={id} className="badge bg-zinc-800/80 text-zinc-300 text-[10px]">
                      {methodMap.get(id)?.name || id}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-zinc-800/60">
                  <div className="flex justify-between text-xs text-zinc-400 mb-1">
                    <span>学习进度</span>
                    <span>{plan.progress.completedTasks}/{plan.progress.totalTasks || plan.tasks?.length || 1} 课时</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{
                        width: `${Math.round(((plan.progress.completedTasks || 0) / Math.max(1, plan.progress.totalTasks || 1)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 待复习知识任务 */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
          <Clock className="w-4 h-4 text-yellow-400" />
          <span>待复习与测验任务 (间隔重复)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {dueTasks.length === 0 ? (
            <div className="card p-6 md:col-span-3 text-center text-zinc-500 text-xs">
              今日所有学习与复习任务已完成！保持节奏。
            </div>
          ) : (
            dueTasks.map(task => {
              const m = methodMap.get(task.methodId)
              return (
                <div key={task.id} className="card p-4 space-y-2 border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-100 text-sm">{m?.name || '方法论'}</span>
                    <span className="badge badge-yellow text-[10px]">复习到期</span>
                  </div>
                  <p className="text-xs text-zinc-400">{task.objective || m?.content?.summary}</p>
                  <button className="btn-primary text-xs w-full py-1.5 mt-2">
                    开始复习与测验
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 模态框：新建实践
// ============================================================

interface NewPracticeModalProps {
  isOpen: boolean
  onClose: () => void
  allMethods: Method[]
  onCreated: (p: Practice) => Promise<void>
}

function NewPracticeModal({ isOpen, onClose, allMethods, onCreated }: NewPracticeModalProps) {
  const [title, setTitle] = useState('')
  const [problem, setProblem] = useState('')
  const [selectedMethods, setSelectedMethods] = useState<string[]>([])
  const [goal, setGoal] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !problem.trim()) return

    setSubmitting(true)
    try {
      // 自动从所选方法论生成默认实施步骤
      const initialSteps: Practice['planning']['steps'] = []
      let order = 1
      for (const mId of selectedMethods) {
        const m = allMethods.find(x => x.id === mId)
        if (m?.content?.steps?.length) {
          for (const st of m.content.steps) {
            initialSteps.push({
              order: order++,
              title: `[${m.name}] ${st.title}`,
              description: st.description,
              status: 'pending'
            })
          }
        }
      }

      const newPractice: Practice = {
        id: `prac_${uuidv4().slice(0, 8)}`,
        title: title.trim(),
        problem: problem.trim(),
        methodIds: selectedMethods,
        planning: {
          goal: goal.trim() || '成功解决该问题并形成标准化沉淀',
          expectedOutcome: goal.trim(),
          plan: 'AI 辅助生成的执行闭环方案',
          steps: initialSteps.length ? initialSteps : [
            { order: 1, title: '定义问题与关键指标', description: '明确当前现状与预期目标差距', status: 'pending' },
            { order: 2, title: '制定并推进试点方案', description: '小步快跑，获取真实反馈', status: 'pending' },
            { order: 3, title: '检查成效并复盘', description: '对比目标与实际偏差', status: 'pending' }
          ],
          startDate: new Date().toISOString().slice(0, 10),
          estimatedCost: { time: '2周', effort: '每天 1 小时' }
        },
        execution: { logs: [] },
        evaluation: {
          goalCompletion: 0,
          processRating: 5,
          effectRating: 5,
          summary: '',
          longTermTracking: []
        },
        status: 'in_progress',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await onCreated(newPractice)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="发起新实践项目" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="label">实践项目主题 *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：提升 Q4 团队冲刺交付效率、攻坚核心算法性能重构"
            className="input text-sm"
          />
        </div>

        <div>
          <label className="label">要解决的实际问题 *</label>
          <textarea
            required
            rows={2}
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="详细描述当前遇到的困境或瓶颈..."
            className="textarea"
          />
        </div>

        <div>
          <label className="label">选择适用的方法论（可多选组合）</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-zinc-950/60 rounded-lg border border-zinc-800">
            {allMethods.map(m => {
              const checked = selectedMethods.includes(m.id)
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => {
                    setSelectedMethods(checked ? selectedMethods.filter(id => id !== m.id) : [...selectedMethods, m.id])
                  }}
                  className={`p-2 rounded text-left border transition-all text-xs ${
                    checked
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-medium'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="font-medium truncate">{m.name}</div>
                  <div className="text-[10px] text-zinc-500 truncate">{m.content.summary}</div>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="label">预期达成目标</label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="例如：交付延期率降低 30%，周会时长缩短至 45 分钟"
            className="input"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
          <button type="button" onClick={onClose} className="btn-ghost text-xs">取消</button>
          <button type="submit" disabled={submitting} className="btn-primary text-xs">
            {submitting ? '创建中...' : '确认发起实践'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ============================================================
// 模态框：新建学习计划
// ============================================================

interface NewPlanModalProps {
  isOpen: boolean
  onClose: () => void
  allMethods: Method[]
  onCreated: (plan: LearningPlan) => Promise<void>
}

function NewPlanModal({ isOpen, onClose, allMethods, onCreated }: NewPlanModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedMethods, setSelectedMethods] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setSubmitting(true)
    try {
      const planId = `plan_${uuidv4().slice(0, 8)}`
      const newPlan: LearningPlan = {
        id: planId,
        title: title.trim(),
        description: description.trim(),
        goal: { type: 'method', methodIds: selectedMethods },
        methodIds: selectedMethods,
        tasks: selectedMethods.map((mId, idx) => ({
          id: `task_${uuidv4().slice(0, 8)}`,
          planId,
          methodId: mId,
          objective: `系统掌握 ${allMethods.find(m => m.id === mId)?.name || mId} 的核心机理与实践边界`,
          materials: [],
          keyPoints: [],
          mastery: 'aware',
          scheduledAt: new Date(Date.now() + idx * 86400000 * 2).toISOString().slice(0, 10),
          reviewDates: [],
          status: idx === 0 ? 'in_progress' : 'pending'
        })),
        schedule: { type: 'weekly', dailyMinutes: 20 },
        progress: {
          totalTasks: selectedMethods.length,
          completedTasks: 0,
          masteryAvg: 1,
          streak: 1
        },
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await onCreated(newPlan)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="开启新系统学习计划" size="md">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="label">计划名称 *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：第一性原理与颠覆式思考专项突破"
            className="input text-sm"
          />
        </div>

        <div>
          <label className="label">计划简介</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="设定学习动机与预期收获..."
            className="textarea"
          />
        </div>

        <div>
          <label className="label">选入方法论</label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-zinc-950/60 rounded-lg border border-zinc-800">
            {allMethods.map(m => {
              const checked = selectedMethods.includes(m.id)
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => {
                    setSelectedMethods(checked ? selectedMethods.filter(id => id !== m.id) : [...selectedMethods, m.id])
                  }}
                  className={`p-2 rounded text-left border transition-all text-xs truncate ${
                    checked
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-medium'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {m.name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
          <button type="button" onClick={onClose} className="btn-ghost text-xs">取消</button>
          <button type="submit" disabled={submitting} className="btn-primary text-xs">
            {submitting ? '创建中...' : '确认开启计划'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
