import React, { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../stores'
import MethodCard from '../components/MethodCard'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import DomainBadge from '../components/DomainBadge'

// ---- Domain metadata ----
const DOMAIN_IDS = [
  'management', 'personal_growth', 'thinking', 'work_efficiency',
  'communication', 'learning', 'business', 'life',
]

const domainNameMap: Record<string, string> = {
  management: '管理',
  personal_growth: '个人成长',
  thinking: '思维',
  work_efficiency: '工作效率',
  communication: '沟通',
  learning: '学习',
  business: '商业',
  life: '生活',
}

const domainIconMap: Record<string, string> = {
  management: '🏢',
  personal_growth: '🌱',
  thinking: '🧠',
  work_efficiency: '⚡',
  communication: '💬',
  learning: '📚',
  business: '💼',
  life: '🌿',
}

// Progress-bar colors (Tailwind safe-listed via inline style to avoid purge issues)
const domainBarColorMap: Record<string, string> = {
  management: '#3b82f6',
  personal_growth: '#22c55e',
  thinking: '#a855f7',
  work_efficiency: '#eab308',
  communication: '#ec4899',
  learning: '#06b6d4',
  business: '#f97316',
  life: '#84cc16',
}

// ---- Stat Card ----
interface StatCardProps {
  label: string
  value: number | string
  icon: string
  color: string
  sub?: string
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, sub }) => (
  <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-400 font-medium">{label}</span>
      <span className="text-xl">{icon}</span>
    </div>
    <div className={`text-3xl font-bold ${color}`}>{value}</div>
    {sub && <div className="text-xs text-slate-500">{sub}</div>}
  </div>
)

// ---- AI Recommendation chips ----
const AI_TIPS = [
  '📌 尝试"费曼学习法"加深对新概念的理解',
  '🔗 "GTD 时间管理"与"番茄工作法"可以组合使用',
  '🌟 本周进行中的实践已超 3 天，记得记录复盘日志',
  '💡 "心流理论"是提升专注力的高可信方法论，建议收藏',
]

