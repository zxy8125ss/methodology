import React from 'react'
import type { EvidenceLevel } from '../types'

interface EvidenceBadgeProps {
  level: EvidenceLevel
}

const evidenceConfig: Record<EvidenceLevel, { label: string; className: string }> = {
  high: {
    label: '高可信',
    className: 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30',
  },
  medium: {
    label: '中等',
    className: 'bg-blue-500/20 text-blue-300 ring-blue-500/30',
  },
  low: {
    label: '低可信',
    className: 'bg-amber-500/20 text-amber-300 ring-amber-500/30',
  },
  unverified: {
    label: '待验证',
    className: 'bg-slate-500/20 text-slate-400 ring-slate-500/30',
  },
  disputed: {
    label: '争议',
    className: 'bg-red-500/20 text-red-300 ring-red-500/30',
  },
}

const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({ level }) => {
  const config = evidenceConfig[level] ?? evidenceConfig.unverified
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${config.className}`}
    >
      {config.label}
    </span>
  )
}

export default EvidenceBadge
