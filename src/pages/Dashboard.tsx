import React, { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  Compass,
  Layers,
  ChevronRight
} from 'lucide-react'
import { useAppStore } from '../stores'
import MethodCard from '../components/MethodCard'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

const DOMAIN_IDS = [
  'management', 'personal_growth', 'thinking', 'work_efficiency',
  'communication', 'learning', 'business', 'life',
]

const domainNameMap: Record<string, string> = {
  management: '管理与组织',
  personal_growth: '个人成长',
  thinking: '思维模型',
  work_efficiency: '工作效率',
  communication: '沟通谈判',
  learning: '学习管理',
  business: '商业经营',
  life: '生活哲学',
}

const domainBarColorMap: Record<string, string> = {
  management: '#71717a',
  personal_growth: '#10b981',
  thinking: '#f4f4f5',
  work_efficiency: '#f59e0b',
  communication: '#a1a1aa',
  learning: '#0ea5e9',
  business: '#d4d4d8',
  life: '#84cc16',
}

interface StatCardProps {
  label: string
  value: number | string
  sub?: string
  icon: React.ReactNode
  onClick?: () => void
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-4.5 flex flex-col justify-between transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/90 hover:shadow-float ${
      onClick ? 'cursor-pointer' : ''
    }`}
  >
    <div className="flex items-center justify-between text-zinc-400">
      <span className="text-xs font-medium tracking-tight">{label}</span>
      <span className="w-6 h-6 rounded-lg bg-zinc-800/60 flex items-center justify-center text-zinc-300">
        {icon}
      </span>
    </div>
    <div className="mt-3">
      <div className="text-2xl font-bold font-mono tracking-tight text-white">{value}</div>
      {sub && <div className="text-[11px] text-zinc-400 mt-0.5">{sub}</div>}
    </div>
  </div>
)

const AI_INSIGHTS = [
  {
    tag: '思维模型',
    title: '第一性原理 × 费曼技巧',
    desc: '尝试将底层事实还原与以教促学结合，彻底击穿认知假象与术语迷雾。'
  },
  {
    tag: '执行闭环',
    title: 'OKR 与 双周 PDCA 冲刺',
    desc: '用野心目标明确方向，用高频敏捷循环持续纠偏，告别低价值虚忙。'
  }
]

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const {
    stats,
    recentMethods,
    pendingReviews,
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

  const totalMethods = stats?.totalMethods ?? 0
  const domainDistribution = stats?.domainDistribution ?? {}
  const maxDomainCount = Math.max(1, ...Object.values(domainDistribution))

  return (
    <div className="space-y-7">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Cogito · Overview</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">综合概览与认知工作台</h1>
          <p className="text-xs text-zinc-400 mt-1">
            标准化沉淀、关联推演与实践验证的个人方法论总览
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>刷新数据</span>
          </button>
          <button
            onClick={() => navigate('/library/new')}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <span>+ 新建方法论</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner text="正在同步方法论资产体系..." />
        </div>
      ) : (
        <>
          {/* 4 核心指标卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <StatCard
              label="收录方法论"
              value={totalMethods}
              sub="标准化核心档案"
              icon={<BookOpen className="w-3.5 h-3.5" />}
              onClick={() => navigate('/library')}
            />
            <StatCard
              label="AI 待审核成果"
              value={stats?.pendingReviews ?? 0}
              sub={stats?.pendingReviews ? '待人工检视入库' : '暂无积压'}
              icon={<Sparkles className="w-3.5 h-3.5" />}
              onClick={() => navigate('/research')}
            />
            <StatCard
              label="进行中实践"
              value={stats?.activePractices ?? 0}
              sub="现实问题验证中"
              icon={<Compass className="w-3.5 h-3.5" />}
              onClick={() => navigate('/practice')}
            />
            <StatCard
              label="活跃学习计划"
              value={stats?.activeLearningPlans ?? 0}
              sub="系统化认知进阶"
              icon={<TrendingUp className="w-3.5 h-3.5" />}
              onClick={() => navigate('/practice')}
            />
          </div>

          {/* 主工作区二分网格 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：八大领域知识分布图 */}
            <div className="card p-5 space-y-4 lg:col-span-1">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">八大领域分布</h2>
                <span className="text-[11px] font-mono text-zinc-500">{totalMethods} 档案</span>
              </div>

              {/* 极简环形概览 */}
              <div className="relative flex items-center justify-center py-2">
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
                          stroke={domainBarColorMap[id] ?? '#52525b'}
                          strokeWidth="10"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-500"
                        />
                      )
                    })
                  })()}
                </svg>
                <div className="absolute text-center">
                  <div className="text-xl font-bold font-mono text-white">{totalMethods}</div>
                  <div className="text-[10px] text-zinc-500">Methodology</div>
                </div>
              </div>

              {/* 领域进度条列表 */}
              <div className="space-y-2 pt-1">
                {DOMAIN_IDS.map((id) => {
                  const count = domainDistribution[id] ?? 0
                  const pct = maxDomainCount > 0 ? Math.round((count / maxDomainCount) * 100) : 0
                  return (
                    <div
                      key={id}
                      onClick={() => navigate(`/library?domain=${id}`)}
                      className="group cursor-pointer p-1.5 rounded-lg hover:bg-zinc-800/40 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors">
                          {domainNameMap[id]}
                        </span>
                        <span className="font-mono text-zinc-500 text-[11px]">{count}</span>
                      </div>
                      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: domainBarColorMap[id] ?? '#71717a' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 右侧：最近收录 + 待审核队列 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 最近收录 */}
              <div className="card p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">最近更新档案</h2>
                  <button
                    onClick={() => navigate('/library')}
                    className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <span>浏览全部</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {recentMethods.length === 0 ? (
                  <EmptyState
                    icon="📭"
                    title="知识库尚无档案"
                    description="点击新建方法论或进入 AI 研究中心主动探索"
                    action={{ label: '新建方法论', onClick: () => navigate('/library/new') }}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {recentMethods.slice(0, 4).map((method) => (
                      <MethodCard
                        key={method.id}
                        method={method}
                        onClick={() => navigate(`/library/${method.id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* 待审核队列（若有） */}
              {pendingReviews.length > 0 && (
                <div className="card p-5 border-amber-900/40 bg-amber-950/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                        AI 研究成果待审核 ({pendingReviews.length})
                      </h2>
                    </div>
                    <button
                      onClick={() => navigate('/research')}
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                    >
                      <span>前往审核队列</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {pendingReviews.slice(0, 2).map((review) => (
                      <div
                        key={review.id}
                        className="flex items-start justify-between gap-3 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-zinc-200 truncate">
                            {review.discoveredMethod?.draftMethod?.name ?? '待收录方法论'}
                          </p>
                          <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                            {review.aiSummary}
                          </p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => approveReview(review.id)}
                            className="px-2.5 py-1 text-[11px] bg-white text-zinc-950 font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
                          >
                            批准
                          </button>
                          <button
                            onClick={() => rejectReview(review.id, '退回')}
                            className="px-2.5 py-1 text-[11px] bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors"
                          >
                            忽略
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI 推荐洞察 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {AI_INSIGHTS.map((item, idx) => (
                  <div key={idx} className="card p-4 space-y-2 border-zinc-800/60 bg-zinc-900/40">
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                      <span>{item.tag}</span>
                      <Sparkles className="w-3 h-3 text-zinc-400" />
                    </div>
                    <h3 className="text-xs font-semibold text-zinc-200">{item.title}</h3>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
