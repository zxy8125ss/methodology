import React from 'react'

interface DomainBadgeProps {
  domainId: string
  label?: string
  size?: 'sm' | 'md'
}

const domainColorMap: Record<string, string> = {
  management: 'bg-blue-500/20 text-blue-300 ring-blue-500/30',
  personal_growth: 'bg-green-500/20 text-green-300 ring-green-500/30',
  thinking: 'bg-purple-500/20 text-purple-300 ring-purple-500/30',
  work_efficiency: 'bg-yellow-500/20 text-yellow-300 ring-yellow-500/30',
  communication: 'bg-pink-500/20 text-pink-300 ring-pink-500/30',
  learning: 'bg-cyan-500/20 text-cyan-300 ring-cyan-500/30',
  business: 'bg-orange-500/20 text-orange-300 ring-orange-500/30',
  life: 'bg-lime-500/20 text-lime-300 ring-lime-500/30',
}

const domainNameMap: Record<string, string> = {
  management: '管理',
  personal_growth: '个人成长',
  thinking: '思维',
  work_efficiency: '工作效率',
  communication: '沟通',
  learning: '学习',
  business: '商业',
  life: '生活',
}

const DomainBadge: React.FC<DomainBadgeProps> = ({ domainId, label, size = 'sm' }) => {
  const colorClass = domainColorMap[domainId] ?? 'bg-slate-500/20 text-slate-300 ring-slate-500/30'
  const displayLabel = label ?? domainNameMap[domainId] ?? domainId

  const sizeClass = size === 'md'
    ? 'px-2.5 py-1 text-xs font-medium'
    : 'px-2 py-0.5 text-xs font-medium'

  return (
    <span className={`inline-flex items-center rounded-full ring-1 ${colorClass} ${sizeClass}`}>
      {displayLabel}
    </span>
  )
}

export default DomainBadge
