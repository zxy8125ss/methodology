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
  return d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}

const MethodCard: React.FC<MethodCardProps> = ({ method, onClick }) => {
  return (
    <div
      className={`group relative bg-white border border-[#EAE6DF] rounded-2xl p-4.5 flex flex-col justify-between gap-3.5 transition-all duration-200 hover:border-[#D4CEBF] hover:shadow-card hover:-translate-y-0.5 overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="min-w-0">
        {/* Top Header: Title, Layer & Type */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-md bg-[#F4F2EC] text-[#68645C] border border-[#EAE6DF] shrink-0">
                Layer {method.layer}
              </span>
              <span className="text-[11px] text-[#8C877D] shrink-0 font-serif italic">
                {methodTypeLabel[method.type] ?? method.type}
              </span>
            </div>
            <h3 className="font-serif text-[17px] font-medium text-[#1F1E1B] tracking-tight group-hover:text-[#9E543C] transition-colors truncate">
              {method.name}
            </h3>
          </div>

          <div className="w-6 h-6 rounded-lg bg-[#FAF9F5] border border-[#EAE6DF] flex items-center justify-center text-[#8C877D] group-hover:text-[#9E543C] group-hover:border-[#CC785C]/40 transition-all duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Core Summary (Claude Editorial typography) */}
        <p className="text-xs text-[#57534D] leading-relaxed line-clamp-2 mb-3.5 break-words">
          {method.content?.summary}
        </p>

        {/* Domain Badges */}
        <div className="flex flex-wrap gap-1.5 overflow-hidden">
          {method.domains.slice(0, 2).map((domainId) => (
            <DomainBadge key={domainId} domainId={domainId} />
          ))}
          {method.domains.length > 2 && (
            <span className="px-1.5 py-0.5 text-[10px] text-[#8C877D] bg-[#F4F2EC] rounded-md border border-[#EAE6DF] shrink-0 font-mono">
              +{method.domains.length - 2}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Evidence & Meta Info */}
      <div className="flex items-center justify-between text-[11px] pt-3 border-t border-[#F4F2EC] text-[#8C877D] min-w-0 gap-2">
        <div className="shrink-0">
          <EvidenceBadge level={method.evidence?.level ?? 'unverified'} />
        </div>

        <div className="flex items-center gap-1.5 font-sans text-[10px] text-[#A39E93] min-w-0 shrink truncate">
          {method.origin?.proposer && (
            <span className="truncate max-w-[90px] font-serif">{method.origin.proposer}</span>
          )}
          <span>·</span>
          <span className="shrink-0">{formatDate(method.updatedAt)}</span>
        </div>
      </div>
    </div>
  )
}

export default MethodCard
