import React from 'react'
import type { EvidenceLevel } from '../types'

interface EvidenceBadgeProps {
  level: EvidenceLevel
}

const evidenceConfig: Record<EvidenceLevel, { label: string; dot: string; text: string; bg: string }> = {
  high: {
    label: '高可信度',
    dot: 'bg-[#3C8554]',
    text: 'text-[#2F6B42]',
    bg: 'bg-[#F0F5F1] border-[#D9E8DC]'
  },
  medium: {
    label: '中等可信',
    dot: 'bg-[#487EA6]',
    text: 'text-[#2D5A80]',
    bg: 'bg-[#F0F4F8] border-[#D8E4EE]'
  },
  low: {
    label: '经验性',
    dot: 'bg-[#B38324]',
    text: 'text-[#8C6415]',
    bg: 'bg-[#FAF4E8] border-[#F3E5C6]'
  },
  unverified: {
    label: '待验证',
    dot: 'bg-[#A39E93]',
    text: 'text-[#736F66]',
    bg: 'bg-[#F4F2EC] border-[#EAE6DF]'
  },
  disputed: {
    label: '存疑',
    dot: 'bg-[#BD4F48]',
    text: 'text-[#8A3F3A]',
    bg: 'bg-[#FBF1F0] border-[#F3D7D5]'
  },
}

const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({ level }) => {
  const config = evidenceConfig[level] ?? evidenceConfig.unverified
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-sans border ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  )
}

export default EvidenceBadge
