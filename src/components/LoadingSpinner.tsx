import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '', text }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-4">
      <div
        className={`inline-block rounded-full border-slate-600 border-t-indigo-400 animate-spin ${sizeMap[size]} ${className}`}
        role="status"
        aria-label="加载中"
      />
      {text && <span className="text-xs text-slate-400">{text}</span>}
    </div>
  )
}

export default LoadingSpinner
