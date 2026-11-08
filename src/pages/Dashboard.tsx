import React, { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  BookOpen,
  RefreshCw,
  Compass,
  ChevronRight,
  Plus
} from 'lucide-react'
import { useAppStore } from '../stores'
import MethodCard from '../components/MethodCard'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

const DOMAIN_IDS = [
  'thinking', 'management', 'personal_growth', 'work_efficiency',
  'communication', 'learning', 'business', 'life',
]

const domainNameMap: Record<string, string> = {
  thinking: '思维模型',
  management: '管理与组织',
  personal_growth: '个人成长',
  work_efficiency: '工作效率',
  communication: '沟通谈判',
  learning: '学习管理',
  business: '商业经营',
  life: '生活实用',
}

const domainBarColorMap: Record<string, string> = {
  thinking: '#4f46e5',
  management: '#78716c',
  personal_growth: '#059669',
  work_efficiency: '#d97706',
  communication: '#0284c7',
  learning: '#0891b2',
  business: '#7c3aed',
  life: '#e11d48',
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
    className={`bg-white border border-stone-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between shadow-card transition-all duration-200 hover:border-stone-400 hover:shadow-float overflow-hidden ${
      onClick ? 'cursor-pointer active:scale-[0.98]' : ''
    }`}
  >
    <div className="flex items-center justify-between text-stone-500 gap-2 min-w-0">
      <span className="text-xs font-medium tracking-tight truncate">{label}</span>
      <span className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
        {icon}
      </span>
    </div>
    <div className="mt-2 min-w-0">
      <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-stone-900 truncate">{value}</div>
      {sub && <div className="text-[10px] sm:text-[11px] text-stone-500 mt-0.5 truncate">{sub}</div>}
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
    <div className="space-y-6">
      {/* 头部区：克制、优雅、无冗余重复 */}
      <div className="flex items-center justify-between gap-3 border-b border-stone-200/80 pb-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 truncate">认知工作台</h1>
          <p className="text-xs text-stone-500 mt-0.5 truncate">
            标准化结构、跨领域推演与实践复利总览
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('/library/new')}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新建档案</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner text="正在同步方法论资产体系..." />
        </div>
      ) : (
        <>
          {/* 4 核心指标卡片 (2x2 移动端网格，无文本溢出) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="收录方法论"
              value={totalMethods}
              sub="标准化核心档案"
              icon={<BookOpen className="w-3.5 h-3.5" />}
              onClick={() => navigate('/library')}
            />
            <StatCard
              label="待审核成果"
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

          {/* 待审核队列（若有成果积压，置顶提示） */}
          {pendingReviews.length > 0 && (
            <div className="card p-4 border-amber-300 bg-amber-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-900 truncate">
                    AI 深度研究成果待审核 ({pendingReviews.length})
                  </h2>
                </div>
                <button
                  onClick={() => navigate('/research')}
                  className="text-xs text-amber-800 hover:text-amber-950 flex items-center gap-1 font-medium shrink-0"
                >
                  <span>前往审核</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2">
                {pendingReviews.slice(0, 2).map((review) => (
                  <div
                    key={review.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-amber-200 shadow-soft"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-stone-900 truncate">
                        {review.discoveredMethod?.draftMethod?.name ?? '待收录方法论'}
                      </p>
                      <p className="text-[11px] text-stone-600 mt-0.5 line-clamp-1 break-words">
                        {review.aiSummary}
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => approveReview(review.id)}
                        className="px-2.5 py-1 text-[11px] bg-stone-900 text-white font-semibold rounded-lg hover:bg-stone-800 transition-colors shadow-soft"
                      >
                        批准
                      </button>
                      <button
                        onClick={() => rejectReview(review.id, '退回')}
                        className="px-2.5 py-1 text-[11px] bg-stone-100 text-stone-600 hover:text-stone-900 rounded-lg transition-colors border border-stone-200"
                      >
                        忽略
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 最近更新档案：首屏核心内容 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-700">精选与最近更新</h2>
                <span className="text-[10px] font-mono text-stone-400">({totalMethods} 条收录)</span>
              </div>
              <button
                onClick={() => navigate('/library')}
                className="text-xs text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1 font-medium"
              >
                <span>全部档案</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
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

          {/* 领域分布与认知洞察二分区 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">
            {/* 八大领域知识分布 */}
            <div className="card p-4.5 space-y-3 lg:col-span-1">
              <div className="flex items-center justify-between border-b border-stone-200/70 pb-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-800">八大领域分布</h2>
                <span className="text-[11px] font-mono text-stone-500">{totalMethods} 档案</span>
              </div>

              {/* 紧凑领域条目 */}
              <div className="space-y-2 pt-1">
                {DOMAIN_IDS.map((id) => {
                  const count = domainDistribution[id] ?? 0
                  const pct = maxDomainCount > 0 ? Math.round((count / maxDomainCount) * 100) : 0
                  return (
                    <div
                      key={id}
                      onClick={() => navigate(`/library?domain=${id}`)}
                      className="group cursor-pointer p-1 rounded-lg hover:bg-stone-50 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-stone-700 group-hover:text-stone-900 transition-colors text-xs truncate">
                          {domainNameMap[id]}
                        </span>
                        <span className="font-mono text-stone-500 text-[11px] shrink-0">{count}</span>
                      </div>
                      <div className="h-1 bg-stone-100 rounded-full overflow-hidden border border-stone-200/60">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: domainBarColorMap[id] ?? '#78716c' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* AI 推荐洞察 */}
            <div className="lg:col-span-2 space-y-3.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-700">深度认知组合推荐</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {AI_INSIGHTS.map((item, idx) => (
                  <div key={idx} className="card p-4 space-y-2 border-stone-200/80 bg-white shadow-card">
                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
                      <span>{item.tag}</span>
                      <Sparkles className="w-3 h-3 text-amber-500" />
                    </div>
                    <h3 className="text-xs font-bold text-stone-900">{item.title}</h3>
                    <p className="text-[11px] text-stone-600 leading-relaxed break-words">{item.desc}</p>
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