// ---- Dashboard ----
const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const {
    stats,
    recentMethods,
    pendingReviews,
    domains,
    loading,
    initialize,
    loadDashboardStats,
    approveReview,
    rejectReview,
  } = useAppStore()

  const isLoading = loading['dashboard'] || !stats

  useEffect(() => {
    initialize()
  }, [initialize])

  const handleRefresh = useCallback(() => {
    loadDashboardStats()
  }, [loadDashboardStats])

  // Domain distribution data
  const totalMethods = stats?.totalMethods ?? 0
  const domainDistribution = stats?.domainDistribution ?? {}

  // Max count for scaling bars
  const maxDomainCount = Math.max(1, ...Object.values(domainDistribution))

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 space-y-6">

      {/* ---- Page Header ---- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">📊 工作台</h1>
          <p className="text-sm text-slate-400 mt-0.5">方法论知识库综合概览</p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-3 py-1.5 text-xs text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
        >
          🔄 刷新
        </button>
      </div>

      {/* ---- Stat Cards ---- */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="方法论总数"
              value={totalMethods}
              icon="📚"
              color="text-indigo-400"
              sub="已收录知识"
            />
            <StatCard
              label="待审核"
              value={stats?.pendingReviews ?? 0}
              icon="🔍"
              color={stats?.pendingReviews ? 'text-amber-400' : 'text-slate-400'}
              sub="AI 研究成果"
            />
            <StatCard
              label="进行中实践"
              value={stats?.activePractices ?? 0}
              icon="🚀"
              color="text-emerald-400"
              sub="实践项目"
            />
            <StatCard
              label="学习计划"
              value={stats?.activeLearningPlans ?? 0}
              icon="🎯"
              color="text-cyan-400"
              sub="进行中"
            />
          </div>

          {/* ---- Main Grid ---- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ---- Left: Domain Distribution ---- */}
            <div className="lg:col-span-1 bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-200">八大领域分布</h2>
                <span className="text-xs text-slate-500">共 {totalMethods} 条</span>
              </div>

              {/* Donut-style ring summary */}
              <div className="relative flex items-center justify-center py-4">
                <svg viewBox="0 0 120 120" className="w-28 h-28 -rotate-90">
                  {(() => {
                    let cumulativePercent = 0
                    const radius = 48
                    const circumference = 2 * Math.PI * radius
                    const domainEntries = DOMAIN_IDS.map((id) => ({
                      id,
                      count: domainDistribution[id] ?? 0,
                    })).filter(d => d.count > 0)

                    const totalCount = domainEntries.reduce((s, d) => s + d.count, 0) || 1

                    return domainEntries.map(({ id, count }) => {
                      const pct = count / totalCount
                      const strokeDasharray = `${pct * circumference} ${(1 - pct) * circumference}`
                      const strokeDashoffset = -cumulativePercent * circumference
                      cumulativePercent += pct
                      return (
                        <circle
                          key={id}
                          cx="60"
                          cy="60"
                          r={radius}
                          fill="none"
                          stroke={domainBarColorMap[id] ?? '#64748b'}
                          strokeWidth="12"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="butt"
                        />
                      )
                    })
                  })()}
                </svg>
                <div className="absolute text-center">
                  <div className="text-2xl font-bold text-slate-100">{totalMethods}</div>
                  <div className="text-[10px] text-slate-500">方法论</div>
                </div>
              </div>

              {/* Bar list */}
              <div className="space-y-2.5">
                {DOMAIN_IDS.map((id) => {
                  const count = domainDistribution[id] ?? 0
                  const pct = maxDomainCount > 0 ? Math.round((count / maxDomainCount) * 100) : 0
                  return (
                    <div key={id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          {domainIconMap[id]} {domainNameMap[id]}
                        </span>
                        <span className="text-slate-500">{count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: domainBarColorMap[id] ?? '#64748b' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ---- Right: Recent Methods + Pending Reviews ---- */}
            <div className="lg:col-span-2 space-y-5">

              {/* Recent Methods */}
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-200">🆕 最近新增</h2>
                  <button
                    onClick={() => navigate('/library')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    查看全部 →
                  </button>
                </div>

                {recentMethods.length === 0 ? (
                  <EmptyState
                    icon="📭"
                    title="暂无方法论"
                    description="尝试从知识库页面新建或通过 AI 研究添加"
                    action={{ label: '前往知识库', onClick: () => navigate('/library') }}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recentMethods.slice(0, 6).map((method) => (
                      <MethodCard
                        key={method.id}
                        method={method}
                        onClick={() => navigate(`/library/${method.id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Reviews */}
              {pendingReviews.length > 0 && (
                <div className="bg-slate-800/60 border border-amber-500/20 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-slate-200">
                      🔍 待审核
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-500/20 text-amber-300 rounded-full">
                        {pendingReviews.length}
                      </span>
                    </h2>
                    <button
                      onClick={() => navigate('/review')}
                      className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      审核全部 →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {pendingReviews.slice(0, 3).map((review) => (
                      <div
                        key={review.id}
                        className="flex items-start justify-between gap-3 p-3 bg-slate-700/40 rounded-lg border border-slate-700/50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-200 truncate">
                            {review.discoveredMethod?.draftMethod?.name ??
                              review.updatedMethod?.methodName ??
                              '未知方法论'}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {review.aiSummary}
                          </p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => approveReview(review.id)}
                            className="px-2 py-1 text-[11px] bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded transition-colors"
                          >
                            批准
                          </button>
                          <button
                            onClick={() => rejectReview(review.id, '不符合标准')}
                            className="px-2 py-1 text-[11px] bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded transition-colors"
                          >
                            拒绝
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ---- Bottom Row ---- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Today's Learning Tasks */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-200">📅 今日学习任务</h2>
                <button
                  onClick={() => navigate('/learning')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  全部计划 →
                </button>
              </div>
              {stats?.activeLearningPlans === 0 ? (
                <EmptyState
                  icon="🎓"
                  title="暂无学习计划"
                  description="创建学习计划，系统会安排每日任务和间隔复习"
                  action={{ label: '新建计划', onClick: () => navigate('/learning') }}
                />
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                    <span className="text-lg">📖</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-200">你有 {stats?.activeLearningPlans} 个进行中的学习计划</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">点击前往查看今日任务</p>
                    </div>
                    <button
                      onClick={() => navigate('/learning')}
                      className="shrink-0 px-2 py-1 text-[11px] bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 rounded transition-colors"
                    >
                      开始
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Practice Status + AI Tips */}
            <div className="space-y-4">
              {/* Practice */}
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-slate-200">🚀 实践项目状态</h2>
                  <button
                    onClick={() => navigate('/practice')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    查看全部 →
                  </button>
                </div>
                {stats?.activePractices === 0 ? (
                  <p className="text-xs text-slate-500 py-2">暂无进行中的实践项目</p>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <span className="text-2xl font-bold text-emerald-400">{stats?.activePractices}</span>
                    <div className="text-xs text-slate-400">个实践项目正在进行中，记得定期记录进展</div>
                  </div>
                )}
              </div>

              {/* AI Recommendation */}
              <div className="bg-slate-800/60 border border-purple-500/20 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-slate-200 mb-3">✨ AI 推荐</h2>
                <div className="space-y-2">
                  {AI_TIPS.slice(0, 2).map((tip, i) => (
                    <div
                      key={i}
                      className="text-xs text-slate-400 p-2.5 bg-slate-700/30 rounded-lg border border-slate-700/40 leading-relaxed"
                    >
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
