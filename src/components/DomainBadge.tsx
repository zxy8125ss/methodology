import React from 'react'

interface DomainBadgeProps {
  domainId: string
  label?: string
  size?: 'sm' | 'md'
}

const domainStyleMap: Record<string, { bg: string; text: string; border: string }> = {
  management: { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-200' },
  personal_growth: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  thinking: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
  work_efficiency: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  communication: { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200' },
  learning: { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
  business: { bg: 'bg-violet-50', text: 'text-violet-800', border: 'border-violet-200' },
  life: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
}

const domainNameMap: Record<string, string> = {
  management: '管理',
  personal_growth: '个人成长',
  thinking: '思维模型',
  work_efficiency: '工作效率',
  communication: '沟通谈判',
  learning: '学习管理',
  business: '商业模式',
  life: '生活实用',
}

const DomainBadge: React.FC<DomainBadgeProps> = ({ domainId, label, size = 'sm' }) => {
  const style = domainStyleMap[domainId] ?? { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-200' }
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
