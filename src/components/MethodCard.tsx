import React from 'react'
import type { Method } from '../types'
import DomainBadge from './DomainBadge'
import EvidenceBadge from './EvidenceBadge'
import { ArrowUpRight } from 'lucide-react'

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

const MethodCard: React.FC<MethodCardProps> = ({ method, onClick }) => {
  return (
    <div
      className={`group relative bg-white border border-stone-200/85 rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all duration-200 hover:border-stone-400/80 hover:shadow-card hover:-translate-y-0.5 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div>
        {/* Top Header: Title, Layer & Type */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 border border-stone-200">
                Layer {method.layer}
              </span>
              <span className="text-[11px] text-stone-500">
                {methodTypeLabel[method.type] ?? method.type}
              </span>
            </div>
            <h3 className="text-base font-semibold text-stone-900 tracking-tight group-hover:text-stone-950 transition-colors truncate">
              {method.name}
            </h3>
          </div>

          <div className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 group-hover:text-stone-800 transition-all duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Core Summary (Editorial typography) */}
        <p className="text-xs text-stone-600 leading-relaxed line-clamp-2 mb-3">
          {method.content?.summary}
        </p>

        {/* Domain Badges */}
        <div className="flex flex-wrap gap-1.5">
          {method.domains.slice(0, 3).map((domainId) => (
            <DomainBadge key={domainId} domainId={domainId} />
          ))}
          {method.domains.length > 3 && (
            <span className="px-1.5 py-0.5 text-[10px] text-stone-500 bg-stone-100 rounded-md border border-stone-200">
              +{method.domains.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Evidence & Meta Info */}
      <div className="flex items-center justify-between text-[11px] pt-2.5 border-t border-stone-100 text-stone-500">
        <EvidenceBadge level={method.evidence?.level ?? 'unverified'} />

        <div className="flex items-center gap-2 font-mono text-[10px] text-stone-400">
          {method.origin?.proposer && (
            <span className="truncate max-w-[90px]">{method.origin.proposer}</span>
          )}
          <span>·</span>
          <span>{formatDate(method.updatedAt)}</span>
        </div>
      </div>
    </div>
  )
}

export default MethodCard
