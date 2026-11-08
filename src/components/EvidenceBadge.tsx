import React from 'react'
import type { EvidenceLevel } from '../types'

interface EvidenceBadgeProps {
  level: EvidenceLevel
}

const evidenceConfig: Record<EvidenceLevel, { label: string; dot: string; text: string; bg: string }> = {
  high: {
    label: '高可信度',
    dot: 'bg-emerald-600',
    text: 'text-stone-700',
    bg: 'bg-emerald-50/80 border-emerald-200'
  },
  medium: {
    label: '中等可信',
    dot: 'bg-sky-600',
    text: 'text-stone-700',
    bg: 'bg-sky-50/80 border-sky-200'
  },
  low: {
    label: '经验性',
    dot: 'bg-amber-600',
    text: 'text-stone-700',
    bg: 'bg-amber-50/80 border-amber-200'
  },
  unverified: {
    label: '待验证',
    dot: 'bg-stone-400',
    text: 'text-stone-500',
    bg: 'bg-stone-100 border-stone-200'
  },
  disputed: {
    label: '存疑',
    dot: 'bg-rose-600',
    text: 'text-rose-700',
    bg: 'bg-rose-50 border-rose-200'
  },
}

const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({ level }) => {
  const config = evidenceConfig[level] ?? evidenceConfig.unverified
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  )
}

export default EvidenceBadge
