import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Edit2, BookOpen, Target, Share2, CheckCircle, AlertCircle,
  Star, ChevronRight, ExternalLink, Users, Lightbulb, AlertTriangle, X
} from 'lucide-react'
import type { Method, Source } from '../types'
import { methodsDB } from '../services/db'
import { getRelatedMethods } from '../services/search'
import { useAppStore } from '../stores'
import MarkdownRenderer from '../components/MarkdownRenderer'

// ---- Types ----
type TabKey = 'overview' | 'theory' | 'steps' | 'cases' | 'proscons' | 'related' | 'sources'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: '概览' },
  { key: 'theory', label: '理论原理' },
  { key: 'steps', label: '实施步骤' },
  { key: 'cases', label: '实际案例' },
  { key: 'proscons', label: '优缺点与局限' },
  { key: 'related', label: '相关方法' },
  { key: 'sources', label: '证据来源' },
]

// ---- Badge helpers ----
const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  active: { label: '已收录', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  pending_review: { label: '待审核', cls: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
  draft: { label: '草稿', cls: 'bg-slate-500/20 text-slate-300 border-slate-500/40' },
  deprecated: { label: '已废弃', cls: 'bg-red-500/20 text-red-300 border-red-500/40' },
  disputed: { label: '存疑', cls: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
}

const EVIDENCE_LABELS: Record<string, { label: string; cls: string }> = {
  high: { label: '高可信度', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  medium: { label: '中等可信度', cls: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  low: { label: '低可信度', cls: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
  unverified: { label: '未验证', cls: 'bg-slate-500/20 text-slate-300 border-slate-500/40' },
  disputed: { label: '存疑', cls: 'bg-red-500/20 text-red-300 border-red-500/40' },
}

const TYPE_LABELS: Record<string, string> = {
  theory: '理论', model: '模型', tool: '工具', process: '流程',
  principle: '原则', framework: '框架', other: '其他',
}

function Badge({ label, cls }: { label: string; cls: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>
      {label}
    </span>
  )
}

// ---- Overview Tab ----
function OverviewTab({ method }: { method: Method }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard title="基本信息">
          <InfoRow label="名称" value={method.name} />
          {method.aliases.length > 0 && (
            <InfoRow label="别名" value={method.aliases.join(' / ')} />
          )}
          <InfoRow label="类型" value={TYPE_LABELS[method.type] ?? method.type} />
          <InfoRow label="领域" value={method.domains.join(' · ')} />
          {method.origin.proposer && (
            <InfoRow label="提出者" value={method.origin.proposer} />
          )}
          {method.origin.year && (
            <InfoRow label="年份" value={String(method.origin.year)} />
          )}
        </InfoCard>

        <InfoCard title="概述">
          <p className="text-slate-300 text-sm leading-relaxed">{method.content.summary}</p>
        </InfoCard>
      </div>

      <InfoCard title="核心思想">
        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{method.content.coreIdea}</p>
      </InfoCard>

      {method.content.mechanism && (
        <InfoCard title="运行原理">
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{method.content.mechanism}</p>
        </InfoCard>
      )}

      {method.content.scenarios.length > 0 && (
        <InfoCard title="适用场景">
          <ul className="space-y-1.5">
            {method.content.scenarios.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </InfoCard>
      )}
    </div>
  )
}

// ---- Steps Tab ----
function StepsTab({ method }: { method: Method }) {
  if (method.content.steps.length === 0) {
    return <EmptyState message="暂无步骤信息" />
  }
  return (
    <div className="space-y-4">
      {method.content.steps.map((step) => (
        <div
          key={step.order}
          className="flex gap-4 p-5 bg-slate-800 border border-slate-700 rounded-xl"
        >
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            {step.order}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-100 mb-2">{step.title}</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-3">{step.description}</p>
            {step.tips && step.tips.length > 0 && (
              <div className="mb-2">
                {step.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-emerald-300 mb-1">
                    <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {tip}
                  </div>
                ))}
              </div>
            )}
            {step.warnings && step.warnings.length > 0 && (
              <div>
                {step.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-yellow-300 mb-1">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {w}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ---- Cases Tab ----
function CasesTab({ method }: { method: Method }) {
  if (method.cases.length === 0) {
    return <EmptyState message="暂无案例" />
  }
  return (
    <div className="space-y-4">
      {method.cases.map((c) => (
        <div key={c.id} className="p-5 bg-slate-800 border border-slate-700 rounded-xl space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-slate-100">{c.title}</h3>
            <div className="flex gap-1.5 flex-shrink-0">
              {c.verified && <Badge label="已验证" cls="bg-emerald-500/20 text-emerald-300 border-emerald-500/40" />}
              {c.aiGenerated && <Badge label="AI生成" cls="bg-purple-500/20 text-purple-300 border-purple-500/40" />}
            </div>
          </div>
          {(c.organization || c.industry) && (
            <p className="text-xs text-slate-400">
              {[c.organization, c.industry].filter(Boolean).join(' · ')}
            </p>
          )}
          <div className="space-y-2 text-sm text-slate-300">
            <div><span className="text-slate-400 font-medium">背景：</span>{c.context}</div>
            <div><span className="text-slate-400 font-medium">应用：</span>{c.application}</div>
            <div><span className="text-slate-400 font-medium">结果：</span>{c.outcome}</div>
          </div>
          {c.lessons.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1">经验教训</p>
              <ul className="space-y-1">
                {c.lessons.map((l, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {c.sourceUrl && (
            <a
              href={c.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
            >
              <ExternalLink className="w-3 h-3" /> 查看来源
            </a>
          )}
        </div>
      ))}
    </div>
  )
}

// ---- ProsConsTab ----
function ProsConsTab({ method }: { method: Method }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div className="p-5 bg-emerald-900/20 border border-emerald-700/40 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-emerald-300">优点</h3>
        </div>
        {method.content.advantages.length === 0 ? (
          <p className="text-sm text-slate-500">暂无数据</p>
        ) : (
          <ul className="space-y-2">
            {method.content.advantages.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-emerald-400 flex-shrink-0">✓</span> {a}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-5 bg-yellow-900/20 border border-yellow-700/40 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <h3 className="font-semibold text-yellow-300">局限</h3>
        </div>
        {method.content.limitations.length === 0 ? (
          <p className="text-sm text-slate-500">暂无数据</p>
        ) : (
          <ul className="space-y-2">
            {method.content.limitations.map((l, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-yellow-400 flex-shrink-0">!</span> {l}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-5 bg-red-900/20 border border-red-700/40 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <X className="w-5 h-5 text-red-400" />
          <h3 className="font-semibold text-red-300">常见误区</h3>
        </div>
        {method.content.misconceptions.length === 0 ? (
          <p className="text-sm text-slate-500">暂无数据</p>
        ) : (
          <ul className="space-y-2">
            {method.content.misconceptions.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-red-400 flex-shrink-0">✗</span> {m}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// ---- Related Methods Tab ----
function RelatedTab({ methodId }: { methodId: string }) {
  const [related, setRelated] = useState<Method[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRelatedMethods(methodId, 8)
      .then(setRelated)
      .finally(() => setLoading(false))
  }, [methodId])

  if (loading) return <Loader />
  if (related.length === 0) return <EmptyState message="暂无相关方法论" />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {related.map((m) => (
        <Link
          key={m.id}
          to={`/library/${m.id}`}
          className="p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-blue-500/50 transition-colors group"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-slate-100 group-hover:text-blue-300 transition-colors">
              {m.name}
            </h3>
            <span className="text-xs text-slate-500">{TYPE_LABELS[m.type] ?? m.type}</span>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2">{m.content.summary}</p>
        </Link>
      ))}
    </div>
  )
}

// ---- Sources Tab ----
function SourcesTab({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return <EmptyState message="暂无来源信息" />

  const credibilityMap: Record<string, { label: string; cls: string }> = {
    high: { label: '高可信', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    medium: { label: '中等', cls: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
    low: { label: '低可信', cls: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
  }

  const typeMap: Record<string, string> = {
    book: '书籍', paper: '论文', article: '文章', speech: '演讲',
    course: '课程', website: '网站', other: '其他'
  }

  return (
    <div className="space-y-3">
      {sources.map((s) => (
        <div key={s.id} className="p-4 bg-slate-800 border border-slate-700 rounded-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-medium text-slate-100 text-sm mb-1">{s.title}</h3>
              <p className="text-xs text-slate-400">
                {s.author} {s.institution ? `· ${s.institution}` : ''}
                {s.publishedAt ? ` · ${s.publishedAt}` : ''}
              </p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <Badge label={typeMap[s.type] ?? s.type} cls="bg-slate-600/40 text-slate-300 border-slate-600" />
              {credibilityMap[s.credibility] && (
                <Badge {...credibilityMap[s.credibility]} />
              )}
            </div>
          </div>
          {s.notes && <p className="text-xs text-slate-400 mt-2">{s.notes}</p>}
          {s.url && (
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-2"
            >
              <ExternalLink className="w-3 h-3" /> 访问来源
            </a>
          )}
        </div>
      ))}
    </div>
  )
}

// ---- Shared helpers ----
function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 bg-slate-800 border border-slate-700 rounded-xl">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">{title}</h3>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 mb-2.5 last:mb-0">
      <span className="text-xs text-slate-500 w-16 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-slate-200">{value}</span>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
      <BookOpen className="w-10 h-10 mb-3 opacity-40" />
      <p>{message}</p>
    </div>
  )
}

function Loader() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ---- Main Page ----
export default function MethodDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addNotification } = useAppStore()
  const [method, setMethod] = useState<Method | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>('overview')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    methodsDB.get(id)
      .then((m) => {
        if (m) {
          setMethod(m)
          // bump view count
          methodsDB.save({ ...m, stats: { ...m.stats, viewCount: m.stats.viewCount + 1 } })
        } else {
          addNotification({ type: 'error', title: '未找到该方法论' })
          navigate('/library')
        }
      })
      .finally(() => setLoading(false))
  }, [id, navigate, addNotification])

  const handleShare = async () => {
    if (!method) return
    try {
      await navigator.clipboard.writeText(window.location.href)
      addNotification({ type: 'success', title: '链接已复制' })
    } catch {
      addNotification({ type: 'info', title: '请手动复制链接', message: window.location.href })
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!method) return null

  const statusBadge = STATUS_LABELS[method.status]
  const evidenceBadge = EVIDENCE_LABELS[method.evidence.level]

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> 返回
        </button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-3">{method.name}</h1>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {statusBadge && <Badge {...statusBadge} />}
          {evidenceBadge && <Badge {...evidenceBadge} />}
          <Badge
            label={TYPE_LABELS[method.type] ?? method.type}
            cls="bg-blue-500/20 text-blue-300 border-blue-500/40"
          />
          {method.tags.map((tag) => (
            <span key={tag} className="text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate(`/library/${id}/edit`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" /> 编辑
          </button>
          <button
            onClick={() => navigate('/practice')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            <Target className="w-4 h-4" /> 添加到实践
          </button>
          <button
            onClick={() => navigate('/practice?tab=learning')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
          >
            <BookOpen className="w-4 h-4" /> 加入学习计划
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
          >
            <Share2 className="w-4 h-4" /> 分享
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-700 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'overview' && <OverviewTab method={method} />}
        {activeTab === 'theory' && (
          method.content.fullArticle ? (
            <MarkdownRenderer
              content={method.content.fullArticle}
              className="max-w-none text-slate-300"
            />
          ) : (
            <div className="space-y-4">
              {method.content.principles.length > 0 && (
                <div className="p-5 bg-slate-800 border border-slate-700 rounded-xl">
                  <h3 className="font-semibold text-slate-200 mb-3">理论基础</h3>
                  <ul className="space-y-2">
                    {method.content.principles.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <Star className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <EmptyState message="暂无完整理论文章" />
            </div>
          )
        )}
        {activeTab === 'steps' && <StepsTab method={method} />}
        {activeTab === 'cases' && <CasesTab method={method} />}
        {activeTab === 'proscons' && <ProsConsTab method={method} />}
        {activeTab === 'related' && id && <RelatedTab methodId={id} />}
        {activeTab === 'sources' && <SourcesTab sources={method.origin.sources} />}
      </div>

      {/* Stats footer */}
      <div className="mt-10 pt-6 border-t border-slate-700 flex gap-6 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" /> {method.stats.viewCount} 次查看
        </span>
        <span>实践 {method.stats.practiceCount} 次</span>
        <span>学习 {method.stats.learningCount} 人次</span>
        <span className="ml-auto">更新于 {new Date(method.updatedAt).toLocaleDateString('zh-CN')}</span>
      </div>
    </div>
  )
}
