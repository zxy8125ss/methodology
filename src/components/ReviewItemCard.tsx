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
  high: '高',
  medium: '中',
  low: '低',
  unverified: '未验证',
  disputed: '争议',
}

const evidenceLevelColor: Record<string, string> = {
  high: 'text-green-400 bg-green-900/40',
  medium: 'text-yellow-400 bg-yellow-900/40',
  low: 'text-orange-400 bg-orange-900/40',
  unverified: 'text-gray-400 bg-gray-700',
  disputed: 'text-red-400 bg-red-900/40',
}

function QualityBar({ score }: { score: number }) {
  const color =
    score >= 80 ? 'bg-green-500' :
    score >= 60 ? 'bg-yellow-500' :
    score >= 40 ? 'bg-orange-500' : 'bg-red-500'

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-300 w-8 text-right">{score}</span>
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
    <div className={`bg-gray-800/70 border rounded-xl p-4 transition-all ${selected ? 'border-blue-500' : 'border-gray-700'}`}>
      {/* 顶部行 */}
      <div className="flex items-start gap-3 mb-3">
        {/* 多选框 */}
        {onSelect && (
          <input
            type="checkbox"
            checked={!!selected}
            onChange={(e) => onSelect(item.id, e.target.checked)}
            className="mt-1 accent-blue-500 w-4 h-4 shrink-0"
          />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-md">
              {typeLabel[item.type] ?? item.type}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-md ${evidenceLevelColor[evidenceLevel] ?? 'text-gray-400 bg-gray-700'}`}>
              证据：{evidenceLevelLabel[evidenceLevel] ?? evidenceLevel}
            </span>
            <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded-md">
              优先级：{item.priority === 'high' ? '高' : item.priority === 'medium' ? '中' : '低'}
            </span>
          </div>
          <h3 className="text-white font-semibold text-base leading-snug">
            {draft?.name ?? item.updatedMethod?.methodName ?? '未知方法论'}
          </h3>
          {draft?.content?.summary && (
            <p className="text-gray-400 text-sm mt-0.5 line-clamp-2">{draft.content.summary}</p>
          )}
        </div>
      </div>

      {/* 质量评分 */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>质量评分</span>
        </div>
        <QualityBar score={qualityScore} />
      </div>

      {/* 相似方法论警告 */}
      {similar.length > 0 && (
        <div className="mb-3 bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-yellow-400 text-xs font-medium mb-1.5">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            检测到相似方法论
          </div>
          <ul className="space-y-1">
            {similar.slice(0, 3).map((s, i) => (
              <li key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
                <span className="text-yellow-500 mt-0.5">•</span>
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
          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform ${summaryOpen ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {summaryOpen ? '收起' : '展开'} AI 审核摘要
        </button>
        {summaryOpen && (
          <div className="mt-2 bg-gray-900/60 rounded-lg p-3 text-xs text-gray-300 leading-relaxed whitespace-pre-wrap border border-gray-700">
            {item.aiSummary}
          </div>
        )}
      </div>

      {/* AI 建议 */}
      <div className="text-xs text-gray-500 mb-3 italic">{item.aiRecommendation}</div>

      {/* 操作按钮 */}
      {item.status === 'pending' && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onApprove(item.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            批准入库
          </button>

          {item.discoveredMethod?.recommendedMergeTarget && onMerge && (
            <button
              onClick={handleMerge}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              合并入库
            </button>
          )}

          {!showRejectInput ? (
            <button
              onClick={() => setShowRejectInput(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              退回
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full mt-1">
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="退回原因（必填）"
                className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                onKeyDown={(e) => { if (e.key === 'Enter') handleReject() }}
                autoFocus
              />
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-3 py-1.5 bg-red-700 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs rounded-lg transition-colors"
              >
                确认退回
              </button>
              <button
                onClick={() => { setShowRejectInput(false); setRejectReason('') }}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg transition-colors"
              >
                取消
              </button>
            </div>
          )}
        </div>
      )}

      {/* 已处理状态 */}
      {item.status !== 'pending' && (
        <div className={`text-xs px-2 py-1 rounded-lg inline-block ${
          item.status === 'approved' ? 'bg-green-900/40 text-green-400' :
          item.status === 'rejected' ? 'bg-red-900/40 text-red-400' :
          item.status === 'merged' ? 'bg-blue-900/40 text-blue-400' :
          'bg-gray-700 text-gray-400'
        }`}>
          {item.status === 'approved' ? '✓ 已批准入库' :
           item.status === 'rejected' ? `✗ 已退回${item.reviewNotes ? `：${item.reviewNotes}` : ''}` :
           item.status === 'merged' ? '⇒ 已合并' :
           item.status}
        </div>
      )}
    </div>
  )
}
