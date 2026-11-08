import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Compass,
  TrendingUp,
  Search,
  Plus,
  Layers,
  ChevronRight,
  Lightbulb
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

const CLAUDE_PROMPTS = [
  {
    label: '第一性原理 × 费曼技巧',
    query: '如何结合第一性原理与费曼技巧穿透业务本质？',
    desc: '还原底层事实，击穿术语假象'
  },
  {
    label: 'OKR × PDCA 双周冲刺',
    query: '面对复杂多变的目标，如何用 OKR 与双周 PDCA 建立坚固执行闭环？',
    desc: '方向明确，敏捷纠偏，告别虚忙'
  },
  {
    label: '心流状态与深度工作',
    query: '注意力碎片化严重，怎样打造高沉浸的心流深度工作系统？',
    desc: '阻断认知损耗，守护高价值产出'
  },
  {
    label: '逆向思维与事前验尸法',
    query: '重大决策前夕，如何运用逆向思维与事前验尸法防范黑天鹅？',
    desc: '预设彻底溃败，反推最脆弱节点'
  }
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [promptText, setPromptText] = useState('')
  const {
    stats,
    recentMethods,
    pendingReviews,
    loading,
    initialize,
    approveReview,
    rejectReview,
  } = useAppStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  const isLoading = loading['dashboard'] || !stats
  const totalMethods = stats?.totalMethods ?? 0
  const domainDistribution = stats?.domainDistribution ?? {}
  const maxDomainCount = Math.max(1, ...Object.values(domainDistribution))

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!promptText.trim()) return
    navigate(`/search?q=${encodeURIComponent(promptText.trim())}`)
  }

  const handlePromptClick = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* ============================================================
          1. Claude 沉浸式 Hero 探索区 (Anthropic Editorial Design)
         ============================================================ */}
      <section className="text-center sm:text-left space-y-4 pt-1 sm:pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF0EB] border border-[#F0DED3] text-[11px] text-[#B8684D] font-medium font-sans">
          <Sparkles className="w-3.5 h-3.5 text-[#CC785C]" />
          <span>Cogito · 个人方法论与认知推演系统</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#1F1E1B] tracking-tight">
            探索认知边界，推演系统解法
          </h1>
          <button
            onClick={() => navigate('/library/new')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#68645C] hover:text-[#1F1E1B] bg-white border border-[#EAE6DF] rounded-xl hover:border-[#D4CEBF] transition-all shadow-soft shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-[#CC785C]" />
            <span>新建档案</span>
          </button>
        </div>

        <p className="text-xs sm:text-sm text-[#57534D] font-sans leading-relaxed max-w-2xl">
          收录人类顶尖认知框架与决策工具。面对现实复杂难题，让 AI 跨模型推演、解构矛盾，形成严密闭环。
        </p>

        {/* Claude 风格中心推演输入框 */}
        <form onSubmit={handlePromptSubmit} className="pt-2">
          <div className="relative bg-white border border-[#EAE6DF] focus-within:border-[#CC785C] focus-within:ring-2 focus-within:ring-[#CC785C]/20 rounded-2xl p-2 sm:p-2.5 transition-all shadow-card flex items-center gap-2">
            <Search className="w-4 h-4 text-[#8C877D] ml-2 shrink-0" />
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="输入面临的挑战、目标或决策困局（如：团队跨部门协作阻力、战略执行滞后）..."
              className="w-full bg-transparent border-none py-2 text-xs sm:text-sm text-[#1F1E1B] placeholder-[#9E9A90] focus:outline-none min-w-0"
            />
            <button
              type="submit"
              disabled={!promptText.trim()}
              className="px-4 py-2 bg-[#CC785C] hover:bg-[#B8684D] active:bg-[#A2583F] disabled:opacity-40 text-white rounded-xl text-xs font-medium transition-all shadow-soft shrink-0 flex items-center gap-1.5"
            >
              <span>推演</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* 启发式场景提示词胶囊 */}
        <div className="flex flex-wrap gap-2 pt-1">
          {CLAUDE_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handlePromptClick(item.query)}
              className="text-left px-2.5 py-1.5 rounded-xl bg-white border border-[#EAE6DF] hover:border-[#CC785C]/60 hover:bg-[#FAF8F5] transition-all text-[11px] text-[#57534D] hover:text-[#1F1E1B] shadow-soft flex items-center gap-1.5 group"
            >
              <Lightbulb className="w-3 h-3 text-[#CC785C] shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ============================================================
          2. 极简认知资产脉搏 (替代臃肿冷冰的 CRM 计数卡)
         ============================================================ */}
      <section className="bg-white border border-[#EAE6DF] rounded-2xl p-4 shadow-soft">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-[#F4F2EC]">
          <div
            onClick={() => navigate('/library')}
            className="cursor-pointer p-2 flex flex-col justify-between hover:opacity-80 transition-opacity"
          >
            <span className="text-[11px] text-[#8C877D]">已收录方法论</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-serif text-xl sm:text-2xl font-medium text-[#1F1E1B]">{totalMethods}</span>
              <span className="text-[11px] text-[#A39E93]">套模型</span>
            </div>
          </div>

          <div
            onClick={() => navigate('/library')}
            className="cursor-pointer p-2 sm:pl-4 flex flex-col justify-between hover:opacity-80 transition-opacity"
          >
            <span className="text-[11px] text-[#8C877D]">核心覆盖领域</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-serif text-xl sm:text-2xl font-medium text-[#1F1E1B]">8</span>
              <span className="text-[11px] text-[#A39E93]">大分支</span>
            </div>
          </div>

          <div
            onClick={() => navigate('/practice')}
            className="cursor-pointer p-2 sm:pl-4 flex flex-col justify-between hover:opacity-80 transition-opacity"
          >
            <span className="text-[11px] text-[#8C877D]">现实行动验证</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-serif text-xl sm:text-2xl font-medium text-[#1F1E1B]">{stats?.activePractices ?? 0}</span>
              <span className="text-[11px] text-[#A39E93]">项进行中</span>
            </div>
          </div>

          <div
            onClick={() => navigate('/research')}
            className="cursor-pointer p-2 sm:pl-4 flex flex-col justify-between hover:opacity-80 transition-opacity"
          >
            <span className="text-[11px] text-[#8C877D]">AI 深度研究</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-serif text-xl sm:text-2xl font-medium text-[#CC785C]">
                {stats?.pendingReviews ? `${stats.pendingReviews} 待审` : '就绪'}
              </span>
              <span className="text-[11px] text-[#A39E93]">全域扫描</span>
            </div>
          </div>
        </div>
      </section>

      {/* 待审核队列（若有成果积压，优雅收纳） */}
      {pendingReviews.length > 0 && (
        <section className="bg-[#FAF0EB] border border-[#F0DED3] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-[#CC785C] shrink-0" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9E543C] truncate">
                AI 深度研究发现待入库成果 ({pendingReviews.length})
              </h2>
            </div>
            <button
              onClick={() => navigate('/research')}
              className="text-xs text-[#9E543C] hover:text-[#6B3827] flex items-center gap-1 font-medium shrink-0"
            >
              <span>查看全部</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {pendingReviews.slice(0, 2).map((review) => (
              <div
                key={review.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-[#F0DED3] shadow-soft"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-serif font-medium text-[#1F1E1B] truncate">
                    {review.discoveredMethod?.draftMethod?.name ?? '待收录方法论'}
                  </p>
                  <p className="text-[11px] text-[#57534D] mt-0.5 line-clamp-1 break-words">
                    {review.aiSummary}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => approveReview(review.id)}
                    className="px-3 py-1 text-[11px] bg-[#CC785C] text-white font-medium rounded-lg hover:bg-[#B8684D] transition-colors shadow-soft"
                  >
                    入库
                  </button>
                  <button
                    onClick={() => rejectReview(review.id, '退回')}
                    className="px-3 py-1 text-[11px] bg-[#F4F2EC] text-[#57534D] hover:text-[#1F1E1B] rounded-lg transition-colors border border-[#EAE6DF]"
                  >
                    忽略
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================
          3. 精选与最近更新方法论 (Claude Letterpress Cards)
         ============================================================ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2">
          <div className="flex items-baseline gap-2">
            <h2 className="font-serif text-lg sm:text-xl font-normal text-[#1F1E1B]">精选认知档案</h2>
            <span className="text-[11px] text-[#8C877D] font-serif italic">Curated & Updated</span>
          </div>
          <button
            onClick={() => navigate('/library')}
            className="text-xs text-[#736F66] hover:text-[#CC785C] transition-colors flex items-center gap-1 font-medium"
          >
            <span>完整知识库</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner text="正在载入知识档案..." />
          </div>
        ) : recentMethods.length === 0 ? (
          <EmptyState
            icon="📭"
            title="知识库暂无档案"
            description="点击上方新建档案，或让 AI 从研究中心导入"
            action={{ label: '新建档案', onClick: () => navigate('/library/new') }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {recentMethods.slice(0, 6).map((method) => (
              <MethodCard
                key={method.id}
                method={method}
                onClick={() => navigate(`/library/${method.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ============================================================
          4. 八大领域体系与深度认知推演 (Editorial System Grid)
         ============================================================ */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">
        {/* 八大领域知识分布 */}
        <div className="bg-white border border-[#EAE6DF] rounded-2xl p-4.5 space-y-3.5 lg:col-span-1 shadow-soft">
          <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2.5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#CC785C]" />
              <h3 className="font-serif text-sm font-medium text-[#1F1E1B]">八大领域知识图谱</h3>
            </div>
            <span className="text-[10px] text-[#8C877D] font-mono">{totalMethods} 档案</span>
          </div>

          <div className="space-y-2 pt-1">
            {DOMAIN_IDS.map((id) => {
              const count = domainDistribution[id] ?? 0
              const pct = maxDomainCount > 0 ? Math.round((count / maxDomainCount) * 100) : 0
              return (
                <div
                  key={id}
                  onClick={() => navigate(`/library?domain=${id}`)}
                  className="group cursor-pointer p-1.5 rounded-xl hover:bg-[#FAF9F5] transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#57534D] group-hover:text-[#1F1E1B] font-medium transition-colors text-xs truncate">
                      {domainNameMap[id]}
                    </span>
                    <span className="font-serif text-[#8C877D] text-xs shrink-0">{count} 套</span>
                  </div>
                  <div className="h-1 bg-[#F4F2EC] rounded-full overflow-hidden border border-[#EAE6DF]/60">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-[#CC785C]"
                      style={{ width: `${pct}%`, opacity: 0.35 + (pct / 100) * 0.65 }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Claude 风格认知推演组合推荐 */}
        <div className="lg:col-span-2 space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2">
            <h3 className="font-serif text-sm font-medium text-[#1F1E1B]">经典跨界推演组合</h3>
            <span className="text-[10px] text-[#8C877D] font-serif italic">Cognitive Synthesis</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div
              onClick={() => handlePromptClick('第一性原理与费曼技巧如何结合？')}
              className="bg-white border border-[#EAE6DF] hover:border-[#CC785C]/60 rounded-2xl p-4 space-y-2 shadow-soft hover:shadow-card transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[11px] text-[#B8684D]">
                <span className="font-sans font-medium px-2 py-0.5 rounded-md bg-[#FAF0EB] border border-[#F0DED3]">
                  思维与学习
                </span>
                <Sparkles className="w-3.5 h-3.5 text-[#CC785C] group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="font-serif text-base font-medium text-[#1F1E1B] group-hover:text-[#9E543C] transition-colors">
                第一性原理 × 费曼技巧
              </h4>
              <p className="text-xs text-[#57534D] leading-relaxed break-words">
                将事物还原到最基本的不可再分事实，并通过大白话教授他人检验漏洞，彻底破除“以为自己懂了”的认知幻觉。
              </p>
            </div>

            <div
              onClick={() => handlePromptClick('OKR与双周PDCA冲刺怎样配合？')}
              className="bg-white border border-[#EAE6DF] hover:border-[#CC785C]/60 rounded-2xl p-4 space-y-2 shadow-soft hover:shadow-card transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[11px] text-[#B8684D]">
                <span className="font-sans font-medium px-2 py-0.5 rounded-md bg-[#FAF0EB] border border-[#F0DED3]">
                  战略与落地
                </span>
                <Sparkles className="w-3.5 h-3.5 text-[#CC785C] group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="font-serif text-base font-medium text-[#1F1E1B] group-hover:text-[#9E543C] transition-colors">
                OKR × 双周 PDCA 敏捷冲刺
              </h4>
              <p className="text-xs text-[#57534D] leading-relaxed break-words">
                以 OKR 确立不设限的高野心北极星指标，以 14 天 PDCA 闭环严格控制行动节奏与复盘纠偏，杜绝目标与执行脱节。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
