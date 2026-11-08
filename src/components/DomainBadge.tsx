import React from 'react'

interface DomainBadgeProps {
  domainId: string
  label?: string
  size?: 'sm' | 'md'
}

const domainStyleMap: Record<string, { bg: string; text: string; border: string }> = {
  thinking: { bg: 'bg-[#FAF0EB]', text: 'text-[#B8684D]', border: 'border-[#F0DED3]' },
  management: { bg: 'bg-[#F4F2EC]', text: 'text-[#57534D]', border: 'border-[#EAE6DF]' },
  personal_growth: { bg: 'bg-[#F0F5F1]', text: 'text-[#2F6B42]', border: 'border-[#D9E8DC]' },
  work_efficiency: { bg: 'bg-[#FAF4E8]', text: 'text-[#8C6415]', border: 'border-[#F3E5C6]' },
  communication: { bg: 'bg-[#F0F4F8]', text: 'text-[#2D5A80]', border: 'border-[#D8E4EE]' },
  learning: { bg: 'bg-[#EFF6F6]', text: 'text-[#2D6C6F]', border: 'border-[#D6EAEA]' },
  business: { bg: 'bg-[#F5F2F8]', text: 'text-[#634582]', border: 'border-[#E5DEEE]' },
  life: { bg: 'bg-[#FBF1F0]', text: 'text-[#8A3F3A]', border: 'border-[#F3D7D5]' },
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
  const style = domainStyleMap[domainId] ?? { bg: 'bg-[#F4F2EC]', text: 'text-[#57534D]', border: 'border-[#EAE6DF]' }
  const displayLabel = label ?? domainNameMap[domainId] ?? domainId

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium ${style.bg} ${style.text} ${style.border} ${
        size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[11px]'
      }`}
    >
      {displayLabel}
    </span>
  )
}

export default DomainBadge
