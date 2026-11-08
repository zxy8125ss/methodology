import React from 'react'
import { useAppStore } from '../stores'
import { X } from 'lucide-react'

export default function NotificationCenter() {
  const { notifications, removeNotification } = useAppStore()

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none safe-top">
      {notifications.map(n => (
        <div
          key={n.id}
          className={`card border p-3.5 shadow-float animate-slide-up pointer-events-auto flex items-start gap-3 bg-white ${
            n.type === 'success' ? 'border-emerald-200' :
            n.type === 'error' ? 'border-rose-200' :
            n.type === 'warning' ? 'border-amber-200' :
            'border-stone-200'
          }`}
        >
          <span className="text-base flex-shrink-0 mt-0.5">
            {n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : n.type === 'warning' ? '⚠️' : 'ℹ️'}
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-xs text-stone-900">{n.title}</div>
            {n.message && <div className="text-[11px] text-stone-600 mt-0.5 line-clamp-2">{n.message}</div>}
            {n.action && (
              <button
                onClick={n.action.onClick}
                className="text-[11px] text-stone-900 underline mt-1 font-medium"
              >
                {n.action.label}
              </button>
            )}
          </div>
          <button
            onClick={() => removeNotification(n.id)}
            className="text-stone-400 hover:text-stone-700 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
