import React from 'react'
import type { Method } from '../types'
import DomainBadge from './DomainBadge'
import EvidenceBadge from './EvidenceBadge'

const methodTypeLabel: Record<string, string> = {
  theory: '理论',
  model: '模型',
  tool: '工具',
  process: '流程',
  principle: '原则',
  framework: '框架',
  other: '其他',
}

interface MethodCardProps {
  method: Method
  onClick?: () => void
  showActions?: boolean
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays} 天前`
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const MethodCard: React.FC<MethodCardProps> = ({ method, onClick, showActions = false }) => {
  return (
    <div
      className={`group bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex flex-col gap-3 transition-all duration-200 hover:border-indigo-500/50 hover:bg-slate-800/90 hover:shadow-lg hover:shadow-indigo-900/20 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-100 leading-snug group-hover:text-indigo-300 transition-colors line-clamp-1">
          {method.name}
        </h3>
        <span className="shrink-0 px-1.5 py-0.5 rounded text-[11px] text-slate-400 bg-slate-700/50 font-medium">
          {methodTypeLabel[method.type] ?? method.type}
        </span>
      </div>

      {/* Summary */}
      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
        {method.content.summary}
      </p>

      {/* Domain badges */}
      <div className="flex flex-wrap gap-1.5">
        {method.domains.slice(0, 3).map((domainId) => (
          <DomainBadge key={domainId} domainId={domainId} />
        ))}
        {method.domains.length > 3 && (
          <span className="px-2 py-0.5 text-xs text-slate-500 bg-slate-700/40 rounded-full">
            +{method.domains.length - 3}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
        <EvidenceBadge level={method.evidence.level} />
        <span className="text-[11px] text-slate-500">{formatDate(method.updatedAt)}</span>
      </div>

      {/* Tags */}
      {method.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {method.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 text-[11px] text-slate-500 bg-slate-700/30 rounded">
              #{tag}
            </span>
          ))}
          {method.tags.length > 4 && (
            <span className="px-1.5 py-0.5 text-[11px] text-slate-500">+{method.tags.length - 4}</span>
          )}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 mt-1">
          <button
            className="flex-1 py-1.5 text-xs text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
            onClick={(e) => { e.stopPropagation(); onClick?.() }}
          >
            查看详情
          </button>
        </div>
      )}
    </div>
  )
}

export default MethodCard
