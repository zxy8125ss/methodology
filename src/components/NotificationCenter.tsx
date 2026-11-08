import React, { useEffect } from 'react'
import { useAppStore } from '../stores'

export default function NotificationCenter() {
  const { notifications, removeNotification } = useAppStore()

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map(n => (
        <div
          key={n.id}
          className={`card border p-4 shadow-xl animate-slide-up pointer-events-auto flex items-start gap-3 ${
            n.type === 'success' ? 'border-green-700/50 bg-green-900/20' :
            n.type === 'error' ? 'border-red-700/50 bg-red-900/20' :
            n.type === 'warning' ? 'border-yellow-700/50 bg-yellow-900/20' :
            'border-blue-700/50 bg-blue-900/20'
          }`}
        >
          <span className="text-lg flex-shrink-0 mt-0.5">
            {n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : n.type === 'warning' ? '⚠️' : 'ℹ️'}
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-zinc-100">{n.title}</div>
            {n.message && <div className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{n.message}</div>}
            {n.action && (
              <button
                onClick={n.action.onClick}
                className="text-xs text-blue-400 hover:text-blue-300 mt-1 font-medium"
              >
                {n.action.label}
              </button>
            )}
          </div>
          <button
            onClick={() => removeNotification(n.id)}
            className="text-zinc-500 hover:text-zinc-300 text-lg leading-none flex-shrink-0"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
