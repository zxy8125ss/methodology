import React from 'react'
import type { ResearchTask, ResearchStatus } from '../types'

interface ResearchTaskCardProps {
  task: ResearchTask
  onClick?: () => void
}

const statusConfig: Record<ResearchStatus, { label: string; color: string; bg: string; border: string }> = {
  queued:         { label: '等待中',   color: 'text-stone-600',   bg: 'bg-stone-100',      border: 'border-stone-200' },
  in_progress:    { label: '研究中',   color: 'text-sky-800',     bg: 'bg-sky-50',         border: 'border-sky-200' },
  completed:      { label: '已完成',   color: 'text-emerald-800', bg: 'bg-emerald-50',     border: 'border-emerald-200' },
  failed:         { label: '失败',     color: 'text-rose-800',    bg: 'bg-rose-50',        border: 'border-rose-200' },
  pending_review: { label: '待审核',   color: 'text-amber-800',   bg: 'bg-amber-50',       border: 'border-amber-200' },
  approved:       { label: '已批准',   color: 'text-emerald-800', bg: 'bg-emerald-50',     border: 'border-emerald-200' },
  rejected:       { label: '已退回',   color: 'text-stone-600',   bg: 'bg-stone-100',      border: 'border-stone-200' },
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function ResearchTaskCard({ task, onClick }: ResearchTaskCardProps) {
  const status = statusConfig[task.status] ?? statusConfig.queued
  const isActive = task.status === 'in_progress'

  return (
    <div
      onClick={onClick}
      className={`
        bg-white border border-stone-200/85 rounded-2xl p-4 transition-all duration-200 shadow-card
        ${onClick ? 'cursor-pointer hover:border-stone-400 hover:shadow-float' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        {/* 标题 */}
        <h3 className="font-serif text-[#1F1E1B] font-medium text-sm leading-snug flex-1 line-clamp-2">
          {task.title}
        </h3>

        {/* 状态标签 */}
        <span className={`shrink-0 text-xs px-2.5 py-0.5 rounded-full font-medium border ${status.color} ${status.bg} ${status.border}`}>
          {status.label}
        </span>
      </div>

      {/* 进度条 */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-stone-500">研究进度</span>
          <span className="text-[11px] font-mono font-medium text-stone-700">{task.progress}%</span>
        </div>
        <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isActive ? 'bg-sky-500' : task.status === 'completed' || task.status === 'approved' ? 'bg-emerald-500' : task.status === 'failed' ? 'bg-rose-500' : 'bg-stone-400'}`}
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>

      {/* 主题标签 */}
      {task.targetTopics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {task.targetTopics.slice(0, 4).map((topic, i) => (
            <span
              key={i}
              className="text-xs bg-stone-50 text-stone-700 border border-stone-200 px-2 py-0.5 rounded-md"
            >
              {topic}
            </span>
          ))}
          {task.targetTopics.length > 4 && (
            <span className="text-xs text-stone-400">+{task.targetTopics.length - 4}</span>
          )}
        </div>
      )}

      {/* 底部信息 */}
      <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
        <span>创建于 {formatDate(task.createdAt)}</span>
        {task.isAutomatic && (
          <span className="flex items-center gap-1 text-violet-600 font-medium">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            自动更新
          </span>
        )}
      </div>

      {/* 错误信息 */}
      {task.error && (
        <div className="mt-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-1.5 line-clamp-2">
          ⚠ {task.error}
        </div>
      )}
    </div>
  )
}
