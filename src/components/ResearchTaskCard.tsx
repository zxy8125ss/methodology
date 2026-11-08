import React from 'react'
import type { ResearchTask, ResearchStatus } from '../types'

interface ResearchTaskCardProps {
  task: ResearchTask
  onClick?: () => void
}

const statusConfig: Record<ResearchStatus, { label: string; color: string; bg: string }> = {
  queued:         { label: '等待中',   color: 'text-gray-400',   bg: 'bg-gray-800' },
  in_progress:    { label: '研究中',   color: 'text-blue-400',   bg: 'bg-blue-900/40' },
  completed:      { label: '已完成',   color: 'text-green-400',  bg: 'bg-green-900/40' },
  failed:         { label: '失败',     color: 'text-red-400',    bg: 'bg-red-900/40' },
  pending_review: { label: '待审核',   color: 'text-yellow-400', bg: 'bg-yellow-900/40' },
  approved:       { label: '已批准',   color: 'text-emerald-400',bg: 'bg-emerald-900/40' },
  rejected:       { label: '已退回',   color: 'text-rose-400',   bg: 'bg-rose-900/40' },
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
        bg-gray-800/60 border border-gray-700 rounded-xl p-4 transition-all
        ${onClick ? 'cursor-pointer hover:border-blue-500/60 hover:bg-gray-800' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        {/* 标题 */}
        <h3 className="text-white font-medium text-sm leading-snug flex-1 line-clamp-2">
          {task.title}
        </h3>

        {/* 状态标签 */}
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${status.color} ${status.bg}`}>
          {status.label}
        </span>
      </div>

      {/* 进度条 */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">进度</span>
          <span className="text-xs text-gray-400">{task.progress}%</span>
        </div>
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isActive ? 'bg-blue-500' : task.status === 'completed' || task.status === 'approved' ? 'bg-green-500' : task.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'}`}
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
              className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-md"
            >
              {topic}
            </span>
          ))}
          {task.targetTopics.length > 4 && (
            <span className="text-xs text-gray-500">+{task.targetTopics.length - 4}</span>
          )}
        </div>
      )}

      {/* 底部信息 */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>创建于 {formatDate(task.createdAt)}</span>
        {task.isAutomatic && (
          <span className="flex items-center gap-1 text-purple-400">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            自动
          </span>
        )}
      </div>

      {/* 错误信息 */}
      {task.error && (
        <div className="mt-2 text-xs text-red-400 bg-red-900/20 rounded-lg px-3 py-1.5 line-clamp-2">
          ⚠ {task.error}
        </div>
      )}
    </div>
  )
}
