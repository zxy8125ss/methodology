import React, { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  confirmVariant?: 'primary' | 'danger'
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '确认',
  confirmVariant = 'primary',
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  const confirmClass =
    confirmVariant === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700 text-white'
      : 'bg-[#CC785C] hover:bg-[#B8684D] text-white'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/20 backdrop-blur-xs transition-opacity"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md bg-white border border-[#EAE6DF] rounded-2xl shadow-float overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAE6DF]">
          <div className="flex items-center gap-2.5">
            {confirmVariant === 'danger' && (
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <h2 className="font-serif text-base font-medium text-[#1F1E1B]">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-[#8C877D] hover:text-[#1F1E1B] hover:bg-[#F4F2EC] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="text-xs text-[#57534D] leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 px-5 py-3.5 border-t border-[#EAE6DF] bg-[#FAF9F5]">
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 text-xs font-medium text-[#57534D] bg-white hover:bg-[#F4F2EC] border border-[#EAE6DF] rounded-xl transition-colors shadow-soft"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-1.5 text-xs font-medium rounded-xl transition-colors shadow-soft ${confirmClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
