import React from 'react'
import type { Method } from '../types'
import DomainBadge from './DomainBadge'
import EvidenceBadge from './EvidenceBadge'
import { ArrowUpRight, Sparkles } from 'lucide-react'

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
      className={`group relative bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-4.5 flex flex-col justify-between gap-3.5 transition-all duration-300 hover:border-zinc-600 hover:bg-zinc-900/90 hover:shadow-float hover:-translate-y-0.5 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div>
        {/* Top Header: Title, Layer & Type */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                Layer {method.layer}
              </span>
              <span className="text-[11px] text-zinc-400">
                {methodTypeLabel[method.type] ?? method.type}
              </span>
            </div>
            <h3 className="text-base font-semibold text-zinc-100 tracking-tight group-hover:text-white transition-colors truncate">
              {method.name}
            </h3>
          </div>

          <div className="w-6 h-6 rounded-lg bg-zinc-800/60 flex items-center justify-center text-zinc-400 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Core Summary (Editorial typography) */}
        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-3">
          {method.content?.summary}
        </p>

        {/* Domain Badges */}
        <div className="flex flex-wrap gap-1.5">
          {method.domains.slice(0, 3).map((domainId) => (
            <DomainBadge key={domainId} domainId={domainId} />
          ))}
          {method.domains.length > 3 && (
            <span className="px-1.5 py-0.5 text-[10px] text-zinc-500 bg-zinc-800/60 rounded-md">
              +{method.domains.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Evidence & Meta Info */}
      <div className="flex items-center justify-between text-[11px] pt-3 border-t border-zinc-800/60 text-zinc-500">
        <EvidenceBadge level={method.evidence?.level ?? 'unverified'} />

        <div className="flex items-center gap-2 font-mono text-[10px]">
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
