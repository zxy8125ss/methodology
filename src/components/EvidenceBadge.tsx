import React from 'react'
import type { EvidenceLevel } from '../types'

interface EvidenceBadgeProps {
  level: EvidenceLevel
}

const evidenceConfig: Record<EvidenceLevel, { label: string; dot: string; text: string; bg: string }> = {
  high: {
    label: '高可信度',
    dot: 'bg-emerald-400',
    text: 'text-zinc-300',
    bg: 'bg-zinc-800/80 border-zinc-700/60'
  },
  medium: {
    label: '中等可信',
    dot: 'bg-sky-400',
    text: 'text-zinc-300',
    bg: 'bg-zinc-800/80 border-zinc-700/60'
  },
  low: {
    label: '经验性',
    dot: 'bg-amber-400',
    text: 'text-zinc-400',
    bg: 'bg-zinc-800/80 border-zinc-700/60'
  },
  unverified: {
    label: '待验证',
    dot: 'bg-zinc-500',
    text: 'text-zinc-500',
    bg: 'bg-zinc-900 border-zinc-800'
  },
  disputed: {
    label: '存疑',
    dot: 'bg-rose-400',
    text: 'text-rose-300',
    bg: 'bg-rose-950/20 border-rose-900/40'
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
