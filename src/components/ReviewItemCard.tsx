import React, { useState } from 'react'
import type { ReviewItem } from '../types'

interface ReviewItemCardProps {
  item: ReviewItem
  onApprove: (id: string) => void
  onReject: (id: string, reason: string) => void
  onMerge?: (id: string, targetId: string) => void
  selected?: boolean
  onSelect?: (id: string, checked: boolean) => void
}

const evidenceLevelLabel: Record<string, string> = {
  high: '高可信',
  medium: '中可信',
  low: '经验性',
  unverified: '未验证',
  disputed: '存疑',
}

const evidenceLevelColor: Record<string, string> = {
  high: 'text-emerald-800 bg-emerald-50 border-emerald-200',
  medium: 'text-sky-800 bg-sky-50 border-sky-200',
  low: 'text-amber-800 bg-amber-50 border-amber-200',
  unverified: 'text-stone-600 bg-stone-100 border-stone-200',
  disputed: 'text-rose-800 bg-rose-50 border-rose-200',
}

function QualityBar({ score }: { score: number }) {
  const color =
    score >= 80 ? 'bg-emerald-600' :
    score >= 60 ? 'bg-amber-500' :
    score >= 40 ? 'bg-orange-500' : 'bg-rose-500'

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-mono font-bold text-stone-700 w-8 text-right">{score}</span>
    </div>
  )
}

export default function ReviewItemCard({
  item,
  onApprove,
  onReject,
  onMerge,
  selected,
  onSelect,
}: ReviewItemCardProps) {
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)

  const draft = item.discoveredMethod?.draftMethod
  const qualityScore = item.discoveredMethod?.qualityScore ?? 0
  const evidenceLevel = draft?.evidence?.level ?? 'unverified'
  const similar = item.discoveredMethod?.similarExisting ?? []

  const typeLabel: Record<string, string> = {
    new_method: '新方法论',
    update_method: '更新方法论',
    new_relation: '新关联关系',
    deprecate_method: '废弃方法论',
  }

  const handleReject = () => {
    if (!rejectReason.trim()) return
    onReject(item.id, rejectReason)
    setShowRejectInput(false)
    setRejectReason('')
  }

  const handleMerge = () => {
    const target = item.discoveredMethod?.recommendedMergeTarget
    if (target && onMerge) {
      onMerge(item.id, target)
    }
  }

  return (
    <div className={`bg-white border rounded-2xl p-4 transition-all shadow-card ${selected ? 'border-stone-900 ring-1 ring-stone-900' : 'border-stone-200/85'}`}>
      {/* 顶部行 */}
      <div className="flex items-start gap-3 mb-2.5">
        {/* 多选框 */}
        {onSelect && (
          <input
            type="checkbox"
            checked={!!selected}
            onChange={(e) => onSelect(item.id, e.target.checked)}
            className="mt-1 accent-stone-900 w-4 h-4 shrink-0"
          />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="text-xs bg-stone-100 text-stone-700 border border-stone-200 px-2 py-0.5 rounded-md">
              {typeLabel[item.type] ?? item.type}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-md border ${evidenceLevelColor[evidenceLevel] ?? 'text-stone-600 bg-stone-100 border-stone-200'}`}>
              证据：{evidenceLevelLabel[evidenceLevel] ?? evidenceLevel}
            </span>
            <span className="text-xs text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-md">
              优先级：{item.priority === 'high' ? '高' : item.priority === 'medium' ? '中' : '低'}
            </span>
          </div>
          <h3 className="font-serif text-[#1F1E1B] font-medium text-base leading-snug">
            {draft?.name ?? item.updatedMethod?.methodName ?? '未知方法论'}
          </h3>
          {draft?.content?.summary && (
            <p className="text-stone-600 text-xs mt-0.5 line-clamp-2">{draft.content.summary}</p>
          )}
        </div>
      </div>

      {/* 质量评分 */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-stone-500 mb-1">
          <span>综合可信与完整度</span>
        </div>
        <QualityBar score={qualityScore} />
      </div>

      {/* 相似方法论警告 */}
      {similar.length > 0 && (
        <div className="mb-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-amber-900 text-xs font-semibold mb-1">
            <svg className="w-3.5 h-3.5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            检测到知识库已有相似方法论
          </div>
          <ul className="space-y-1">
            {similar.slice(0, 3).map((s, i) => (
              <li key={i} className="text-xs text-amber-800 flex items-start gap-1.5">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>
                  相似度 <strong>{s.similarity}%</strong>：{s.reason}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI 审核摘要（可折叠） */}
      <div className="mb-3">
        <button
          onClick={() => setSummaryOpen(v => !v)}
          className="flex items-center gap-1.5 text-xs text-stone-700 hover:text-stone-950 font-medium transition-colors"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform ${summaryOpen ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {summaryOpen ? '收起' : '展开'} AI 深度研究报告与来源依据
        </button>
        {summaryOpen && (
          <div className="mt-2 bg-stone-50 rounded-xl p-3 text-xs text-stone-700 leading-relaxed whitespace-pre-wrap border border-stone-200">
            {item.aiSummary}
          </div>
        )}
      </div>

      {/* AI 建议 */}
      {item.aiRecommendation && (
        <div className="text-xs text-stone-500 mb-3 italic">{item.aiRecommendation}</div>
      )}

      {/* 操作按钮 */}
      {item.status === 'pending' && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
          <button
            onClick={() => onApprove(item.id)}
            className="btn-primary text-xs py-1.5 px-3"
          >
            通过入库
          </button>
          {item.discoveredMethod?.recommendedMergeTarget && (
            <button
              onClick={handleMerge}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              合并到已有
            </button>
          )}
          <button
            onClick={() => setShowRejectInput(!showRejectInput)}
            className="btn-ghost text-xs py-1.5 px-3 text-stone-500 hover:text-stone-800"
          >
            退回/忽略
          </button>

          {showRejectInput && (
            <div className="w-full flex items-center gap-2 mt-2">
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="填写退回或忽略原因..."
                className="input text-xs py-1.5 flex-1"
              />
              <button
                onClick={handleReject}
                className="btn-danger text-xs py-1.5 px-3"
              >
                确认
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
