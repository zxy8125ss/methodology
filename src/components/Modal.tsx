import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  // 按 Esc 关闭
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // 防止滚动穿透
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* 内容 */}
      <div
        className={`relative w-full ${sizeClasses[size]} bg-white border border-stone-200/90 rounded-2xl shadow-float flex flex-col max-h-[90vh] overflow-hidden`}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#EAE6DF] shrink-0 bg-[#FAF9F5]">
          <h2 id="modal-title" className="font-serif text-base font-medium text-[#1F1E1B]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-[#8C877D] hover:text-[#1F1E1B] transition-colors p-1 rounded-lg hover:bg-[#F4F2EC]"
            aria-label="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 内容主体 */}
        <div className="p-5 overflow-y-auto text-stone-800 text-xs">
          {children}
        </div>
      </div>
    </div>
  )
}
