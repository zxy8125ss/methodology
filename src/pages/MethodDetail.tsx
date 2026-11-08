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
  active: { label: '已收录', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  pending_review: { label: '待审核', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  draft: { label: '草稿', cls: 'bg-stone-100 text-stone-700 border-stone-200' },
  deprecated: { label: '已废弃', cls: 'bg-rose-50 text-rose-800 border-rose-200' },
  disputed: { label: '存疑', cls: 'bg-rose-50 text-rose-800 border-rose-200' },
}

const EVIDENCE_LABELS: Record<string, { label: string; cls: string }> = {
  high: { label: '高可信度', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  medium: { label: '中等可信度', cls: 'bg-sky-50 text-sky-800 border-sky-200' },
  low: { label: '低可信度', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  unverified: { label: '未验证', cls: 'bg-stone-100 text-stone-700 border-stone-200' },
  disputed: { label: '存疑', cls: 'bg-rose-50 text-rose-800 border-rose-200' },
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
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <InfoRow label="首次提出" value={String(method.origin.year)} />
          )}
        </InfoCard>

        <InfoCard title="概述">
          <p className="text-stone-700 text-xs leading-relaxed">{method.content.summary}</p>
        </InfoCard>
      </div>

      <InfoCard title="核心思想">
        <p className="text-stone-700 text-xs leading-relaxed whitespace-pre-wrap">{method.content.coreIdea}</p>
      </InfoCard>

      {method.content.mechanism && (
        <InfoCard title="运行原理">
          <p className="text-stone-700 text-xs leading-relaxed whitespace-pre-wrap">{method.content.mechanism}</p>
        </InfoCard>
      )}

      {method.content.scenarios.length > 0 && (
        <InfoCard title="适用场景">
          <ul className="space-y-1.5">
            {method.content.scenarios.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-stone-700">
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
                <span>{s}</span>
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
    <div className="space-y-3.5">
      {method.content.steps.map((step) => (
        <div
          key={step.order}
          className="flex gap-4 p-4.5 bg-white border border-stone-200/80 rounded-2xl shadow-card"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center text-white font-bold text-xs shadow-soft font-mono">
            {step.order}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-stone-900 mb-1.5 text-sm">{step.title}</h3>
            <p className="text-stone-700 text-xs leading-relaxed mb-2.5">{step.description}</p>
            {step.tips && step.tips.length > 0 && (
              <div className="mb-2">
                {step.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-emerald-800 mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            )}
            {step.warnings && step.warnings.length > 0 && (
              <div>
                {step.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-amber-800 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{w}</span>
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
    <div className="space-y-3.5">
      {method.cases.map((c) => (
        <div key={c.id} className="p-4.5 bg-white border border-stone-200/80 rounded-2xl shadow-card space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-stone-900 text-sm">{c.title}</h3>
            <div className="flex gap-1.5 flex-shrink-0">
              {c.verified && <Badge label="已验证" cls="bg-emerald-50 text-emerald-800 border-emerald-200" />}
              {c.aiGenerated && <Badge label="AI推断" cls="bg-violet-50 text-violet-800 border-violet-200" />}
            </div>
          </div>
          {(c.organization || c.industry) && (
            <p className="text-[11px] text-stone-500 font-mono">
              {[c.organization, c.industry].filter(Boolean).join(' · ')}
            </p>
          )}
          <div className="space-y-1.5 text-xs text-stone-700">
            <div><span className="text-stone-500 font-medium">背景：</span>{c.context}</div>
            <div><span className="text-stone-500 font-medium">应用：</span>{c.application}</div>
            <div><span className="text-stone-500 font-medium">结果：</span>{c.outcome}</div>
          </div>
          {c.lessons.length > 0 && (
            <div className="pt-1.5 border-t border-stone-100">
              <p className="text-[11px] text-stone-500 font-medium mb-1">经验教训</p>
              <ul className="space-y-1">
                {c.lessons.map((l, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-stone-700">
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
                    <span>{l}</span>
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
              className="inline-flex items-center gap-1 text-xs text-stone-700 hover:text-stone-950 underline mt-1"
            >
              <ExternalLink className="w-3 h-3" /> 查看原始出处
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <h3 className="font-semibold text-xs text-emerald-900 uppercase tracking-wider">主要优点</h3>
        </div>
        {method.content.advantages.length === 0 ? (
          <p className="text-xs text-stone-400">暂无数据</p>
        ) : (
          <ul className="space-y-1.5">
            {method.content.advantages.map((a, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-stone-800">
                <span className="text-emerald-600 font-bold">✓</span> <span>{a}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <h3 className="font-semibold text-xs text-amber-900 uppercase tracking-wider">局限与前提</h3>
        </div>
        {method.content.limitations.length === 0 ? (
          <p className="text-xs text-stone-400">暂无数据</p>
        ) : (
          <ul className="space-y-1.5">
            {method.content.limitations.map((l, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-stone-800">
                <span className="text-amber-600 font-bold">!</span> <span>{l}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-4 bg-rose-50/60 border border-rose-200/80 rounded-2xl shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <X className="w-4 h-4 text-rose-600" />
          <h3 className="font-semibold text-xs text-rose-900 uppercase tracking-wider">常见误区</h3>
        </div>
        {method.content.misconceptions.length === 0 ? (
          <p className="text-xs text-stone-400">暂无数据</p>
        ) : (
          <ul className="space-y-1.5">
            {method.content.misconceptions.map((m, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-stone-800">
                <span className="text-rose-600 font-bold">✗</span> <span>{m}</span>
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      {related.map((m) => (
        <Link
          key={m.id}
          to={`/library/${m.id}`}
          className="p-4 bg-white border border-stone-200/80 rounded-2xl hover:border-stone-400 hover:shadow-card transition-all group"
        >
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="font-semibold text-sm text-stone-900 group-hover:text-stone-950 transition-colors">
              {m.name}
            </h3>
            <span className="text-[11px] text-stone-500 font-mono">{TYPE_LABELS[m.type] ?? m.type}</span>
          </div>
          <p className="text-xs text-stone-600 line-clamp-2">{m.content.summary}</p>
        </Link>
      ))}
    </div>
  )
}

// ---- Sources Tab ----
function SourcesTab({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return <EmptyState message="暂无来源信息" />

  const credibilityMap: Record<string, { label: string; cls: string }> = {
    high: { label: '高可信', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    medium: { label: '中等', cls: 'bg-sky-50 text-sky-800 border-sky-200' },
    low: { label: '经验性', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  }

  const typeMap: Record<string, string> = {
    book: '书籍', paper: '论文', article: '文章', speech: '演讲',
    course: '课程', website: '网站', other: '其他'
  }

  return (
    <div className="space-y-3">
      {sources.map((s) => (
        <div key={s.id} className="p-4 bg-white border border-stone-200/80 rounded-2xl shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-stone-900 text-sm mb-0.5">{s.title}</h3>
              <p className="text-xs text-stone-500">
                {s.author} {s.institution ? `· ${s.institution}` : ''}
                {s.publishedAt ? ` · ${s.publishedAt}` : ''}
              </p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <Badge label={typeMap[s.type] ?? s.type} cls="bg-stone-100 text-stone-700 border-stone-200" />
              {credibilityMap[s.credibility] && (
                <Badge {...credibilityMap[s.credibility]} />
              )}
            </div>
          </div>
          {s.notes && <p className="text-xs text-stone-600 mt-2">{s.notes}</p>}
          {s.url && (
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-stone-700 hover:text-stone-950 underline mt-2"
            >
              <ExternalLink className="w-3 h-3" /> 访问原始来源
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
    <div className="p-4 sm:p-4.5 bg-white border border-stone-200/80 rounded-2xl shadow-card overflow-hidden">
      <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2.5">{title}</h3>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2.5 mb-2 last:mb-0 text-xs items-start min-w-0">
      <span className="text-stone-400 w-16 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-stone-800 font-medium flex-1 min-w-0 break-words">{value}</span>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-stone-500 card bg-white">
      <BookOpen className="w-8 h-8 mb-2 text-stone-300" />
      <p className="text-xs">{message}</p>
    </div>
  )
}

function Loader() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-7 h-7 border-2 border-stone-800 border-t-transparent rounded-full animate-spin" />
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
      <div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!method) return null

  const statusBadge = STATUS_LABELS[method.status]
  const evidenceBadge = EVIDENCE_LABELS[method.evidence.level]

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> 返回上一页
        </button>
      </div>

      {/* Header */}
      <div className="border-b border-stone-200/80 pb-5">
        <h1 className="text-2xl font-bold text-stone-900 mb-2 tracking-tight">{method.name}</h1>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {statusBadge && <Badge {...statusBadge} />}
          {evidenceBadge && <Badge {...evidenceBadge} />}
          <Badge
            label={TYPE_LABELS[method.type] ?? method.type}
            cls="bg-stone-100 text-stone-700 border-stone-200"
          />
          {method.tags.map((tag) => (
            <span key={tag} className="text-[11px] text-stone-500 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate(`/library/${id}/edit`)}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" /> 编辑
          </button>
          <button
            onClick={() => navigate('/practice')}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Target className="w-3.5 h-3.5" /> 添加到实践
          </button>
          <button
            onClick={() => navigate('/practice?tab=learning')}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" /> 制定学习计划
          </button>
          <button
            onClick={handleShare}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" /> 分享链接
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-stone-200 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-stone-900 text-stone-950 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
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
            <div className="card p-6 bg-white">
              <MarkdownRenderer
                content={method.content.fullArticle}
                className="max-w-none text-stone-800"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {method.content.principles.length > 0 && (
                <div className="p-4.5 bg-white border border-stone-200/80 rounded-2xl shadow-card">
                  <h3 className="font-semibold text-xs text-stone-500 uppercase tracking-wider mb-3">理论基础</h3>
                  <ul className="space-y-2">
                    {method.content.principles.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-stone-800">
                        <Star className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <EmptyState message="暂无完整理论长文" />
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
      <div className="mt-8 pt-4 border-t border-stone-200/80 flex gap-6 text-[11px] text-stone-400 font-mono">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" /> {method.stats.viewCount} 次查看
        </span>
        <span>实践 {method.stats.practiceCount} 次</span>
        <span>学习 {method.stats.learningCount} 人次</span>
        <span className="ml-auto">更新于 {new Date(method.updatedAt).toLocaleDateString('zh-CN')}</span>
      </div>
    </div>
  )
}
