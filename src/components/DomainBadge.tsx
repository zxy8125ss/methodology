import React from 'react'

interface DomainBadgeProps {
  domainId: string
  label?: string
  size?: 'sm' | 'md'
}

const domainStyleMap: Record<string, { bg: string; text: string; border: string }> = {
  management: { bg: 'bg-zinc-800/80', text: 'text-zinc-200', border: 'border-zinc-700/60' },
  personal_growth: { bg: 'bg-emerald-950/30', text: 'text-emerald-300', border: 'border-emerald-800/40' },
  thinking: { bg: 'bg-zinc-800/80', text: 'text-zinc-200', border: 'border-zinc-700/60' },
  work_efficiency: { bg: 'bg-amber-950/30', text: 'text-amber-300', border: 'border-amber-800/40' },
  communication: { bg: 'bg-zinc-800/80', text: 'text-zinc-200', border: 'border-zinc-700/60' },
  learning: { bg: 'bg-sky-950/30', text: 'text-sky-300', border: 'border-sky-800/40' },
  business: { bg: 'bg-zinc-800/80', text: 'text-zinc-200', border: 'border-zinc-700/60' },
  life: { bg: 'bg-zinc-800/80', text: 'text-zinc-200', border: 'border-zinc-700/60' },
}

const domainNameMap: Record<string, string> = {
  management: '管理',
  personal_growth: '个人成长',
  thinking: '思维模型',
  work_efficiency: '工作效率',
  communication: '沟通谈判',
  learning: '学习管理',
  business: '商业模式',
  life: '生活哲学',
}

const DomainBadge: React.FC<DomainBadgeProps> = ({ domainId, label, size = 'sm' }) => {
  const style = domainStyleMap[domainId] ?? { bg: 'bg-zinc-800/70', text: 'text-zinc-300', border: 'border-zinc-700/60' }
  const displayLabel = label ?? domainNameMap[domainId] ?? domainId

  return (
    <span
      className={`inline-flex items-center rounded-lg border font-medium ${style.bg} ${style.text} ${style.border} ${
        size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[11px]'
      }`}
    >
      {displayLabel}
    </span>
  )
}

export default DomainBadge
